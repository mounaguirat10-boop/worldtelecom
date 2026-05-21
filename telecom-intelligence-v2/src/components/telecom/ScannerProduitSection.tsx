'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog'
import {
  ScanBarcode, QrCode, Camera, Keyboard, Search, Plus, Trash2,
  Loader2, Package, CheckCircle2, Save, List, BarChart3
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/i18n/context'
import type { Language } from '@/lib/i18n/translations'
import BarcodeScanner from './BarcodeScanner'

interface ScannedProduct {
  id: string
  barcode: string
  productName: string
  category: string
  quantity: number
  unitPrice: number
  supplier: string
  saved: boolean
}

export default function ScannerProduitSection() {
  const { t, isRTL, language } = useLanguage()
  const [mode, setMode] = useState<'scanner' | 'manual' | 'list'>('scanner')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [manualBarcode, setManualBarcode] = useState('')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([])
  const [showSavedList, setShowSavedList] = useState(false)

  const categoryOptions = [
    { value: 'هواتف', label: t('categories.phones') },
    { value: 'أجهزة', label: t('categories.devices') },
    { value: 'ملحقات', label: t('categories.accessories') },
    { value: 'قطع غيار', label: t('categories.spareParts') },
  ]

  const translateCategory = (dbValue: string) => {
    const option = categoryOptions.find(o => o.value === dbValue)
    return option ? option.label : dbValue
  }

  const handleBarcodeScan = (barcode: string) => {
    setScannerOpen(false)
    setManualBarcode('')
    setFormData(prev => ({ ...prev, barcode }))
    toast.success(`${t('inventory.barcodeScanned')}: ${barcode}`)
  }

  const handleManualSearch = () => {
    const code = manualBarcode.trim()
    if (code) {
      setFormData(prev => ({ ...prev, barcode: code }))
      toast.success(`${t('scanner.barcodeRegistered')}: ${code}`)
    }
  }

  const handleAddToInventory = async () => {
    const required = ['productName', 'category', 'quantity', 'unitPrice']
    const missing = required.filter(k => !formData[k]?.trim())
    if (missing.length > 0) {
      toast.error(t('fillRequired'))
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        const newItem = await res.json()
        setScannedProducts(prev => [
          ...prev,
          {
            id: newItem.id,
            barcode: formData.barcode || '',
            productName: formData.productName || '',
            category: formData.category || '',
            quantity: parseInt(formData.quantity || '0'),
            unitPrice: parseFloat(formData.unitPrice || '0'),
            supplier: formData.supplier || '',
            saved: true,
          }
        ])
        toast.success(t('scanner.savedToInventory'))
        setFormData({})
      } else {
        toast.error(t('scanner.saveError'))
      }
    } catch {
      toast.error(t('errorConnection'))
    }
    setSubmitting(false)
  }

  const handleDeleteFromInventory = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setScannedProducts(prev => prev.filter(p => p.id !== id))
        toast.success(t('scanner.deletedFromInventory'))
      }
    } catch {
      toast.error(t('errorDelete'))
    }
  }

  const handleSaveAll = async () => {
    toast.info(t('scanner.allAlreadySaved'))
  }

  const clearForm = () => {
    setFormData({})
    setManualBarcode('')
  }

  const totalScanned = scannedProducts.length
  const savedCount = scannedProducts.filter(p => p.saved).length
  const totalValue = scannedProducts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0)

  const stats = [
    { label: t('scanner.scannedProducts'), value: totalScanned > 0 ? totalScanned.toString() : '0', icon: ScanBarcode, color: 'text-teal-400' },
    { label: t('scanner.savedInInventory'), value: savedCount > 0 ? savedCount.toString() : '0', icon: CheckCircle2, color: 'text-emerald-400' },
    { label: t('scanner.productValue'), value: scannedProducts.length > 0 ? (totalValue >= 1000 ? `${(totalValue / 1000).toFixed(1)}K ${t('currency')}` : `${totalValue.toFixed(0)} ${t('currency')}`) : `0 ${t('currency')}`, icon: BarChart3, color: 'text-amber-400' },
    { label: t('scanner.categoryCount'), value: scannedProducts.length > 0 ? new Set(scannedProducts.map(p => p.category)).size.toString() : '0', icon: Package, color: 'text-cyan-400' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted/50"><s.icon className={`h-5 w-5 ${s.color}`} /></div>
                  <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 p-1 bg-muted/20 rounded-lg border border-border/30">
        <Button
          variant={mode === 'scanner' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('scanner')}
          className={`flex-1 rounded-md text-sm ${mode === 'scanner' ? 'bg-teal-400 hover:bg-teal-500 text-white' : 'text-muted-foreground'}`}
        >
          <ScanBarcode className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('scanner.scanBarcode')}
        </Button>
        <Button
          variant={mode === 'manual' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('manual')}
          className={`flex-1 rounded-md text-sm ${mode === 'manual' ? 'bg-teal-400 hover:bg-teal-500 text-white' : 'text-muted-foreground'}`}
        >
          <Keyboard className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('scanner.manualEntry')}
        </Button>
        <Button
          variant={mode === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('list')}
          className={`flex-1 rounded-md text-sm ${mode === 'list' ? 'bg-teal-400 hover:bg-teal-500 text-white' : 'text-muted-foreground'}`}
        >
          <List className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('scanner.registeredProducts')}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {/* Scanner Mode */}
        {mode === 'scanner' && (
          <motion.div key="scanner" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
            <Card className="border-teal-400/20 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-teal-400" />
                  <CardTitle className="text-lg">{t('scanner.scanProductBarcode')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="p-6 rounded-2xl bg-teal-400/5 border-2 border-dashed border-teal-400/30">
                    <ScanBarcode className="h-16 w-16 text-teal-400" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {t('scanner.scanOrQR')}
                  </p>
                  <Button onClick={() => setScannerOpen(true)} className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-3 text-base">
                    <Camera className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('scanner.startCamera')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Manual barcode fallback */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Keyboard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t('scanner.orEnterManually')}</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={manualBarcode}
                    onChange={e => setManualBarcode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
                    placeholder={t('scanner.enterBarcodeNumber')}
                    className="bg-muted/30 border-border/50 flex-1"
                    dir="ltr"
                  />
                  <Button onClick={handleManualSearch} disabled={!manualBarcode.trim()} className="bg-teal-400 hover:bg-teal-500 text-white">
                    <Search className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {t('scanner.register')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Scanner Dialog */}
            <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
              <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ScanBarcode className="h-5 w-5 text-teal-400" />
                    {t('scanner.scanProduct')}
                  </DialogTitle>
                  <DialogDescription>{t('scanner.scanOrManual')}</DialogDescription>
                </DialogHeader>
                <BarcodeScanner onScan={handleBarcodeScan} />
              </DialogContent>
            </Dialog>
          </motion.div>
        )}

        {/* Manual Entry Mode */}
        {mode === 'manual' && (
          <motion.div key="manual" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-teal-400" />
                    <CardTitle className="text-lg">{t('scanner.addNewProduct')}</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearForm} className="text-muted-foreground">
                    {t('scanner.clearForm')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.barcode && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-teal-400/10 border border-teal-400/20">
                      <QrCode className="h-4 w-4 text-teal-400" />
                      <span className="text-sm">{t('inventory.barcode')}: </span>
                      <span className="text-sm font-bold text-teal-400" dir="ltr">{formData.barcode}</span>
                      <Button variant="ghost" size="sm" className="mr-auto h-6 w-6 p-0" onClick={() => setFormData(p => ({ ...p, barcode: '' }))}>✕</Button>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-sm">{t('inventory.productName')} *</Label>
                    <Input value={formData.productName || ''} onChange={e => setFormData(p => ({ ...p, productName: e.target.value }))} placeholder={t('inventory.productExample')} className="bg-muted/30 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{t('inventory.category')} *</Label>
                    <Select value={formData.category || ''} onValueChange={v => setFormData(p => ({ ...p, category: v }))}>
                      <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue placeholder={t('inventory.chooseCategory')} /></SelectTrigger>
                      <SelectContent>{categoryOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">{t('inventory.quantity')} *</Label>
                      <Input type="number" value={formData.quantity || ''} onChange={e => setFormData(p => ({ ...p, quantity: e.target.value }))} placeholder="0" className="bg-muted/30 border-border/50" dir="ltr" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">{t('inventory.minQuantity')}</Label>
                      <Input type="number" value={formData.minQuantity || ''} onChange={e => setFormData(p => ({ ...p, minQuantity: e.target.value }))} placeholder="10" className="bg-muted/30 border-border/50" dir="ltr" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">{t('inventory.unitPrice')} ({t('currency')}) *</Label>
                      <Input type="number" value={formData.unitPrice || ''} onChange={e => setFormData(p => ({ ...p, unitPrice: e.target.value }))} placeholder="0" className="bg-muted/30 border-border/50" dir="ltr" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">{t('inventory.supplier')}</Label>
                      <Input value={formData.supplier || ''} onChange={e => setFormData(p => ({ ...p, supplier: e.target.value }))} placeholder={t('inventory.supplierName')} className="bg-muted/30 border-border/50" />
                    </div>
                  </div>
                  {!formData.barcode && (
                    <div className="space-y-2">
                      <Label className="text-sm">{t('inventory.barcodeOptional')}</Label>
                      <div className="flex gap-2">
                        <Input value={formData.barcode || ''} onChange={e => setFormData(p => ({ ...p, barcode: e.target.value }))} placeholder={t('inventory.enterBarcodeManual')} className="bg-muted/30 border-border/50 flex-1" dir="ltr" />
                        <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)} className="border-border/50 shrink-0">
                          <Camera className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {t('scanner.scanBtn')}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-border/30">
                    <Button onClick={handleAddToInventory} disabled={submitting} className="bg-teal-400 hover:bg-teal-500 text-white flex-1 min-w-[140px]">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t('scanner.saveToInventory')}</>}
                    </Button>
                    <Button onClick={clearForm} variant="outline" className="border-border/50">
                      <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('scanner.clear')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scanner Dialog (also accessible from manual mode) */}
            <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
              <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ScanBarcode className="h-5 w-5 text-teal-400" />
                    {t('scanner.scanProduct')}
                  </DialogTitle>
                  <DialogDescription>{t('scanner.scanOrManual')}</DialogDescription>
                </DialogHeader>
                <BarcodeScanner onScan={handleBarcodeScan} />
              </DialogContent>
            </Dialog>
          </motion.div>
        )}

        {/* List Mode */}
        {mode === 'list' && (
          <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
            {scannedProducts.length === 0 ? (
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-4 rounded-2xl bg-muted/30 mb-4">
                      <ScanBarcode className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">{t('scanner.noProductsYet')}</h3>
                    <p className="text-sm text-muted-foreground max-w-md mb-4">
                      {t('scanner.noProductsDesc')}
                    </p>
                    <Button onClick={() => setMode('scanner')} className="bg-teal-400 hover:bg-teal-500 text-white">
                      <ScanBarcode className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('scanner.scanBarcode')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex gap-3">
                  <Button onClick={handleSaveAll} className="bg-teal-400 hover:bg-teal-500 text-white">
                    <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('scanner.saveAll')}
                  </Button>
                  <Button onClick={() => setScannedProducts([])} variant="outline" className="border-red-400/30 text-red-400 hover:bg-red-400/10">
                    <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('scanner.deleteAll')}
                  </Button>
                </div>

                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{t('scanner.registeredProducts')} ({scannedProducts.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/50">
                            <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('inventory.barcode')}</th>
                            <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('inventory.product')}</th>
                            <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('inventory.category')}</th>
                            <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('inventory.quantity')}</th>
                            <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('inventory.price')}</th>
                            <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('inventory.state')}</th>
                            <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('delete')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scannedProducts.map(product => (
                            <tr key={product.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                              <td className="p-3 text-xs text-muted-foreground" dir="ltr">{product.barcode || '-'}</td>
                              <td className="p-3 font-medium">{product.productName}</td>
                              <td className="p-3"><Badge variant="secondary" className="bg-muted/50">{translateCategory(product.category)}</Badge></td>
                              <td className="p-3">{product.quantity}</td>
                              <td className="p-3">{product.unitPrice} {t('currency')}</td>
                              <td className="p-3">
                                {product.saved ? (
                                  <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-3 w-3" /> {t('scanner.saved')}</span>
                                ) : (
                                  <span className="text-amber-400">{t('scanner.notSaved')}</span>
                                )}
                              </td>
                              <td className="p-3">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300" onClick={() => handleDeleteFromInventory(product.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
