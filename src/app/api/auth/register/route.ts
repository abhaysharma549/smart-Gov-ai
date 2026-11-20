import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations";
import { userStore } from "@/lib/user-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate input schema
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] || "Validation failed";
      return NextResponse.json(
        { error: firstError, details: fieldErrors },
        { status: 400 }
      );
    }

    const { name, registrationNumber, email, phone, password } = result.data;

    // 2. Attempt user creation in userStore
    // Automatically receives role "CITIZEN", prevents duplicate email/regNo, prevents admin tampering
    const createResult = await userStore.createUser({
      name,
      registrationNumber,
      email,
      phone,
      password,
    });

    if (createResult.error || !createResult.user) {
      return NextResponse.json(
        { error: createResult.error || "Unable to register account" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        data: createResult.user,
        message: "Account registered successfully. You can now log in.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred. Please try again." },
      { status: 500 }
    );
  }
}
