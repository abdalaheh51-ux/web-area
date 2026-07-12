'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, ArrowLeft, ChevronDown, Layout, ShoppingBag, BarChart3, Sparkles, Globe, ShoppingCart, TrendingUp, Users, Package, DollarSign, Bell, Search, Menu, Home, BarChart2, Settings, FileText, ChevronLeft, Star, Heart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/use-language'

// Phase labels - bilingual
const PHASE_LABELS_AR = ['صفحة هبوط', 'متجر إلكتروني', 'لوحة تحكم ERP', 'بورتفوليو']
const PHASE_LABELS_EN = ['Landing Page', 'E-Commerce', 'ERP Dashboard', 'Portfolio']
const PHASE_ICONS = [Layout, ShoppingBag, BarChart3, Globe]
const PHASE_COLORS = ['text-blue-600 dark:text-blue-400', 'text-amber-600 dark:text-amber-400', 'text-blue-600 dark:text-blue-400', 'text-amber-600 dark:text-amber-400']

// ─── Browser Chrome Frame ──────────────────────────────────────
function BrowserChrome({ label, color }: { label: string; color: string }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-1.5 bg-card/80 backdrop-blur-sm border-b border-border/30">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-red-500/60" />
        <div className="w-2 h-2 rounded-full bg-amber-500/60" />
        <div className="w-2 h-2 rounded-full bg-green-500/60" />
      </div>
      <div className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-muted/40 text-[9px] text-muted-foreground font-mono">
        <Globe className="w-2.5 h-2.5" />
        webarea.dev
      </div>
      <motion.div
        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${color} text-white`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
      >
        {label}
      </motion.div>
    </div>
  )
}

// ─── Phase 1: Landing Page ─────────────────────────────────────
function LandingPageVisual() {
  return (
    <motion.div
      className="relative w-full h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <BrowserChrome label="صفحة هبوط" color="bg-blue-500" />
      <div className="pt-7 h-full overflow-hidden">
        {/* Nav bar */}
        <motion.div
          className="flex items-center justify-between px-3 py-1.5 border-b border-border/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-blue-500/30" />
            <div className="h-2 w-10 rounded-full bg-foreground/20" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-6 rounded-full bg-foreground/10" />
            <div className="h-1.5 w-6 rounded-full bg-foreground/10" />
            <div className="h-1.5 w-6 rounded-full bg-foreground/10" />
          </div>
          <motion.div
            className="px-2 py-0.5 rounded text-[7px] font-bold bg-blue-500 text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            ابدأ الآن
          </motion.div>
        </motion.div>

        {/* Hero Section */}
        <div className="px-3 py-2">
          <motion.div
            className="rounded-lg bg-gradient-to-l from-blue-500/20 to-blue-600/10 border border-blue-500/20 p-2.5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <motion.div className="h-2 w-3/4 rounded-full bg-blue-400/40 mb-1.5"
                  initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ delay: 0.5 }} />
                <motion.div className="h-1.5 w-full rounded-full bg-foreground/15 mb-1"
                  initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.6 }} />
                <motion.div className="h-1.5 w-2/3 rounded-full bg-foreground/10 mb-2"
                  initial={{ width: 0 }} animate={{ width: '66%' }} transition={{ delay: 0.7 }} />
                <div className="flex gap-1.5">
                  <motion.div
                    className="px-2 py-1 rounded text-[7px] font-bold bg-blue-500 text-white"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: 'spring' }}
                  >
                    جرّب مجاناً
                  </motion.div>
                  <motion.div
                    className="px-2 py-1 rounded text-[7px] font-medium border border-blue-500/30 text-blue-600 dark:text-blue-400"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.9, type: 'spring' }}
                  >
                    اعرف أكثر
                  </motion.div>
                </div>
              </div>
              <motion.div
                className="w-16 h-14 rounded bg-blue-500/15 border border-blue-500/20 flex items-center justify-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Rocket className="w-5 h-5 text-blue-600 dark:text-blue-400/60" />
              </motion.div>
            </div>
          </motion.div>

          {/* Features row */}
          <div className="grid grid-cols-3 gap-1.5 mt-2">
            {[
              { icon: '⚡', title: 'سرعة', val: '99%' },
              { icon: '🔒', title: 'أمان', val: 'SSL' },
              { icon: '📱', title: 'متجاوب', val: '100%' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                className="rounded-md border border-border/20 bg-card/50 p-1.5 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + i * 0.1 }}
              >
                <div className="text-[10px]">{f.icon}</div>
                <div className="text-[7px] font-bold text-foreground/80">{f.title}</div>
                <div className="text-[6px] text-blue-600 dark:text-blue-400 font-semibold">{f.val}</div>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <motion.div
            className="mt-2 rounded-md border border-border/20 bg-card/30 p-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <div className="flex items-center gap-1 mb-1">
              <div className="flex -space-x-1 space-x-reverse">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-3.5 h-3.5 rounded-full bg-amber-500/30 border border-card" />
                ))}
              </div>
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map(i => (
                  <Star key={i} className="w-2 h-2 text-amber-600 dark:text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-[6px] text-muted-foreground">+200 تقييم</span>
            </div>
            <div className="h-1 w-4/5 rounded-full bg-foreground/10" />
            <div className="h-1 w-3/5 rounded-full bg-foreground/8 mt-0.5" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Phase 2: E-Commerce Store ─────────────────────────────────
function StorefrontVisual() {
  const [likedProducts, setLikedProducts] = useState<number[]>([])

  const products = [
    { name: 'ساعة ذكية', price: '299 ر.س', color: 'bg-blue-500/20', border: 'border-blue-500/20' },
    { name: 'سماعة لاسلكية', price: '149 ر.س', color: 'bg-amber-500/20', border: 'border-amber-500/20' },
    { name: 'حقيبة أنيقة', price: '89 ر.س', color: 'bg-emerald-500/20', border: 'border-emerald-500/20' },
    { name: 'نظارة حديثة', price: '199 ر.س', color: 'bg-rose-500/20', border: 'border-rose-500/20' },
    { name: 'حزام جلد', price: '59 ر.س', color: 'bg-blue-500/20', border: 'border-blue-500/20' },
    { name: 'عطر فاخر', price: '350 ر.س', color: 'bg-amber-500/20', border: 'border-amber-500/20' },
  ]

  return (
    <motion.div
      className="relative w-full h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <BrowserChrome label="متجر إلكتروني" color="bg-amber-500" />
      <div className="pt-7 h-full overflow-hidden">
        {/* Store Header */}
        <motion.div
          className="flex items-center justify-between px-3 py-1.5 border-b border-border/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-[8px] font-bold text-foreground/80">متجر الأناقة</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/40">
            <Search className="w-2.5 h-2.5 text-muted-foreground" />
            <div className="h-1 w-8 rounded-full bg-foreground/10" />
          </div>
          <div className="flex items-center gap-1">
            <div className="relative">
              <ShoppingCart className="w-3.5 h-3.5 text-foreground/60" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 text-[5px] text-white flex items-center justify-center font-bold">3</div>
            </div>
            <div className="w-4 h-4 rounded-full bg-amber-500/20" />
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          className="flex gap-1 px-3 py-1.5 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {['الكل', 'إلكترونيات', 'أزياء', 'إكسسوارات'].map((cat, i) => (
            <div
              key={cat}
              className={`px-2 py-0.5 rounded-full text-[6px] font-medium whitespace-nowrap ${
                i === 0 ? 'bg-amber-500 text-white' : 'bg-muted/40 text-muted-foreground'
              }`}
            >
              {cat}
            </div>
          ))}
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-3 gap-1.5 px-3">
          {products.map((product, i) => (
            <motion.div
              key={product.name}
              className="rounded-md border border-border/20 bg-card/50 overflow-hidden group"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.07 }}
            >
              {/* Product image */}
              <div className={`relative h-10 ${product.color} flex items-center justify-center`}>
                <div className="w-6 h-6 rounded bg-white/10 border border-white/10" />
                <motion.div
                  className="absolute top-0.5 left-0.5 cursor-pointer"
                  whileTap={{ scale: 0.8 }}
                  onClick={() => {
                    setLikedProducts(prev =>
                      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                    )
                  }}
                >
                  <Heart className={`w-2.5 h-2.5 transition-colors ${
                    likedProducts.includes(i) ? 'text-rose-500 fill-rose-500' : 'text-white/40'
                  }`} />
                </motion.div>
                <div className="absolute bottom-0.5 right-0.5 flex items-center gap-0.5 bg-black/30 rounded-full px-1 py-px">
                  <Eye className="w-1.5 h-1.5 text-white/60" />
                  <span className="text-[5px] text-white/60">{Math.floor(Math.random() * 500 + 100)}</span>
                </div>
              </div>
              {/* Product info */}
              <div className="p-1">
                <div className="text-[6px] font-semibold text-foreground/80 truncate">{product.name}</div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[7px] font-bold text-amber-600 dark:text-amber-400">{product.price}</span>
                  <div className="flex gap-0">
                    {[0, 1, 2, 3, 4].map(s => (
                      <Star key={s} className="w-1.5 h-1.5 text-amber-600 dark:text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <motion.div
                  className="mt-1 w-full py-0.5 rounded text-[5px] text-center font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  whileHover={{ scale: 1.05 }}
                >
                  أضف للسلة
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cart summary bar */}
        <motion.div
          className="mx-3 mt-1.5 flex items-center justify-between px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <div className="flex items-center gap-1">
            <ShoppingCart className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
            <span className="text-[6px] text-amber-600 dark:text-amber-400 font-medium">3 منتجات</span>
          </div>
          <span className="text-[7px] font-bold text-amber-600 dark:text-amber-400">547 ر.س</span>
          <div className="px-1.5 py-0.5 rounded text-[6px] font-bold bg-amber-500 text-white">
            إتمام الشراء
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Phase 3: ERP Dashboard ────────────────────────────────────
function DashboardVisual() {
  return (
    <motion.div
      className="relative w-full h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <BrowserChrome label="لوحة تحكم ERP" color="bg-blue-600" />
      <div className="pt-7 h-full overflow-hidden flex">
        {/* Sidebar */}
        <motion.div
          className="w-9 shrink-0 border-l border-border/20 bg-card/30 flex flex-col py-1.5 px-1 gap-0.5"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { icon: Home, active: true },
            { icon: BarChart2, active: false },
            { icon: Package, active: false },
            { icon: FileText, active: false },
            { icon: Users, active: false },
            { icon: Settings, active: false },
          ].map((item, i) => (
            <motion.div
              key={i}
              className={`w-full aspect-square rounded flex items-center justify-center ${
                item.active ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-muted-foreground/40'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <item.icon className="w-3 h-3" />
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {/* Top bar */}
          <motion.div
            className="flex items-center justify-between px-2 py-1 border-b border-border/15"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-[7px] font-bold text-foreground/70">لوحة التحكم</span>
            <div className="flex items-center gap-1.5">
              <Bell className="w-2.5 h-2.5 text-muted-foreground/50" />
              <div className="w-3.5 h-3.5 rounded-full bg-blue-500/20" />
            </div>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-1 px-2 py-1.5">
            {[
              { icon: DollarSign, label: 'الإيرادات', value: '٤٥,٢٣٠', change: '+١٢٪', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/15' },
              { icon: ShoppingCart, label: 'الطلبات', value: '١,٨٤٧', change: '+٨٪', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/15' },
              { icon: Package, label: 'المخزون', value: '٣,٤٢١', change: '-٣٪', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15' },
              { icon: Users, label: 'العملاء', value: '٨٤٥', change: '+١٥٪', color: 'text-rose-400', bg: 'bg-rose-500/15' },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                className="rounded-md border border-border/15 bg-card/50 p-1.5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
              >
                <div className="flex items-center gap-1">
                  <div className={`w-4 h-4 rounded ${kpi.bg} flex items-center justify-center`}>
                    <kpi.icon className={`w-2.5 h-2.5 ${kpi.color}`} />
                  </div>
                  <span className="text-[6px] text-muted-foreground">{kpi.label}</span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[9px] font-bold text-foreground/90">{kpi.value}</span>
                  <span className={`text-[6px] font-semibold ${kpi.change.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-400'}`}>{kpi.change}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chart Area */}
          <motion.div
            className="mx-2 rounded-md border border-border/15 bg-card/30 p-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[6px] font-semibold text-foreground/60">المبيعات الشهرية</span>
              <div className="flex gap-1">
                <span className="text-[5px] px-1 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium">شهري</span>
                <span className="text-[5px] px-1 py-0.5 rounded text-muted-foreground/40">سنوي</span>
              </div>
            </div>
            <div className="flex items-end gap-[3px] h-12">
              {[35, 55, 40, 70, 50, 65, 85, 60, 75, 90, 70, 95].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-blue-500/70 to-blue-400/30"
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.9 + i * 0.03, duration: 0.4, ease: 'easeOut' }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-0.5">
              {['يناير', 'مارس', 'يونيو', 'سبتمبر', 'ديسمبر'].map(m => (
                <span key={m} className="text-[4px] text-muted-foreground/40">{m}</span>
              ))}
            </div>
          </motion.div>

          {/* Recent orders table */}
          <motion.div
            className="mx-2 mt-1.5 rounded-md border border-border/15 bg-card/30 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="px-1.5 py-1 border-b border-border/10">
              <span className="text-[6px] font-semibold text-foreground/60">آخر الطلبات</span>
            </div>
            {[
              { id: '#١٢٤٥', client: 'أحمد م.', amount: '٢,٣٥٠ ر.س', status: 'مكتمل', statusColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15' },
              { id: '#١٢٤٤', client: 'سارة ع.', amount: '٨٩٠ ر.س', status: 'قيد الشحن', statusColor: 'text-amber-600 dark:text-amber-400 bg-amber-500/15' },
              { id: '#١٢٤٣', client: 'محمد خ.', amount: '١,٥٦٠ ر.س', status: 'مكتمل', statusColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15' },
            ].map((order, i) => (
              <motion.div
                key={order.id}
                className="flex items-center justify-between px-1.5 py-0.5 border-b border-border/5 last:border-0"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + i * 0.08 }}
              >
                <span className="text-[5px] font-mono text-muted-foreground/50">{order.id}</span>
                <span className="text-[5px] text-foreground/60">{order.client}</span>
                <span className="text-[5px] font-semibold text-foreground/70">{order.amount}</span>
                <span className={`text-[5px] px-1 py-px rounded font-medium ${order.statusColor}`}>{order.status}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Phase 4: Portfolio ────────────────────────────────────────
function PortfolioVisual() {
  const projects = [
    { title: 'متجر الأناقة', tag: 'E-Commerce', color: 'bg-amber-500/20 border-amber-500/20' },
    { title: 'سيستم المخازن', tag: 'ERP', color: 'bg-blue-500/20 border-blue-500/20' },
    { title: 'حملة رمضان', tag: 'Landing', color: 'bg-emerald-500/20 border-emerald-500/20' },
    { title: 'بورتفوليو إبداع', tag: 'Portfolio', color: 'bg-rose-500/20 border-rose-500/20' },
  ]

  return (
    <motion.div
      className="relative w-full h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <BrowserChrome label="بورتفوليو" color="bg-amber-500" />
      <div className="pt-7 h-full overflow-hidden">
        {/* Header */}
        <motion.div
          className="px-3 py-2 border-b border-border/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="h-2.5 w-20 rounded-full bg-foreground/20 mb-1" />
              <div className="h-1 w-32 rounded-full bg-foreground/10" />
            </div>
            <div className="flex gap-1">
              <div className="px-1.5 py-0.5 rounded text-[6px] bg-blue-500 text-white font-medium">الكل</div>
              <div className="px-1.5 py-0.5 rounded text-[6px] bg-muted/40 text-muted-foreground">متاجر</div>
              <div className="px-1.5 py-0.5 rounded text-[6px] bg-muted/40 text-muted-foreground">ERP</div>
            </div>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          className="flex items-center justify-center gap-3 py-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { val: '+١٥٠', label: 'مشروع' },
            { val: '+٥٠', label: 'عميل' },
            { val: '٤.٩', label: 'تقييم' },
          ].map((s, i) => (
            <div key={s.label} className="text-center">
              <div className="text-[9px] font-bold text-primary">{s.val}</div>
              <div className="text-[5px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-2 gap-1.5 px-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              className="rounded-md border border-border/20 bg-card/50 overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              {/* Project image */}
              <div className={`h-10 ${project.color} border-b flex items-center justify-center`}>
                <div className="w-8 h-5 rounded bg-white/10" />
              </div>
              <div className="p-1.5">
                <div className="text-[7px] font-semibold text-foreground/80">{project.title}</div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[5px] px-1 py-px rounded bg-primary/10 text-primary font-medium">{project.tag}</span>
                  <div className="flex gap-0.5">
                    <Eye className="w-2 h-2 text-muted-foreground/40" />
                    <span className="text-[5px] text-muted-foreground/40">{Math.floor(Math.random() * 900 + 100)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonial */}
        <motion.div
          className="mx-3 mt-1.5 rounded-md border border-border/20 bg-card/30 p-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <div className="flex items-center gap-1 mb-1">
            <div className="w-4 h-4 rounded-full bg-amber-500/20" />
            <div>
              <div className="h-1 w-10 rounded-full bg-foreground/20" />
              <div className="h-0.5 w-6 rounded-full bg-foreground/10 mt-0.5" />
            </div>
          </div>
          <div className="h-1 w-full rounded-full bg-foreground/10" />
          <div className="h-1 w-4/5 rounded-full bg-foreground/8 mt-0.5" />
          <div className="flex gap-0.5 mt-1">
            {[0, 1, 2, 3, 4].map(s => (
              <Star key={s} className="w-2 h-2 text-amber-600 dark:text-amber-400 fill-amber-400" />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Animated visual container ─────────────────────────────────
function DigitalTransformationVisual() {
  const { dir } = useLanguage()
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 4)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Glow effect behind the visual */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/25 to-amber-500/25 blur-2xl scale-105" />

      {/* Main container */}
      <motion.div
        className="relative rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md overflow-hidden shadow-2xl"
        style={{ aspectRatio: '3/4' }}
        layout
      >
        {/* Animated visual content */}
        <AnimatePresence mode="wait">
          {phase === 0 && <LandingPageVisual key="landing" />}
          {phase === 1 && <StorefrontVisual key="store" />}
          {phase === 2 && <DashboardVisual key="dashboard" />}
          {phase === 3 && <PortfolioVisual key="portfolio" />}
        </AnimatePresence>
      </motion.div>

      {/* Phase Navigation Tabs */}
      <div className="mt-4 flex items-center justify-center gap-1">
        {(dir === 'rtl' ? PHASE_LABELS_AR : PHASE_LABELS_EN).map((label, i) => {
          const Icon = PHASE_ICONS[i]
          return (
            <motion.button
              key={label}
              onClick={() => setPhase(i)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-300 ${
                i === phase
                  ? 'text-cyan-400 border border-cyan-400/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
              }`}
              style={i === phase ? { background: 'rgba(34,211,238,0.08)', boxShadow: '0 0 12px rgba(34,211,238,0.15)' } : {}}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{label}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-0.5 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-l from-cyan-400 to-violet-500"
          key={phase}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 4, ease: 'linear' }}
        />
      </div>
    </div>
  )
}

// ─── Floating gradient orbs ────────────────────────────────────
function GradientOrbs() {
  return (
    <>
      <div
        className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full animate-float opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
          animationDelay: '0s',
        }}
      />
      <div
        className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          animation: 'float 4s ease-in-out infinite',
          animationDelay: '1.5s',
        }}
      />
      <div
        className="absolute top-1/3 left-1/3 w-48 h-48 rounded-full opacity-15 blur-2xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)',
          animation: 'float 5s ease-in-out infinite',
          animationDelay: '0.8s',
        }}
      />
      <div
        className="absolute bottom-1/3 right-1/3 w-56 h-56 rounded-full opacity-12 blur-2xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)',
          animation: 'float 3.5s ease-in-out infinite',
          animationDelay: '2s',
        }}
      />
    </>
  )
}

// ─── Main Hero Section ─────────────────────────────────────────
export default function HeroSection() {
  const { t, dir } = useLanguage()
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" dir={dir}>
      {/* Background effects */}
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 mesh-gradient animated-gradient opacity-60 pointer-events-none" />
      {/* Circuit grid */}
      <div className="absolute inset-0 circuit-pattern opacity-50" />
      {/* Floating shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-shape absolute top-1/4 right-10 w-16 h-16 rounded-2xl" style={{ background: 'rgba(34,211,238,0.06)', backdropFilter: 'blur(4px)', border: '1px solid rgba(34,211,238,0.15)' }} />
        <div className="floating-shape absolute bottom-1/3 left-10 w-12 h-12 rounded-full" style={{ background: 'rgba(124,58,237,0.06)', backdropFilter: 'blur(4px)', border: '1px solid rgba(124,58,237,0.15)', animationDelay: '2s' }} />
        <div className="floating-shape absolute top-1/2 right-1/4 w-8 h-8 rounded-lg" style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.12)', animationDelay: '4s' }} />
      </div>
      {/* Blur orbs */}
      <div className="blur-orb w-80 h-80 top-0 right-1/4" style={{ background: '#22d3ee' }} />
      <div className="blur-orb w-64 h-64 bottom-0 left-1/4" style={{ background: '#7c3aed' }} />
      {/* Noise texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")',
      }} />
      <GradientOrbs />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <motion.div
            className="text-center lg:text-right order-2 lg:order-1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-primary/40">
                <img
                  src="/logo.png"
                  alt="Web Area Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-medium text-primary">Web Area</span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <span className="block text-slide-up text-foreground">{t.heroTitle1}</span>
              <span className="block mt-2 text-slide-up">
                {t.heroTitle2}{' '}
                <span className="gradient-text-cyber">{t.heroTitleHighlight}</span>،
              </span>
              <span className="block mt-1 text-slide-up">
                {t.heroTitle3.includes('ERP') ? (
                  <>
                    {t.heroTitle3.split('ERP')[0]}
                    <span className="gradient-text-violet">ERP</span>
                    {t.heroTitle3.split('ERP')[1]}
                  </>
                ) : (
                  t.heroTitle3
                )}
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 lg:mr-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {t.heroSubtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <button
                type="button"
                className="relative overflow-hidden text-base px-8 py-4 rounded-xl font-bold text-white flex items-center gap-2 transition-all duration-300 hover:scale-105 group"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #7c3aed)',
                  boxShadow: '0 4px 25px rgba(34,211,238,0.35), 0 0 0 1px rgba(34,211,238,0.2)',
                }}
                onClick={() => document.querySelector('#project-builder')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="animate-shimmer absolute inset-0 pointer-events-none" />
                <Rocket className="w-5 h-5 transition-transform group-hover:-translate-y-0.5 group-hover:rotate-12" />
                {t.heroCTA}
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </button>
              <button
                type="button"
                className="text-base px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
              >
                {t.heroDiscover}
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              className="mt-10 flex items-center justify-center lg:justify-start gap-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              {[
                { value: '4', label: t.heroStatProjects },
                { value: '∞', label: t.heroStatClients },
                { value: '24/7', label: t.heroStatStages },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="flex items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + i * 0.1, duration: 0.4 }}
                >
                  <div className="text-center px-4 sm:px-6">
                    <div className="text-3xl sm:text-4xl font-black text-primary">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                  {i < 2 && <div className="h-10 w-px bg-border/50" />}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Animated visual */}
          <motion.div
            className="order-1 lg:order-2 flex justify-center"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
          >
            <DigitalTransformationVisual />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <span className="text-xs text-muted-foreground">{t.heroScroll}</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
