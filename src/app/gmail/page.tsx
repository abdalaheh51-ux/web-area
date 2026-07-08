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
    <html>
      <head>
        <meta name="robots" content="noindex,follow" />
      </head>
      <body className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-800 text-white">
        <main className="max-w-xl w-full mx-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm shadow-lg">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-cyan-300/40 bg-white/5 flex items-center justify-center">
                <img src="/logo.png" alt="Web Area" className="w-10 h-10 object-cover" />
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold">جارٍ إعادة التوجيه إلى البريد</h1>
              <p className="text-sm text-cyan-100/80 text-center">سيُفتح مسودة جديدة في Gmail مُعَبّأة إلى: <strong className="break-words">{email}</strong></p>

              <div className="flex items-center gap-4 mt-3">
                <div className="w-10 h-10 rounded-full border-2 border-white/20 animate-spin border-t-transparent" aria-hidden="true" />
                <span className="text-sm text-cyan-100/70">الانتقال الآن…</span>
              </div>

              <div className="mt-5 w-full flex flex-col sm:flex-row gap-3">
                <a href={gmailLink} className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 rounded-md bg-cyan-500 hover:bg-cyan-600 text-white font-medium shadow-sm" target="_blank" rel="noopener noreferrer">فتح Gmail الآن</a>
                <a href={`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`} className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 rounded-md bg-white/5 hover:bg-white/10 text-cyan-100 text-sm">استخدام تطبيق البريد (احتياطي)</a>
              </div>

              <p className="mt-4 text-xs text-cyan-100/60 text-center">إذا لم يحدث شيء تلقائيًا، اضغط على "فتح Gmail الآن" أو انسخ الرابط يدويًا.</p>
              <p className="mt-2 text-xs text-cyan-100/50 break-all text-center"><a href={gmailLink} className="underline">{gmailLink}</a></p>
            </div>
          </div>
        </main>
        <script dangerouslySetInnerHTML={{ __html: script }} />
      </body>
    </html>
  )
}
