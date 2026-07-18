# دليل تحديث نموذج لوحة التحكم - الترجمة التلقائية والتصنيفات الجديدة

## 📋 نظرة عامة

تم تحديث قسم "أعمالنا" بالميزات التالية:
1. **إضافة تصنيفات جديدة** في الفلتر: صفحة هبوط وموقع شركات
2. **ترجمة تلقائية فورية** أثناء الكتابة في لوحة التحكم
3. **عرض الحقول الإنجليزية تحت العربية مباشرة** مع الحفاظ على قابلية التعديل

---

## 🎯 المميزات الجديدة

### 1. الفلتر المحدث
الآن يمكن تصفية المشاريع حسب:
- الكل (All)
- متجر إلكتروني (E-Commerce)
- بورتفوليو (Portfolio)
- تحليل بيانات (Data Analytics)
- سيستم إداري (Admin System)
- **صفحة هبوط (Landing Page)** ✨ جديد
- **موقع شركات (Corporate Website)** ✨ جديد

### 2. الترجمة التلقائية الفورية
عند كتابة النص بالعربية:
- يتم تأخير قليل (800ms) لتجنب الطلبات المتكررة
- النص يُترجم تلقائياً إلى الإنجليزية
- الحقل الإنجليزي يُملأ تلقائياً
- يمكن تعديل النص المترجم يدوياً في أي وقت
- مؤشر "مترجم تلقائياً" يظهر عند اكتمال الترجمة

### 3. واجهة محسّنة
- الحقل العربي في الأعلى
- الحقل الإنجليزي مباشرة تحته في صندوق مميز
- سهولة الرؤية والتعديل
- مؤشر تحميل أثناء الترجمة

---

## 📁 الملفات المُنشأة/المحدثة

### ملفات جديدة:
1. **src/hooks/use-auto-translate-debounced.ts**
   - Hook للترجمة التلقائية مع Debounce
   - يتجنب الطلبات المتكررة أثناء الكتابة

2. **src/app/admin/portfolio-form-fields.tsx**
   - مكون الحقول المحسّن
   - يعرض العربي والإنجليزي معاً
   - يدعم الترجمة التلقائية الفورية

### ملفات محدثة:
1. **src/components/sections/portfolio.tsx**
   - إضافة التصنيفات الجديدة إلى الفلتر
   - إضافة منطق الفلتر للتصنيفات الجديدة

---

## 🚀 خطوات التطبيق

### المرحلة 1: استبدال الحقول في لوحة التحكم

في ملف `src/app/admin/page.tsx`، استبدل الحقول الحالية بـ `PortfolioFormFields`:

```typescript
import PortfolioFormFields from './portfolio-form-fields'

// داخل PortfolioForm component
<PortfolioFormFields
  label="اسم المشروع"
  arabicValue={formData.name}
  englishValue={formData.nameEn}
  onArabicChange={(value) => update('name', value)}
  onEnglishChange={(value) => update('nameEn', value)}
  dir={dir}
  placeholder="أدخل اسم المشروع بالعربية"
  placeholderEn="Project name in English"
/>

<PortfolioFormFields
  label="الوصف"
  arabicValue={formData.description}
  englishValue={formData.descriptionEn}
  onArabicChange={(value) => update('description', value)}
  onEnglishChange={(value) => update('descriptionEn', value)}
  isTextarea={true}
  dir={dir}
  placeholder="أدخل وصف المشروع"
  placeholderEn="Project description"
/>

<PortfolioFormFields
  label="المشكلة"
  arabicValue={formData.problem}
  englishValue={formData.problemEn}
  onArabicChange={(value) => update('problem', value)}
  onEnglishChange={(value) => update('problemEn', value)}
  isTextarea={true}
  dir={dir}
/>

<PortfolioFormFields
  label="الحل"
  arabicValue={formData.solution}
  englishValue={formData.solutionEn}
  onArabicChange={(value) => update('solution', value)}
  onEnglishChange={(value) => update('solutionEn', value)}
  isTextarea={true}
  dir={dir}
/>

<PortfolioFormFields
  label="النتيجة"
  arabicValue={formData.result}
  englishValue={formData.resultEn}
  onArabicChange={(value) => update('result', value)}
  onEnglishChange={(value) => update('resultEn', value)}
  isTextarea={true}
  dir={dir}
/>
```

### المرحلة 2: التحقق من الفلتر

الفلتر تم تحديثه تلقائياً في مكون `portfolio.tsx`. تحقق من أنه يعمل بشكل صحيح:
- افتح الموقع
- اذهب إلى قسم "أعمالنا"
- تحقق من ظهور الأزرار الجديدة (صفحة هبوط، موقع شركات)
- جرب الفلتر على مشروع من التصنيفات الجديدة

### المرحلة 3: اختبار الترجمة التلقائية

1. افتح لوحة التحكم
2. انقر على "إضافة مشروع جديد"
3. اكتب اسم المشروع بالعربية (مثلاً: "صفحة هبوط متجر إلكتروني")
4. انتظر 800ms - سيتم ملء الحقل الإنجليزي تلقائياً
5. كرر العملية للحقول الأخرى

---

## 💻 مثال الاستخدام

### إضافة مشروع جديد:

1. **الاسم:**
   - العربي: "صفحة هبوط متجر إلكتروني"
   - الإنجليزي: (سيتم ملؤه تلقائياً) "E-commerce Store Landing Page"

2. **الوصف:**
   - العربي: "صفحة هبوط حديثة لمتجر إلكتروني بتصميم عصري"
   - الإنجليزي: (سيتم ملؤه تلقائياً) "Modern landing page for an e-commerce store with contemporary design"

3. **المشكلة:**
   - العربي: "المتجر القديم لم يكن يجذب العملاء الجدد"
   - الإنجليزي: (سيتم ملؤه تلقائياً) "The old store was not attracting new customers"

4. **الحل:**
   - العربي: "تصميم صفحة هبوط جديدة بتقنيات حديثة"
   - الإنجليزي: (سيتم ملؤه تلقائياً) "Designing a new landing page with modern technologies"

5. **النتيجة:**
   - العربي: "زيادة التحويلات بنسبة 150%"
   - الإنجليزي: (سيتم ملؤه تلقائياً) "Increased conversions by 150%"

---

## ⚙️ متطلبات النظام

### متطلبات الخادم:
- Node.js 16+
- Google Translate API (اختياري - بدون API، النص لن يُترجم لكن الحقول ستبقى فارغة)

### متغيرات البيئة:
```env
GOOGLE_TRANSLATE_API_KEY=your_api_key_here (اختياري)
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: الترجمة لا تعمل
**الحل:**
1. تأكد من إضافة `GOOGLE_TRANSLATE_API_KEY` في `.env.local`
2. تأكد من تفعيل Google Translate API في Google Cloud Console
3. تحقق من اتصالك بالإنترنت

### المشكلة: الترجمة بطيئة جداً
**الحل:** قلل قيمة `delayMs` في `useAutoTranslateDebounced` من 800 إلى 500

### المشكلة: الحقل الإنجليزي لا يُملأ
**الحل:**
1. تأكد من كتابة النص بالعربية أولاً
2. انتظر 800ms (الحد الأدنى للتأخير)
3. تحقق من سجل الأخطاء في المتصفح (F12)

---

## 📊 جدول المقارنة

| الميزة | قبل | بعد |
|--------|-----|-----|
| التصنيفات | 4 | 6 ✨ |
| الترجمة | يدوية | تلقائية ✨ |
| عرض الحقول | منفصلة | متجاورة ✨ |
| التعديل اليدوي | ممكن | ممكن ✨ |
| مؤشر الترجمة | لا | نعم ✨ |

---

## 🔐 الأمان

- لا يتم حفظ النصوص على الخادم
- API Key محمي بمتغيرات البيئة
- الترجمة تتم عبر اتصال آمن (HTTPS)

---

## 📝 ملاحظات مهمة

1. **التأخير:** 800ms هو التأخير الافتراضي. يمكن تغييره حسب الحاجة
2. **الترجمة التلقائية:** تعتمد على Google Translate API
3. **التعديل اليدوي:** يمكن تعديل النص المترجم في أي وقت
4. **الفلتر:** تم تحديثه تلقائياً ليشمل التصنيفات الجديدة

---

## 🚀 التحسينات المستقبلية

1. إضافة خيار لتعطيل الترجمة التلقائية
2. إضافة خيار لتغيير التأخير
3. دعم لغات إضافية
4. تخزين مؤقت للترجمات (Caching)

---

**آخر تحديث:** 18 يوليو 2026
**الإصدار:** 2.0
**الحالة:** جاهز للتطبيق
