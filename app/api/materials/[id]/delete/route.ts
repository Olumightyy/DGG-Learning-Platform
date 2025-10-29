import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the material belongs to the instructor
    const { data: material } = await supabase.from("materials").select("instructor_id").eq("id", id).single()

    if (!material || material.instructor_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete the material (cascading deletes will handle videos, assignments, etc.)
    const { error } = await supabase.from("materials").delete().eq("id", id)

    if (error) {
      console.error("Delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Fatal error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
