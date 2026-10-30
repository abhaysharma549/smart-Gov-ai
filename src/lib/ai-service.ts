/**
 * AI Service Module — SmartGov AI
 *
 * Provides modular AI analysis with local fallbacks.
 * Supports: classification, duplicate detection, image analysis, risk scoring.
 *
 * The service validates all outputs and never auto-rejects complaints.
 */

import prisma from "@/lib/db";

// ============================================================
// Types
// ============================================================

export interface AnalysisInput {
  complaintId: string;
  title: string;
  description: string;
  categoryId: string;
  imageKeys?: string[];
  latitude?: number;
  longitude?: number;
}

export interface ClassificationResult {
  suggestedCategory: string;
  suggestedCategoryId: string | null;
  confidence: number;
  method: string;
  modelVersion: string;
}

export interface DuplicateMatch {
  complaintId: string;
  referenceNumber: string;
  title: string;
  overallSimilarity: number;
  textSimilarity: number;
  geoDistance: number | null; // km
  imageSimilarity: number | null;
  explanation: string;
  createdAt: Date;
}

export interface DuplicateDetectionResult {
  candidates: DuplicateMatch[];
  method: string;
  modelVersion: string;
}

export interface ImageAnalysisResult {
  imageId: string;
  isRelevant: boolean | null;
  relevanceNote: string;
  integrityFlags: IntegrityFlag[];
  method: string;
}

export interface IntegrityFlag {
  type: "observation" | "heuristic" | "model_prediction";
  label: string;
  description: string;
  severity: "info" | "low" | "medium" | "high";
}

export interface RiskSignal {
  name: string;
  score: number; // 0-100
  weight: number;
  explanation: string;
}

export interface RiskAssessmentResult {
  score: number; // 0-100
  band: "low" | "medium" | "high" | "critical";
  signals: RiskSignal[];
  explanation: string;
  rulesVersion: string;
  reviewRecommended: boolean;
}

export interface FullAnalysisResult {
  classification: ClassificationResult | null;
  duplicates: DuplicateDetectionResult | null;
  imageAnalysis: ImageAnalysisResult[];
  risk: RiskAssessmentResult;
  recommendedAction: string;
  humanReviewRecommended: boolean;
}

// ============================================================
// Classification — Keyword-based with optional LLM
// ============================================================

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "road-damage": [
    "road", "pothole", "crack", "asphalt", "pavement", "highway",
    "street damage", "broken road", "road repair", "crater",
  ],
  "garbage-collection": [
    "garbage", "trash", "waste", "rubbish", "litter", "dump",
    "refuse", "solid waste", "bin", "dustbin",
  ],
  "water-supply": [
    "water", "pipe", "leak", "supply", "tap", "plumbing",
    "water pressure", "no water", "contaminated water", "bore",
  ],
  "drainage-sewerage": [
    "drain", "sewer", "sewage", "blockage", "clogged", "overflow",
    "manhole", "drainage", "flood", "waterlogging",
  ],
  "street-lighting": [
    "streetlight", "light", "lamp", "dark", "street light", "bulb",
    "pole", "electrical", "lighting", "no light",
  ],
  "public-infrastructure": [
    "bridge", "building", "footpath", "sidewalk", "park", "bench",
    "railing", "guardrail", "public facility", "infrastructure",
  ],
  "sanitation": [
    "toilet", "sanitation", "hygiene", "clean", "dirty",
    "public toilet", "urinal", "washroom", "restroom",
  ],
  "public-safety": [
    "safety", "danger", "hazard", "accident", "risk", "unsafe",
    "broken", "collapse", "emergency", "threat",
  ],
};

export async function classifyComplaint(
  title: string,
  description: string
): Promise<ClassificationResult> {
  const text = `${title} ${description}`.toLowerCase();
  let bestCategory = "other";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += keyword.split(" ").length; // Multi-word keywords score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  // Look up category in database
  const dbCategory = await prisma.complaintCategory.findFirst({
    where: { code: bestCategory },
  });

  const confidence = bestScore > 0 ? Math.min(bestScore / 5, 0.95) : 0;

  return {
    suggestedCategory: bestCategory,
    suggestedCategoryId: dbCategory?.id || null,
    confidence,
    method: "keyword_matching",
    modelVersion: "1.0.0",
  };
}

// ============================================================
// Duplicate Detection — Text + Geo similarity
// ============================================================

/**
 * Compute Jaccard similarity between two sets of words.
 */
function jaccardSimilarity(textA: string, textB: string): number {
  const wordsA = new Set(
    textA.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean)
  );
  const wordsB = new Set(
    textB.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean)
  );

  const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

/**
 * Calculate Haversine distance between two coordinates in km.
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function detectDuplicates(
  input: AnalysisInput,
  options: { textThreshold?: number; geoRadiusKm?: number; maxResults?: number } = {}
): Promise<DuplicateDetectionResult> {
  const {
    textThreshold = 0.3,
    geoRadiusKm = 2,
    maxResults = 5,
  } = options;

  // Fetch recent complaints in the same category (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const candidates = await prisma.complaint.findMany({
    where: {
      id: { not: input.complaintId },
      categoryId: input.categoryId,
      createdAt: { gte: ninetyDaysAgo },
      isDeleted: false,
    },
    select: {
      id: true,
      referenceNumber: true,
      title: true,
      description: true,
      latitude: true,
      longitude: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const matches: DuplicateMatch[] = [];
  const queryText = `${input.title} ${input.description}`;

  for (const candidate of candidates) {
    const candidateText = `${candidate.title} ${candidate.description}`;
    const textSim = jaccardSimilarity(queryText, candidateText);

    let geoDistance: number | null = null;
    let geoScore = 0;

    if (
      input.latitude != null &&
      input.longitude != null &&
      candidate.latitude != null &&
      candidate.longitude != null
    ) {
      geoDistance = haversineDistance(
        input.latitude,
        input.longitude,
        candidate.latitude,
        candidate.longitude
      );
      geoScore = geoDistance <= geoRadiusKm ? 1 - geoDistance / geoRadiusKm : 0;
    }

    // Weighted overall similarity
    const overallSimilarity = textSim * 0.7 + geoScore * 0.3;

    if (textSim >= textThreshold || (geoScore > 0.5 && textSim > 0.15)) {
      const explanationParts: string[] = [];
      if (textSim >= textThreshold) {
        explanationParts.push(
          `Text similarity: ${(textSim * 100).toFixed(0)}%`
        );
      }
      if (geoDistance !== null && geoDistance <= geoRadiusKm) {
        explanationParts.push(
          `Location proximity: ${geoDistance.toFixed(1)} km apart`
        );
      }

      matches.push({
        complaintId: candidate.id,
        referenceNumber: candidate.referenceNumber,
        title: candidate.title,
        overallSimilarity,
        textSimilarity: textSim,
        geoDistance,
        imageSimilarity: null,
        explanation: explanationParts.join("; "),
        createdAt: candidate.createdAt,
      });
    }
  }

  // Sort by similarity desc, take top N
  matches.sort((a, b) => b.overallSimilarity - a.overallSimilarity);

  return {
    candidates: matches.slice(0, maxResults),
    method: "jaccard_text_geo_proximity",
    modelVersion: "1.0.0",
  };
}

// ============================================================
// Image Analysis — Metadata + basic checks
// ============================================================

export async function analyzeImage(
  imageId: string,
  complaintCategory: string
): Promise<ImageAnalysisResult> {
  // Basic image analysis using available metadata.
  // A production system would use a vision API or ML model.

  const image = await prisma.complaintImage.findUnique({
    where: { id: imageId },
  });

  if (!image) {
    return {
      imageId,
      isRelevant: null,
      relevanceNote: "Image not found for analysis.",
      integrityFlags: [],
      method: "metadata_check",
    };
  }

  const flags: IntegrityFlag[] = [];

  // Check file size
  if (image.sizeBytes < 5000) {
    flags.push({
      type: "observation",
      label: "Very small file",
      description: "Image file is unusually small, which may indicate low quality.",
      severity: "info",
    });
  }

  // Check dimensions if available
  if (image.width && image.height) {
    if (image.width < 100 || image.height < 100) {
      flags.push({
        type: "observation",
        label: "Low resolution",
        description: "Image resolution is very low.",
        severity: "low",
      });
    }
  }

  return {
    imageId,
    isRelevant: null, // Cannot determine without vision model
    relevanceNote:
      "Image relevance assessment requires a configured vision model. This is a heuristic assessment only.",
    integrityFlags: flags,
    method: "metadata_heuristic",
  };
}

// ============================================================
// Risk Assessment — Rule-based scoring
// ============================================================

const RISK_RULES_VERSION = "1.0.0";

export async function assessRisk(
  input: AnalysisInput,
  duplicateResult?: DuplicateDetectionResult,
  imageResults?: ImageAnalysisResult[]
): Promise<RiskAssessmentResult> {
  const signals: RiskSignal[] = [];

  // Signal 1: High duplicate similarity
  if (duplicateResult?.candidates && duplicateResult.candidates.length > 0) {
    const topMatch = duplicateResult.candidates[0];
    if (topMatch.overallSimilarity > 0.7) {
      signals.push({
        name: "high_duplicate_similarity",
        score: Math.round(topMatch.overallSimilarity * 40),
        weight: 0.3,
        explanation: `Very similar to existing complaint ${topMatch.referenceNumber} (${(topMatch.overallSimilarity * 100).toFixed(0)}% match)`,
      });
    } else if (topMatch.overallSimilarity > 0.4) {
      signals.push({
        name: "moderate_duplicate_similarity",
        score: Math.round(topMatch.overallSimilarity * 20),
        weight: 0.2,
        explanation: `Moderately similar to existing complaint ${topMatch.referenceNumber}`,
      });
    }
  }

  // Signal 2: No images provided
  if (!input.imageKeys || input.imageKeys.length === 0) {
    signals.push({
      name: "no_evidence_images",
      score: 10,
      weight: 0.1,
      explanation: "No photographic evidence provided",
    });
  }

  // Signal 3: No location provided
  if (input.latitude == null || input.longitude == null) {
    signals.push({
      name: "no_location",
      score: 5,
      weight: 0.05,
      explanation: "No GPS coordinates provided",
    });
  }

  // Signal 4: Very short description
  if (input.description.length < 50) {
    signals.push({
      name: "brief_description",
      score: 8,
      weight: 0.1,
      explanation: "Description is quite brief",
    });
  }

  // Signal 5: Image integrity flags
  if (imageResults) {
    const totalFlags = imageResults.reduce(
      (sum, r) => sum + r.integrityFlags.length,
      0
    );
    if (totalFlags > 2) {
      signals.push({
        name: "image_integrity_concerns",
        score: Math.min(totalFlags * 5, 25),
        weight: 0.15,
        explanation: `${totalFlags} image integrity observation(s) found`,
      });
    }
  }

  // Calculate weighted score (0-100)
  let totalScore = 0;
  let totalWeight = 0;
  for (const signal of signals) {
    totalScore += signal.score * signal.weight;
    totalWeight += signal.weight;
  }

  const normalizedScore =
    totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  const finalScore = Math.min(normalizedScore, 100);

  // Determine risk band
  let band: "low" | "medium" | "high" | "critical";
  if (finalScore < 20) band = "low";
  else if (finalScore < 45) band = "medium";
  else if (finalScore < 70) band = "high";
  else band = "critical";

  const reviewRecommended = band === "high" || band === "critical";

  return {
    score: finalScore,
    band,
    signals,
    explanation:
      signals.length === 0
        ? "No risk signals detected."
        : `${signals.length} risk signal(s) identified. This is an operational priority indicator, not a judgment on the complaint's validity.`,
    rulesVersion: RISK_RULES_VERSION,
    reviewRecommended,
  };
}

// ============================================================
// Full Analysis Pipeline
// ============================================================

export async function analyzeComplaint(
  input: AnalysisInput
): Promise<FullAnalysisResult> {
  let classification: ClassificationResult | null = null;
  let duplicates: DuplicateDetectionResult | null = null;
  const imageAnalyses: ImageAnalysisResult[] = [];

  // 1. Classification
  try {
    classification = await classifyComplaint(input.title, input.description);
  } catch (error) {
    console.error("Classification failed:", error);
  }

  // 2. Duplicate detection
  try {
    duplicates = await detectDuplicates(input);
  } catch (error) {
    console.error("Duplicate detection failed:", error);
  }

  // 3. Image analysis
  if (input.imageKeys && input.imageKeys.length > 0) {
    for (const imageId of input.imageKeys) {
      try {
        const result = await analyzeImage(
          imageId,
          classification?.suggestedCategory || ""
        );
        imageAnalyses.push(result);
      } catch (error) {
        console.error(`Image analysis failed for ${imageId}:`, error);
      }
    }
  }

  // 4. Risk assessment
  const risk = await assessRisk(input, duplicates ?? undefined, imageAnalyses);

  // Determine recommended action
  let recommendedAction = "Proceed with normal processing";
  let humanReviewRecommended = false;

  if (risk.reviewRecommended) {
    recommendedAction = "Flag for human review before proceeding";
    humanReviewRecommended = true;
  }

  if (duplicates && duplicates.candidates.length > 0) {
    const topMatch = duplicates.candidates[0];
    if (topMatch.overallSimilarity > 0.7) {
      recommendedAction =
        "Review potential duplicate before processing. Original complaint preserved.";
      humanReviewRecommended = true;
    }
  }

  return {
    classification,
    duplicates,
    imageAnalysis: imageAnalyses,
    risk,
    recommendedAction,
    humanReviewRecommended,
  };
}
