'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  FileBarChart, TrendingUp, Users, Package,
  Wifi, AlertTriangle, DollarSign, RefreshCw, CheckCircle2, Brain
} from 'lucide-react'
import { motion } from 'framer-motion'

interface Stats {
  customers: number
  revenues: { month: string; amount: number; target: number }[]
  inventory: { productName: string; quantity: number; minQuantity: number }[]
  incidents: { severity: string; status: string }[]
  metrics: { date: string; uptime: number; latency: number }[]
  tickets: { priority: string; status: string }[]
}

const COLORS = ['#ef4444', '#f59e0b', '#2dd4bf']

export default function ReportsSection() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<string>('')
  const [analysisLoading, setAnalysisLoading] = useState(false)

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
        customers: custRes.ok ? (await custRes.json()).length : 0,
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
      const avgUptime = stats.metrics.length
        ? (stats.metrics.reduce((s, m) => s + m.uptime, 0) / stats.metrics.length).toFixed(2)
        : 0
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `حلل وضعية WORLD TELECOM بناءً على:
- العملاء: ${stats.customers}
- الإيرادات: ${stats.revenues.length} سجل، إجمالي: ${stats.revenues.reduce((s, r) => s + r.amount, 0)} دت
- المخزون: ${stats.inventory.length} منتج (${stats.inventory.filter(i => i.quantity < i.minQuantity).length} منخفض)
- حوادث الشبكة: ${stats.incidents.length} (${stats.incidents.filter(i => i.status === 'مفتوح').length} مفتوحة)
- وقت التشغيل: ${avgUptime}%
- تذاكر الدعم: ${stats.tickets.length}
أعطني تحليلاً مفصلاً للوضعية والمشاكل والتوصيات للمستقبل.`
        })
      })
      const data = await res.json()
      setAnalysis(data.response || 'عذراً، حدث خطأ.')
    } catch { setAnalysis('عذراً، حدث خطأ.') }
    setAnalysisLoading(false)
  }

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-16 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-64 rounded-lg" />)}
      </div>
    </div>
  )

  const totalRevenue = stats?.revenues.reduce((s, r) => s + r.amount, 0) || 0
  const avgUptime = stats?.metrics.length
    ? (stats.metrics.reduce((s, m) => s + m.uptime, 0) / stats.metrics.length).toFixed(2)
    : 0
  const openIncidents = stats?.incidents.filter(i => i.status === 'مفتوح').length || 0
  const lowStock = stats?.inventory.filter(i => i.quantity < i.minQuantity).length || 0

  const incidentsBySeverity = [
    { name: 'حرج', value: stats?.incidents.filter(i => i.severity === 'حرج').length || 0 },
    { name: 'متوسط', value: stats?.incidents.filter(i => i.severity === 'متوسط').length || 0 },
    { name: 'خفيف', value: stats?.incidents.filter(i => i.severity === 'خفيف').length || 0 },
  ]

  const ticketsByPriority = [
    { name: 'عالي', value: stats?.tickets.filter(t => t.priority === 'عالي').length || 0 },
    { name: 'متوسط', value: stats?.tickets.filter(t => t.priority === 'متوسط').length || 0 },
    { name: 'منخفض', value: stats?.tickets.filter(t => t.priority === 'منخفض').length || 0 },
  ]

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
        <Button variant="outline" size="sm" onClick={fetchAllData} className="border-border/50 hover:bg-teal-400/10">
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-teal-400" />
              <span className="text-xs text-muted-foreground">العملاء</span>
            </div>
            <p className="text-2xl font-bold text-teal-400">{stats?.customers}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground">الإيرادات</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{totalRevenue.toLocaleString()} دت</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-muted-foreground">وقت التشغيل</span>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{avgUptime}%</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-xs text-muted-foreground">حوادث مفتوحة</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{openIncidents}</p>
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

        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              الحوادث حسب الخطورة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incidentsBySeverity.some(i => i.value > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={incidentsBySeverity} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {incidentsBySeverity.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 ml-2" />
                لا توجد حوادث 🎉
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-400" />
              تذاكر الدعم حسب الأولوية
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ticketsByPriority.some(t => t.value > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ticketsByPriority} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                  <Bar dataKey="value" fill="#8b5cf6" name="التذاكر" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">لا توجد تذاكر دعم</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Summary */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">ملخص الوضعية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
              <div className={`w-3 h-3 rounded-full ${openIncidents === 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <div>
                <p className="text-xs text-muted-foreground">الشبكة</p>
                <p className="text-sm font-medium">{openIncidents === 0 ? 'مستقرة ✅' : `${openIncidents} حادثة مفتوحة ⚠️`}</p>
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
              <div className="w-3 h-3 rounded-full bg-teal-400" />
              <div>
                <p className="text-xs text-muted-foreground">العملاء</p>
                <p className="text-sm font-medium">{stats?.customers} عميل مسجل</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-teal-400" />
              التحليل الذكي والتوصيات
            </CardTitle>
            <Button onClick={generateAnalysis} disabled={analysisLoading} size="sm" className="bg-teal-400 hover:bg-teal-500 text-white">
              {analysisLoading ? 'جاري التحليل...' : 'توليد التحليل'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {analysis ? (
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/20 p-4 rounded-lg">
              {analysis}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileBarChart className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">اضغط "توليد التحليل" للحصول على تحليل ذكي شامل</p>
            </div>
          )}
        </CardContent>
      </Card>

    </motion.div>
  )
}