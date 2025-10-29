import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { material_id } = await request.json()

    if (!material_id) {
      return NextResponse.json({ error: "Material ID is required" }, { status: 400 })
    }

    // Check if material is public
    const { data: material, error: materialError } = await supabase
      .from("materials")
      .select("is_public")
      .eq("id", material_id)
      .single()

    if (materialError || !material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 })
    }

    if (!material.is_public) {
      return NextResponse.json({ error: "This material is not available for enrollment" }, { status: 403 })
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from("enrollments")
      .select("*")
      .eq("student_id", user.id)
      .eq("material_id", material_id)
      .single()

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled in this material" }, { status: 400 })
    }

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from("enrollments")
      .insert({
        student_id: user.id,
        material_id,
      })
      .select()

    if (enrollError) {
      return NextResponse.json({ error: enrollError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, enrollment }, { status: 201 })
  } catch (error) {
    console.error("Enrollment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
