# دليل إصلاح مشاكل Vercel Deployment

## 🔧 المشكلة

عند محاولة نشر المشروع على Vercel مع ميزة التقاط الصور (Screenshot)، يحدث خطأ لأن:
1. مكتبات Puppeteer و Playwright تحتاج إلى Chromium/Firefox
2. بيئة Vercel Serverless لها قيود على حجم الملفات والموارد
3. لم تكن الحزم المطلوبة مضافة إلى `package.json`

## ✅ الحل

تم تطبيق الإصلاحات التالية:

### 1. تحديث `package.json`

تمت إضافة الحزم التالية:

```json
{
  "dependencies": {
    "@sparticuz/chromium": "^131.0.0",
    "puppeteer-core": "^23.0.0",
    "puppeteer": "^23.0.0",
    "playwright-core": "^1.61.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@sparticuz/chromium-min": "^131.0.0"
  }
}
```

**شرح الحزم:**
- **@sparticuz/chromium**: نسخة محسّنة من Chromium للعمل على Vercel Serverless
- **puppeteer**: مكتبة للتحكم في Chromium
- **playwright-core**: بديل احتياطي إذا فشل Puppeteer

### 2. تحديث `src/app/api/screenshot/route.ts`

تم تحسين الـ API لـ:
- استخدام `@sparticuz/chromium` بدلاً من Chromium العادي
- إضافة fallback إلى Playwright إذا فشل Puppeteer
- معالجة أفضل للأخطاء
- دعم متغيرات البيئة الخاصة بـ Vercel

### 3. إضافة `vercel.json`

ملف إعدادات Vercel يتضمن:
- إعدادات البناء والتطوير
- متغيرات البيئة المطلوبة
- إعدادات الدوال (Functions) بما فيها المدة الزمنية والذاكرة

## 🚀 خطوات التطبيق

### الخطوة 1: تحديث المكتبات محلياً

```bash
cd web-area
pnpm install
```

### الخطوة 2: اختبار محلياً

```bash
pnpm run dev
```

ثم جرب API الـ Screenshot:

```bash
curl -X POST http://localhost:3000/api/screenshot \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "theme": "light",
    "delay": 40000
  }'
```

### الخطوة 3: رفع التغييرات إلى GitHub

```bash
git add .
git commit -m "Fix Vercel deployment issues for screenshot feature"
git push origin redesign/cyberpunk-tech
```

### الخطوة 4: نشر على Vercel

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر المشروع
3. انقر على "Deployments"
4. اختر الـ commit الأخير أو انقر على "Redeploy"
5. انتظر انتهاء البناء

## 📊 جدول المتطلبات

| المتطلب | الإصدار | الحالة |
|--------|---------|--------|
| Node.js | 20.x | ✅ مدعوم |
| pnpm | 10.x | ✅ مدعوم |
| @sparticuz/chromium | 131.0.0 | ✅ مضاف |
| puppeteer | 23.0.0 | ✅ مضاف |
| playwright-core | 1.61.1 | ✅ موجود |

## 🐛 استكشاف الأخطاء

### المشكلة: "Build failed: Module not found"

**الحل:** تأكد من تشغيل `pnpm install` قبل البناء

```bash
pnpm install
pnpm run build
```

### المشكلة: "Function timeout"

**الحل:** الـ API محدد بـ 60 ثانية، وهو كافٍ للتأخير (40 ثانية) + معالجة الصورة. إذا استمرت المشكلة، قلل التأخير إلى 30 ثانية.

### المشكلة: "Memory exceeded"

**الحل:** الذاكرة المخصصة للـ Function هي 1024 MB، وهي كافية. إذا استمرت المشكلة، قلل دقة الصورة من 1920x1080 إلى 1280x720.

### المشكلة: "Screenshot service not available"

**الحل:** تأكد من:
1. تثبيت جميع الحزم: `pnpm install`
2. وجود متغيرات البيئة المطلوبة
3. أن الرابط المدخل صحيح وقابل للوصول

## 📈 الأداء على Vercel

| العملية | الوقت |
|--------|------|
| تحميل الصفحة | 5-10 ثواني |
| التأخير للصور الكسولة | 40 ثانية |
| معالجة الصورة | 2-3 ثواني |
| رفع الصورة | 1-2 ثانية |
| **الإجمالي** | **~50 ثانية** |

## 🔐 متغيرات البيئة المطلوبة

أضف هذه المتغيرات في إعدادات Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_url
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=your_app_url
```

## 📝 ملاحظات مهمة

1. **استهلاك الموارد**: التقاط الصور يستهلك موارد كبيرة، استخدمه بحذر
2. **التأخير**: التأخير الافتراضي (40 ثانية) يضمن تحميل معظم الصور الكسولة
3. **الأداء**: قد يكون بطيئاً على الخوادم ذات الموارد المحدودة
4. **التكلفة**: كل استدعاء API يستهلك موارد، قد يؤثر على فاتورة Vercel

## 🎯 الخطوات التالية

1. ✅ تحديث `package.json` - تم
2. ✅ تحسين API الـ Screenshot - تم
3. ✅ إضافة `vercel.json` - تم
4. ⏳ رفع التغييرات إلى GitHub - قادم
5. ⏳ اختبار الـ Deployment على Vercel - قادم

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من سجلات البناء على Vercel Dashboard
2. تحقق من متغيرات البيئة
3. جرب البناء محلياً أولاً: `pnpm run build`

---

**آخر تحديث:** 18 يوليو 2026
**الحالة:** جاهز للنشر على Vercel
