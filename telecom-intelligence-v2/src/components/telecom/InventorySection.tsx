'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  Package, AlertTriangle, TrendingUp, QrCode,
  Plus, Trash2, Loader2, ScanBarcode, CheckCircle2, XCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/i18n/context'
import type { Language } from '@/lib/i18n/translations'
import BarcodeScanner from './BarcodeScanner'
import EmptyState from './EmptyState'

interface InventoryItem {
  id: string
  productName: string
  category: string
  quantity: number
  minQuantity: number
  unitPrice: number
  supplier: string | null
  barcode: string | null
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

const CATEGORY_COLORS: Record<string, string> = {
  'هواتف': '#0D9488',
  'أجهزة': '#10B981',
  'ملحقات': '#F59E0B',
  'قطع غيار': '#06B6D4',
}

export default function InventorySection() {
  const { t, isRTL, language } = useLanguage()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

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

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory')
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems]) // eslint-disable-line react-hooks/set-state-in-effect

  const handleSubmit = async () => {
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
        toast.success(t('inventory.productAdded'))
        setFormData({})
        setAddOpen(false)
        fetchItems()
      } else {
        toast.error(t('inventory.addError'))
      }
    } catch {
      toast.error(t('errorConnection'))
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(t('inventory.productDeleted'))
        fetchItems()
      }
    } catch { /* ignore */ }
  }

  const handleBarcodeScan = (barcode: string) => {
    setFormData(prev => ({ ...prev, barcode }))
    setScannerOpen(false)
    setAddOpen(true)
    toast.success(`${t('inventory.barcodeScanned')}: ${barcode}`)
  }

  const lowStockItems = items.filter(i => i.quantity <= i.minQuantity)
  const totalValue = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  const categoryData = categoryOptions.map(cat => ({
    name: cat.label,
    value: items.filter(i => i.category === cat.value).reduce((s, i) => s + i.quantity, 0),
    color: CATEGORY_COLORS[cat.value] || '#64748B'
  })).filter(c => c.value > 0)

  const supplierData = Array.from(new Set(items.filter(i => i.supplier).map(i => i.supplier!)))
    .map(supplier => ({
      supplier,
      count: items.filter(i => i.supplier === supplier).length,
      value: items.filter(i => i.supplier === supplier).reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    }))

  const metrics = [
    { label: t('inventory.totalProducts'), value: items.length > 0 ? totalItems.toString() : '0', icon: Package, color: 'text-teal-400' },
    { label: t('inventory.stockValue'), value: items.length > 0 ? (totalValue >= 1000 ? `${(totalValue / 1000).toFixed(1)}K ${t('currency')}` : `${totalValue.toFixed(0)} ${t('currency')}`) : `0 ${t('currency')}`, icon: TrendingUp, color: 'text-emerald-400' },
    { label: t('inventory.categories'), value: items.length > 0 ? categoryData.length.toString() : '0', icon: Package, color: 'text-amber-400' },
    { label: t('inventory.lowStock'), value: lowStockItems.length.toString(), icon: AlertTriangle, color: lowStockItems.length > 0 ? 'text-red-400' : 'text-emerald-400' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted/50"><m.icon className={`h-5 w-5 ${m.color}`} /></div>
                  <div>
                    <p className="text-2xl font-bold">{m.value}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setScannerOpen(true)} className="bg-amber-400 hover:bg-amber-500 text-black">
          <QrCode className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('inventory.scanBarcode')}
        </Button>
        <Button onClick={() => { setFormData({}); setAddOpen(true) }} className="bg-teal-400 hover:bg-teal-500 text-white">
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('inventory.addProduct')}
        </Button>
      </div>

      {/* Scanner Dialog */}
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanBarcode className="h-5 w-5 text-teal-400" />
              {t('inventory.scanProductBarcode')}
            </DialogTitle>
            <DialogDescription>{t('inventory.scanOrEnter')}</DialogDescription>
          </DialogHeader>
          <BarcodeScanner onScan={handleBarcodeScan} />
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) setFormData({}) }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('inventory.addNewProduct')}</DialogTitle>
            <DialogDescription>{t('inventory.enterProductData')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formData.barcode && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-teal-400/10 border border-teal-400/20">
                <QrCode className="h-4 w-4 text-teal-400" />
                <span className="text-sm">{t('inventory.barcode')}: </span>
                <span className="text-sm font-bold text-teal-400" dir="ltr">{formData.barcode}</span>
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
                <Input value={formData.barcode || ''} onChange={e => setFormData(p => ({ ...p, barcode: e.target.value }))} placeholder={t('inventory.enterBarcodeManual')} className="bg-muted/30 border-border/50" dir="ltr" />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild><Button variant="outline" disabled={submitting} className="border-border/50">{t('cancel')}</Button></DialogClose>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-teal-400 hover:bg-teal-500 text-white">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t('add')}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {items.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8 text-muted-foreground" />}
          title={t('inventory.noProductsYet')}
          description={t('inventory.noProductsDesc')}
          actionLabel={t('inventory.addProduct')}
          onAction={() => setAddOpen(true)}
        />
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t('inventory.stockByCategory')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                          {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} formatter={(value: number) => [`${value} ${t('inventory.unit')}`]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-2">
                    {categoryData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-muted-foreground">{item.name}</span></div>
                        <span className="font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{t('inventory.quantityBySupplier')}</CardTitle>
                    <Badge variant="secondary" className="bg-teal-400/10 text-teal-400">{supplierData.length} {t('inventory.supplierCount')}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={supplierData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis type="category" dataKey="supplier" stroke="#94A3B8" fontSize={11} tickLine={false} width={100} />
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} />
                        <Bar dataKey="count" name={t('inventory.productCount')} fill="#0D9488" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Low Stock Alerts */}
          {lowStockItems.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="border-red-400/30 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <CardTitle className="text-lg text-red-400">{t('inventory.lowStockAlert')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-red-400/5 border border-red-400/10">
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-red-400" />
                          <div>
                            <p className="text-sm font-medium">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">{translateCategory(item.category)} {item.barcode ? `• ${t('inventory.barcode')}: ${item.barcode}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-left">
                            <p className="text-sm font-bold text-red-400">{item.quantity} / {item.minQuantity}</p>
                            <p className="text-[10px] text-muted-foreground">{t('inventory.currentMin')}</p>
                          </div>
                          <Progress value={(item.quantity / item.minQuantity) * 100} className="w-20 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Products Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t('inventory.productTable')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('inventory.product')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('inventory.category')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('inventory.quantity')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('inventory.price')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('inventory.barcode')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('inventory.state')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('delete')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-medium">{item.productName}</td>
                          <td className="p-3"><Badge variant="secondary" className="bg-muted/50">{translateCategory(item.category)}</Badge></td>
                          <td className="p-3">{item.quantity}</td>
                          <td className="p-3">{item.unitPrice} {t('currency')}</td>
                          <td className="p-3 text-xs text-muted-foreground" dir="ltr">{item.barcode || '-'}</td>
                          <td className="p-3">
                            {item.quantity <= item.minQuantity ? (
                              <span className="flex items-center gap-1 text-red-400"><XCircle className="h-3 w-3" /> {t('inventory.low')}</span>
                            ) : (
                              <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-3 w-3" /> {t('inventory.available')}</span>
                            )}
                          </td>
                          <td className="p-3">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300" onClick={() => handleDelete(item.id)}>
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
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
