'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Database, Plus, Trash2, DollarSign, Users, Package,
  AlertTriangle, Wifi, MessageSquare, Bell, RefreshCw
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/i18n/context'
import type { Language } from '@/lib/i18n/translations'
import DataFormDialog, { FormField } from './DataFormDialog'

// Type definitions
interface RevenueRecord { id: string; month: string; amount: number; target: number; category: string; createdAt: string }
interface CustomerRecord { id: string; name: string; phone: string; email: string | null; address: string | null; serviceType: string; status: string; createdAt: string }
interface InventoryRecord { id: string; productName: string; category: string; quantity: number; minQuantity: number; unitPrice: number; supplier: string | null; createdAt: string }
interface IncidentRecord { id: string; title: string; area: string; severity: string; status: string; reportedAt: string; createdAt: string }
interface MetricRecord { id: string; date: string; uptime: number; latency: number; throughput: number; errors: number; createdAt: string }
interface TicketRecord { id: string; customerName: string; subject: string; description: string; priority: string; status: string; createdAt: string }
interface NotificationRecord { id: string; title: string; message: string; type: string; priority: string; isRead: boolean; createdAt: string }

type DataType = 'revenues' | 'customers' | 'inventory' | 'incidents' | 'metrics' | 'tickets' | 'notifications'

const apiEndpoints: Record<DataType, string> = {
  revenues: '/api/revenues',
  customers: '/api/customers',
  inventory: '/api/inventory',
  incidents: '/api/network-incidents',
  metrics: '/api/network-metrics',
  tickets: '/api/support-tickets',
  notifications: '/api/notifications',
}

export default function DataManagementSection() {
  const { t, isRTL, language } = useLanguage()
  const [activeTab, setActiveTab] = useState<DataType>('revenues')
  const [data, setData] = useState<Record<string, unknown[]>>({})
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const tabs: { key: DataType; label: string; icon: React.ElementType; color: string }[] = [
    { key: 'revenues', label: t('dataManagement.revenues'), icon: DollarSign, color: 'text-emerald-400' },
    { key: 'customers', label: t('dataManagement.customers'), icon: Users, color: 'text-teal-400' },
    { key: 'inventory', label: t('dataManagement.inventory'), icon: Package, color: 'text-amber-400' },
    { key: 'incidents', label: t('dataManagement.incidents'), icon: AlertTriangle, color: 'text-red-400' },
    { key: 'metrics', label: t('dataManagement.metrics'), icon: Wifi, color: 'text-cyan-400' },
    { key: 'tickets', label: t('dataManagement.tickets'), icon: MessageSquare, color: 'text-purple-400' },
    { key: 'notifications', label: t('dataManagement.notif'), icon: Bell, color: 'text-pink-400' },
  ]

  const translateStatus = (status: string) => {
    const map: Record<string, Record<Language, string>> = {
      'نشط': { ar: 'نشط', fr: 'Actif', en: 'Active' },
      'غير نشط': { ar: 'غير نشط', fr: 'Inactif', en: 'Inactive' },
      'معلق': { ar: 'معلق', fr: 'En attente', en: 'Pending' },
      'مفتوح': { ar: 'مفتوح', fr: 'Ouvert', en: 'Open' },
      'قيد المعالجة': { ar: 'قيد المعالجة', fr: 'En Cours', en: 'In Progress' },
      'محلول': { ar: 'محلول', fr: 'Résolu', en: 'Resolved' },
      'مغلق': { ar: 'مغلق', fr: 'Fermé', en: 'Closed' },
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

  const translatePriority = (priority: string) => {
    const map: Record<string, Record<Language, string>> = {
      'عالي': { ar: 'عالي', fr: 'Élevée', en: 'High' },
      'متوسط': { ar: 'متوسط', fr: 'Moyenne', en: 'Medium' },
      'منخفض': { ar: 'منخفض', fr: 'Basse', en: 'Low' },
      'عاجل': { ar: 'عاجل', fr: 'Urgent', en: 'Urgent' },
      'مهم': { ar: 'مهم', fr: 'Important', en: 'Important' },
      'عادي': { ar: 'عادي', fr: 'Normal', en: 'Normal' },
    }
    return map[priority]?.[language] || priority
  }

  const translateCategory = (category: string) => {
    const map: Record<string, Record<Language, string>> = {
      'هواتف': { ar: 'هواتف', fr: 'Téléphones', en: 'Phones' },
      'أجهزة': { ar: 'أجهزة', fr: 'Appareils', en: 'Devices' },
      'ملحقات': { ar: 'ملحقات', fr: 'Accessoires', en: 'Accessories' },
      'قطع غيار': { ar: 'قطع غيار', fr: 'Pièces Détachées', en: 'Spare Parts' },
      'بيع الأجهزة': { ar: 'بيع الأجهزة', fr: "Vente d'Appareils", en: 'Device Sales' },
      'التركيبات': { ar: 'التركيبات', fr: 'Installations', en: 'Installations' },
      'الإصلاحات': { ar: 'الإصلاحات', fr: 'Réparations', en: 'Repairs' },
      'الاشتراكات': { ar: 'الاشتراكات', fr: 'Abonnements', en: 'Subscriptions' },
      'الدعم الفني': { ar: 'الدعم الفني', fr: 'Support Technique', en: 'Technical Support' },
    }
    return map[category]?.[language] || category
  }

  const translateServiceType = (serviceType: string) => {
    const map: Record<string, Record<Language, string>> = {
      'بيع': { ar: 'بيع', fr: 'Vente', en: 'Sales' },
      'تركيب': { ar: 'تركيب', fr: 'Installation', en: 'Installation' },
      'إصلاح': { ar: 'إصلاح', fr: 'Réparation', en: 'Repair' },
      'اشتراك': { ar: 'اشتراك', fr: 'Abonnement', en: 'Subscription' },
      'دعم فني': { ar: 'دعم فني', fr: 'Support Technique', en: 'Technical Support' },
    }
    return map[serviceType]?.[language] || serviceType
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

  const formFields: Record<DataType, FormField[]> = {
    revenues: [
      { name: 'month', label: t('dataManagement.month'), type: 'text', placeholder: t('dashboard.monthExample'), required: true },
      { name: 'amount', label: t('dataManagement.amountTND'), type: 'number', placeholder: '0', required: true, min: 0 },
      { name: 'target', label: t('dataManagement.targetTND'), type: 'number', placeholder: '0', required: true, min: 0 },
      { name: 'category', label: t('dataManagement.category'), type: 'select', options: ['بيع الأجهزة', 'التركيبات', 'الإصلاحات', 'الاشتراكات', 'الدعم الفني'], required: true },
    ],
    customers: [
      { name: 'name', label: t('dataManagement.customerName'), type: 'text', required: true },
      { name: 'phone', label: t('dataManagement.phone'), type: 'text', required: true },
      { name: 'email', label: t('dataManagement.email'), type: 'text' },
      { name: 'address', label: t('dataManagement.address'), type: 'text' },
      { name: 'serviceType', label: t('dataManagement.serviceType'), type: 'select', options: ['بيع', 'تركيب', 'إصلاح', 'اشتراك', 'دعم فني'], required: true },
      { name: 'status', label: t('dataManagement.status'), type: 'select', options: ['نشط', 'غير نشط', 'معلق'] },
    ],
    inventory: [
      { name: 'productName', label: t('dataManagement.productName'), type: 'text', required: true },
      { name: 'category', label: t('dataManagement.category'), type: 'select', options: ['هواتف', 'أجهزة', 'ملحقات', 'قطع غيار'], required: true },
      { name: 'quantity', label: t('dataManagement.quantity'), type: 'number', required: true, min: 0 },
      { name: 'minQuantity', label: t('dataManagement.minQuantity'), type: 'number', required: true, min: 0 },
      { name: 'unitPrice', label: t('dataManagement.unitPrice'), type: 'number', required: true, min: 0, step: '0.01' },
      { name: 'supplier', label: t('dataManagement.supplier'), type: 'text' },
    ],
    incidents: [
      { name: 'title', label: t('dataManagement.titleField'), type: 'text', required: true },
      { name: 'area', label: t('dataManagement.area'), type: 'text', required: true },
      { name: 'severity', label: t('dataManagement.severity'), type: 'select', options: ['حرج', 'متوسط', 'خفيف'], required: true },
      { name: 'status', label: t('dataManagement.status'), type: 'select', options: ['مفتوح', 'قيد المعالجة', 'محلول'] },
    ],
    metrics: [
      { name: 'date', label: t('dataManagement.date'), type: 'date', required: true },
      { name: 'uptime', label: t('dataManagement.uptimePct'), type: 'number', required: true, min: 0, step: '0.01' },
      { name: 'latency', label: t('dataManagement.latencyMs'), type: 'number', required: true, min: 0, step: '0.1' },
      { name: 'throughput', label: t('dataManagement.throughputPct'), type: 'number', required: true, min: 0, step: '0.1' },
      { name: 'errors', label: t('dataManagement.errorPct'), type: 'number', required: true, min: 0, step: '0.01' },
    ],
    tickets: [
      { name: 'customerName', label: t('dataManagement.customerName'), type: 'text', required: true },
      { name: 'subject', label: t('dataManagement.subject'), type: 'text', required: true },
      { name: 'description', label: t('dataManagement.description'), type: 'text', required: true },
      { name: 'priority', label: t('dataManagement.priority'), type: 'select', options: ['عالي', 'متوسط', 'منخفض'], required: true },
    ],
    notifications: [
      { name: 'title', label: t('dataManagement.titleField'), type: 'text', required: true },
      { name: 'message', label: t('dataManagement.message'), type: 'text', required: true },
      { name: 'type', label: t('dataManagement.type'), type: 'select', options: ['سعر', 'سوق', 'تنبيه', 'نظام', 'معلومات'], required: true },
      { name: 'priority', label: t('dataManagement.priority'), type: 'select', options: ['عاجل', 'مهم', 'عادي'] },
    ],
  }

  const fetchData = useCallback(async (type: DataType) => {
    try {
      const res = await fetch(apiEndpoints[type])
      if (res.ok) {
        const json = await res.json()
        setData(prev => ({ ...prev, [type]: json }))
      }
    } catch {
      // silently handle
    }
  }, [])

  const fetchAllData = useCallback(async () => {
    setLoading(true)
    await Promise.all(tabs.map(tab => fetchData(tab.key)))
    setLoading(false)
  }, [fetchData, tabs])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  const handleAdd = async (formData: Record<string, string>) => {
    setSubmitting(true)
    try {
      const res = await fetch(apiEndpoints[activeTab], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        toast.success(t('recordAdded'))
        setFormOpen(false)
        fetchData(activeTab)
      } else {
        toast.error(t('recordFailed'))
      }
    } catch {
      toast.error(t('recordFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return
    setDeleting(id)
    try {
      const res = await fetch(`${apiEndpoints[activeTab]}/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(t('recordDeleted'))
        fetchData(activeTab)
      } else {
        toast.error(t('errorDelete'))
      }
    } catch {
      toast.error(t('errorDelete'))
    } finally {
      setDeleting(null)
    }
  }

  const currentData = data[activeTab] || []
  const currentTab = tabs.find(tb => tb.key === activeTab)!

  const renderTable = () => {
    const alignClass = isRTL ? 'text-right' : 'text-left'
    switch (activeTab) {
      case 'revenues':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={alignClass}>{t('dataManagement.month')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.amountTND')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.targetTND')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.category')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.date')}</TableHead>
                <TableHead className={alignClass}>{t('action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(currentData as RevenueRecord[]).map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.month}</TableCell>
                  <TableCell>{row.amount.toLocaleString()}</TableCell>
                  <TableCell>{row.target.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{translateCategory(row.category)}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(row.createdAt).toLocaleDateString('ar-TN')}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDelete(row.id)} disabled={deleting === row.id}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      case 'customers':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={alignClass}>{t('dataManagement.customerName')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.phone')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.email')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.serviceType')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.status')}</TableHead>
                <TableHead className={alignClass}>{t('action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(currentData as CustomerRecord[]).map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell className="text-muted-foreground">{row.email || '-'}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{translateServiceType(row.serviceType)}</Badge></TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${row.status === 'نشط' ? 'bg-emerald-400/10 text-emerald-400' : row.status === 'معلق' ? 'bg-amber-400/10 text-amber-400' : 'bg-red-400/10 text-red-400'}`}>
                      {translateStatus(row.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDelete(row.id)} disabled={deleting === row.id}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      case 'inventory':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={alignClass}>{t('dataManagement.productName')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.category')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.quantity')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.minQuantity')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.price')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.state')}</TableHead>
                <TableHead className={alignClass}>{t('action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(currentData as InventoryRecord[]).map(row => {
                const isLow = row.quantity < row.minQuantity
                return (
                  <TableRow key={row.id} className={isLow ? 'bg-red-400/5' : ''}>
                    <TableCell className="font-medium">{row.productName}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{translateCategory(row.category)}</Badge></TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>{row.minQuantity}</TableCell>
                    <TableCell>{row.unitPrice.toLocaleString()} {t('currency')}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-[10px] ${isLow ? 'bg-red-400/10 text-red-400' : 'bg-emerald-400/10 text-emerald-400'}`}>
                        {isLow ? t('dataManagement.low') : t('dataManagement.good')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDelete(row.id)} disabled={deleting === row.id}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )
      case 'incidents':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={alignClass}>{t('dataManagement.titleField')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.area')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.severity')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.status')}</TableHead>
                <TableHead className={alignClass}>{t('action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(currentData as IncidentRecord[]).map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell>{row.area}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${row.severity === 'حرج' ? 'bg-red-400/10 text-red-400' : row.severity === 'متوسط' ? 'bg-amber-400/10 text-amber-400' : 'bg-blue-400/10 text-blue-400'}`}>
                      {translateSeverity(row.severity)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${row.status === 'محلول' ? 'bg-emerald-400/10 text-emerald-400' : row.status === 'قيد المعالجة' ? 'bg-amber-400/10 text-amber-400' : 'bg-red-400/10 text-red-400'}`}>
                      {translateStatus(row.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDelete(row.id)} disabled={deleting === row.id}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      case 'metrics':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={alignClass}>{t('dataManagement.date')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.uptimePct')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.latencyMs')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.throughputPct')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.errorPct')}</TableHead>
                <TableHead className={alignClass}>{t('action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(currentData as MetricRecord[]).map(row => (
                <TableRow key={row.id}>
                  <TableCell>{new Date(row.date).toLocaleDateString('ar-TN')}</TableCell>
                  <TableCell>{row.uptime}</TableCell>
                  <TableCell>{row.latency}</TableCell>
                  <TableCell>{row.throughput}</TableCell>
                  <TableCell>{row.errors}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDelete(row.id)} disabled={deleting === row.id}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      case 'tickets':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={alignClass}>{t('dataManagement.customerName')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.subject')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.priority')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.status')}</TableHead>
                <TableHead className={alignClass}>{t('action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(currentData as TicketRecord[]).map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.customerName}</TableCell>
                  <TableCell>{row.subject}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${row.priority === 'عالي' ? 'bg-red-400/10 text-red-400' : row.priority === 'متوسط' ? 'bg-amber-400/10 text-amber-400' : 'bg-emerald-400/10 text-emerald-400'}`}>
                      {translatePriority(row.priority)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${row.status === 'محلول' || row.status === 'مغلق' ? 'bg-emerald-400/10 text-emerald-400' : row.status === 'قيد المعالجة' ? 'bg-amber-400/10 text-amber-400' : 'bg-red-400/10 text-red-400'}`}>
                      {translateStatus(row.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDelete(row.id)} disabled={deleting === row.id}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      case 'notifications':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={alignClass}>{t('dataManagement.titleField')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.message')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.type')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.priority')}</TableHead>
                <TableHead className={alignClass}>{t('dataManagement.state')}</TableHead>
                <TableHead className={alignClass}>{t('action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(currentData as NotificationRecord[]).map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-48 truncate">{row.message}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{translateType(row.type)}</Badge></TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${row.priority === 'عاجل' ? 'bg-red-400/10 text-red-400' : row.priority === 'مهم' ? 'bg-amber-400/10 text-amber-400' : 'bg-blue-400/10 text-blue-400'}`}>
                      {translatePriority(row.priority)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${row.isRead ? 'bg-muted text-muted-foreground' : 'bg-teal-400/10 text-teal-400'}`}>
                      {row.isRead ? t('dataManagement.readLabel') : t('dataManagement.newLabel')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDelete(row.id)} disabled={deleting === row.id}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-400/10">
            <Database className="h-6 w-6 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t('dataManagement.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('dataManagement.subtitle')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAllData}
            className="border-border/50 hover:bg-teal-400/10"
          >
            <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('refresh')}
          </Button>
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-teal-400 hover:bg-teal-500 text-white"
            size="sm"
          >
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('dataManagement.addRecord')}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab.key)}
            className={activeTab === tab.key ? 'bg-teal-400 hover:bg-teal-500 text-white' : 'border-border/50 hover:bg-teal-400/10'}
          >
            <tab.icon className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${activeTab !== tab.key ? tab.color : ''}`} />
            {tab.label}
            <Badge variant="secondary" className={`${isRTL ? 'mr-2' : 'ml-2'} text-[10px] h-5 px-1.5 ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
              {(data[tab.key] || []).length}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Data Table */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <currentTab.icon className={`h-5 w-5 ${currentTab.color}`} />
              <CardTitle className="text-lg">{currentTab.label}</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-teal-400/10 text-teal-400">
              {(currentData).length} {t('records')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {currentData.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {renderTable()}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t('dataManagement.noDataYet')}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-border/50 hover:bg-teal-400/10"
                onClick={() => setFormOpen(true)}
              >
                <Plus className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                {t('dataManagement.addFirst')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <DataFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={`${t('dataManagement.addTitle')} ${currentTab.label}`}
        fields={formFields[activeTab]}
        onSubmit={handleAdd}
        isLoading={submitting}
      />
    </motion.div>
  )
}
