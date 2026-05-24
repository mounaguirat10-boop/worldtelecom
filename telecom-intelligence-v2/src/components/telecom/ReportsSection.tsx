'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  FileBarChart, TrendingUp, Users, Package,
  Wifi, AlertTriangle, DollarSign, RefreshCw,
  CheckCircle2, Brain, Download, FileText
} from 'lucide-react'
import { motion } from 'framer-motion'

interface Stats {
  customers: { name: string; status: string; serviceType: string }[]
  revenues: { month: string; amount: number; target: number; category: string }[]
  inventory: { productName: string; quantity: number; minQuantity: number; unitPrice: number }[]
  incidents: { title: string; severity: string; status: string; area: string }[]
  metrics: { date: string; uptime: number; latency: number }[]
  tickets: { subject: string; priority: string; status: string }[]
}

const COLORS = ['#ef4444', '#f59e0b', '#2dd4bf']

export default function ReportsSection() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<string>('')
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchAllData() }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [custRes, revRes, invRes, incRes, metRes, tickRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/revenues'),
        fetch('/api/inventory'),
        fetch('/api/network-incidents'),
        fetch('/api/network-metrics'),
        fetch('/api/support-tickets'),
      ])
      setStats({
        customers: custRes.ok ? await custRes.json() : [],
        revenues: revRes.ok ? await revRes.json() : [],
        inventory: invRes.ok ? await invRes.json() : [],
        incidents: incRes.ok ? await incRes.json() : [],
        metrics: metRes.ok ? await metRes.json() : [],
        tickets: tickRes.ok ? await tickRes.json() : [],
      })
    } catch { /* ignore */ }
    setLoading(false)
  }

  const generateAnalysis = async () => {
    if (!stats) return
    setAnalysisLoading(true)
    try {
      const totalRevenue = stats.revenues.reduce((s, r) => s + r.amount, 0)
      const avgUptime = stats.metrics.length
        ? (stats.metrics.reduce((s, m) => s + m.uptime, 0) / stats.metrics.length).toFixed(2)
        : 0
      const openIncidents = stats.incidents.filter(i => i.status === 'مفتوح').length
      const lowStock = stats.inventory.filter(i => i.quantity < i.minQuantity).length
      const activeCustomers = stats.customers.filter(c => c.status === 'نشط').length
      const openTickets = stats.tickets.filter(t => t.status === 'مفتوح').length

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `اكتب تقريراً كتابياً احترافياً ومفصلاً عن وضعية شركة WORLD TELECOM بناءً على البيانات التالية:

📊 البيانات:
- إجمالي العملاء: ${stats.customers.length} (نشطون: ${activeCustomers})
- إجمالي الإيرادات: ${totalRevenue.toLocaleString()} دت من ${stats.revenues.length} سجل
- المخزون: ${stats.inventory.length} منتج (${lowStock} منخفض المخزون)
- حوادث الشبكة: ${stats.incidents.length} حادثة (${openIncidents} مفتوحة)
- وقت تشغيل الشبكة: ${avgUptime}%
- تذاكر الدعم: ${stats.tickets.length} (${openTickets} مفتوحة)

اكتب التقرير بالعربية ويشمل:
1. ملخص تنفيذي
2. تحليل الوضعية الحالية
3. نقاط القوة
4. نقاط الضعف والمخاطر
5. توصيات للمستقبل
6. خطة عمل مقترحة

اجعل التقرير احترافياً ومفيداً لمدير الشركة.`
        })
      })
      const data = await res.json()
      setAnalysis(data.response || 'عذراً، حدث خطأ.')
    } catch { setAnalysis('عذراً، حدث خطأ.') }
    setAnalysisLoading(false)
  }

  const downloadPDF = async () => {
    if (!reportRef.current) return
    setPdfLoading(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#0f172a',
        useCORS: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      let heightLeft = pdfHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
      heightLeft -= pdf.internal.pageSize.getHeight()

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
        heightLeft -= pdf.internal.pageSize.getHeight()
      }

      const date = new Date().toLocaleDateString('ar-TN')
      pdf.save(`تقرير-WORLD-TELECOM-${date}.pdf`)
    } catch (e) {
      console.error('PDF error:', e)
    }
    setPdfLoading(false)
  }

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-16 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  )

  const totalRevenue = stats?.revenues.reduce((s, r) => s + r.amount, 0) || 0
  const totalTarget = stats?.revenues.reduce((s, r) => s + r.target, 0) || 0
  const avgUptime = stats?.metrics.length
    ? (stats.metrics.reduce((s, m) => s + m.uptime, 0) / stats.metrics.length).toFixed(2)
    : 0
  const openIncidents = stats?.incidents.filter(i => i.status === 'مفتوح').length || 0
  const lowStock = stats?.inventory.filter(i => i.quantity < i.minQuantity).length || 0
  const activeCustomers = stats?.customers.filter(c => c.status === 'نشط').length || 0
  const openTickets = stats?.tickets.filter(t => t.status === 'مفتوح').length || 0
  const achievementRate = totalTarget > 0 ? ((totalRevenue / totalTarget) * 100).toFixed(1) : 0

  const incidentsBySeverity = [
    { name: 'حرج', value: stats?.incidents.filter(i => i.severity === 'حرج').length || 0 },
    { name: 'متوسط', value: stats?.incidents.filter(i => i.severity === 'متوسط').length || 0 },
    { name: 'خفيف', value: stats?.incidents.filter(i => i.severity === 'خفيف').length || 0 },
  ]

  const today = new Date().toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-400/10">
            <FileBarChart className="h-6 w-6 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">التقارير والتحليلات</h2>
            <p className="text-sm text-muted-foreground">تقرير شامل لوضعية WORLD TELECOM</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAllData} className="border-border/50 hover:bg-teal-400/10">
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
          <Button onClick={downloadPDF} disabled={pdfLoading} size="sm" className="bg-teal-400 hover:bg-teal-500 text-white">
            <Download className="h-4 w-4 ml-2" />
            {pdfLoading ? 'جاري التحميل...' : 'تحميل PDF'}
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="space-y-6">

        {/* Report Header */}
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-teal-400">WORLD TELECOM</h1>
                <p className="text-muted-foreground">TelecomIntelligence — تقرير الأداء</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">تاريخ التقرير</p>
                <p className="font-bold">{today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-teal-400" />
                <span className="text-xs text-muted-foreground">العملاء</span>
              </div>
              <p className="text-2xl font-bold text-teal-400">{stats?.customers.length}</p>
              <p className="text-xs text-muted-foreground mt-1">{activeCustomers} نشط</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-muted-foreground">الإيرادات</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{totalRevenue.toLocaleString()} دت</p>
              <p className="text-xs text-muted-foreground mt-1">نسبة الإنجاز: {achievementRate}%</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="h-4 w-4 text-cyan-400" />
                <span className="text-xs text-muted-foreground">وقت التشغيل</span>
              </div>
              <p className="text-2xl font-bold text-cyan-400">{avgUptime}%</p>
              <p className="text-xs text-muted-foreground mt-1">{openIncidents} حادثة مفتوحة</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-xs text-muted-foreground">الدعم</span>
              </div>
              <p className="text-2xl font-bold text-amber-400">{stats?.tickets.length}</p>
              <p className="text-xs text-muted-foreground mt-1">{openTickets} مفتوح</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                الإيرادات مقارنة بالهدف
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.revenues.length ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.revenues.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                    <Bar dataKey="amount" fill="#2dd4bf" name="الإيرادات" />
                    <Bar dataKey="target" fill="#334155" name="الهدف" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات إيرادات</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wifi className="h-4 w-4 text-cyan-400" />
                أداء الشبكة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.metrics.length ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.metrics.slice(0, 7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" tickFormatter={d => new Date(d).toLocaleDateString('ar-TN', { day: '2-digit', month: '2-digit' })} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                    <Line type="monotone" dataKey="uptime" stroke="#2dd4bf" name="وقت التشغيل %" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات شبكة</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Summary */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-400" />
              ملخص الوضعية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <div className={`w-3 h-3 rounded-full ${openIncidents === 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <div>
                  <p className="text-xs text-muted-foreground">الشبكة</p>
                  <p className="text-sm font-medium">{openIncidents === 0 ? 'مستقرة ✅' : `${openIncidents} حادثة ⚠️`}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <div className={`w-3 h-3 rounded-full ${lowStock === 0 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <div>
                  <p className="text-xs text-muted-foreground">المخزون</p>
                  <p className="text-sm font-medium">{lowStock === 0 ? 'جيد ✅' : `${lowStock} منتج منخفض ⚠️`}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <div className={`w-3 h-3 rounded-full ${Number(achievementRate) >= 80 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <div>
                  <p className="text-xs text-muted-foreground">الإيرادات</p>
                  <p className="text-sm font-medium">{achievementRate}% من الهدف</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <div className="w-3 h-3 rounded-full bg-teal-400" />
                <div>
                  <p className="text-xs text-muted-foreground">العملاء</p>
                  <p className="text-sm font-medium">{activeCustomers} عميل نشط</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Written Report */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-teal-400" />
                التقرير الكتابي التحليلي
              </CardTitle>
              <Button onClick={generateAnalysis} disabled={analysisLoading} size="sm" className="bg-teal-400 hover:bg-teal-500 text-white">
                {analysisLoading ? 'جاري الكتابة...' : '✍️ توليد التقرير'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <div className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/20 p-6 rounded-lg border border-border/30 text-foreground">
                {analysis}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-sm font-medium">اضغط "توليد التقرير" للحصول على تقرير كتابي احترافي</p>
                <p className="text-xs mt-2 opacity-70">يشمل: ملخص تنفيذي، تحليل الوضعية، توصيات، وخطة عمل</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </motion.div>
  )
}