'use client'

import { useLanguage } from '@/hooks/use-language'

export default function PrivacyContent() {
  const { t, dir } = useLanguage()

  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 py-16" dir={dir}>
      <h1 className="text-3xl font-bold mb-6">{t.privacyPolicy}</h1>

      <section className="prose prose-invert max-w-none">
        <h2>{dir === 'rtl' ? 'مقدمة' : 'Introduction'}</h2>
        <p>
          {dir === 'rtl'
            ? 'نلتزم بحماية خصوصيتك. توضح هذه السياسة كيف نجمع ونستخدم ونحفظ معلوماتك.'
            : 'We are committed to protecting your privacy. This policy explains how we collect, use, and store your information.'}
        </p>

        <h3>{dir === 'rtl' ? 'المعلومات التي نجمعها' : 'Information We Collect'}</h3>
        <p>
          {dir === 'rtl'
            ? 'قد نجمع البريد الإلكتروني، الاسم، ورسائل الاتصالات عند تواصلك معنا.'
            : 'We may collect email, name, and message contents when you contact us.'}
        </p>

        <h3>{dir === 'rtl' ? 'كيف نستخدم المعلومات' : 'How We Use Information'}</h3>
        <p>
          {dir === 'rtl'
            ? 'نستخدم المعلومات للرد على استفساراتك وتحسين خدماتنا.'
            : 'We use information to respond to inquiries and improve our services.'}
        </p>

        <h3>{dir === 'rtl' ? 'اتصال' : 'Contact'}</h3>
        <p>
          {dir === 'rtl'
            ? 'إذا كان لديك أسئلة حول سياسة الخصوصية، راسلنا عبر البريد الإلكتروني.'
            : 'If you have questions about this policy, contact us via email.'}
        </p>
      </section>
    </main>
  )
}
