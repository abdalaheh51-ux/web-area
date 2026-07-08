import Navbar from '@/components/navbar'
import Footer from '@/components/sections/footer'
import PrivacyContent from './PrivacyContent'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://example.com'

export const metadata = {
  title: 'Privacy Policy / سياسة الخصوصية — Web Area',
  description: 'We are committed to protecting your privacy. / نلتزم بحماية خصوصيتك.',
  openGraph: {
    title: 'Privacy Policy — Web Area',
    description: 'We are committed to protecting your privacy.',
    url: `${siteUrl}/privacy`,
    type: 'website',
    images: [
      {
        url: `${siteUrl}/logo.png`,
        alt: 'Web Area logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy — Web Area',
    description: 'We are committed to protecting your privacy.',
    images: [`${siteUrl}/logo.png`],
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PrivacyContent />
      <Footer />
    </div>
  )
}
