'use client'

import { useLanguage } from '@/hooks/use-language'
import Navbar from '@/components/navbar'
import HeroSection from '@/components/sections/hero-section'
import GrowthSpectrum from '@/components/sections/growth-spectrum'
import CaseStudies from '@/components/sections/case-studies'
import Portfolio from '@/components/sections/portfolio'
import ProjectBuilder from '@/components/sections/project-builder'
import WhyUs from '@/components/sections/why-us'
import Comments from '@/components/sections/comments'
import Footer from '@/components/sections/footer'

export default function Home() {
  const { dir } = useLanguage()
  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      <Navbar />
      <main className="flex-1">
        <section id="hero"><HeroSection /></section>
        <section id="growth"><GrowthSpectrum /></section>
        <section id="portfolio"><Portfolio /></section>
        <ProjectBuilder />
        <WhyUs />
        <section id="cases"><CaseStudies /></section>
        <section id="comments"><Comments /></section>
      </main>
      <Footer />
    </div>
  )
}

