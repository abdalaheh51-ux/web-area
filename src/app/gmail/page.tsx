import { useEffect } from 'react'

const email = 'webarea2@gmail.com'
const subject = 'استفسار بخصوص خدمة من Web Area'
const body = 'أهلاً فريق Web Area، أود الاستفسار عن خدماتكم...'

const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
  email
)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

export const metadata = {
  title: email,
  openGraph: {
    title: email,
    description: 'اضغط لفتح مسودة بريد إلكتروني إلى Web Area',
    url: 'https://web-area-a.vercel.app/gmail',
    siteName: 'Web Area',
  },
}

export default function GmailRedirectPage() {
  useEffect(() => {
    // try to open Gmail in a new tab; if blocked, navigate current tab
    const newWin = window.open(gmailLink, '_blank', 'noopener,noreferrer')
    if (!newWin) {
      window.location.href = gmailLink
    }
  }, [])

  return (
    <html>
      <head>
        <meta name="robots" content="noindex,follow" />
      </head>
      <body>
        <p>جارٍ إعادة التوجيه إلى Gmail...</p>
        <p>
          إذا لم يعمل التحويل تلقائيًا، انسخ هذا الرابط والصقه في المتصفح:
          <br />
          <a href={gmailLink}>{gmailLink}</a>
        </p>
      </body>
    </html>
  )
}
