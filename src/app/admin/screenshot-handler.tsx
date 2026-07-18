'use client'

import { useState } from 'react'
import { Loader2, Camera, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

interface ScreenshotHandlerProps {
  onScreenshotCaptured: (url: string) => void
  dir: 'rtl' | 'ltr'
}

/**
 * مكون لالتقاط صور الموقع (Screenshots) مع خيارات الوضع والتأخير
 */
export function ScreenshotHandler({ onScreenshotCaptured, dir }: ScreenshotHandlerProps) {
  const { toast } = useToast()
  const [isCapturing, setIsCapturing] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [delay, setDelay] = useState(40) // بالثواني

  const isRtl = dir === 'rtl'

  const handleCaptureScreenshot = async () => {
    if (!websiteUrl.trim()) {
      toast({
        title: isRtl ? 'خطأ' : 'Error',
        description: isRtl ? 'يرجى إدخال رابط الموقع' : 'Please enter a website URL',
        variant: 'destructive',
      })
      return
    }

    setIsCapturing(true)

    try {
      // التحقق من صحة الرابط
      let url = websiteUrl.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`
      }

      toast({
        title: isRtl ? 'جاري التقاط الصورة...' : 'Capturing screenshot...',
        description: isRtl 
          ? `سيتم التقاط صورة بعد ${delay} ثانية لضمان تحميل جميع الصور`
          : `Screenshot will be captured after ${delay} seconds to ensure all images load`,
      })

      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          theme,
          delay: delay * 1000, // تحويل إلى ميلي ثانية
          fullPage: true,
          width: 1920,
          height: 1080,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onScreenshotCaptured(data.url)
        toast({
          title: isRtl ? 'تم التقاط الصورة بنجاح' : 'Screenshot captured successfully',
          description: isRtl 
            ? `تم التقاط صورة بحجم ${data.dimensions.width}x${data.dimensions.height}`
            : `Captured at ${data.dimensions.width}x${data.dimensions.height}`,
        })
        setWebsiteUrl('')
      } else {
        toast({
          title: isRtl ? 'فشل التقاط الصورة' : 'Failed to capture screenshot',
          description: data.details || data.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: isRtl ? 'خطأ' : 'Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      setIsCapturing(false)
    }
  }

  return (
    <div className="space-y-4 p-4 rounded-lg bg-muted/20 border border-border/30">
      {/* العنوان */}
      <div className="flex items-center gap-2">
        <Camera className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-sm">
          {isRtl ? 'التقاط صورة من الموقع' : 'Capture Website Screenshot'}
        </h3>
      </div>

      {/* رابط الموقع */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          {isRtl ? 'رابط الموقع' : 'Website URL'}
        </label>
        <Input
          type="url"
          placeholder={isRtl ? 'https://example.com' : 'https://example.com'}
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          disabled={isCapturing}
          dir="ltr"
        />
      </div>

      {/* خيارات الوضع والتأخير */}
      <div className="grid grid-cols-2 gap-3">
        {/* اختيار الوضع */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            {isRtl ? 'الوضع' : 'Theme'}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('light')}
              disabled={isCapturing}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${
                theme === 'light'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Sun className="w-3 h-3" />
              {isRtl ? 'فاتح' : 'Light'}
            </button>
            <button
              onClick={() => setTheme('dark')}
              disabled={isCapturing}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Moon className="w-3 h-3" />
              {isRtl ? 'مظلم' : 'Dark'}
            </button>
          </div>
        </div>

        {/* اختيار التأخير */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            {isRtl ? 'التأخير (ثانية)' : 'Delay (seconds)'}
          </label>
          <Input
            type="number"
            min="5"
            max="120"
            value={delay}
            onChange={(e) => setDelay(Math.max(5, Math.min(120, parseInt(e.target.value) || 40)))}
            disabled={isCapturing}
            className="text-xs"
          />
        </div>
      </div>

      {/* زر التقاط الصورة */}
      <Button
        onClick={handleCaptureScreenshot}
        disabled={isCapturing || !websiteUrl.trim()}
        className="w-full gap-2"
      >
        {isCapturing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isRtl ? 'جاري التقاط الصورة...' : 'Capturing...'}
          </>
        ) : (
          <>
            <Camera className="w-4 h-4" />
            {isRtl ? 'التقاط الصورة' : 'Capture Screenshot'}
          </>
        )}
      </Button>

      {/* معلومات مساعدة */}
      <p className="text-[10px] text-muted-foreground/50 text-center">
        {isRtl
          ? `سيتم التقاط صورة كاملة للموقع بعد ${delay} ثانية لضمان تحميل جميع الصور الكسولة`
          : `Full page screenshot will be captured after ${delay} seconds to ensure all lazy images load`}
      </p>
    </div>
  )
}

export default ScreenshotHandler
