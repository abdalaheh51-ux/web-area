const email = 'webarea2@gmail.com'
const subject = 'استفسار بخصوص خدمة من Web Area'
const body = 'أهلاً فريق Web Area، أود الاستفسار عن خدماتكم...'

// Use the exact working Gmail compose URL provided by the user (includes /u/0 and tf=cm)
const gmailLink = 'https://mail.google.com/mail/u/0/?fs=1&to=webarea2@gmail.com&su=%D8%A7%D8%B3%D8%D9%81%D8%B3%D8%A7%D8%B1+%D8%A8%D8%AE%D8%B5%D9%88%D8%B5+%D8%AE%D8%AF%D9%85%D8%A9+%D9%85%D9%86+Web+Area&body=%D8%A3%D9%87%D9%84%D8%A7%D9%8B+%D9%81%D8%B1%D9%8A%D9%82+Web+Area%D8%8C+%D8%A3%D9%88%D8%AF+%D8%A7%D9%84%D8%A7%D8%B3%D8%D9%81%D8%B3%D8%A7%D8%B1+%D8%B9%D9%86+%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%D9%83%D9%85...&tf=cm'

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
