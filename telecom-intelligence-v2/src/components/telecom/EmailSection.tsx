'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Mail, Send, Plus, Star, StarOff, Trash2, Loader2,
  Inbox, Eye, FileEdit, ArrowRight, ArrowLeft
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/i18n/context'
import { Language } from '@/lib/i18n/translations'
import EmptyState from './EmptyState'

interface Email {
  id: string
  from: string
  to: string
  subject: string
  body: string
  status: string
  priority: string
  isRead: boolean
  starred: boolean
  createdAt: string
}

type FilterType = 'all' | 'sent' | 'draft' | 'starred'

export default function EmailSection() {
  const { t, isRTL, language } = useLanguage()
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [composeOpen, setComposeOpen] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)

  const translateStatus = (status: string) => {
    const map: Record<string, Record<Language, string>> = {
      'مرسلة': { ar: 'مرسلة', fr: 'Envoyé', en: 'Sent' },
      'مسودة': { ar: 'مسودة', fr: 'Brouillon', en: 'Draft' },
      'مستلمة': { ar: 'مستلمة', fr: 'Reçu', en: 'Received' },
    }
    return map[status]?.[language] || status
  }

  const translatePriority = (priority: string) => {
    const map: Record<string, Record<Language, string>> = {
      'عاجل': { ar: 'عاجل', fr: 'Urgent', en: 'Urgent' },
      'مهم': { ar: 'مهم', fr: 'Important', en: 'Important' },
      'عادي': { ar: 'عادي', fr: 'Normal', en: 'Normal' },
    }
    return map[priority]?.[language] || priority
  }

  const statusOptions = [
    { value: 'مرسلة', label: t('email.sentStatus') },
    { value: 'مسودة', label: t('email.draftStatus') },
    { value: 'مستلمة', label: t('email.receivedStatus') },
  ]

  const priorityOptions = [
    { value: 'عاجل', label: t('email.urgent') },
    { value: 'مهم', label: t('email.important') },
    { value: 'عادي', label: t('email.normal') },
  ]

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/emails')
      if (res.ok) setEmails(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData]) // eslint-disable-line react-hooks/set-state-in-effect

  const handleCompose = async (sendNow: boolean) => {
    if (!formData.from || !formData.to || !formData.subject) {
      toast.error(t('fillRequired')); return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: sendNow ? 'مرسلة' : 'مسودة',
        })
      })
      if (res.ok) {
        toast.success(sendNow ? t('email.emailSent') : t('email.draftSaved'))
        setFormData({})
        setComposeOpen(false)
        fetchData()
      } else {
        toast.error(t('errorAdd'))
      }
    } catch {
      toast.error(t('errorConnection'))
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/emails?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(t('email.emailDeleted'))
        setSelectedEmail(null)
        fetchData()
      }
    } catch { toast.error(t('errorDelete')) }
  }

  const handleMarkRead = async (id: string, isRead: boolean) => {
    try {
      const res = await fetch('/api/emails', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead })
      })
      if (res.ok) fetchData()
    } catch { /* ignore */ }
  }

  const handleToggleStar = async (id: string, starred: boolean) => {
    try {
      const res = await fetch('/api/emails', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, starred })
      })
      if (res.ok) fetchData()
    } catch { /* ignore */ }
  }

  const unreadCount = emails.filter(e => !e.isRead).length
  const starredCount = emails.filter(e => e.starred).length
  const draftCount = emails.filter(e => e.status === 'مسودة').length

  const filtered = filter === 'all' ? emails
    : filter === 'sent' ? emails.filter(e => e.status === 'مرسلة')
    : filter === 'draft' ? emails.filter(e => e.status === 'مسودة')
    : emails.filter(e => e.starred)

  const stats = [
    { label: t('email.totalEmails'), value: emails.length.toString(), icon: Mail, color: 'text-teal-400' },
    { label: t('email.unread'), value: unreadCount.toString(), icon: Inbox, color: 'text-amber-400' },
    { label: t('email.starredCount'), value: starredCount.toString(), icon: Star, color: 'text-yellow-400' },
    { label: t('email.draftCount'), value: draftCount.toString(), icon: FileEdit, color: 'text-cyan-400' },
  ]

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: 'all', label: t('email.all') },
    { key: 'sent', label: t('email.sent') },
    { key: 'draft', label: t('email.drafts') },
    { key: 'starred', label: t('email.starred') },
  ]

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-400" /></div>
  }

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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => { setFormData({ from: 'info@worldtelecom.tn' }); setComposeOpen(true) }} className="bg-teal-400 hover:bg-teal-500 text-white">
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t('email.compose')}
        </Button>
      </div>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={v => { setComposeOpen(v); if (!v) setFormData({}) }}>
        <DialogContent className="sm:max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-teal-400" />
              {t('email.compose')}
            </DialogTitle>
            <DialogDescription>{t('email.composeDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm">{t('email.from')} *</Label>
              <Input value={formData.from || ''} onChange={e => setFormData(p => ({ ...p, from: e.target.value }))} placeholder={t('email.fromPlaceholder')} className="bg-muted/30 border-border/50" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">{t('email.to')} *</Label>
              <Input value={formData.to || ''} onChange={e => setFormData(p => ({ ...p, to: e.target.value }))} placeholder={t('email.toPlaceholder')} className="bg-muted/30 border-border/50" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">{t('email.subject')} *</Label>
              <Input value={formData.subject || ''} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} placeholder={t('email.subjectPlaceholder')} className="bg-muted/30 border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">{t('email.body')}</Label>
              <Textarea value={formData.body || ''} onChange={e => setFormData(p => ({ ...p, body: e.target.value }))} placeholder={t('email.bodyPlaceholder')} className="bg-muted/30 border-border/50 min-h-[120px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">{t('email.priority')}</Label>
                <Select value={formData.priority || 'عادي'} onValueChange={v => setFormData(p => ({ ...p, priority: v }))}>
                  <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>{priorityOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild><Button variant="outline" disabled={submitting} className="border-border/50">{t('cancel')}</Button></DialogClose>
            <Button onClick={() => handleCompose(false)} disabled={submitting} variant="outline" className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10">
              <FileEdit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t('email.saveDraft')}
            </Button>
            <Button onClick={() => handleCompose(true)} disabled={submitting} className="bg-teal-400 hover:bg-teal-500 text-white">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t('email.send')}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filterButtons.map(f => (
          <Button key={f.key} variant={filter === f.key ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f.key)} className={filter === f.key ? 'bg-teal-400 hover:bg-teal-500 text-white' : 'border-border/50'}>
            {f.label}
          </Button>
        ))}
      </div>

      {/* Email List & Detail */}
      {emails.length === 0 ? (
        <EmptyState icon={<Mail className="h-8 w-8 text-muted-foreground" />} title={t('email.noEmailsYet')} description={t('email.noEmailsDesc')} actionLabel={t('email.compose')} onAction={() => { setFormData({ from: 'info@worldtelecom.tn' }); setComposeOpen(true) }} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Email List */}
          <div className={`${selectedEmail ? 'hidden lg:block' : ''} lg:col-span-1`}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Inbox className="h-5 w-5 text-teal-400" />
                  {t('email.inbox')}
                  <Badge variant="secondary" className="bg-teal-400/10 text-teal-400 text-[10px]">{filtered.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">{t('noData')}</div>
                  ) : (
                    filtered.map(email => (
                      <div
                        key={email.id}
                        onClick={() => { setSelectedEmail(email); if (!email.isRead) handleMarkRead(email.id, true) }}
                        className={`p-3 rounded-lg cursor-pointer transition-all border ${
                          selectedEmail?.id === email.id
                            ? 'bg-teal-400/10 border-teal-400/30'
                            : 'hover:bg-muted/30 border-transparent'
                        } ${!email.isRead ? 'bg-card/80' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleStar(email.id, !email.starred) }}
                            className="mt-0.5 shrink-0"
                          >
                            {email.starred ? <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> : <Star className="h-4 w-4 text-muted-foreground/30" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-sm truncate ${!email.isRead ? 'font-bold' : 'font-medium'}`}>{isRTL ? email.from : email.to}</span>
                              {!email.isRead && <div className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />}
                            </div>
                            <p className={`text-xs truncate ${!email.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{email.subject}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className={`text-[9px] h-4 px-1 ${
                                email.status === 'مرسلة' ? 'bg-emerald-400/10 text-emerald-400' :
                                email.status === 'مسودة' ? 'bg-amber-400/10 text-amber-400' :
                                'bg-cyan-400/10 text-cyan-400'
                              }`}>{translateStatus(email.status)}</Badge>
                              <span className="text-[10px] text-muted-foreground">{new Date(email.createdAt).toLocaleDateString(isRTL ? 'ar-TN' : 'fr-FR')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Detail */}
          <div className={`${selectedEmail ? '' : 'hidden lg:block'} lg:col-span-2`}>
            {selectedEmail ? (
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Button variant="ghost" size="sm" className="lg:hidden shrink-0 h-8 w-8 p-0" onClick={() => setSelectedEmail(null)}>
                        {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                      </Button>
                      <CardTitle className="text-lg truncate">{selectedEmail.subject}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleToggleStar(selectedEmail.id, !selectedEmail.starred)}>
                        {selectedEmail.starred ? <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> : <StarOff className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300" onClick={() => handleDelete(selectedEmail.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">{t('email.from')}</p>
                        <p className="text-sm font-medium" dir="ltr">{selectedEmail.from}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">{t('email.to')}</p>
                        <p className="text-sm font-medium" dir="ltr">{selectedEmail.to}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="secondary" className={`text-[10px] ${
                        selectedEmail.status === 'مرسلة' ? 'bg-emerald-400/10 text-emerald-400' :
                        selectedEmail.status === 'مسودة' ? 'bg-amber-400/10 text-amber-400' :
                        'bg-cyan-400/10 text-cyan-400'
                      }`}>{translateStatus(selectedEmail.status)}</Badge>
                      <Badge variant="secondary" className={`text-[10px] ${
                        selectedEmail.priority === 'عاجل' ? 'bg-red-400/10 text-red-400' :
                        selectedEmail.priority === 'مهم' ? 'bg-amber-400/10 text-amber-400' :
                        'bg-muted/50 text-muted-foreground'
                      }`}>{translatePriority(selectedEmail.priority)}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(selectedEmail.createdAt).toLocaleString(isRTL ? 'ar-TN' : 'fr-FR')}</span>
                    </div>
                    {selectedEmail.body ? (
                      <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedEmail.body}</p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-muted/20 border border-border/30 text-center text-muted-foreground text-sm">
                        {t('noData')}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="border-border/50" onClick={() => {
                        setFormData({ from: selectedEmail.to, to: selectedEmail.from, subject: `Re: ${selectedEmail.subject}` })
                        setComposeOpen(true)
                      }}>
                        {isRTL ? <ArrowRight className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} /> : <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />}
                        {t('email.compose')}
                      </Button>
                      {!selectedEmail.isRead && (
                        <Button variant="outline" size="sm" className="border-teal-400/30 text-teal-400" onClick={() => handleMarkRead(selectedEmail.id, true)}>
                          <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t('email.markRead')}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">{t('email.noEmailsYet')}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
