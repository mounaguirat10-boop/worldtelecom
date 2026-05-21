'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  Users, DollarSign, Activity, Wifi, TrendingUp, TrendingDown,
  Phone, Clock, ArrowUpRight, ArrowDownRight, Loader2, Package, AlertTriangle, Plus, Trash2, Save
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import EmptyState from './EmptyState'
import { useLanguage } from '@/lib/i18n/context'
import type { Language } from '@/lib/i18n/translations'

interface Revenue { id: string; month: string; amount: number; target: number; category: string }
interface Customer { id: string; name: string; phone: string; serviceType: string; status: string; joinDate: string }
interface InventoryItem { id: string; productName: string; quantity: number; minQuantity: number; category: string }
interface NetworkIncident { id: string; title: string; area: string; severity: string; status: string; reportedAt: string }
interface SupportTicket { id: string; customerName: string; subject: string; status: string; createdAt: string }

export default function DashboardSection() {
  const { t, isRTL, language } = useLanguage()

  const customerServiceOptions = [
    { value: 'ألياف ضوئية', label: t('serviceTypes.fiber') },
    { value: 'موبايل', label: t('serviceTypes.mobile') },
    { value: 'إنترنت', label: t('serviceTypes.internet') },
    { value: 'تلفزيون', label: t('serviceTypes.tv') },
    { value: 'أعمال', label: t('serviceTypes.business') },
  ]

  const categoryOptions = [
    { value: 'بيع الأجهزة', label: t('categories.deviceSale') },
    { value: 'التركيبات', label: t('categories.installations') },
    { value: 'الإصلاحات', label: t('categories.repairs') },
    { value: 'الاشتراكات', label: t('categories.subscriptions') },
    { value: 'الدعم الفني', label: t('categories.techSupport') },
  ]

  // Translate database-stored status values
  const translateStatus = (status: string) => {
    const statusMap: Record<string, Record<Language, string>> = {
      'نشط': { ar: 'نشط', fr: 'Actif', en: 'Active' },
      'غير نشط': { ar: 'غير نشط', fr: 'Inactif', en: 'Inactive' },
      'مفتوح': { ar: 'مفتوح', fr: 'Ouvert', en: 'Open' },
      'قيد المعالجة': { ar: 'قيد المعالجة', fr: 'En Cours', en: 'In Progress' },
      'محلول': { ar: 'محلول', fr: 'Résolu', en: 'Resolved' },
    }
    return statusMap[status]?.[language] || status
  }

  // Translate database-stored severity values
  const translateSeverity = (severity: string) => {
    const severityMap: Record<string, Record<Language, string>> = {
      'حرج': { ar: 'حرج', fr: 'Critique', en: 'Critical' },
      'متوسط': { ar: 'متوسط', fr: 'Moyen', en: 'Medium' },
      'خفيف': { ar: 'خفيف', fr: 'Mineur', en: 'Minor' },
    }
    return severityMap[severity]?.[language] || severity
  }

  // Translate database-stored service type values
  const translateServiceType = (serviceType: string) => {
    const serviceMap: Record<string, Record<Language, string>> = {
      'ألياف ضوئية': { ar: 'ألياف ضوئية', fr: 'Fibre Optique', en: 'Fiber Optic' },
      'موبايل': { ar: 'موبايل', fr: 'Mobile', en: 'Mobile' },
      'إنترنت': { ar: 'إنترنت', fr: 'Internet', en: 'Internet' },
      'تلفزيون': { ar: 'تلفزيون', fr: 'Télévision', en: 'Television' },
      'أعمال': { ar: 'أعمال', fr: 'Entreprise', en: 'Business' },
    }
    return serviceMap[serviceType]?.[language] || serviceType
  }

  // Translate database-stored category values
  const translateCategory = (category: string) => {
    const categoryMap: Record<string, Record<Language, string>> = {
      'بيع الأجهزة': { ar: 'بيع الأجهزة', fr: "Vente d'Appareils", en: 'Device Sales' },
      'التركيبات': { ar: 'التركيبات', fr: 'Installations', en: 'Installations' },
      'الإصلاحات': { ar: 'الإصلاحات', fr: 'Réparations', en: 'Repairs' },
      'الاشتراكات': { ar: 'الاشتراكات', fr: 'Abonnements', en: 'Subscriptions' },
      'الدعم الفني': { ar: 'الدعم الفني', fr: 'Support Technique', en: 'Technical Support' },
    }
    return categoryMap[category]?.[language] || category
  }

  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [incidents, setIncidents] = useState<NetworkIncident[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [addCustomerOpen, setAddCustomerOpen] = useState(false)
  const [addRevenueOpen, setAddRevenueOpen] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [revRes, custRes, invRes, incRes, tickRes] = await Promise.all([
        fetch('/api/revenues'), fetch('/api/customers'), fetch('/api/inventory'),
        fetch('/api/network-incidents'), fetch('/api/support-tickets')
      ])
      if (revRes.ok) setRevenues(await revRes.json())
      if (custRes.ok) setCustomers(await custRes.json())
      if (invRes.ok) setInventory(await invRes.json())
      if (incRes.ok) setIncidents(await incRes.json())
      if (tickRes.ok) setTickets(await tickRes.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData]) // eslint-disable-line react-hooks/set-state-in-effect

  // Add Customer
  const handleAddCustomer = async () => {
    if (!formData.name || !formData.phone || !formData.serviceType) {
      toast.error(t('fillRequired')); return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/customers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) { toast.success(t('recordAdded')); setFormData({}); setAddCustomerOpen(false); fetchData() }
      else toast.error(t('errorAdd'))
    } catch { toast.error(t('errorConnection')) }
    setSubmitting(false)
  }

  // Add Revenue
  const handleAddRevenue = async () => {
    if (!formData.month || !formData.amount || !formData.target || !formData.category) {
      toast.error(t('fillRequired')); return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/revenues', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) { toast.success(t('recordAdded')); setFormData({}); setAddRevenueOpen(false); fetchData() }
      else toast.error(t('errorAdd'))
    } catch { toast.error(t('errorConnection')) }
    setSubmitting(false)
  }

  const totalRevenue = revenues.reduce((s, r) => s + r.amount, 0)
  const activeCustomers = customers.filter(c => c.status === 'نشط').length
  const lowStockCount = inventory.filter(i => i.quantity <= i.minQuantity).length
  const openIncidents = incidents.filter(i => i.status !== 'محلول').length
  const openTickets = tickets.filter(t => t.status === 'مفتوح').length

  const kpiData = [
    { title: t('dashboard.totalCustomers'), value: customers.length > 0 ? customers.length.toString() : '0', change: customers.length > 0 ? `${activeCustomers} ${t('dashboard.active')}` : t('noData'), trend: 'up' as const, icon: Users, color: 'text-teal-400', bgColor: 'bg-teal-400/10', borderColor: 'border-teal-400/20' },
    { title: t('dashboard.totalRevenue'), value: revenues.length > 0 ? `${(totalRevenue / 1000).toFixed(0)}K ${t('currency')}` : `0 ${t('currency')}`, change: revenues.length > 0 ? `${revenues.length} ${t('records')}` : t('noData'), trend: 'up' as const, icon: DollarSign, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10', borderColor: 'border-emerald-400/20' },
    { title: t('dashboard.productsInStock'), value: inventory.length > 0 ? inventory.length.toString() : '0', change: inventory.length > 0 ? (lowStockCount > 0 ? `${lowStockCount} ${t('dashboard.low')}` : t('dashboard.noAlerts')) : t('noData'), trend: lowStockCount > 0 ? 'down' as const : 'up' as const, icon: Package, color: 'text-cyan-400', bgColor: 'bg-cyan-400/10', borderColor: 'border-cyan-400/20' },
    { title: t('dashboard.networkIncidents'), value: incidents.length > 0 ? openIncidents.toString() : '0', change: incidents.length > 0 ? (openIncidents === 0 ? t('dashboard.stable') : t('dashboard.needsAttention')) : t('noData'), trend: openIncidents === 0 ? 'up' as const : 'down' as const, icon: Wifi, color: 'text-amber-400', bgColor: 'bg-amber-400/10', borderColor: 'border-amber-400/20' },
  ]

  const revenueByMonth: Record<string, { revenue: number; target: number }> = {}
  revenues.forEach(r => {
    if (!revenueByMonth[r.month]) revenueByMonth[r.month] = { revenue: 0, target: 0 }
    revenueByMonth[r.month].revenue += r.amount
    revenueByMonth[r.month].target += r.target
  })
  const revenueChartData = Object.entries(revenueByMonth).map(([month, data]) => ({ month, ...data }))

  const customerByService: Record<string, number> = {}
  customers.forEach(c => { customerByService[c.serviceType] = (customerByService[c.serviceType] || 0) + 1 })
  const customerChartData = Object.entries(customerByService).map(([serviceType, count]) => ({ serviceType: translateServiceType(serviceType), count }))

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-400" /></div>
  }

  const hasData = revenues.length > 0 || customers.length > 0 || inventory.length > 0 || incidents.length > 0

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className={`${kpi.borderColor} border bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-300`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <div className="flex items-center gap-1">
                      {kpi.trend === 'up' ? <ArrowUpRight className="h-3 w-3 text-emerald-400" /> : <ArrowDownRight className="h-3 w-3 text-red-400" />}
                      <span className={`text-xs font-medium ${kpi.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>{kpi.change}</span>
                    </div>
                  </div>
                  <div className={`${kpi.bgColor} p-3 rounded-xl`}><kpi.icon className={`h-6 w-6 ${kpi.color}`} /></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Add Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => { setFormData({}); setAddCustomerOpen(true) }} className="bg-teal-400 hover:bg-teal-500 text-white">
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t('dashboard.addCustomer')}
        </Button>
        <Button onClick={() => { setFormData({}); setAddRevenueOpen(true) }} className="bg-emerald-400 hover:bg-emerald-500 text-white">
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t('dashboard.addRevenue')}
        </Button>
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={addCustomerOpen} onOpenChange={v => { setAddCustomerOpen(v); if (!v) setFormData({}) }}>
        <DialogContent className="sm:max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader><DialogTitle>{t('dashboard.addCustomerTitle')}</DialogTitle><DialogDescription>{t('dashboard.addCustomerDesc')}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label className="text-sm">{t('dashboard.customerName')} *</Label><Input value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder={t('dashboard.customerName')} className="bg-muted/30 border-border/50" /></div>
            <div className="space-y-2"><Label className="text-sm">{t('dashboard.phoneNumber')} *</Label><Input value={formData.phone || ''} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="+216..." className="bg-muted/30 border-border/50" dir="ltr" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-sm">{t('dashboard.serviceType')} *</Label>
                <Select value={formData.serviceType || ''} onValueChange={v => setFormData(p => ({ ...p, serviceType: v }))}>
                  <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue placeholder={t('dashboard.chooseService')} /></SelectTrigger>
                  <SelectContent>{customerServiceOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-sm">{t('dashboard.status')}</Label>
                <Select value={formData.status || 'نشط'} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="نشط">{t('dashboard.activeStatus')}</SelectItem><SelectItem value="غير نشط">{t('dashboard.inactiveStatus')}</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label className="text-sm">{t('dashboard.email')}</Label><Input value={formData.email || ''} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className="bg-muted/30 border-border/50" dir="ltr" /></div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild><Button variant="outline" disabled={submitting} className="border-border/50">{t('cancel')}</Button></DialogClose>
            <Button onClick={handleAddCustomer} disabled={submitting} className="bg-teal-400 hover:bg-teal-500 text-white">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t('add')}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Revenue Dialog */}
      <Dialog open={addRevenueOpen} onOpenChange={v => { setAddRevenueOpen(v); if (!v) setFormData({}) }}>
        <DialogContent className="sm:max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader><DialogTitle>{t('dashboard.addRevenueTitle')}</DialogTitle><DialogDescription>{t('dashboard.addRevenueDesc')}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label className="text-sm">{t('dashboard.month')} *</Label><Input value={formData.month || ''} onChange={e => setFormData(p => ({ ...p, month: e.target.value }))} placeholder={t('dashboard.monthExample')} className="bg-muted/30 border-border/50" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-sm">{t('dashboard.amount')} ({t('currency')}) *</Label><Input type="number" value={formData.amount || ''} onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))} placeholder="0" className="bg-muted/30 border-border/50" dir="ltr" /></div>
              <div className="space-y-2"><Label className="text-sm">{t('dashboard.target')} ({t('currency')}) *</Label><Input type="number" value={formData.target || ''} onChange={e => setFormData(p => ({ ...p, target: e.target.value }))} placeholder="0" className="bg-muted/30 border-border/50" dir="ltr" /></div>
            </div>
            <div className="space-y-2"><Label className="text-sm">{t('dashboard.category')} *</Label>
              <Select value={formData.category || ''} onValueChange={v => setFormData(p => ({ ...p, category: v }))}>
                <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue placeholder={t('dashboard.chooseCategory')} /></SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild><Button variant="outline" disabled={submitting} className="border-border/50">{t('cancel')}</Button></DialogClose>
            <Button onClick={handleAddRevenue} disabled={submitting} className="bg-teal-400 hover:bg-teal-500 text-white">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t('add')}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!hasData ? (
        <EmptyState
          icon={<Activity className="h-8 w-8 text-muted-foreground" />}
          title={t('dashboard.noDataYet')}
          description={t('dashboard.noDataDesc')}
        />
      ) : (
        <>
          {/* Revenue Chart */}
          {revenueChartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div variants={itemVariants}>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{t('dashboard.revenueTrend')}</CardTitle>
                      <Badge variant="secondary" className="bg-emerald-400/10 text-emerald-400"><TrendingUp className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />{t('dashboard.realData')}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                          <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} formatter={(value: number) => [`${(value / 1000).toFixed(0)}K ${t('currency')}`]} />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" name={t('dashboard.revenues')} stroke="#0D9488" strokeWidth={2.5} dot={{ fill: '#0D9488', r: 4 }} />
                          <Line type="monotone" dataKey="target" name={t('dashboard.targetLabel')} stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Customer by Service */}
              {customerChartData.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{t('dashboard.customersByService')}</CardTitle>
                        <Badge variant="secondary" className="bg-teal-400/10 text-teal-400"><Users className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />{customers.length} {t('dashboard.customer')}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={customerChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="serviceType" stroke="#94A3B8" fontSize={11} tickLine={false} />
                            <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} />
                            <Bar dataKey="count" name={t('dashboard.customerCount')} fill="#0D9488" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          )}

          {/* Recent Activities */}
          {(incidents.length > 0 || tickets.length > 0 || customers.length > 0) && (
            <motion.div variants={itemVariants}>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-2"><CardTitle className="text-lg">{t('dashboard.recentActivities')}</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {incidents.slice(0, 3).map(inc => (
                      <div key={inc.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="mt-1 p-1.5 rounded-lg bg-amber-400/10 text-amber-400"><AlertTriangle className="h-3 w-3" /></div>
                        <div><p className="text-xs">{t('dashboard.networkFault')}: {inc.title} - {inc.area}</p><p className="text-[10px] text-muted-foreground">{translateSeverity(inc.severity)}</p></div>
                      </div>
                    ))}
                    {tickets.slice(0, 3).map(t => (
                      <div key={t.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="mt-1 p-1.5 rounded-lg bg-teal-400/10 text-teal-400"><Phone className="h-3 w-3" /></div>
                        <div><p className="text-xs">{t('dashboard.ticket')}: {t.subject} - {t.customerName}</p><p className="text-[10px] text-muted-foreground">{translateStatus(t.status)}</p></div>
                      </div>
                    ))}
                    {customers.slice(0, 2).map(c => (
                      <div key={c.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="mt-1 p-1.5 rounded-lg bg-emerald-400/10 text-emerald-400"><Users className="h-3 w-3" /></div>
                        <div><p className="text-xs">{t('dashboard.newCustomer')}: {c.name} ({translateServiceType(c.serviceType)})</p><p className="text-[10px] text-muted-foreground">{translateStatus(c.status)}</p></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Stats */}
          <motion.div variants={itemVariants}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2"><CardTitle className="text-lg">{t('dashboard.quickStats')}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('dashboard.activeCustomers')}</span><span className="font-bold text-teal-400">{activeCustomers}</span></div>
                    <Progress value={customers.length > 0 ? (activeCustomers / customers.length) * 100 : 0} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('dashboard.openTickets')}</span><span className="font-bold text-amber-400">{openTickets}</span></div>
                    <Progress value={tickets.length > 0 ? (openTickets / tickets.length) * 100 : 0} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('dashboard.lowStock')}</span><span className="font-bold text-red-400">{lowStockCount}</span></div>
                    <Progress value={inventory.length > 0 ? (lowStockCount / inventory.length) * 100 : 0} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('dashboard.openIncidents')}</span><span className="font-bold text-cyan-400">{openIncidents}</span></div>
                    <Progress value={incidents.length > 0 ? (openIncidents / incidents.length) * 100 : 0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
