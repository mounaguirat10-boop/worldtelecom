'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, BarChart3, PieChartIcon, Target, ArrowUpRight, Zap, Plus, Loader2, Trash2, Save } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import EmptyState from './EmptyState'
import { useLanguage } from '@/lib/i18n/context'
import { Language } from '@/lib/i18n/translations'

interface Revenue { id: string; month: string; amount: number; target: number; category: string }

const COLORS = ['#0D9488', '#10B981', '#F59E0B', '#06B6D4', '#8B5CF6']

export default function BIAnalyticsSection() {
  const { t, isRTL, language } = useLanguage()

  const categoryOptions = [
    { value: 'بيع الأجهزة', label: t('categories.deviceSale') },
    { value: 'التركيبات', label: t('categories.installations') },
    { value: 'الإصلاحات', label: t('categories.repairs') },
    { value: 'الاشتراكات', label: t('categories.subscriptions') },
    { value: 'الدعم الفني', label: t('categories.techSupport') },
  ]

  const translateCategory = (cat: string) => {
    const map: Record<string, Record<Language, string>> = {
      'بيع الأجهزة': { ar: 'بيع الأجهزة', fr: "Vente d'Appareils", en: 'Device Sales' },
      'التركيبات': { ar: 'التركيبات', fr: 'Installations', en: 'Installations' },
      'الإصلاحات': { ar: 'الإصلاحات', fr: 'Réparations', en: 'Repairs' },
      'الاشتراكات': { ar: 'الاشتراكات', fr: 'Abonnements', en: 'Subscriptions' },
      'الدعم الفني': { ar: 'الدعم الفني', fr: 'Support Technique', en: 'Technical Support' },
    }
    return map[cat]?.[language] || cat
  }

  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/revenues')
      if (res.ok) setRevenues(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData]) // eslint-disable-line react-hooks/set-state-in-effect

  const handleSubmit = async () => {
    if (!formData.month || !formData.amount || !formData.target || !formData.category) {
      toast.error(t('fillRequired')); return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/revenues', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      })
      if (res.ok) { toast.success(t('recordAdded')); setFormData({}); setAddOpen(false); fetchData() }
      else toast.error(t('errorAdd'))
    } catch { toast.error(t('errorConnection')) }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/revenues?id=${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success(t('recordDeleted')); fetchData() }
    } catch { toast.error(t('errorDelete')) }
  }

  const totalRevenue = revenues.reduce((s, r) => s + r.amount, 0)
  const totalTarget = revenues.reduce((s, r) => s + r.target, 0)
  const avgGrowth = revenues.length > 0 ? (((totalRevenue - totalTarget) / totalTarget) * 100).toFixed(1) : '0'

  const categoryValues = ['بيع الأجهزة', 'التركيبات', 'الإصلاحات', 'الاشتراكات', 'الدعم الفني']
  const serviceRevenue = categoryValues.map(cat => ({
    service: translateCategory(cat),
    revenue: revenues.filter(r => r.category === cat).reduce((s, r) => s + r.amount, 0),
  })).filter(s => s.revenue > 0)

  const revenueByMonth: Record<string, { revenue: number; target: number; profit: number }> = {}
  revenues.forEach(r => {
    if (!revenueByMonth[r.month]) revenueByMonth[r.month] = { revenue: 0, target: 0, profit: 0 }
    revenueByMonth[r.month].revenue += r.amount
    revenueByMonth[r.month].target += r.target
    revenueByMonth[r.month].profit += r.amount - (r.target * 0.6)
  })
  const quarterlyData = Object.entries(revenueByMonth).map(([month, data]) => ({ quarter: month, ...data }))

  const performanceMetrics = [
    { label: t('bi.revenueRecords'), value: revenues.length > 0 ? revenues.length.toString() : '0', icon: BarChart3, color: 'text-teal-400' },
    { label: t('bi.totalRevenue'), value: revenues.length > 0 ? (totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(1)}K ${t('currency')}` : `${totalRevenue.toFixed(0)} ${t('currency')}`) : `0 ${t('currency')}`, icon: Target, color: 'text-emerald-400' },
    { label: t('bi.growthRate'), value: revenues.length > 0 ? `${avgGrowth}%` : t('noData'), icon: TrendingUp, color: 'text-amber-400' },
    { label: t('bi.operatingEfficiency'), value: revenues.length > 0 && totalTarget > 0 ? `${((totalRevenue / totalTarget) * 100).toFixed(0)}%` : t('noData'), icon: Zap, color: 'text-cyan-400' },
  ]

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-400" /></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted/50"><metric.icon className={`h-5 w-5 ${metric.color}`} /></div>
                  <div><p className="text-2xl font-bold">{metric.value}</p><p className="text-xs text-muted-foreground">{metric.label}</p></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add Revenue Button */}
      <div className="flex gap-3">
        <Button onClick={() => { setFormData({}); setAddOpen(true) }} className="bg-teal-400 hover:bg-teal-500 text-white">
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t('bi.addRevenue')}
        </Button>
      </div>

      {/* Add Revenue Dialog */}
      <Dialog open={addOpen} onOpenChange={v => { setAddOpen(v); if (!v) setFormData({}) }}>
        <DialogContent className="sm:max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader><DialogTitle>{t('bi.addRevenueTitle')}</DialogTitle><DialogDescription>{t('bi.addRevenueDesc')}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label className="text-sm">{t('bi.month')} *</Label><Input value={formData.month || ''} onChange={e => setFormData(p => ({ ...p, month: e.target.value }))} placeholder={t('bi.monthExample')} className="bg-muted/30 border-border/50" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-sm">{t('bi.amount')} ({t('currency')}) *</Label><Input type="number" value={formData.amount || ''} onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))} placeholder="0" className="bg-muted/30 border-border/50" dir="ltr" /></div>
              <div className="space-y-2"><Label className="text-sm">{t('bi.target')} ({t('currency')}) *</Label><Input type="number" value={formData.target || ''} onChange={e => setFormData(p => ({ ...p, target: e.target.value }))} placeholder="0" className="bg-muted/30 border-border/50" dir="ltr" /></div>
            </div>
            <div className="space-y-2"><Label className="text-sm">{t('bi.category')} *</Label>
              <Select value={formData.category || ''} onValueChange={v => setFormData(p => ({ ...p, category: v }))}>
                <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue placeholder={t('bi.chooseCategory')} /></SelectTrigger>
                <SelectContent>{categoryOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild><Button variant="outline" disabled={submitting} className="border-border/50">{t('cancel')}</Button></DialogClose>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-teal-400 hover:bg-teal-500 text-white">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t('add')}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {revenues.length === 0 ? (
        <EmptyState icon={<BarChart3 className="h-8 w-8 text-muted-foreground" />} title={t('bi.noData')} description={t('bi.noDataDesc')} actionLabel={t('bi.addRevenue')} onAction={() => setAddOpen(true)} />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{t('bi.revenueByService')}</CardTitle>
                    <Badge variant="secondary" className="bg-teal-400/10 text-teal-400"><ArrowUpRight className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />{t('dashboard.realData')}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={serviceRevenue} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                        <YAxis type="category" dataKey="service" stroke="#94A3B8" fontSize={12} tickLine={false} width={100} />
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} formatter={(value: number) => [`${(value / 1000).toFixed(0)}K ${t('currency')}`]} />
                        <Bar dataKey="revenue" name={t('bi.revenues')} fill="#0D9488" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
                <CardHeader className="pb-2"><CardTitle className="text-lg">{t('bi.revenueDistribution')}</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={serviceRevenue} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="revenue" nameKey="service">
                          {serviceRevenue.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} formatter={(value: number) => [`${(value / 1000).toFixed(0)}K ${t('currency')}`]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-2">
                    {serviceRevenue.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} /><span className="text-muted-foreground">{item.service}</span></div>
                        <span className="font-bold">{(item.revenue / 1000).toFixed(0)}K</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Revenue Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{t('bi.monthlyRevenueTrend')}</CardTitle>
                  <Badge variant="secondary" className="bg-emerald-400/10 text-emerald-400">{t('dashboard.realData')}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quarterlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="quarter" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} />
                      <Legend />
                      <Bar dataKey="revenue" name={t('bi.revenues')} fill="#0D9488" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="target" name={t('bi.targetLabel')} fill="#64748B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2"><CardTitle className="text-lg">{t('bi.revenueDetails')}</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('bi.month')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('bi.category')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('bi.amount')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('bi.target')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('bi.performance')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('bi.delete')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenues.map(r => (
                        <tr key={r.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-medium">{r.month}</td>
                          <td className="p-3"><Badge variant="secondary" className="bg-muted/50">{translateCategory(r.category)}</Badge></td>
                          <td className="p-3">{(r.amount / 1000).toFixed(0)}K {t('currency')}</td>
                          <td className="p-3">{(r.target / 1000).toFixed(0)}K {t('currency')}</td>
                          <td className="p-3">
                            <div className="w-24 bg-muted/50 rounded-full h-2">
                              <div className="bg-teal-400 h-2 rounded-full" style={{ width: `${Math.min((r.amount / r.target) * 100, 100)}%` }} />
                            </div>
                          </td>
                          <td className="p-3">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300" onClick={() => handleDelete(r.id)}>
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
