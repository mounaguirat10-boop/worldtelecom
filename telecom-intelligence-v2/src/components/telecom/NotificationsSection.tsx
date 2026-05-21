'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Bell, Plus, Loader2, Check, DollarSign, TrendingUp, AlertTriangle, Info, Eye
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/i18n/context'
import type { Language } from '@/lib/i18n/translations'
import EmptyState from './EmptyState'

interface Notification { id: string; title: string; message: string; type: string; priority: string; isRead: boolean; createdAt: string }

const typeIcons: Record<string, React.ElementType> = {
  'سعر': DollarSign, 'سوق': TrendingUp, 'تنبيه': AlertTriangle, 'نظام': Info, 'معلومات': Info
}
const typeColors: Record<string, string> = {
  'سعر': 'text-amber-400 bg-amber-400/10', 'سوق': 'text-teal-400 bg-teal-400/10', 'تنبيه': 'text-red-400 bg-red-400/10', 'نظام': 'text-cyan-400 bg-cyan-400/10', 'معلومات': 'text-emerald-400 bg-emerald-400/10'
}

export default function NotificationsSection() {
  const { t, isRTL, language } = useLanguage()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState<string>('الكل')

  const typeOptions = [
    { value: 'سعر', label: t('notifications.price') },
    { value: 'سوق', label: t('notifications.market') },
    { value: 'تنبيه', label: t('notifications.alert') },
    { value: 'نظام', label: t('notifications.system') },
    { value: 'معلومات', label: t('notifications.info') },
  ]

  const priorityOptions = [
    { value: 'عاجل', label: t('notifications.urgent') },
    { value: 'مهم', label: t('notifications.important') },
    { value: 'عادي', label: t('notifications.normal') },
  ]

  const filterButtons = [
    { value: 'الكل', label: t('notifications.all') },
    { value: 'سعر', label: t('notifications.price') },
    { value: 'سوق', label: t('notifications.market') },
    { value: 'تنبيه', label: t('notifications.alert') },
    { value: 'نظام', label: t('notifications.system') },
    { value: 'معلومات', label: t('notifications.info') },
  ]

  const translatePriority = (priority: string) => {
    const map: Record<string, Record<Language, string>> = {
      'عاجل': { ar: 'عاجل', fr: 'Urgent', en: 'Urgent' },
      'مهم': { ar: 'مهم', fr: 'Important', en: 'Important' },
      'عادي': { ar: 'عادي', fr: 'Normal', en: 'Normal' },
    }
    return map[priority]?.[language] || priority
  }

  const translateType = (type: string) => {
    const map: Record<string, Record<Language, string>> = {
      'سعر': { ar: 'سعر', fr: 'Prix', en: 'Price' },
      'سوق': { ar: 'سوق', fr: 'Marché', en: 'Market' },
      'تنبيه': { ar: 'تنبيه', fr: 'Alerte', en: 'Alert' },
      'نظام': { ar: 'نظام', fr: 'Système', en: 'System' },
      'معلومات': { ar: 'معلومات', fr: 'Information', en: 'Info' },
    }
    return map[type]?.[language] || type
  }

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) setNotifications(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData]) // eslint-disable-line react-hooks/set-state-in-effect

  const handleSubmit = async () => {
    if (!formData.title || !formData.message || !formData.type) { toast.error(t('fillRequired')); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (res.ok) { toast.success(t('notifications.notifAdded')); setFormData({}); setAddOpen(false); fetchData() }
    } catch { toast.error(t('error')) }
    setSubmitting(false)
  }

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isRead: true }) })
      if (res.ok) fetchData()
    } catch { /* ignore */ }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const filtered = filter === 'الكل' ? notifications : notifications.filter(n => n.type === filter)

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-400" /></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header Stats */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><Bell className="h-5 w-5 text-teal-400" /><span className="text-lg font-bold">{notifications.length} {t('notifications.notification')}</span></div>
          {unreadCount > 0 && <Badge className="bg-red-400/10 text-red-400">{unreadCount} {t('notifications.unread')}</Badge>}
        </div>
        <Button onClick={() => { setFormData({}); setAddOpen(true) }} className="bg-teal-400 hover:bg-teal-500 text-white"><Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t('notifications.addNotification')}</Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {filterButtons.map(f => (
          <Button key={f.value} variant={filter === f.value ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f.value)} className={filter === f.value ? 'bg-teal-400 hover:bg-teal-500 text-white' : 'border-border/50'}>
            {f.label}
          </Button>
        ))}
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={v => { setAddOpen(v); if (!v) setFormData({}) }}>
        <DialogContent className="sm:max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader><DialogTitle>{t('notifications.addNotifTitle')}</DialogTitle><DialogDescription>{t('notifications.enterNotifContent')}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label className="text-sm">{t('notifications.title')} *</Label><Input value={formData.title || ''} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder={t('notifications.notifTitle')} className="bg-muted/30 border-border/50" /></div>
            <div className="space-y-2"><Label className="text-sm">{t('notifications.content')} *</Label><Textarea value={formData.message || ''} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} placeholder={t('notifications.notifContent')} className="bg-muted/30 border-border/50 min-h-[80px]" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-sm">{t('notifications.type')} *</Label>
                <Select value={formData.type || ''} onValueChange={v => setFormData(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue placeholder={t('notifications.chooseType')} /></SelectTrigger>
                  <SelectContent>{typeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-sm">{t('notifications.priority')}</Label>
                <Select value={formData.priority || 'عادي'} onValueChange={v => setFormData(p => ({ ...p, priority: v }))}>
                  <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>{priorityOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild><Button variant="outline" disabled={submitting}>{t('cancel')}</Button></DialogClose>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-teal-400 hover:bg-teal-500 text-white">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {notifications.length === 0 ? (
        <EmptyState icon={<Bell className="h-8 w-8 text-muted-foreground" />} title={t('notifications.noNotificationsYet')} description={t('notifications.noNotifDesc')} actionLabel={t('notifications.addNotification')} onAction={() => setAddOpen(true)} />
      ) : (
        <div className="space-y-3">
          {filtered.map(n => {
            const Icon = typeIcons[n.type] || Info
            const colorClass = typeColors[n.type] || 'text-muted-foreground bg-muted/50'
            return (
              <motion.div key={n.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`rounded-xl border p-4 transition-all ${n.isRead ? 'border-border/30 bg-card/50' : 'border-teal-400/20 bg-card/80'}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}><Icon className="h-5 w-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{n.title}</span>
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-teal-400" />}
                      {n.priority === 'عاجل' && <Badge className="bg-red-400/10 text-red-400 text-[10px]">{t('notifications.urgent')}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleDateString('ar-TN')} {new Date(n.createdAt).toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' })}</span>
                      {!n.isRead && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs text-teal-400 hover:text-teal-300 p-0" onClick={() => markAsRead(n.id)}>
                          <Eye className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />{t('notifications.read')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
