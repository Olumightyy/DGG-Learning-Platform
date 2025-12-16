import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const admin = createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

export async function GET() {
  const { data, error } = await admin.from('settings').select('value').eq('key', 'meeting_url').single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ meeting_url: data?.value ?? null })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const meeting_url = body?.meeting_url ?? null

    const { error } = await admin
      .from('settings')
      .upsert({ key: 'meeting_url', value: meeting_url, updated_at: new Date().toISOString() })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ meeting_url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
