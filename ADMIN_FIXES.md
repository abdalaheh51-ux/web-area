# إصلاحات لوحة التحكم - معالجة الصور

## 📝 الإصلاحات المقترحة

### 1. تحسين معالجة رفع الصور مع التحقق من الأبعاد

**الملف:** `src/app/admin/page.tsx`

**الكود الحالي (السطر 137-174):**
```typescript
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
      toast({
        title: dir === 'rtl' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully',
        description: dir === 'rtl' ? 'تم حفظ الصورة وربطها بالحقول المطلوبة' : 'The image was saved and linked successfully',
      })
    } else {
      const details = data.details ? ` (${JSON.stringify(data.details)})` : ''
      toast({
        title: dir === 'rtl' ? 'فشل رفع الصورة' : 'Image upload failed',
        description:
          (data.error || (dir === 'rtl' ? 'حدث خطأ أثناء رفع الصورة' : 'Something went wrong while uploading the image')) + details,
        variant: 'destructive',
      })
    }
  } catch (error) {
    toast({
      title: dir === 'rtl' ? 'فشل رفع الصورة' : 'Image upload failed',
      description: `${dir === 'rtl' ? 'تحقق من الملف وحاول مرة أخرى' : 'Please check the file and try again'}${error instanceof Error ? `: ${error.message}` : ''}`,
      variant: 'destructive',
    })
  } finally {
    setUploadingField(null)
  }
}
```

**الكود المحسّن:**
```typescript
// ✅ FIX #2 و #5: تحسين معالجة رفع الصور مع التحقق من الأبعاد
const handleImageUpload = async (field: string, file: File) => {
  setUploadingField(field)
  
  try {
    // ✅ FIX #5: التحقق من أبعاد الصورة قبل الرفع
    const img = new Image()
    const validationPromise = new Promise<boolean>((resolve) => {
      img.onload = () => {
        const minWidth = 400
        const minHeight = 300
        
        if (img.width < minWidth || img.height < minHeight) {
          toast({
            title: dir === 'rtl' ? 'الصورة صغيرة جداً' : 'Image too small',
            description: dir === 'rtl' 
              ? `الحد الأدنى: ${minWidth}x${minHeight}px، الصورة الحالية: ${img.width}x${img.height}px`
              : `Minimum: ${minWidth}x${minHeight}px, your image: ${img.width}x${img.height}px`,
            variant: 'destructive',
          })
          resolve(false)
        } else {
          resolve(true)
        }
      }
      img.onerror = () => {
        toast({
          title: dir === 'rtl' ? 'خطأ في الصورة' : 'Invalid image',
          description: dir === 'rtl' ? 'تأكد من أن الملف صورة صحيحة' : 'Make sure the file is a valid image',
          variant: 'destructive',
        })
        resolve(false)
      }
      img.src = URL.createObjectURL(file)
    })

    const isValid = await validationPromise
    if (!isValid) {
      setUploadingField(null)
      return
    }

    // متابعة الرفع
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
      toast({
        title: dir === 'rtl' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully',
        description: dir === 'rtl' 
          ? `تم حفظ الصورة (${data.originalDimensions})`
          : `Image saved (${data.originalDimensions})`,
      })
    } else {
      // ✅ FIX #7: رسائل خطأ أفضل ومفصلة
      const errorMessages: Record<number, string> = {
        400: dir === 'rtl' ? 'صيغة الملف غير صحيحة أو الأبعاد صغيرة جداً' : 'Invalid file format or dimensions too small',
        413: dir === 'rtl' ? 'الملف كبير جداً (الحد الأقصى 5 ميجا)' : 'File too large (max 5MB)',
        500: dir === 'rtl' ? 'خطأ في الخادم، يرجى المحاولة لاحقاً' : 'Server error, please try again later',
      }
      
      const statusCode = res.status || 500
      const errorMsg = errorMessages[statusCode] || data.error || 'فشل رفع الصورة'
      
      toast({
        title: dir === 'rtl' ? 'فشل رفع الصورة' : 'Upload failed',
        description: data.details ? `${errorMsg}: ${data.details}` : errorMsg,
        variant: 'destructive',
      })
    }
  } catch (error) {
    toast({
      title: dir === 'rtl' ? 'فشل رفع الصورة' : 'Image upload failed',
      description: `${dir === 'rtl' ? 'تحقق من الملف وحاول مرة أخرى' : 'Please check the file and try again'}${error instanceof Error ? `: ${error.message}` : ''}`,
      variant: 'destructive',
    })
  } finally {
    setUploadingField(null)
  }
}
```

---

### 2. تحسين معاينة الصور في لوحة التحكم

**الملف:** `src/app/admin/page.tsx` (السطر 334-338)

**الكود الحالي:**
```typescript
{formData[field] && (
  <div className="relative h-16 rounded-md overflow-hidden border border-border/30 bg-muted/20">
    <img src={formData[field]} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0' }} />
  </div>
)}
```

**الكود المحسّن:**
```typescript
{/* ✅ FIX #2: معاينة أفضل للصور مع رسائل واضحة */}
{formData[field] ? (
  <div className="relative h-16 rounded-md overflow-hidden border border-border/30 bg-muted/20 flex items-center justify-center">
    <img 
      src={formData[field]} 
      alt={`Gallery ${i + 1}`} 
      className="w-full h-full object-cover" 
      onError={(e) => { 
        const img = e.target as HTMLImageElement
        img.style.display = 'none'
        const parent = img.parentElement
        if (parent) {
          parent.innerHTML = `
            <div class="flex flex-col items-center gap-1 text-xs text-red-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>${isRtl ? 'فشل تحميل الصورة' : 'Failed to load'}</span>
            </div>
          `
        }
      }} 
    />
  </div>
) : (
  <div className="h-16 rounded-md border border-dashed border-border/30 bg-muted/20 flex items-center justify-center">
    <p className="text-xs text-muted-foreground">{isRtl ? 'لا توجد صورة' : 'No image'}</p>
  </div>
)}
```

---

### 3. تحسين معالجة الصور الرئيسية في المعاينة

**الملف:** `src/app/admin/page.tsx` (السطر 348-353)

**الكود الحالي:**
```typescript
{formData.imageUrl && (
  <div className="rounded-lg overflow-hidden border border-border/30 max-h-40">
    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
  </div>
)}
```

**الكود المحسّن:**
```typescript
{/* ✅ FIX #2: معاينة أفضل للصورة الرئيسية */}
{formData.imageUrl && (
  <div className="rounded-lg overflow-hidden border border-border/30 max-h-40 bg-muted/20 flex items-center justify-center">
    <img 
      src={formData.imageUrl} 
      alt="Preview" 
      className="w-full h-full object-cover" 
      onError={(e) => { 
        const img = e.target as HTMLImageElement
        img.style.display = 'none'
        const parent = img.parentElement
        if (parent) {
          parent.innerHTML = `
            <div class="flex flex-col items-center gap-2 text-center p-4">
              <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-xs text-red-500">${isRtl ? 'فشل تحميل الصورة' : 'Failed to load image'}</p>
            </div>
          `
        }
      }} 
    />
  </div>
)}
```

---

### 4. إضافة رسالة توضيحية عن متطلبات الصور

**الملف:** `src/app/admin/page.tsx` (السطر 355-359)

**الكود الحالي:**
```typescript
<p className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
  <Upload className="w-3 h-3" />
  {isRtl ? 'اضغط رفع لاختيار صورة من جهازك (حد أقصى 5 ميجا)' : 'Click Upload to select from device (max 5MB)'}
</p>
```

**الكود المحسّن:**
```typescript
{/* ✅ FIX #5: رسالة توضيحية أفضل عن متطلبات الصور */}
<div className="text-[10px] text-muted-foreground/50 space-y-1 p-2 rounded-md bg-muted/20 border border-border/20">
  <p className="flex items-center gap-1">
    <Upload className="w-3 h-3" />
    {isRtl ? 'اضغط رفع لاختيار صورة من جهازك' : 'Click Upload to select from device'}
  </p>
  <ul className="list-disc list-inside space-y-0.5 text-muted-foreground/40">
    <li>{isRtl ? 'الحد الأقصى: 5 ميجا' : 'Max size: 5MB'}</li>
    <li>{isRtl ? 'الحد الأدنى: 400x300 بكسل' : 'Min dimensions: 400x300px'}</li>
    <li>{isRtl ? 'الصيغ المدعومة: JPEG, PNG, WebP, GIF' : 'Supported formats: JPEG, PNG, WebP, GIF'}</li>
  </ul>
</div>
```

---

## 🔄 خطوات التطبيق

1. **نسخ الإصلاحات:** انسخ الأكواد المحسّنة إلى الملفات المناسبة
2. **اختبار الرفع:** جرب رفع صور بأحجام مختلفة
3. **اختبار الأخطاء:** جرب رفع صور صغيرة جداً أو بصيغ غير صحيحة
4. **التحقق من المعاينة:** تأكد من ظهور الصور بشكل صحيح في لوحة التحكم

---

## 📊 الفوائد

| الإصلاح | الفائدة |
|--------|--------|
| التحقق من الأبعاد | منع رفع صور منخفضة الجودة |
| رسائل خطأ أفضل | توضيح المشاكل للمستخدم |
| معاينة محسّنة | رؤية واضحة لحالة الصور |
| متطلبات موضحة | فهم أفضل لما هو مطلوب |

---

## ⚠️ ملاحظات مهمة

- تأكد من تثبيت مكتبة `sharp` في المشروع
- اختبر جميع التغييرات على متصفحات مختلفة
- تحقق من أن API يعيد الحقل `originalDimensions` في الاستجابة
