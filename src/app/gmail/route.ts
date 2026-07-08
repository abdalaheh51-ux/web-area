import { NextResponse } from 'next/server'

export function GET() {
  const email = 'webarea2@gmail.com'
  const subject = 'استفسار بخصوص خدمة من Web Area'
  const body = 'أهلاً فريق Web Area، أود الاستفسار عن خدماتكم...'

  const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    email
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  return NextResponse.redirect(gmailLink)
}
