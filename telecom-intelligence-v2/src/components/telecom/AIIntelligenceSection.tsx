'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  Bot, Send, Sparkles, Eye, TrendingUp, MessageSquare,
  Zap, Shield, Brain, Cpu, Camera, CheckCircle2, AlertTriangle,
  Lightbulb, Target, BarChart3
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/context'
import type { Language } from '@/lib/i18n/translations'
import EmptyState from './EmptyState'

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  time: string
}

interface DataCounts {
  revenues: number
  customers: number
  inventory: number
  incidents: number
  tickets: number
  notifications: number
}

export default function AIIntelligenceSection() {
  const { t, isRTL, language } = useLanguage()

  const autoReplyLabels = [
    t('ai.autoReply1'),
    t('ai.autoReply2'),
    t('ai.autoReply3'),
    t('ai.autoReply4'),
    t('ai.autoReply5'),
  ]

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      content: t('ai.welcomeMessage'),
      time: '09:00'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(() => {
    if (typeof window === "undefined") return [false, false, false, false, false]
    try { const s = localStorage.getItem("autoReplyEnabled"); return s ? JSON.parse(s) : [false, false, false, false, false] } catch { return [false, false, false, false, false] }
  })
  const [dataCounts, setDataCounts] = useState<DataCounts>({
    revenues: 0, customers: 0, inventory: 0, incidents: 0, tickets: 0, notifications: 0
  })

  const autoReplySettings = autoReplyLabels.map((label, i) => ({
    id: i + 1,
    label,
    enabled: autoReplyEnabled[i],
  }))

  useEffect(() => {
    let cancelled = false
    const fetchDataCounts = async () => {
      try {
        const [revRes, custRes, invRes, incRes, tickRes, notRes] = await Promise.all([
          fetch('/api/revenues'),
          fetch('/api/customers'),
          fetch('/api/inventory'),
          fetch('/api/network-incidents'),
          fetch('/api/support-tickets'),
          fetch('/api/notifications'),
        ])
        if (cancelled) return
        const counts: DataCounts = { revenues: 0, customers: 0, inventory: 0, incidents: 0, tickets: 0, notifications: 0 }
        if (revRes.ok) counts.revenues = (await revRes.json()).length
        if (custRes.ok) counts.customers = (await custRes.json()).length
        if (invRes.ok) counts.inventory = (await invRes.json()).length
        if (incRes.ok) counts.incidents = (await incRes.json()).length
        if (tickRes.ok) counts.tickets = (await tickRes.json()).length
        if (notRes.ok) counts.notifications = (await notRes.json()).length
        if (!cancelled) setDataCounts(counts)
      } catch {
        // silently handle
      }
    }
    fetchDataCounts()
    return () => { cancelled = true }
  }, [])

  const totalRecords = dataCounts.revenues + dataCounts.customers + dataCounts.inventory + dataCounts.incidents + dataCounts.tickets + dataCounts.notifications

  const aiMetrics = [
    { label: t('ai.reduceResponseTime'), value: '5x', sublabel: t('ai.from5to1'), icon: Zap, color: 'text-teal-400' },
    { label: t('ai.analysisAccuracy'), value: totalRecords > 0 ? `${totalRecords}` : '0', sublabel: totalRecords > 0 ? t('ai.realDataRecords') : t('ai.noDataYet'), icon: Brain, color: 'text-emerald-400' },
    { label: t('ai.networkIncidents'), value: dataCounts.incidents > 0 ? `${dataCounts.incidents}` : '0', sublabel: dataCounts.incidents > 0 ? t('ai.registeredIncidents') : t('ai.noRegisteredIncidents'), icon: Camera, color: 'text-amber-400' },
    { label: t('ai.customerRecords'), value: dataCounts.customers > 0 ? `${dataCounts.customers}` : '0', sublabel: dataCounts.customers > 0 ? t('ai.registeredCustomers') : t('ai.noCustomersYet'), icon: TrendingUp, color: 'text-cyan-400' },
  ]

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputValue.trim(),
      time: new Date().toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputValue.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: ChatMessage = {
          id: messages.length + 2,
          role: 'assistant',
          content: data.response,
          time: new Date().toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        const botMessage: ChatMessage = {
          id: messages.length + 2,
          role: 'assistant',
          content: t('ai.errorMessage'),
          time: new Date().toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, botMessage])
      }
    } catch {
      const botMessage: ChatMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: t('ai.fallbackMessage'),
        time: new Date().toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botMessage])
    }

    setIsLoading(false)
  }

  const toggleAutoReply = (id: number) => {
    setAutoReplyEnabled(prev => {
    const next = [...prev]
next[id - 1] = !next[id - 1]
localStorage.setItem("autoReplyEnabled", JSON.stringify(next))
return next
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* AI Metrics - Dynamic from DB */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {aiMetrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-muted/50">
                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.sublabel}</p>
                    <p className="text-xs font-medium mt-0.5">{metric.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chatbot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-teal-400/10">
                    <Bot className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t('ai.smartAssistant')}</CardTitle>
                    <p className="text-xs text-muted-foreground">{t('ai.aiSupport')}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20">
                  <Sparkles className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {t('ai.connected')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4">
              <div className="flex-1 overflow-y-auto max-h-80 space-y-3 mb-4">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-teal-400/10 border border-teal-400/20 rounded-tr-none'
                          : 'bg-muted/50 border border-border/50 rounded-tl-none'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {msg.role === 'assistant' && <Bot className="h-3.5 w-3.5 text-teal-400" />}
                          {msg.role === 'user' && <MessageSquare className="h-3.5 w-3.5 text-amber-400" />}
                          <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <div className="flex justify-end">
                    <div className="bg-muted/50 border border-border/50 rounded-xl rounded-tl-none p-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('ai.typeMessage')}
                  className="bg-muted/30 border-border/50"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-teal-400 hover:bg-teal-500 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Auto-reply Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-400" />
                <CardTitle className="text-lg">{t('ai.autoReplySettings')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {autoReplySettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between gap-3">
                    <span className="text-sm">{setting.label}</span>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={() => toggleAutoReply(setting.id)}
                    />
                  </div>
                ))}
                <div className="pt-3 border-t border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium">{t('ai.improveResponseTime')}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{t('ai.beforeAI')}</span>
                      <span>{t('ai.minutes5')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{t('ai.afterAI')}</span>
                      <span className="text-emerald-400">{t('ai.minute1')}</span>
                    </div>
                    <Progress value={80} className="h-1.5" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Data Overview - Dynamic from DB */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Data Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-400" />
                <CardTitle className="text-lg">{t('ai.dataSummary')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {totalRecords === 0 ? (
                <EmptyState
                  icon={<BarChart3 className="h-8 w-8 text-muted-foreground" />}
                  title={t('ai.noDataYet')}
                  description={t('ai.noDataDesc')}
                />
              ) : (
                <div className="space-y-3">
                  {[
                    { label: t('ai.revenueLabel'), count: dataCounts.revenues, color: 'text-teal-400', bgColor: 'bg-teal-400/10' },
                    { label: t('ai.customerLabel'), count: dataCounts.customers, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10' },
                    { label: t('ai.inventoryLabel'), count: dataCounts.inventory, color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
                    { label: t('ai.incidentsLabel'), count: dataCounts.incidents, color: 'text-red-400', bgColor: 'bg-red-400/10' },
                    { label: t('ai.ticketsLabel'), count: dataCounts.tickets, color: 'text-cyan-400', bgColor: 'bg-cyan-400/10' },
                    { label: t('ai.notificationsLabel'), count: dataCounts.notifications, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.bgColor}`} />
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                      </div>
                      <span className={`text-sm font-bold ${item.color}`}>{item.count}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('ai.totalRecords')}</span>
                      <span className="text-lg font-bold text-teal-400">{totalRecords}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Computer Vision / Quality Control - Dynamic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-cyan-400" />
                <CardTitle className="text-lg">{t('ai.computerVision')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {dataCounts.inventory === 0 ? (
                <EmptyState
                  icon={<Eye className="h-8 w-8 text-muted-foreground" />}
                  title={t('ai.noProductsYet')}
                  description={t('ai.noProductsDesc')}
                />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-3xl font-bold text-teal-400">{dataCounts.inventory}</p>
                      <p className="text-xs text-muted-foreground">{t('ai.registeredProducts')}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-3xl font-bold text-emerald-400">{dataCounts.incidents}</p>
                      <p className="text-xs text-muted-foreground">{t('ai.detectedIncidents')}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-400" /><span className="text-muted-foreground">{t('ai.intactProducts')}</span></div>
                      <span className="font-bold text-emerald-400">{dataCounts.inventory}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400" /><span className="text-muted-foreground">{t('ai.detectedIncidents')}</span></div>
                      <span className="font-bold text-red-400">{dataCounts.incidents}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Performance - Only shows when there's data */}
      {totalRecords > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-teal-400" />
                <CardTitle className="text-lg">{t('ai.aiPerformance')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-teal-400">{totalRecords}</p>
                  <p className="text-xs text-muted-foreground">{t('ai.totalRecords')}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-emerald-400">{dataCounts.customers}</p>
                  <p className="text-xs text-muted-foreground">{t('ai.customers')}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-amber-400">{dataCounts.inventory}</p>
                  <p className="text-xs text-muted-foreground">{t('ai.products')}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-cyan-400">{dataCounts.revenues}</p>
                  <p className="text-xs text-muted-foreground">{t('ai.revenueRecords')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}

