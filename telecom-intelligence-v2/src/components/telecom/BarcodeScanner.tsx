'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Camera, Keyboard, Search, QrCode, Loader2, AlertCircle } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
}

export default function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('manual')
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<unknown>(null)

  const onScanRef = useRef(onScan)
  onScanRef.current = onScan

  const handleScanResult = useCallback((decodedText: string) => {
    onScanRef.current(decodedText)
  }, [])

  useEffect(() => {
    if (mode !== 'camera') return

    let scanner: InstanceType<typeof import('html5-qrcode').Html5Qrcode> | null = null
    let cancelled = false

    const initScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')

        if (cancelled) return

        scanner = new Html5Qrcode('scanner-region')
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText: string) => {
            handleScanResult(decodedText)
            scanner?.stop().catch(() => {})
          },
          () => {
            // ignore scan failures (no QR/barcode detected in frame)
          }
        )

        if (!cancelled) {
          setIsScanning(true)
          setError('')
        }
      } catch (err: unknown) {
        if (cancelled) return
        const message =
          err instanceof Error && err.message?.includes('Permission')
            ? 'تم رفض إذن الكاميرا. يرجى السماح بالوصول إلى الكاميرا أو استخدام الإدخال اليدوي.'
            : 'لا يمكن الوصول إلى الكاميرا. استخدم الإدخال اليدوي.'
        setError(message)
        setMode('manual')
      }
    }

    initScanner()

    return () => {
      cancelled = true
      setIsScanning(false)
      if (scanner) {
        scanner.stop().catch(() => {})
      }
    }
  }, [mode, handleScanResult])

  const handleManualSubmit = () => {
    const code = manualCode.trim()
    if (code) {
      onScan(code)
      setManualCode('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleManualSubmit()
    }
  }

  const switchToCamera = () => {
    setError('')
    setMode('camera')
  }

  const switchToManual = () => {
    setError('')
    setIsScanning(false)
    setMode('manual')
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border/50">
        <QrCode className="h-5 w-5 text-teal-400" />
        <h3 className="text-sm font-semibold">ماسح الباركود</h3>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-1 p-3 bg-muted/20">
        <Button
          variant={mode === 'camera' ? 'default' : 'ghost'}
          size="sm"
          onClick={switchToCamera}
          className={`flex-1 rounded-lg text-xs ${
            mode === 'camera'
              ? 'bg-teal-400 hover:bg-teal-500 text-white'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Camera className="h-4 w-4 ml-1.5" />
          مسح بالكاميرا
        </Button>
        <Button
          variant={mode === 'manual' ? 'default' : 'ghost'}
          size="sm"
          onClick={switchToManual}
          className={`flex-1 rounded-lg text-xs ${
            mode === 'manual'
              ? 'bg-teal-400 hover:bg-teal-500 text-white'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Keyboard className="h-4 w-4 ml-1.5" />
          إدخال يدوي
        </Button>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-3 p-3 mb-4 rounded-lg bg-red-400/10 border border-red-400/20">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-400">{error}</p>
              <Button
                variant="link"
                size="sm"
                onClick={switchToManual}
                className="text-red-300 hover:text-red-200 p-0 h-auto mt-1 text-xs"
              >
                التبديل إلى الإدخال اليدوي
              </Button>
            </div>
          </div>
        )}

        {/* Camera Mode */}
        {mode === 'camera' && (
          <div className="space-y-3">
            <div
              id="scanner-region"
              className="w-full min-h-[280px] rounded-lg bg-muted/30 border border-border/30 overflow-hidden flex items-center justify-center"
            >
              {!isScanning && !error && (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm">جاري تشغيل الكاميرا...</p>
                </div>
              )}
            </div>
            {isScanning && (
              <p className="text-xs text-center text-muted-foreground">
                وجّه الكاميرا نحو الباركود أو رمز QR للمسح التلقائي
              </p>
            )}
          </div>
        )}

        {/* Manual Mode */}
        {mode === 'manual' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                رقم الباركود
              </label>
              <div className="flex gap-2">
                <Input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="أدخل رقم الباركود أو الرقم التسلسلي..."
                  className="bg-muted/30 border-border/50 flex-1 text-left dir-ltr"
                  dir="ltr"
                />
                <Button
                  onClick={handleManualSubmit}
                  disabled={!manualCode.trim()}
                  className="bg-teal-400 hover:bg-teal-500 text-white px-4 shrink-0"
                >
                  <Search className="h-4 w-4 ml-1.5" />
                  بحث
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              أدخل الرمز الشريطي الموجود على المنتج أو العبوة
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
