'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard, BarChart3, Brain, Package, Wifi,
  Heart, Bell, Search, Menu, X, ChevronLeft,
  Settings, LogOut, User, Database, ScanBarcode, Globe, Mail, FileBarChart
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
import ReportsSection from '@/components/telecom/ReportsSection'
import { signOut } from 'next-auth/react'

import { LanguageProvider, useLanguage } from '@/lib/i18n/context'
import { languageNames, Language } from '@/lib/i18n/translations'

type SectionKey = 'dashboard' | 'bi' | 'reports' | 'ai' | 'inventory' | 'scanner' | 'network' | 'customer' | 'notifications' | 'email' | 'data'

function AppContent() {
  const { language, setLanguage, dir, t, isRTL } = useLanguage()
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customerCount, setCustomerCount] = useState(0)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [networkUptime, setNetworkUptime] = useState(0)

  const navItems: { key: SectionKey; label: string; icon: React.ElementType; badge?: string }[] = [
    { key: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { key: 'bi', label: t('nav.bi'), icon: BarChart3 },
    { key: 'reports', label: 'التقارير', icon: FileBarChart },
    { key: 'ai', label: t('nav.ai'), icon: Brain, badge: 'AI' },
    { key: 'inventory', label: t('nav.inventory'), icon: Package },
    { key: 'scanner', label: t('nav.scanner'), icon: ScanBarcode },
    { key: 'network', label: t('nav.network'), icon: Wifi },
    { key: 'customer', label: t('nav.customer'), icon: Heart },
    { key: 'notifications', label: t('nav.notifications'), icon: Bell },
    { key: 'email', label: t('nav.email'), icon: Mail },
    { key: 'data', label: t('nav.data'), icon: Database },
  ]

  // Fetch real stats from database
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
      case 'reports': return <ReportsSection />
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

  const getSectionTitle = () => {
    return navItems.find(item => item.key === activeSection)?.label || ''
  }

  const notificationBadge = unreadNotifications > 0 ? unreadNotifications.toString() : undefined

  return (
    <div className="min-h-screen bg-background flex" dir={dir}>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:sticky top-0 z-50 lg:z-auto
        h-screen w-64 bg-[#0F172A] ${isRTL ? 'border-l border-border/50' : 'border-r border-border/50'}
        flex flex-col transition-transform duration-300
        ${isRTL ? 'right-0' : 'left-0'}
        ${sidebarOpen ? 'translate-x-0' : `${isRTL ? 'translate-x-full' : '-translate-x-full'} lg:translate-x-0`}
      `}>
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-400/10 flex items-center justify-center overflow-hidden">
              <img
                src="/wt-logo.png"
                alt="WORLD TELECOM"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement!.innerHTML = '<span class="text-teal-400 font-bold text-sm">WT</span>'
                }}
              />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">{t('sidebar.companyName')}</h1>
              <p className="text-[10px] text-teal-400">{t('sidebar.companySub')}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={`${isRTL ? 'mr-auto' : 'ml-auto'} lg:hidden p-1 h-auto`}
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 py-3">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const badge = item.key === 'notifications' ? notificationBadge : item.badge
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveSection(item.key)
                    setSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    transition-all duration-200 group
                    ${activeSection === item.key
                      ? 'bg-teal-400/10 text-teal-400 border border-teal-400/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                    }
                    ${item.key === 'scanner' ? 'border-amber-400/20 bg-amber-400/5' : ''}
                    ${activeSection === 'scanner' && item.key === 'scanner' ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' : ''}
                  `}
                >
                  <item.icon className={`h-4.5 w-4.5 shrink-0 ${
                    activeSection === item.key ? (item.key === 'scanner' ? 'text-amber-400' : 'text-teal-400') : (item.key === 'scanner' ? 'text-amber-400 group-hover:text-amber-300' : 'text-muted-foreground group-hover:text-foreground')
                  }`} />
                  <span className={`flex-1 ${isRTL ? 'text-right' : 'text-left'} ${item.key === 'scanner' ? 'font-medium' : ''}`}>{item.label}</span>
                  {badge && (
                    <Badge variant="secondary" className={`text-[10px] h-5 px-1.5 ${
                      badge === 'AI' ? 'bg-teal-400/10 text-teal-400' :
                      item.key === 'scanner' ? 'bg-amber-400/10 text-amber-400' :
                      parseInt(badge) > 0 ? 'bg-red-400/10 text-red-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {badge}
                    </Badge>
                  )}
                </button>
              )
            })}
          </nav>
        </ScrollArea>

        <div className="p-3 border-t border-border/30">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-teal-400/10 text-teal-400 text-xs">MA</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{t('sidebar.user1Name')}</p>
              <p className="text-[10px] text-muted-foreground">{t('sidebar.user1Role')}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Settings className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300" onClick={() => signOut({ callbackUrl: '/login' })}>
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 bg-[#0F172A]/95 backdrop-blur-sm border-b border-border/30">
          <div className={`flex items-center gap-3 px-4 py-3 ${isRTL ? 'flex-row' : 'flex-row'}`}>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-1 h-auto"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold hidden sm:block">{getSectionTitle()}</h2>
              <Badge variant="secondary" className="bg-teal-400/10 text-teal-400 text-[10px] hidden sm:inline-flex">
                2026
              </Badge>
            </div>

            <div className={`flex-1 max-w-md ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search')}
                  className={`bg-muted/30 border-border/50 h-9 text-sm ${isRTL ? 'pr-9' : 'pl-9'}`}
                />
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 h-9 px-2">
                  <Globe className="h-4 w-4 text-teal-400" />
                  <span className="text-xs font-medium hidden sm:inline">{languageNames[language]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                {(['ar', 'fr', 'en'] as Language[]).map((lang) => (
                  <DropdownMenuItem
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`cursor-pointer ${language === lang ? 'bg-teal-400/10 text-teal-400' : ''}`}
                  >
                    <span className="font-medium">{languageNames[lang]}</span>
                    {language === lang && <Badge className="ml-2 bg-teal-400/20 text-teal-400 text-[9px]">&#10003;</Badge>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden md:flex items-center gap-3">
              {networkUptime > 0 && (
                <>
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-muted-foreground">{t('topbar.network')}: {networkUptime}%</span>
                  </div>
                  <div className="h-4 w-px bg-border/50" />
                </>
              )}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">{t('topbar.customers')}:</span>
                <span className="font-bold text-teal-400">{customerCount.toLocaleString()}</span>
              </div>
            </div>

            <Button variant="ghost" size="sm" className="relative p-2 h-auto" onClick={() => setActiveSection('notifications')}>
              <Bell className="h-4.5 w-4.5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                  {unreadNotifications}
                </span>
              )}
            </Button>

            <div className="hidden sm:flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-teal-400/10 text-teal-400 text-xs">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                <p className="text-xs font-medium">{t('sidebar.user2Name')}</p>
                <p className="text-[10px] text-muted-foreground">{t('sidebar.user2Role')}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t border-border/30 px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium text-teal-400">WORLD TELECOM</span>
              <span>&copy; 2026 - TelecomIntelligence</span>
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
} 
 