import Link from 'next/link'

export default function Page() {
  return (
    <main style={{padding: 24}}>
      <h1 style={{fontSize: 22, fontWeight: 700}}>Instructor — Assignments</h1>
      <p style={{marginTop: 8}}>This is the assignments index for instructors. You can create or manage assignments from here.</p>

      <div style={{marginTop: 16}}>
        <Link href="/instructor/assignments/new">Create new assignment</Link>
      </div>
    </main>
  )
}
