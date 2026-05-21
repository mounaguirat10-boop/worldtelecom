'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BarChart3, Brain, Package, Wifi,
  Heart, Bell, Search, Menu, X, Settings, LogOut, 
  User, Database, ScanBarcode, Globe, Mail, ChevronRight,
  Plus, Trash2, Send, Phone, MapPin, CheckCircle, AlertCircle
} from 'lucide-react'

// ========== بيانات وهمية ==========
const DEMO_CUSTOMERS = [
  { id: 1, name: 'أحمد المنصوري', phone: '+216 55 123 456', email: 'ahmed@example.com', status: 'active' },
  { id: 2, name: 'سارة بن سالم', phone: '+216 98 765 432', email: 'sara@example.com', status: 'inactive' },
  { id: 3, name: 'محمد الطرابلسي', phone: '+216 22 334 455', email: 'mohamed@example.com', status: 'active' },
]

// ========== مكون إضافة عميل ==========
function CustomerManager() {
  const [customers, setCustomers] = useState(DEMO_CUSTOMERS)
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      setMessage({ type: 'error', text: 'الاسم والهاتف مطلوبين!' })
      setTimeout(() => setMessage(null), 3000)
      return
    }
    const newId = Math.max(...customers.map(c => c.id), 0) + 1
    setCustomers([...customers, { ...newCustomer, id: newId, status: 'active' }])
    setNewCustomer({ name: '', phone: '', email: '' })
    setMessage({ type: 'success', text: '✅ تم إضافة العميل بنجاح!' })
    setTimeout(() => setMessage(null), 3000)
  }

  const deleteCustomer = (id: number) => {
    setCustomers(customers.filter(c => c.id !== id))
    setMessage({ type: 'success', text: '🗑️ تم حذف العميل!' })
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="space-y-6">
      {/* رسائل التأكيد */}
      {message && (
        <div className={`p-3 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* نموذج إضافة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-5 rounded-2xl border" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
        <input
          type="text"
          placeholder="الاسم الكامل *"
          value={newCustomer.name}
          onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
          className="px-4 py-2.5 rounded-xl border outline-none transition-all text-sm"
          style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}
        />
        <input
          type="tel"
          placeholder="رقم الهاتف *"
          value={newCustomer.phone}
          onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
          className="px-4 py-2.5 rounded-xl border outline-none transition-all text-sm"
          style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}
        />
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={newCustomer.email}
          onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
          className="px-4 py-2.5 rounded-xl border outline-none transition-all text-sm"
          style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}
        />
        <button
          onClick={addCustomer}
          className="md:col-span-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90"
          style={{ background: '#059669' }}
        >
          <Plus className="h-4 w-4" /> إضافة عميل جديد
        </button>
      </div>

      {/* قائمة العملاء */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0', background: '#FFFFFF' }}>
        <div className="p-4 border-b font-semibold text-sm" style={{ borderColor: '#E2E8F0', color: '#0F172A' }}>
          📋 قائمة العملاء ({customers.length})
        </div>
        <div className="divide-y" style={{ borderColor: '#E2E8F0' }}>
          {customers.map(customer => (
            <div key={customer.id} className="p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                  {customer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: '#0F172A' }}>{customer.name}</p>
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#64748B' }}>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone}</span>
                    {customer.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {customer.email}</span>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteCustomer(customer.id)}
                className="p-2 rounded-lg transition-colors hover:bg-red-50"
                style={{ color: '#DC2626' }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ========== مكون إرسال الإيميل ==========
function EmailSender() {
  const [form, setForm] = useState({ to: '', subject: '', message: '' })
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const sendEmail = () => {
    if (!form.to || !form.subject || !form.message) {
      setStatus({ type: 'error', text: 'جميع الحقول مطلوبة!' })
      setTimeout(() => setStatus(null), 3000)
      return
    }
    // محاكاة إرسال الإيميل
    console.log('📧 إرسال إيميل:', form)
    setStatus({ type: 'success', text: `✅ تم إرسال الإيميل إلى ${form.to} بنجاح!` })
    setForm({ to: '', subject: '', message: '' })
    setTimeout(() => setStatus(null), 3000)
  }

  return (
    <div className="space-y-5">
      {status && (
        <div className={`p-3 rounded-xl flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {status.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span className="text-sm">{status.text}</span>
        </div>
      )}

      <div className="space-y-3 p-5 rounded-2xl border" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
        <input
          type="email"
          placeholder="إلى: البريد الإلكتروني *"
          value={form.to}
          onChange={(e) => setForm({ ...form, to: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-sm"
          style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}
        />
        <input
          type="text"
          placeholder="الموضوع *"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-sm"
          style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}
        />
        <textarea
          placeholder="الرسالة *"
          rows={6}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-sm resize-none"
          style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}
        />
        <button
          onClick={sendEmail}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90"
          style={{ background: '#2563EB' }}
        >
          <Send className="h-4 w-4" /> إرسال الإيميل
        </button>
      </div>
    </div>
  )
}

// ========== مكون Dashboard مبسط ==========
function Dashboard() {
  const stats = [
    { label: 'العملاء النشطاء', value: '1,284', change: '+12%', color: '#2563EB', icon: User },
    { label: 'معدل الجودة', value: '99.97%', change: '+0.5%', color: '#059669', icon: Wifi },
    { label: 'الإشعارات', value: '24', change: '+3', color: '#EA580C', icon: Bell },
    { label: 'الخدمات', value: '8', change: '+2', color: '#7C3AED', icon: Package },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl border" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#059669' }}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold mt-3" style={{ color: '#0F172A' }}>{stat.value}</p>
            <p className="text-xs" style={{ color: '#64748B' }}>{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="p-8 rounded-2xl border flex items-center justify-center" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
        <p className="text-center" style={{ color: '#94A3B8' }}>📊 الرسم البياني هنا</p>
      </div>
    </div>
  )
}

// ========== مكونات وهمية للأقسام الأخرى ==========
const PlaceholderSection = ({ title, icon: Icon, color }: { title: string; icon: React.ElementType; color: string }) => (
  <div className="p-8 rounded-2xl border text-center" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${color}15` }}>
      <Icon className="h-8 w-8" style={{ color }} />
    </div>
    <h3 className="text-lg font-semibold mb-2" style={{ color: '#0F172A' }}>{title}</h3>
    <p className="text-sm" style={{ color: '#64748B' }}>هذا القسم قيد التطوير 🚀</p>
  </div>
)

// ========== الصفحة الرئيسية ==========
type SectionKey = 'dashboard' | 'bi' | 'ai' | 'inventory' | 'scanner' | 'network' | 'customer' | 'notifications' | 'email' | 'data'

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [language, setLanguage] = useState<'ar' | 'fr' | 'en'>('ar')
  const isRTL = language === 'ar'

  const navItems: { key: SectionKey; label: string; icon: React.ElementType; badge?: string; color: string }[] = [
    { key: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard, color: '#2563EB' },
    { key: 'bi', label: 'التحليلات', icon: BarChart3, color: '#7C3AED' },
    { key: 'ai', label: 'الذكاء الاصطناعي', icon: Brain, badge: 'AI', color: '#0891B2' },
    { key: 'inventory', label: 'المخزون', icon: Package, color: '#059669' },
    { key: 'scanner', label: 'الماسح', icon: ScanBarcode, color: '#D97706' },
    { key: 'network', label: 'الشبكة', icon: Wifi, color: '#DC2626' },
    { key: 'customer', label: 'العملاء', icon: Heart, color: '#DB2777' },
    { key: 'notifications', label: 'الإشعارات', icon: Bell, color: '#EA580C' },
    { key: 'email', label: 'الإيميل', icon: Mail, color: '#2563EB' },
    { key: 'data', label: 'البيانات', icon: Database, color: '#64748B' },
  ]

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />
      case 'customer': return <CustomerManager />
      case 'email': return <EmailSender />
      default:
        const item = navItems.find(i => i.key === activeSection)!
        return <PlaceholderSection title={item.label} icon={item.icon} color={item.color} />
    }
  }

  const activeItem = navItems.find(i => i.key === activeSection)

  return (
    <div className="min-h-screen flex" style={{ background: '#F1F5F9' }} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 z-50 h-screen w-64 flex flex-col transition-transform duration-300
        ${isRTL ? 'right-0 border-l' : 'left-0 border-r'}
        ${sidebarOpen ? 'translate-x-0' : `${isRTL ? 'translate-x-full' : '-translate-x-full'} lg:translate-x-0`}
      `} style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>

        <div className="p-5 border-b" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EFF6FF' }}>
              <span style={{ color: '#2563EB', fontWeight: 'bold' }}>WT</span>
            </div>
            <div>
              <h1 className="text-sm font-bold" style={{ color: '#0F172A' }}>WORLD TELECOM</h1>
              <p className="text-[10px]" style={{ color: '#2563EB' }}>Telecom Intelligence</p>
            </div>
            <button className="lg:hidden p-1 rounded ml-auto" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" style={{ color: '#64748B' }} />
            </button>
          </div>
        </div>

        <div className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
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
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: isActive ? `${item.color}20` : '#F1F5F9' }}>
                  <item.icon className="h-4 w-4" style={{ color: isActive ? item.color : '#94A3B8' }} />
                </div>
                <span className="flex-1 text-right">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: '#0891B215', color: '#0891B2' }}>{item.badge}</span>
                )}
                {isActive && <ChevronRight className="h-3 w-3 shrink-0" style={{ color: item.color }} />}
              </button>
            )
          })}
        </div>

        <div className="p-3 border-t" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-3 p-2 rounded-xl" style={{ background: '#F8FAFC' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: '#2563EB', color: '#FFF' }}>AD</div>
            <div className="flex-1">
              <p className="text-xs font-semibold" style={{ color: '#0F172A' }}>أحمد الدوسري</p>
              <p className="text-[10px]" style={{ color: '#94A3B8' }}>مدير النظام</p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-slate-200"><Settings className="h-3.5 w-3.5" style={{ color: '#94A3B8' }} /></button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 border-b" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-3 px-5 py-3">
            <button className="lg:hidden p-1.5 rounded-lg" style={{ background: '#F1F5F9' }}
              onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" style={{ color: '#64748B' }} /></button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${activeItem?.color}15` }}>
                {activeItem && <activeItem.icon className="h-4 w-4" style={{ color: activeItem.color }} />}
              </div>
              <h2 className="text-base font-semibold hidden sm:block" style={{ color: '#0F172A' }}>{activeItem?.label}</h2>
            </div>

            <div className="flex-1 max-w-sm mr-auto">
              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} h-4 w-4`} style={{ color: '#94A3B8' }} />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث..." className={`w-full h-9 text-sm rounded-xl border outline-none ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
                  style={{ background: '#F8FAFC', borderColor: '#E2E8F0', color: '#0F172A' }} />
              </div>
            </div>

            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border"
              style={{ borderColor: '#E2E8F0', background: '#F8FAFC', color: '#64748B' }}
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}>
              <Globe className="h-3.5 w-3.5" /> {language === 'ar' ? 'EN' : 'AR'}
            </button>

            <button className="relative p-2 rounded-xl border" style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}>
              <Bell className="h-4 w-4" style={{ color: '#64748B' }} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t px-5 py-3" style={{ borderColor: '#E2E8F0', background: '#FFFFFF' }}>
          <div className="text-center text-xs" style={{ color: '#94A3B8' }}>
            WORLD TELECOM © 2026 - نظام إدارة العملاء
          </div>
        </footer>
      </div>
    </div>
  )
}
