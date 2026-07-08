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
  // No React hooks here (server component). Use an inline script to open Gmail on the client.
  const script = `(function(){
    try {
      var w = window.open('${gmailLink}', '_blank', 'noopener,noreferrer');
      if(!w) window.location.href='${gmailLink}';
    } catch(e) {
      window.location.href='${gmailLink}';
    }
  })();`

  return (
    <>
      <meta name="robots" content="noindex,follow" />
      <p>جارٍ إعادة التوجيه إلى Gmail...</p>
      <p>
        إذا لم يعمل التحويل تلقائيًا، انسخ هذا الرابط والصقه في المتصفح:
        <br />
        <a href={gmailLink}>{gmailLink}</a>
      </p>
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  )
}
