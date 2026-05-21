'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  Wifi, AlertTriangle, CheckCircle2, Clock, Plus, Loader2, MapPin, Activity, Radio, Trash2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/i18n/context'
import type { Language } from '@/lib/i18n/translations'
import EmptyState from './EmptyState'

interface Incident { id: string; title: string; area: string; severity: string; status: string; reportedAt: string }
interface Metric { id: string; date: string; uptime: number; latency: number; throughput: number; errors: number }

export default function NetworkOpsSection() {
  const { t, isRTL, language } = useLanguage()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [addIncidentOpen, setAddIncidentOpen] = useState(false)
  const [addMetricOpen, setAddMetricOpen] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const severityOptions = [
    { value: 'حرج', label: t('network.critical') },
    { value: 'متوسط', label: t('network.medium') },
    { value: 'خفيف', label: t('network.minor') },
  ]

  const statusOptions = [
    { value: 'مفتوح', label: t('network.open') },
    { value: 'قيد المعالجة', label: t('network.inProcess') },
    { value: 'محلول', label: t('network.resolvedStatus') },
  ]

  const translateStatus = (status: string) => {
    const map: Record<string, Record<Language, string>> = {
      'مفتوح': { ar: 'مفتوح', fr: 'Ouvert', en: 'Open' },
      'قيد المعالجة': { ar: 'قيد المعالجة', fr: 'En Cours', en: 'In Progress' },
      'محلول': { ar: 'محلول', fr: 'Résolu', en: 'Resolved' },
    }
    return map[status]?.[language] || status
  }

  const translateSeverity = (severity: string) => {
    const map: Record<string, Record<Language, string>> = {
      'حرج': { ar: 'حرج', fr: 'Critique', en: 'Critical' },
      'متوسط': { ar: 'متوسط', fr: 'Moyen', en: 'Medium' },
      'خفيف': { ar: 'خفيف', fr: 'Mineur', en: 'Minor' },
    }
    return map[severity]?.[language] || severity
  }

  const fetchData = useCallback(async () => {
    try {
      const [incRes, metRes] = await Promise.all([fetch('/api/network-incidents'), fetch('/api/network-metrics')])
      if (incRes.ok) setIncidents(await incRes.json())
      if (metRes.ok) setMetrics(await metRes.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData]) // eslint-disable-line react-hooks/set-state-in-effect

  const handleSubmitIncident = async () => {
    if (!formData.title || !formData.area || !formData.severity) { toast.error(t('fillRequired')); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/network-incidents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (res.ok) { toast.success(t('network.incidentAdded')); setFormData({}); setAddIncidentOpen(false); fetchData() }
    } catch { toast.error(t('error')) }
    setSubmitting(false)
  }

  const handleSubmitMetric = async () => {
    if (!formData.date || !formData.uptime || !formData.latency) { toast.error(t('fillRequired')); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/network-metrics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (res.ok) { toast.success(t('network.metricAdded')); setFormData({}); setAddMetricOpen(false); fetchData() }
    } catch { toast.error(t('error')) }
    setSubmitting(false)
  }

  const handleDeleteIncident = async (id: string) => {
    try {
      const res = await fetch(`/api/network-incidents?id=${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success(t('network.incidentDeleted')); fetchData() }
    } catch { toast.error(t('errorDelete')) }
  }

  const handleDeleteMetric = async (id: string) => {
    try {
      const res = await fetch(`/api/network-metrics?id=${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success(t('network.metricDeleted')); fetchData() }
    } catch { toast.error(t('errorDelete')) }
  }

  const openCount = incidents.filter(i => i.status === 'مفتوح').length
  const processingCount = incidents.filter(i => i.status === 'قيد المعالجة').length
  const resolvedCount = incidents.filter(i => i.status === 'محلول').length
  const avgUptime = metrics.length > 0 ? (metrics.reduce((s, m) => s + m.uptime, 0) / metrics.length).toFixed(2) : '0'

  const netMetrics = [
    { label: t('network.uptime'), value: `${avgUptime}%`, icon: Wifi, color: 'text-teal-400' },
    { label: t('network.openIncidents'), value: openCount.toString(), icon: AlertTriangle, color: 'text-red-400' },
    { label: t('network.inProgress'), value: processingCount.toString(), icon: Clock, color: 'text-amber-400' },
    { label: t('network.resolved'), value: resolvedCount.toString(), icon: CheckCircle2, color: 'text-emerald-400' },
  ]

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-400" /></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {netMetrics.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-muted/50"><m.icon className={`h-5 w-5 ${m.color}`} /></div><div><p className="text-2xl font-bold">{m.value}</p><p className="text-xs text-muted-foreground">{m.label}</p></div></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => { setFormData({}); setAddIncidentOpen(true) }} className="bg-red-400 hover:bg-red-500 text-white"><AlertTriangle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t('network.reportFault')}</Button>
        <Button onClick={() => { setFormData({}); setAddMetricOpen(true) }} className="bg-teal-400 hover:bg-teal-500 text-white"><Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t('network.addMetric')}</Button>
      </div>

      {/* Add Incident Dialog */}
      <Dialog open={addIncidentOpen} onOpenChange={v => { setAddIncidentOpen(v); if (!v) setFormData({}) }}>
        <DialogContent className="sm:max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader><DialogTitle>{t('network.reportNetworkFault')}</DialogTitle><DialogDescription>{t('network.enterFaultDetails')}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label className="text-sm">{t('network.title')} *</Label><Input value={formData.title || ''} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder={t('network.serviceOutage')} className="bg-muted/30 border-border/50" /></div>
            <div className="space-y-2"><Label className="text-sm">{t('network.area')} *</Label><Input value={formData.area || ''} onChange={e => setFormData(p => ({ ...p, area: e.target.value }))} placeholder={t('network.areaExample')} className="bg-muted/30 border-border/50" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-sm">{t('network.severity')} *</Label>
                <Select value={formData.severity || ''} onValueChange={v => setFormData(p => ({ ...p, severity: v }))}>
                  <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue placeholder={t('network.choose')} /></SelectTrigger>
                  <SelectContent>{severityOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-sm">{t('network.status')}</Label>
                <Select value={formData.status || 'مفتوح'} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild><Button variant="outline" disabled={submitting}>{t('cancel')}</Button></DialogClose>
            <Button onClick={handleSubmitIncident} disabled={submitting} className="bg-teal-400 hover:bg-teal-500 text-white">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Metric Dialog */}
      <Dialog open={addMetricOpen} onOpenChange={v => { setAddMetricOpen(v); if (!v) setFormData({}) }}>
        <DialogContent className="sm:max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader><DialogTitle>{t('network.addNetworkMetric')}</DialogTitle><DialogDescription>{t('network.enterPerformance')}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label className="text-sm">{t('network.date')} *</Label><Input type="date" value={formData.date || ''} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} className="bg-muted/30 border-border/50" dir="ltr" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-sm">{t('network.uptimePct')} *</Label><Input type="number" value={formData.uptime || ''} onChange={e => setFormData(p => ({ ...p, uptime: e.target.value }))} placeholder="99.94" className="bg-muted/30 border-border/50" dir="ltr" /></div>
              <div className="space-y-2"><Label className="text-sm">{t('network.latencyMs')} *</Label><Input type="number" value={formData.latency || ''} onChange={e => setFormData(p => ({ ...p, latency: e.target.value }))} placeholder="15" className="bg-muted/30 border-border/50" dir="ltr" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-sm">{t('network.throughputPct')}</Label><Input type="number" value={formData.throughput || ''} onChange={e => setFormData(p => ({ ...p, throughput: e.target.value }))} placeholder="85" className="bg-muted/30 border-border/50" dir="ltr" /></div>
              <div className="space-y-2"><Label className="text-sm">{t('network.errorRatePct')}</Label><Input type="number" value={formData.errors || ''} onChange={e => setFormData(p => ({ ...p, errors: e.target.value }))} placeholder="0.1" className="bg-muted/30 border-border/50" dir="ltr" /></div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild><Button variant="outline" disabled={submitting}>{t('cancel')}</Button></DialogClose>
            <Button onClick={handleSubmitMetric} disabled={submitting} className="bg-teal-400 hover:bg-teal-500 text-white">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {incidents.length === 0 && metrics.length === 0 ? (
        <EmptyState icon={<Wifi className="h-8 w-8 text-muted-foreground" />} title={t('network.noDataYet')} description={t('network.noDataDesc')} actionLabel={t('network.reportFault')} onAction={() => setAddIncidentOpen(true)} />
      ) : (
        <>
          {/* Network Performance Chart */}
          {metrics.length > 0 && (
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{t('network.networkPerformance')}</CardTitle>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => {
                    Promise.all(metrics.map(m => fetch(`/api/network-metrics?id=${m.id}`, { method: 'DELETE' }))).then(() => { toast.success(t('network.allMetricsDeleted')); fetchData() })
                  }}><Trash2 className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />{t('network.clearMetrics')}</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.map(m => ({ date: new Date(m.date).toLocaleDateString('ar-TN'), ...m }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} />
                      <Legend />
                      <Area type="monotone" dataKey="throughput" name={t('network.throughputLabel')} stroke="#10B981" fill="#10B981" fillOpacity={0.15} strokeWidth={2} />
                      <Area type="monotone" dataKey="latency" name={t('network.latencyLabel')} stroke="#0D9488" fill="#0D9488" fillOpacity={0.1} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Incidents Table */}
          {incidents.length > 0 && (
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2"><CardTitle className="text-lg">{t('network.incidentLog')}</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('network.title')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('network.area')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('network.severity')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('network.status')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('network.date')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('delete')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidents.map(inc => (
                        <tr key={inc.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-medium">{inc.title}</td>
                          <td className="p-3"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{inc.area}</span></td>
                          <td className="p-3"><Badge variant="secondary" className={inc.severity === 'حرج' ? 'bg-red-400/10 text-red-400' : inc.severity === 'متوسط' ? 'bg-amber-400/10 text-amber-400' : 'bg-emerald-400/10 text-emerald-400'}>{translateSeverity(inc.severity)}</Badge></td>
                          <td className="p-3"><Badge variant="secondary" className={inc.status === 'محلول' ? 'bg-emerald-400/10 text-emerald-400' : inc.status === 'قيد المعالجة' ? 'bg-amber-400/10 text-amber-400' : 'bg-red-400/10 text-red-400'}>{translateStatus(inc.status)}</Badge></td>
                          <td className="p-3 text-xs text-muted-foreground">{new Date(inc.reportedAt).toLocaleDateString('ar-TN')}</td>
                          <td className="p-3">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300" onClick={() => handleDeleteIncident(inc.id)}>
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
          )}
        </>
      )}
    </motion.div>
  )
}
