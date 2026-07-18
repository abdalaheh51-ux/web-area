# ميزة التقاط صور الموقع (Screenshot) - دليل الاستخدام والتطبيق

## 📋 نظرة عامة

تم إضافة ميزة متقدمة لالتقاط صور كاملة للمواقع (Full Page Screenshots) مع دعم الأوضاع المختلفة (Dark/Light Mode) وتأثيرات الأنيميشن.

---

## 🎯 المميزات الرئيسية

### 1. التقاط صور كاملة للموقع
- التقاط الصفحة كاملة بدقة عالية (JPEG بجودة 85%)
- دعم المواقع الديناميكية
- معالجة الصور الكسولة (Lazy Loading)

### 2. دعم الأوضاع المختلفة
- **Light Mode**: التقاط الصورة بالوضع الفاتح
- **Dark Mode**: التقاط الصورة بالوضع المظلم

### 3. تأخير قابل للتخصيص
- تأخير افتراضي: 40 ثانية
- نطاق التأخير: 5-120 ثانية
- يضمن تحميل جميع الصور الكسولة

### 4. أنيميشن Scroll
- عرض الصورة مع تأثير scroll من الأسفل للأعلى والعكس
- تفاعل عند التمرير فوق الصورة
- مدة الأنيميشن قابلة للتخصيص

---

## 📁 الملفات المُنشأة

### 1. **src/app/api/screenshot/route.ts**
API endpoint لالتقاط الصور
- يستخدم Puppeteer أو Playwright
- يدعم Dark/Light Mode
- يرفع الصورة تلقائياً إلى التخزين

### 2. **src/components/ui/scrolling-image.tsx**
مكون React لعرض الصور مع أنيميشن Scroll
- أنيميشن سلس من الأسفل للأعلى
- تفاعل عند التمرير
- قابل للتخصيص

### 3. **src/app/admin/screenshot-handler.tsx**
مكون لوحة التحكم لالتقاط الصور
- إدخال رابط الموقع
- اختيار الوضع (Light/Dark)
- تحديد التأخير
- عرض حالة التقاط الصورة

---

## 🚀 خطوات التطبيق

### المرحلة 1: تثبيت المكتبات المطلوبة

```bash
# تثبيت Puppeteer (الخيار الأول)
npm install puppeteer

# أو تثبيت Playwright (الخيار الثاني)
npm install playwright
```

### المرحلة 2: إضافة المكونات إلى لوحة التحكم

في ملف `src/app/admin/page.tsx`، أضف الاستيراد:

```typescript
import ScreenshotHandler from './screenshot-handler'
import { ScrollingImage } from '@/components/ui/scrolling-image'
```

### المرحلة 3: إضافة الزر في نموذج البطاقة

في ملف `src/app/admin/page.tsx` (داخل `PortfolioForm`)، أضف في تبويب الصور:

```typescript
{formTab === 'images' && (
  <div className="space-y-3">
    {/* الكود الموجود */}
    
    {/* إضافة مكون التقاط الصورة */}
    <ScreenshotHandler
      onScreenshotCaptured={(url) => {
        update('imageUrl', url)
        toast({
          title: isRtl ? 'تم التقاط الصورة' : 'Screenshot captured',
          description: isRtl ? 'تم حفظ الصورة كصورة رئيسية' : 'Saved as main image',
        })
      }}
      dir={dir}
    />
  </div>
)}
```

### المرحلة 4: عرض الصور مع الأنيميشن

في ملف `src/components/sections/portfolio.tsx`، استخدم المكون الجديد:

```typescript
import { ScrollingImage } from '@/components/ui/scrolling-image'

// في عرض الصورة الرئيسية
{project.imageUrl && project.imageUrl.includes('screenshot') ? (
  <ScrollingImage
    src={project.imageUrl}
    alt={projectName}
    className="w-full h-full"
    duration={8}
    autoPlay={true}
  />
) : (
  <img
    src={project.imageUrl}
    alt={projectName}
    className="w-full h-full object-cover"
  />
)}
```

---

## 💻 مثال الاستخدام

### من لوحة التحكم:

1. افتح تبويب "صور" في نموذج البطاقة
2. انقر على زر "التقاط صورة من الموقع"
3. أدخل رابط الموقع (مثال: https://example.com)
4. اختر الوضع (فاتح أو مظلم)
5. حدد التأخير (افتراضي: 40 ثانية)
6. انقر على "التقاط الصورة"
7. ستظهر الصورة تلقائياً في حقل الصورة الرئيسية

---

## 🎨 تخصيص الأنيميشن

### تغيير مدة الأنيميشن:

```typescript
<ScrollingImage
  src={imageUrl}
  alt="Project screenshot"
  duration={10} // 10 ثواني بدلاً من 8
  autoPlay={true}
/>
```

### إيقاف الأنيميشن التلقائي:

```typescript
<ScrollingImage
  src={imageUrl}
  alt="Project screenshot"
  autoPlay={false} // تشغيل الأنيميشن عند التمرير فقط
/>
```

---

## 🔧 متطلبات الخادم

### متطلبات النظام:

- Node.js 16+
- Memory: 512MB على الأقل
- Disk Space: 500MB على الأقل (لـ Chromium)

### متغيرات البيئة:

```env
# اختياري - لتحديد عنوان التطبيق
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## ⚙️ إعدادات Puppeteer/Playwright

### تحسين الأداء:

```typescript
// في route.ts
const browser = await puppeteer.default.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage', // لتقليل استهلاك الذاكرة
    '--disable-gpu',
  ],
});
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: "Screenshot service not available"
**الحل:** تثبيت Puppeteer أو Playwright
```bash
npm install puppeteer
```

### المشكلة: "Failed to capture screenshot"
**الحل:** تحقق من:
1. صحة الرابط
2. اتصال الإنترنت
3. حالة الخادم المستهدف

### المشكلة: الصور الكسولة لم تحمل
**الحل:** زيادة قيمة التأخير (مثلاً 60 ثانية بدلاً من 40)

---

## 📊 جدول المتطلبات

| المتطلب | الوصف | الحالة |
|--------|------|--------|
| Puppeteer/Playwright | لالتقاط الصور | ✅ مطلوب |
| API Upload | لرفع الصور | ✅ موجود |
| ScrollingImage Component | لعرض الأنيميشن | ✅ جاهز |
| ScreenshotHandler Component | لواجهة التقاط | ✅ جاهز |

---

## 🎯 حالات الاستخدام

### 1. عرض لقطات المشاريع
التقاط صور كاملة للمشاريع المنجزة وعرضها مع أنيميشن

### 2. مقارنة الأوضاع
التقاط الصورة بالوضع الفاتح والمظلم لإظهار التوافقية

### 3. توثيق الحالة
التقاط صور دورية للموقع لتوثيق التطور

### 4. العروض التقديمية
استخدام الصور المتحركة في العروض التقديمية

---

## 📈 الأداء

### وقت التقاط الصورة:
- تحميل الصفحة: 5-10 ثواني
- التأخير للصور الكسولة: 40 ثانية (قابل للتخصيص)
- معالجة الصورة: 2-3 ثواني
- **الإجمالي: ~50 ثانية**

### حجم الصورة:
- دقة: 1920x1080 (قابلة للتخصيص)
- صيغة: JPEG بجودة 85%
- الحجم المتوسط: 200-500 KB

---

## 🔐 الأمان

- التحقق من صحة الرابط
- التحقق من صلاحيات المستخدم (Admin فقط)
- معالجة آمنة للأخطاء
- عدم حفظ بيانات حساسة

---

## 📝 ملاحظات مهمة

1. **الصور الكسولة**: التأخير الافتراضي (40 ثانية) يضمن تحميل معظم الصور الكسولة
2. **استهلاك الموارد**: التقاط الصور يستهلك موارد كبيرة، استخدمه بحذر
3. **الأداء**: قد يكون بطيئاً على الخوادم ذات الموارد المحدودة
4. **التوافقية**: يعمل مع معظم المواقع الحديثة

---

## 🚀 التحسينات المستقبلية

1. إضافة معاينة مباشرة قبل الحفظ
2. دعم تحديد منطقة معينة من الصفحة
3. إضافة فلاتر وتأثيرات على الصور
4. دعم رفع متعدد للصور
5. تخزين مؤقت للصور المالتقطة

---

**آخر تحديث:** 18 يوليو 2026
**الإصدار:** 1.0
**الحالة:** جاهز للتطبيق
