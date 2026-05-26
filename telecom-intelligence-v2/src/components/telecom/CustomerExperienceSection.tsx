'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Heart, MessageSquare, Plus, Loader2, CheckCircle2, Clock, AlertCircle, Trash2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/i18n/context'
import type { Language } from '@/lib/i18n/translations'
import EmptyState from './EmptyState'

interface Ticket { id: string; customerName: string; subject: string; description: string; priority: string; status: string; createdAt: string }
interface Customer { id: string; name: string }

export default function CustomerExperienceSection() {
  const { t, isRTL, language } = useLanguage()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const priorityOptions = [
    { value: 'عالي', label: t('customer.high') },
    { value: 'متوسط', label: t('customer.medium') },
    { value: 'منخفض', label: t('customer.low') },
  ]

  const statusOptions = [
    { value: 'مفتوح', label: t('customer.openStatus') },
    { value: 'قيد المعالجة', label: t('customer.inProcess') },
    { value: 'محلول', label: t('customer.resolvedStatus') },
  ]

  const translateStatus = (status: string) => {
    const map: Record<string, Record<Language, string>> = {
      'مفتوح': { ar: 'مفتوح', fr: 'Ouvert', en: 'Open' },
      'قيد المعالجة': { ar: 'قيد المعالجة', fr: 'En Cours', en: 'In Progress' },
      'محلول': { ar: 'محلول', fr: 'Résolu', en: 'Resolved' },
    }
    return map[status]?.[language] || status
  }

  const translatePriority = (priority: string) => {
    const map: Record<string, Record<Language, string>> = {
      'عالي': { ar: 'عالي', fr: 'Élevée', en: 'High' },
      'متوسط': { ar: 'متوسط', fr: 'Moyenne', en: 'Medium' },
      'منخفض': { ar: 'منخفض', fr: 'Basse', en: 'Low' },
    }
    return map[priority]?.[language] || priority
  }

  const fetchData = useCallback(async () => {
    try {
      const [ticketsRes, customersRes] = await Promise.all([
        fetch('/api/support-tickets'),
        fetch('/api/customers'),
      ])
      if (ticketsRes.ok) setTickets(await ticketsRes.json())
      if (customersRes.ok) setCustomers(await customersRes.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  const handleSubmit = async () => {
    if (!formData.customerName || !formData.subject || !formData.description) { toast.error(t('fillRequired')); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/support-tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (res.ok) { toast.success(t('customer.ticketAdded')); setFormData({}); setAddOpen(false); fetchData() }
    } catch { toast.error(t('error')) }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/support-tickets?id=${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success(t('customer.ticketDeleted')); fetchData() }
    } catch { toast.error(t('errorDelete')) }
  }

  const openTickets = tickets.filter(t => t.status === 'مفتوح').length
  const processingTickets = tickets.filter(t => t.status === 'قيد المعالجة').length
  const resolvedTickets = tickets.filter(t => t.status === 'محلول').length

  const metrics = [
    { label: t('customer.totalTickets'), value: tickets.length.toString(), icon: MessageSquare, color: 'text-teal-400' },
    { label: t('customer.open'), value: openTickets.toString(), icon: AlertCircle, color: 'text-red-400' },
    { label: t('customer.inProgress'), value: processingTickets.toString(), icon: Clock, color: 'text-amber-400' },
    { label: t('customer.resolved'), value: resolvedTickets.toString(), icon: CheckCircle2, color: 'text-emerald-400' },
  ]

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-400" /></div>

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
                  <div><p className="text-2xl font-bold">{m.value}</p><p className="text-xs text-muted-foreground">{m.label}</p></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add Ticket Button */}
      <div className="flex gap-3">
        <Button onClick={() => { setFormData({}); setAddOpen(true) }} className="bg-teal-400 hover:bg-teal-500 text-white">
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t('customer.addTicket')}
        </Button>
      </div>

      {/* Add Ticket Dialog */}
      <Dialog open={addOpen} onOpenChange={v => { setAddOpen(v); if (!v) setFormData({}) }}>
        <DialogContent className="sm:max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('customer.addTicketTitle')}</DialogTitle>
            <DialogDescription>{t('customer.enterTicketDetails')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">

            {/* Customer Select */}
            <div className="space-y-2">
              <Label className="text-sm">{t('customer.customerName')} *</Label>
              {customers.length > 0 ? (
                <Select value={formData.customerName || ''} onValueChange={v => setFormData(p => ({ ...p, customerName: v }))}>
                  <SelectTrigger className="bg-muted/30 border-border/50">
                    <SelectValue placeholder={t('customer.customerName')} />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={formData.customerName || ''}
                  onChange={e => setFormData(p => ({ ...p, customerName: e.target.value }))}
                  placeholder={t('customer.customerName')}
                  className="bg-muted/30 border-border/50"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t('customer.subject')} *</Label>
              <Input value={formData.subject || ''} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} placeholder={t('customer.ticketSubject')} className="bg-muted/30 border-border/50" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t('customer.description')} *</Label>
              <Textarea value={formData.description || ''} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder={t('customer.problemDesc')} className="bg-muted/30 border-border/50 min-h-[80px]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">{t('customer.priority')}</Label>
                <Select value={formData.priority || 'متوسط'} onValueChange={v => setFormData(p => ({ ...p, priority: v }))}>
                  <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>{priorityOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t('customer.status')}</Label>
                <Select value={formData.status || 'مفتوح'} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild><Button variant="outline" disabled={submitting}>{t('cancel')}</Button></DialogClose>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-teal-400 hover:bg-teal-500 text-white">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {tickets.length === 0 ? (
        <EmptyState icon={<Heart className="h-8 w-8 text-muted-foreground" />} title={t('customer.noTicketsYet')} description={t('customer.noTicketsDesc')} actionLabel={t('customer.addTicket')} onAction={() => setAddOpen(true)} />
      ) : (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2"><CardTitle className="text-lg">{t('customer.supportTickets')}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('customer.customer')}</th>
                    <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('customer.subject')}</th>
                    <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('customer.priority')}</th>
                    <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('customer.status')}</th>
                    <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('customer.date')}</th>
                    <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-muted-foreground font-medium`}>{t('customer.delete')}</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{ticket.customerName}</td>
                      <td className="p-3">{ticket.subject}</td>
                      <td className="p-3">
                        <Badge variant="secondary" className={ticket.priority === 'عالي' ? 'bg-red-400/10 text-red-400' : ticket.priority === 'متوسط' ? 'bg-amber-400/10 text-amber-400' : 'bg-emerald-400/10 text-emerald-400'}>
                          {translatePriority(ticket.priority)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className={ticket.status === 'محلول' ? 'bg-emerald-400/10 text-emerald-400' : ticket.status === 'قيد المعالجة' ? 'bg-amber-400/10 text-amber-400' : 'bg-red-400/10 text-red-400'}>
                          {translateStatus(ticket.status)}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString('ar-TN')}</td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300" onClick={() => handleDelete(ticket.id)}>
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
    </motion.div>
  )
}


