'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard, BarChart3, Brain, Package, Wifi,
  Heart, Bell, Search, Menu, X,
  Settings, LogOut, User, Database, ScanBarcode, Globe, Mail, ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import DashboardSection from '@/components/telecom/DashboardSection'
import BIAnalyticsSection from '@/components/telecom/BIAnalyticsSection'
import AIIntelligenceSection from '@/components/telecom/AIIntelligenceSection'
import InventorySection from '@/components/telecom/InventorySection'
import NetworkOpsSection from '@/components/telecom/NetworkOpsSection'
import CustomerExperienceSection from '@/components/telecom/CustomerExperienceSection'
import NotificationsSection from '@/components/telecom/NotificationsSection'
import DataManagementSection from '@/components/telecom/DataManagementSection'
import ScannerProduitSection from '@/components/telecom/ScannerProduitSection'
import EmailSection from '@/components/telecom/EmailSection'

import { LanguageProvider, useLanguage } from '@/lib/i18n/context'
import { languageNames, Language } from '@/lib/i18n/translations'

type SectionKey = 'dashboard' | 'bi' | 'ai' | 'inventory' | 'scanner' | 'network' | 'customer' | 'notifications' | 'email' | 'data'

function AppContent() {
  const { language, setLanguage, dir, t, isRTL } = useLanguage()
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customerCount, setCustomerCount] = useState(0)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [networkUptime, setNetworkUptime] = useState(0)

  const navItems: { key: SectionKey; label: string; icon: React.ElementType; badge?: string; color?: string }[] = [
    { key: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, color: '#2563EB' },
    { key: 'bi', label: t('nav.bi'), icon: BarChart3, color: '#7C3AED' },
    { key: 'ai', label: t('nav.ai'), icon: Brain, badge: 'AI', color: '#0891B2' },
    { key: 'inventory', label: t('nav.inventory'), icon: Package, color: '#059669' },
    { key: 'scanner', label: t('nav.scanner'), icon: ScanBarcode, color: '#D97706' },
    { key: 'network', label: t('nav.network'), icon: Wifi, color: '#DC2626' },
    { key: 'customer', label: t('nav.customer'), icon: Heart, color: '#DB2777' },
    { key: 'notifications', label: t('nav.notifications'), icon: Bell, color: '#EA580C' },
    { key: 'email', label: t('nav.email'), icon: Mail, color: '#2563EB' },
    { key: 'data', label: t('nav.data'), icon: Database, color: '#64748B' },
  ]

  const fetchStats = useCallback(async () => {
    try {
      const [custRes, notRes, metRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/notifications'),
        fetch('/api/network-metrics'),
      ])
      if (custRes.ok) {
        const customers = await custRes.json()
        setCustomerCount(customers.length)
      }
      if (notRes.ok) {
        const notifications = await notRes.json()
        setUnreadNotifications(notifications.filter((n: { isRead: boolean }) => !n.isRead).length)
      }
      if (metRes.ok) {
        const metrics = await metRes.json()
        if (metrics.length > 0) {
          const avg = metrics.reduce((s: number, m: { uptime: number }) => s + m.uptime, 0) / metrics.length
          setNetworkUptime(parseFloat(avg.toFixed(2)))
        }
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { void fetchStats() }, [fetchStats])

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardSection />
      case 'bi': return <BIAnalyticsSection />
      case 'ai': return <AIIntelligenceSection />
      case 'inventory': return <InventorySection />
      case 'scanner': return <ScannerProduitSection />
      case 'network': return <NetworkOpsSection />
      case 'customer': return <CustomerExperienceSection />
      case 'notifications': return <NotificationsSection />
      case 'email': return <EmailSection />
      case 'data': return <DataManagementSection />
    }
  }

  const activeItem = navItems.find(i => i.key === activeSection)
  const notificationBadge = unreadNotifications > 0 ? unreadNotifications.toString() : undefined

  return (
    <div className="min-h-screen flex" style={{ background: '#F1F5F9' }} dir={dir}>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 z-50 lg:z-auto h-screen w-64
        flex flex-col transition-transform duration-300
        ${isRTL ? 'right-0 border-l' : 'left-0 border-r'}
        ${sidebarOpen ? 'translate-x-0' : `${isRTL ? 'translate-x-full' : '-translate-x-full'} lg:translate-x-0`}
      `} style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>

        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: '#EFF6FF' }}>
              <img
                src="/wt-logo.png" alt="WT"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const t = e.target as HTMLImageElement
                  t.style.display = 'none'
                  t.parentElement!.innerHTML = '<span style="color:#2563EB;font-weight:700;font-size:14px">WT</span>'
                }}
              />
            </div>
            <div>
              <h1 className="text-sm font-bold" style={{ color: '#0F172A' }}>{t('sidebar.companyName')}</h1>
              <p className="text-[10px]" style={{ color: '#2563EB' }}>{t('sidebar.companySub')}</p>
            </div>
            <button className="lg:hidden p-1 rounded ml-auto" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" style={{ color: '#64748B' }} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-4">
          <div className="px-3 space-y-1">
            {navItems.map((item) => {
              const badge = item.key === 'notifications' ? notificationBadge : item.badge
              const isActive = activeSection === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => { setActiveSection(item.key); setSidebarOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
                  style={{
                    background: isActive ? `${item.color}15` : 'transparent',
                    color: isActive ? item.color : '#64748B',
                    fontWeight: isActive ? 600 : 400,
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC' }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: isActive ? `${item.color}20` : '#F1F5F9' }}>
                    <item.icon className="h-4 w-4" style={{ color: isActive ? item.color : '#94A3B8' }} />
                  </div>
                  <span className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>{item.label}</span>
                  {badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: badge === 'AI' ? '#0891B215' : parseInt(badge) > 0 ? '#FEE2E2' : '#F1F5F9',
                        color: badge === 'AI' ? '#0891B2' : parseInt(badge) > 0 ? '#DC2626' : '#64748B',
                      }}>
                      {badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-3 w-3 shrink-0" style={{ color: item.color }} />}
                </button>
              )
            })}
          </div>
        </ScrollArea>

        {/* User */}
        <div className="p-3 border-t" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-3 p-2 rounded-xl" style={{ background: '#F8FAFC' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: '#2563EB', color: '#FFFFFF' }}>MA</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#0F172A' }}>{t('sidebar.user1Name')}</p>
              <p className="text-[10px]" style={{ color: '#94A3B8' }}>{t('sidebar.user1Role')}</p>
            </div>
            <button className="p-1.5 rounded-lg transition-colors hover:bg-slate-200">
              <Settings className="h-3.5 w-3.5" style={{ color: '#94A3B8' }} />
            </button>
            <button className="p-1.5 rounded-lg transition-colors hover:bg-slate-200">
              <LogOut className="h-3.5 w-3.5" style={{ color: '#94A3B8' }} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
          <div className={`flex items-center gap-3 px-5 py-3`}>
            <button className="lg:hidden p-1.5 rounded-lg" style={{ background: '#F1F5F9' }}
              onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" style={{ color: '#64748B' }} />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${activeItem?.color}15` }}>
                {activeItem && <activeItem.icon className="h-4 w-4" style={{ color: activeItem.color }} />}
              </div>
              <h2 className="text-base font-semibold hidden sm:block" style={{ color: '#0F172A' }}>
                {activeItem?.label}
              </h2>
            </div>

            {/* Search */}
            <div className={`flex-1 max-w-sm ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 ${isRTL ? 'right-3' : 'left-3'}`}
                  style={{ color: '#94A3B8' }} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search')}
                  className={`w-full h-9 text-sm rounded-xl border outline-none transition-all ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
                  style={{ background: '#F8FAFC', borderColor: '#E2E8F0', color: '#0F172A' }}
                  onFocus={e => (e.target.style.borderColor = '#2563EB')}
                  onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-3">
              {networkUptime > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                  style={{ background: '#F0FDF4', color: '#059669' }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#059669' }} />
                  {networkUptime}%
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <User className="h-3.5 w-3.5" />
                {customerCount.toLocaleString()}
              </div>
            </div>

            {/* Language */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors"
                  style={{ borderColor: '#E2E8F0', color: '#64748B', background: '#F8FAFC' }}>
                  <Globe className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{languageNames[language]}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                {(['ar', 'fr', 'en'] as Language[]).map((lang) => (
                  <DropdownMenuItem key={lang} onClick={() => setLanguage(lang)}
                    className={`cursor-pointer ${language === lang ? 'font-semibold' : ''}`}>
                    {languageNames[lang]}
                    {language === lang && <span className="ml-auto text-blue-600">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl border transition-colors"
              style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}
              onClick={() => setActiveSection('notifications')}>
              <Bell className="h-4 w-4" style={{ color: '#64748B' }} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold"
                  style={{ background: '#DC2626', color: '#FFFFFF' }}>
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* User Avatar */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: '#2563EB', color: '#FFFFFF' }}>
                <User className="h-4 w-4" />
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-semibold" style={{ color: '#0F172A' }}>{t('sidebar.user2Name')}</p>
                <p className="text-[10px]" style={{ color: '#94A3B8' }}>{t('sidebar.user2Role')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t px-5 py-3" style={{ borderColor: '#E2E8F0', background: '#FFFFFF' }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs" style={{ color: '#94A3B8' }}>
            <div className="flex items-center gap-2">
              <span className="font-bold" style={{ color: '#2563EB' }}>WORLD TELECOM</span>
              <span>© 2026 - TelecomIntelligence</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{t('footer.location')}</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">{t('footer.vision')}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}
