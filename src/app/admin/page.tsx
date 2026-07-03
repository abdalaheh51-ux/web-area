/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, MessageSquare, Package,
  Upload, Loader2,
  Check, X, Trash2, Clock, Mail, Phone, Calendar,
  ArrowLeft, ArrowRight, ChevronDown, Search, Filter,
  Home, LogOut, User as UserIcon, Sun, Moon, Languages,
  Plus, Edit3, Eye, EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/hooks/use-language'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import Footer from '@/components/sections/footer'
import AuthModal from '@/components/auth-modal'

interface ProjectRequest {
  id: string
  referenceNumber: string
  industry: string
  description: string | null
  referenceSites: string
  features: string
  budget: string | null
  timeline: string | null
  contactMethod: string
  name: string
  email: string
  phone: string | null
  bestTime: string | null
  status: string
  adminNotes: string | null
  createdAt: string
}

interface VisitorComment {
  id: string
  name: string | null
  comment: string
  rating: number
  isApproved: boolean
  createdAt: string
}

interface PortfolioItem {
  id: string
  order: number
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  category: string
  technologies: string
  problem: string
  problemEn: string
  solution: string
  solutionEn: string
  result: string
  resultEn: string
  imageUrl: string | null
  gallery1: string | null
  gallery2: string | null
  gallery3: string | null
  externalUrl: string | null
  visible: boolean
  createdAt: string
}

type Tab = 'requests' | 'comments' | 'portfolio'

function PortfolioForm({ item, onSave, onCancel, dir }: {
  item: PortfolioItem | null
  onSave: (data: Partial<PortfolioItem>) => void
  onCancel: () => void
  dir: 'rtl' | 'ltr'
}) {
  const [formTab, setFormTab] = useState<'basic' | 'details' | 'images'>('basic')
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: item?.name || '',
    nameEn: item?.nameEn || '',
    description: item?.description || '',
    descriptionEn: item?.descriptionEn || '',
    category: item?.category || 'تحليل بيانات',
    technologies: item?.technologies || '',
    problem: item?.problem || '',
    problemEn: item?.problemEn || '',
    solution: item?.solution || '',
    solutionEn: item?.solutionEn || '',
    result: item?.result || '',
    resultEn: item?.resultEn || '',
    imageUrl: item?.imageUrl || '',
    gallery1: item?.gallery1 || '',
    gallery2: item?.gallery2 || '',
    gallery3: item?.gallery3 || '',
    externalUrl: item?.externalUrl || '',
    order: item?.order || 0,
  })

  const update = (field: string, value: string | number) => setFormData(prev => ({ ...prev, [field]: value }))

  // Auto-fill English from Arabic if empty
  const updateWithAutoEn = (arField: string, enField: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [arField]: value,
      ...(prev[enField as keyof typeof prev] === '' && value ? { [enField]: value } : {}),
    }))
  }

  // Auto-suggest image paths from name
  const autoFillImages = () => {
    const slug = formData.nameEn || formData.name || 'new'
    const id = Math.floor(Math.random() * 1000) + 10
    setFormData(prev => ({
      ...prev,
      imageUrl: prev.imageUrl || `/projects/project${id}.png`,
      gallery1: prev.gallery1 || `/projects/${id}-1.png`,
      gallery2: prev.gallery2 || `/projects/${id}-2.png`,
      gallery3: prev.gallery3 || `/projects/${id}-3.png`,
    }))
  }

  // Upload image from device
  const handleImageUpload = async (field: string, file: File) => {
    setUploadingField(field)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('type', field === 'imageUrl' ? 'main' : 'gallery')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        update(field, data.url)
      }
    } catch {
      // ignore
    } finally {
      setUploadingField(null)
    }
  }

  // Image upload button component
  const UploadButton = ({ field, label }: { field: string; label: string }) => (
    <label className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-medium cursor-pointer transition-colors shrink-0">
      {uploadingField === field ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Upload className="w-3 h-3" />
      )}
      {label}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImageUpload(field, file)
          e.target.value = '' // reset for re-upload
        }}
      />
    </label>
  )

  const handleSubmit = () => {
    onSave({ ...formData, id: item?.id })
  }

  const isRtl = dir === 'rtl'
  const labelClass = "text-xs font-medium text-muted-foreground"
  const inputClass = "text-sm"

  const categoryOptions = [
    { value: 'تحليل بيانات', label: isRtl ? 'تحليل بيانات' : 'Data Analytics' },
    { value: 'متجر إلكتروني', label: isRtl ? 'متجر إلكتروني' : 'E-Commerce' },
    { value: 'سيستم إداري', label: isRtl ? 'سيستم إداري' : 'Admin System' },
    { value: 'بورتفوليو', label: isRtl ? 'بورتفوليو' : 'Portfolio' },
  ]

  const techSuggestions = ['Next.js', 'React', 'Tailwind', 'Prisma', 'D3.js', 'Node.js', 'Stripe', 'Framer Motion']

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-muted/20">
        <button onClick={() => setFormTab('basic')} className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${formTab === 'basic' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>
          {isRtl ? 'أساسي' : 'Basic'}
        </button>
        <button onClick={() => setFormTab('details')} className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${formTab === 'details' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>
          {isRtl ? 'تفاصيل' : 'Details'}
        </button>
        <button onClick={() => setFormTab('images')} className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${formTab === 'images' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>
          {isRtl ? 'صور' : 'Images'}
        </button>
      </div>

      {/* Basic Tab */}
      {formTab === 'basic' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className={labelClass}>{isRtl ? 'الاسم (عربي) *' : 'Name (Arabic) *'}</label>
            <Input value={formData.name} onChange={(e) => updateWithAutoEn('name', 'nameEn', e.target.value)} className={inputClass} placeholder={isRtl ? 'مثال: متجر الأناقة' : 'e.g. Al-Anaqa Store'} />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{isRtl ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
            <Input value={formData.nameEn} onChange={(e) => update('nameEn', e.target.value)} className={inputClass} dir="ltr" placeholder="Auto-filled from Arabic" />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{isRtl ? 'الوصف (عربي)' : 'Description (Arabic)'}</label>
            <Textarea value={formData.description} onChange={(e) => updateWithAutoEn('description', 'descriptionEn', e.target.value)} className={inputClass} rows={2} placeholder={isRtl ? 'وصف مختصر للمشروع...' : 'Brief description...'} />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{isRtl ? 'الوصف (إنجليزي)' : 'Description (English)'}</label>
            <Textarea value={formData.descriptionEn} onChange={(e) => update('descriptionEn', e.target.value)} className={inputClass} rows={2} dir="ltr" placeholder="Auto-filled from Arabic" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelClass}>{isRtl ? 'التصنيف' : 'Category'}</label>
              <select
                value={formData.category}
                onChange={(e) => update('category', e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
              >
                {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/50">{isRtl ? 'الترتيب تلقائي - الأحدث يظهر أولاً' : 'Order is automatic - newest appears first'}</p>
          <div className="space-y-1">
            <label className={labelClass}>{isRtl ? 'التقنيات' : 'Technologies'}</label>
            <Input value={formData.technologies} onChange={(e) => update('technologies', e.target.value)} className={inputClass} dir="ltr" placeholder="Next.js, React, Prisma" />
            <div className="flex flex-wrap gap-1 mt-1">
              {techSuggestions.map(tech => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => {
                    const current = formData.technologies ? formData.technologies.split(', ').filter(Boolean) : []
                    if (!current.includes(tech)) {
                      update('technologies', [...current, tech].join(', '))
                    }
                  }}
                  className="px-2 py-0.5 rounded-full bg-muted/30 text-[10px] text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  + {tech}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Details Tab */}
      {formTab === 'details' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className={labelClass}>{isRtl ? 'المشكلة (عربي)' : 'Problem (Arabic)'}</label>
            <Textarea value={formData.problem} onChange={(e) => updateWithAutoEn('problem', 'problemEn', e.target.value)} className={inputClass} rows={2} />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{isRtl ? 'الحل (عربي)' : 'Solution (Arabic)'}</label>
            <Textarea value={formData.solution} onChange={(e) => updateWithAutoEn('solution', 'solutionEn', e.target.value)} className={inputClass} rows={2} />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{isRtl ? 'النتيجة (عربي)' : 'Result (Arabic)'}</label>
            <Input value={formData.result} onChange={(e) => updateWithAutoEn('result', 'resultEn', e.target.value)} className={inputClass} placeholder={isRtl ? 'مثال: زيادة 65%' : 'e.g. 65% increase'} />
          </div>
          <p className="text-[10px] text-muted-foreground/50">{isRtl ? 'الإنجليزي يتعبأ تلقائياً من العربي' : 'English auto-fills from Arabic'}</p>
        </div>
      )}

      {/* Images Tab */}
      {formTab === 'images' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={labelClass}>{isRtl ? 'روابط الصور' : 'Image URLs'}</label>
            <Button type="button" variant="outline" size="sm" onClick={autoFillImages} className="h-7 text-[10px] gap-1">
              {isRtl ? 'تعبئة تلقائية' : 'Auto-fill'}
            </Button>
          </div>

          {/* Main Image */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className={labelClass}>{isRtl ? 'الصورة الرئيسية' : 'Main Image'}</label>
              <UploadButton field="imageUrl" label={isRtl ? 'رفع' : 'Upload'} />
            </div>
            <Input value={formData.imageUrl} onChange={(e) => update('imageUrl', e.target.value)} className={inputClass} dir="ltr" placeholder="/projects/project7.png أو ارفع صورة" />
          </div>

          {/* Gallery Images */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(['gallery1', 'gallery2', 'gallery3'] as const).map((field, i) => (
              <div key={field} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>{isRtl ? `معرض ${i + 1}` : `Gallery ${i + 1}`}</label>
                  <UploadButton field={field} label={isRtl ? 'رفع' : 'Upload'} />
                </div>
                <Input value={formData[field]} onChange={(e) => update(field, e.target.value)} className={inputClass} dir="ltr" />
                {/* Thumbnail preview */}
                {formData[field] && (
                  <div className="relative h-16 rounded-md overflow-hidden border border-border/30 bg-muted/20">
                    <img src={formData[field]} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0' }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{isRtl ? 'رابط الموقع (اختياري)' : 'External URL (optional)'}</label>
            <Input value={formData.externalUrl} onChange={(e) => update('externalUrl', e.target.value)} className={inputClass} dir="ltr" placeholder="https://example.com" />
          </div>

          {/* Main image preview */}
          {formData.imageUrl && (
            <div className="rounded-lg overflow-hidden border border-border/30 max-h-40">
              <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
          )}

          {/* Upload tip */}
          <p className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
            <Upload className="w-3 h-3" />
            {isRtl ? 'اضغط رفع لاختيار صورة من جهازك (حد أقصى 5 ميجا)' : 'Click Upload to select from device (max 5MB)'}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-border/30">
        <Button onClick={handleSubmit} className="gap-2">
          <Check className="w-4 h-4" />
          {isRtl ? 'حفظ' : 'Save'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4" />
          {isRtl ? 'إلغاء' : 'Cancel'}
        </Button>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { t, dir, lang, toggleLanguage } = useLanguage()
  const { toast } = useToast()
  const { user, loading, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const [tab, setTab] = useState<Tab>('requests')
  const [requests, setRequests] = useState<ProjectRequest[]>([])
  const [comments, setComments] = useState<VisitorComment[]>([])
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [authOpen, setAuthOpen] = useState(false)
  const isRtl = dir === 'rtl'

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/project-requests')
      const data = await res.json()
      if (data.requests) setRequests(data.requests)
    } catch { /* ignore */ }
  }, [])

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/comments')
      const data = await res.json()
      if (data.comments) setComments(data.comments)
    } catch { /* ignore */ }
  }, [])

  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/portfolio')
      const data = await res.json()
      if (data.items) setPortfolioItems(data.items)
    } catch { /* ignore */ }
  }, [])

  const loadData = useCallback(async () => {
    await Promise.all([fetchRequests(), fetchComments(), fetchPortfolio()])
    setDataLoading(false)
  }, [fetchRequests, fetchComments, fetchPortfolio])

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData()
    } else if (!loading && user === null) {
      setDataLoading(false)
    }
  }, [user, loading, loadData])

  const updateRequestStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/project-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const data = await res.json()
      if (data.success) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
        toast({ title: 'تم التحديث' })
      }
    } catch { toast({ title: 'خطأ', variant: 'destructive' }) }
  }

  const deleteRequest = async (id: string) => {
    try {
      await fetch(`/api/admin/project-requests/${id}`, { method: 'DELETE' })
      setRequests(prev => prev.filter(r => r.id !== id))
      toast({ title: 'تم الحذف' })
    } catch { toast({ title: 'خطأ', variant: 'destructive' }) }
  }

  const toggleCommentApproval = async (id: string, approve: boolean) => {
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved: approve }),
      })
      const data = await res.json()
      if (data.success) {
        setComments(prev => prev.map(c => c.id === id ? { ...c, isApproved: approve } : c))
        toast({ title: approve ? 'تم الاعتماد' : 'تم الرفض' })
      }
    } catch { toast({ title: 'خطأ', variant: 'destructive' }) }
  }

  const deleteComment = async (id: string) => {
    try {
      await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
      setComments(prev => prev.filter(c => c.id !== id))
      toast({ title: 'تم الحذف' })
    } catch { toast({ title: 'خطأ', variant: 'destructive' }) }
  }

  const savePortfolioItem = async (item: Partial<PortfolioItem>) => {
    try {
      if (item.id) {
        // Update
        const res = await fetch('/api/admin/portfolio', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })
        const data = await res.json()
        if (data.success) {
          setPortfolioItems(prev => prev.map(p => p.id === item.id ? data.item : p))
          toast({ title: 'تم الحفظ' })
        }
      } else {
        // Create
        const res = await fetch('/api/admin/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })
        const data = await res.json()
        if (data.success) {
          setPortfolioItems(prev => [data.item, ...prev])
          toast({ title: 'تمت الإضافة' })
        }
      }
      setShowForm(false)
      setEditingItem(null)
    } catch { toast({ title: 'خطأ', variant: 'destructive' }) }
  }

  const deletePortfolioItem = async (id: string) => {
    try {
      await fetch(`/api/admin/portfolio/${id}`, { method: 'DELETE' })
      setPortfolioItems(prev => prev.filter(p => p.id !== id))
      toast({ title: 'تم الحذف' })
    } catch { toast({ title: 'خطأ', variant: 'destructive' }) }
  }

  const togglePortfolioVisibility = async (id: string, visible: boolean) => {
    try {
      const res = await fetch('/api/admin/portfolio', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, visible }),
      })
      const data = await res.json()
      if (data.success) {
        setPortfolioItems(prev => prev.map(p => p.id === id ? { ...p, visible } : p))
        toast({ title: visible ? 'تم إظهار المشروع' : 'تم إخفاء المشروع' })
      }
    } catch { toast({ title: 'خطأ', variant: 'destructive' }) }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(dir === 'rtl' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
    contacted: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
    quoted: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20',
    closed: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  }

  const statusLabels: Record<string, string> = {
    new: dir === 'rtl' ? 'جديد' : 'New',
    contacted: dir === 'rtl' ? 'تم التواصل' : 'Contacted',
    quoted: dir === 'rtl' ? 'تم التسعير' : 'Quoted',
    closed: dir === 'rtl' ? 'مغلق' : 'Closed',
  }

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const matchesSearch = !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.industry.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Stats
  const newRequests = requests.filter(r => r.status === 'new').length
  const pendingComments = comments.filter(c => !c.isApproved).length

  // Loading or unauthorized
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={dir}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={dir}>
        <Card className="frosted-glass max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <X className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">
              {dir === 'rtl' ? 'غير مصرح' : 'Unauthorized'}
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              {dir === 'rtl' ? 'يجب تسجيل الدخول بحساب أدمن للوصول لهذه الصفحة' : 'You must login as admin to access this page'}
            </p>
            <Button onClick={() => window.location.href = '/'}>
              {dir === 'rtl' ? 'العودة للرئيسية' : 'Back to Home'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    toast({ title: dir === 'rtl' ? 'تم تسجيل الخروج' : 'Logged out' })
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      {/* Admin Navbar - simplified */}
      <nav
        dir={dir}
        className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-md border-b border-border/50"
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="Web Area - Home"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-cyan-300/50 nav-logo-glow">
              <img src="/logo.png" alt="Web Area Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-base font-bold text-foreground whitespace-nowrap group-hover:text-primary transition-colors max-[360px]:hidden">
              Web Area
            </span>
            <Badge className="ml-1 bg-gradient-to-l from-blue-500 to-amber-500 text-white border-0 text-[10px]">
              {dir === 'rtl' ? 'إدارة' : 'Admin'}
            </Badge>
          </a>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Theme toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 rounded-lg text-muted-foreground hover:text-blue-500"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}

            {/* Language toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="text-muted-foreground hover:text-blue-500 gap-1.5"
              aria-label="Toggle language"
            >
              <Languages className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </Button>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Home button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/'}
              className="text-muted-foreground hover:text-blue-500 gap-1.5"
              aria-label={dir === 'rtl' ? 'الرئيسية' : 'Home'}
            >
              <Home className="h-4 w-4" />
              <span className="text-xs font-semibold hidden sm:inline">
                {dir === 'rtl' ? 'الرئيسية' : 'Home'}
              </span>
            </Button>

            {/* User avatar / Login */}
            {mounted && user ? (
              <button
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-2 px-2 py-1 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-all"
                aria-label={user.name || user.email}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
              </button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAuthOpen(true)}
                className="text-muted-foreground hover:text-blue-500 gap-1.5"
              >
                <UserIcon className="h-4 w-4" />
              </Button>
            )}

            {/* Logout button */}
            {mounted && user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-destructive hover:bg-destructive/10 gap-1.5"
                aria-label={dir === 'rtl' ? 'خروج' : 'Logout'}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-xs font-semibold hidden sm:inline">
                  {dir === 'rtl' ? 'خروج' : 'Logout'}
                </span>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <main className="flex-1 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-amber-500 shadow-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {dir === 'rtl' ? 'لوحة الإدارة' : 'Admin Dashboard'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {dir === 'rtl' ? 'إدارة الطلبات والتعليقات' : 'Manage requests and comments'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="frosted-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10">
                  <Package className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{requests.length}</p>
                  <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'إجمالي الطلبات' : 'Total Requests'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="frosted-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{newRequests}</p>
                  <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'طلبات جديدة' : 'New Requests'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="frosted-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10">
                  <MessageSquare className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{comments.length}</p>
                  <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'إجمالي التعليقات' : 'Total Comments'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="frosted-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/10">
                  <Clock className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingComments}</p>
                  <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'بانتظار الاعتماد' : 'Pending Approval'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 mb-6 rounded-xl bg-muted/30 w-fit">
            <button
              onClick={() => setTab('requests')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === 'requests' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-4 h-4" />
              {dir === 'rtl' ? 'الطلبات' : 'Requests'}
              {newRequests > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">{newRequests}</span>
              )}
            </button>
            <button
              onClick={() => setTab('comments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === 'comments' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              {dir === 'rtl' ? 'التعليقات' : 'Comments'}
              {pendingComments > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">{pendingComments}</span>
              )}
            </button>
            <button
              onClick={() => setTab('portfolio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === 'portfolio' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Package className="w-4 h-4" />
              {dir === 'rtl' ? 'أعمالنا' : 'Portfolio'}
              {portfolioItems.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">{portfolioItems.length}</span>
              )}
            </button>
          </div>

          {/* Content */}
          {dataLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tab === 'requests' ? (
            /* Requests Tab */
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" style={isRtl ? { right: '0.75rem' } : { left: '0.75rem' }} />
                  <Input
                    placeholder={dir === 'rtl' ? 'بحث بالاسم، البريد، رقم المرجع...' : 'Search by name, email, reference...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={isRtl ? 'pr-10' : 'pl-10'}
                  />
                </div>
                <div className="flex gap-2">
                  {['all', 'new', 'contacted', 'quoted', 'closed'].map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {s === 'all' ? (dir === 'rtl' ? 'الكل' : 'All') : statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>

              {filteredRequests.length === 0 ? (
                <Card className="frosted-card">
                  <CardContent className="p-10 text-center">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">{dir === 'rtl' ? 'لا توجد طلبات' : 'No requests found'}</p>
                  </CardContent>
                </Card>
              ) : (
                filteredRequests.map((req) => (
                  <Card key={req.id} className="frosted-card overflow-hidden">
                    <CardContent className="p-0">
                      {/* Header */}
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-amber-500 text-white font-bold shrink-0">
                            {req.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{req.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{req.referenceNumber} · {formatDate(req.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={statusColors[req.status] || statusColors.new}>
                            {statusLabels[req.status] || req.status}
                          </Badge>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedId === req.id ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {expandedId === req.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-2 border-t border-border/30 space-y-3">
                              {/* Contact info */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                  <a href={`mailto:${req.email}`} className="text-blue-500 hover:underline truncate">{req.email}</a>
                                </div>
                                {req.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                    <a href={`tel:${req.phone}`} className="text-blue-500 hover:underline" dir="ltr">{req.phone}</a>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span>{req.contactMethod}</span>
                                </div>
                                {req.bestTime && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span>{req.bestTime}</span>
                                  </div>
                                )}
                              </div>

                              {/* Industry & description */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-2.5 rounded-lg bg-muted/20">
                                  <p className="text-[10px] text-muted-foreground mb-0.5">{dir === 'rtl' ? 'المجال' : 'Industry'}</p>
                                  <p className="text-xs font-medium">{req.industry}</p>
                                </div>
                                {req.budget && (
                                  <div className="p-2.5 rounded-lg bg-muted/20">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">{dir === 'rtl' ? 'الميزانية' : 'Budget'}</p>
                                    <p className="text-xs font-medium">{req.budget}</p>
                                  </div>
                                )}
                                {req.timeline && (
                                  <div className="p-2.5 rounded-lg bg-muted/20">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">{dir === 'rtl' ? 'الموعد' : 'Timeline'}</p>
                                    <p className="text-xs font-medium">{req.timeline}</p>
                                  </div>
                                )}
                                {req.description && (
                                  <div className="p-2.5 rounded-lg bg-muted/20">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">{dir === 'rtl' ? 'الوصف' : 'Description'}</p>
                                    <p className="text-xs">{req.description}</p>
                                  </div>
                                )}
                              </div>

                              {/* Reference sites & features (JSON) */}
                              {(() => {
                                try {
                                  const sites = JSON.parse(req.referenceSites)
                                  const features = JSON.parse(req.features)
                                  return (
                                    <div className="space-y-2">
                                      {Array.isArray(sites) && sites.length > 0 && (
                                        <div className="p-2.5 rounded-lg bg-muted/20">
                                          <p className="text-[10px] text-muted-foreground mb-1">{dir === 'rtl' ? 'المواقع المرجعية' : 'Reference Sites'}</p>
                                          <div className="space-y-1">
                                            {sites.map((s: { url: string }, i: number) => (
                                              <p key={i} className="text-xs text-blue-500 truncate" dir="ltr">{i + 1}. {s.url}</p>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {features && typeof features === 'object' && (
                                        <div className="p-2.5 rounded-lg bg-muted/20">
                                          <p className="text-[10px] text-muted-foreground mb-1">{dir === 'rtl' ? 'المتطلبات' : 'Requirements'}</p>
                                          <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap">{JSON.stringify(features, null, 2)}</pre>
                                        </div>
                                      )}
                                    </div>
                                  )
                                } catch { return null }
                              })()}

                              {/* Actions */}
                              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/30">
                                <span className="text-xs text-muted-foreground">{dir === 'rtl' ? 'تغيير الحالة:' : 'Change status:'}</span>
                                {['new', 'contacted', 'quoted', 'closed'].map(s => (
                                  <button
                                    key={s}
                                    onClick={() => updateRequestStatus(req.id, s)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                                      req.status === s ? statusColors[s] : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                                    }`}
                                  >
                                    {statusLabels[s]}
                                  </button>
                                ))}
                                <div className="flex-1" />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => deleteRequest(req.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : tab === 'comments' ? (
            /* Comments Tab */
            <div className="space-y-3">
              {comments.length === 0 ? (
                <Card className="frosted-card">
                  <CardContent className="p-10 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">{dir === 'rtl' ? 'لا توجد تعليقات' : 'No comments found'}</p>
                  </CardContent>
                </Card>
              ) : (
                comments.map((comment) => (
                  <Card key={comment.id} className={`frosted-card ${!comment.isApproved ? 'border-amber-500/20' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-amber-500 text-white font-bold shrink-0">
                          {(comment.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">{comment.name || (dir === 'rtl' ? 'زائر' : 'Visitor')}</p>
                              <Badge className={comment.isApproved ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}>
                                {comment.isApproved ? (dir === 'rtl' ? 'معتمد' : 'Approved') : (dir === 'rtl' ? 'بانتظار' : 'Pending')}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(comment.createdAt)}</span>
                          </div>
                          {/* Stars */}
                          <div className="flex gap-0.5 mb-2">
                            {[1, 2, 3, 4, 5].map(s => (
                              <span key={s} className={s <= comment.rating ? 'text-amber-500' : 'text-muted-foreground/20'}>★</span>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{comment.comment}</p>
                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {!comment.isApproved ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-emerald-600 hover:bg-emerald-500/10"
                                onClick={() => toggleCommentApproval(comment.id, true)}
                              >
                                <Check className="w-3.5 h-3.5" />
                                {dir === 'rtl' ? 'اعتماد' : 'Approve'}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-amber-600 hover:bg-amber-500/10"
                                onClick={() => toggleCommentApproval(comment.id, false)}
                              >
                                <X className="w-3.5 h-3.5" />
                                {dir === 'rtl' ? 'إلغاء الاعتماد' : 'Unapprove'}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => deleteComment(comment.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            /* Portfolio Tab */
            <div className="space-y-4">
              {/* Add new button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => { setEditingItem(null); setShowForm(true) }}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {dir === 'rtl' ? 'إضافة مشروع' : 'Add Project'}
                </Button>
              </div>

              {/* Form (modal-like inline) */}
              {showForm && (
                <Card className="frosted-card">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-bold text-lg">
                      {editingItem ? (dir === 'rtl' ? 'تعديل مشروع' : 'Edit Project') : (dir === 'rtl' ? 'مشروع جديد' : 'New Project')}
                    </h3>
                    {/* Form fields - use a simple approach with state */}
                    <PortfolioForm
                      item={editingItem}
                      onSave={savePortfolioItem}
                      onCancel={() => { setShowForm(false); setEditingItem(null) }}
                      dir={dir}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Portfolio items list */}
              {portfolioItems.length === 0 ? (
                <Card className="frosted-card">
                  <CardContent className="p-10 text-center">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">{dir === 'rtl' ? 'لا توجد مشاريع' : 'No projects'}</p>
                  </CardContent>
                </Card>
              ) : (
                portfolioItems.map((item) => (
                  <Card key={item.id} className="frosted-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {/* Image */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted/30 shrink-0">
                            {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm truncate">{item.name}</p>
                              {!item.visible && <Badge className="bg-amber-500/15 text-amber-600 text-[10px]">{dir === 'rtl' ? 'مخفي' : 'Hidden'}</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{item.category} · {item.technologies}</p>
                            <p className="text-xs text-muted-foreground/60 truncate mt-0.5">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => togglePortfolioVisibility(item.id, !item.visible)}>
                            {item.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingItem(item); setShowForm(true) }}>
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => deletePortfolioItem(item.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
