'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Search,
  Bell,
  Clock,
  Plus,
  ChevronDown,
  UserCheck,
  CalendarPlus,
  Briefcase,
  DollarSign,
  Megaphone,
  User,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Building2,
  Globe,
  Sun,
  Moon,
  Flame,
  Check,
  FileText,
  Calculator,
  LogIn,
  LogOut,
  KeyRound,
  Menu,
  ChevronRight,
  Shield,
  CheckCheck,
  BellOff,
  Trash2,
} from 'lucide-react';
import { formatLocalizedText } from '@/lib/translations';

export default function Header() {
  const pathname = usePathname();
  const {
    currentPersona,
    isClockedIn,
    clockInTime,
    toggleClock,
    openModal,
    sidebarCollapsed,
    mobileMenuOpen,
    toggleMobileMenu,
    language,
    setLanguage,
    theme,
    setTheme,
    logout,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotificationItem,
    clearAllNotificationsContext,
    t,
  } = useApp();

  const [personaOpen, setPersonaOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
  const [langOpen, setLangOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const personaRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (personaRef.current && !personaRef.current.contains(event.target as Node)) {
        setPersonaOpen(false);
      }
      if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
        setQuickActionOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setThemeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageInfo = () => {
    switch (pathname) {
      case '/':
        return { category: t('nav_sec_overview'), title: t('nav_dashboard') };
      case '/portal/staff':
        return { category: t('nav_sec_overview'), title: t('nav_staff_portal') };
      case '/portal/manager':
        return { category: t('nav_sec_overview'), title: t('nav_manager_portal') };
      case '/employees':
        return { category: t('nav_sec_workforce'), title: t('nav_employees') };
      case '/departments':
        return { category: t('nav_sec_workforce'), title: t('nav_departments') };
      case '/roster':
        return { category: t('nav_sec_workforce'), title: t('nav_roster') };
      case '/attendance':
        return { category: t('nav_sec_attendance'), title: t('nav_attendance') };
      case '/overtime':
        return { category: t('nav_sec_attendance'), title: t('nav_overtime') };
      case '/leaves':
        return { category: t('nav_sec_attendance'), title: t('nav_leaves') };
      case '/requests':
        return { category: t('nav_sec_attendance'), title: t('nav_requests') };
      case '/salary':
        return { category: t('nav_sec_compensation'), title: t('nav_salary') };
      case '/payroll':
        return { category: t('nav_sec_compensation'), title: t('nav_payroll') };
      case '/recruitment':
        return { category: t('nav_sec_compensation'), title: t('nav_recruitment') };
      case '/performance':
        return { category: t('nav_sec_compensation'), title: t('nav_performance') };
      case '/announcements':
        return { category: t('nav_sec_admin'), title: t('nav_announcements') };
      case '/tools':
        return { category: t('nav_sec_admin'), title: t('nav_tools') };
      case '/reports':
        return { category: t('nav_sec_admin'), title: t('nav_reports') };
      case '/users':
        return { category: t('nav_sec_admin'), title: t('nav_users') };
      case '/settings':
        return { category: t('nav_sec_admin'), title: t('nav_settings') };
      default:
        return { category: 'HESTRA', title: 'HRMS' };
    }
  };

  const pageInfo = getPageInfo();

  function formatTimeAgo(isoString: string, lang: 'en' | 'km'): string {
    if (!isoString) return '';
    try {
      const now = Date.now();
      const date = new Date(isoString).getTime();
      const diffSec = Math.floor((now - date) / 1000);

      if (diffSec < 60) {
        return lang === 'km' ? 'ទើបតែឥឡូវ' : 'Just now';
      }
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) {
        return lang === 'km' ? `${diffMin} នាទីមុន` : `${diffMin}m ago`;
      }
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) {
        return lang === 'km' ? `${diffHour} ម៉ោងមុន` : `${diffHour}h ago`;
      }
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay < 7) {
        return lang === 'km' ? `${diffDay} ថ្ងៃមុន` : `${diffDay}d ago`;
      }
      return new Date(isoString).toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'request':
        return {
          icon: FileText,
          color: 'text-amber-600 bg-amber-50',
        };
      case 'leave':
        return {
          icon: CalendarPlus,
          color: 'text-blue-600 bg-blue-50',
        };
      case 'overtime':
        return {
          icon: Clock,
          color: 'text-sky-600 bg-sky-50',
        };
      case 'recruitment':
        return {
          icon: Briefcase,
          color: 'text-purple-600 bg-purple-50',
        };
      case 'payroll':
        return {
          icon: DollarSign,
          color: 'text-emerald-600 bg-emerald-50',
        };
      case 'announcement':
        return {
          icon: Megaphone,
          color: 'text-pink-600 bg-pink-50',
        };
      case 'system':
      default:
        return {
          icon: Sparkles,
          color: 'text-indigo-600 bg-indigo-50',
        };
    }
  }

  const displayedNotifications =
    notifFilter === 'unread'
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  return (
    <header
      className={`no-print sticky top-0 z-30 h-16 glass-panel border-b border-slate-200/80 transition-all duration-300 flex items-center justify-between px-4 sm:px-6 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      } ml-0`}
    >
      {/* Left: Mobile Menu Button & Breadcrumb Navigation */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
            {pageInfo.category}
          </span>
          <ChevronRight size={13} className="text-slate-300" />
          <span className="font-bold text-slate-800 text-sm truncate">
            {pageInfo.title}
          </span>
        </div>

        {/* Sleek Search Bar */}
        <div className="relative w-44 sm:w-60 md:w-72 ml-1 sm:ml-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={15}
          />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-sans"
          />
          <kbd className="hidden md:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions, Language, Theme, Clock, Notifications & User */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Live Attendance Clock-In / Out Toggle */}
        <button
          onClick={toggleClock}
          title={isClockedIn ? t('clock_out') : t('clock_in')}
          className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-2xs cursor-pointer ${
            isClockedIn
              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {isClockedIn && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isClockedIn ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            ></span>
          </span>
          <Clock size={14} className="shrink-0" />
          <span className="hidden sm:inline">
            {isClockedIn
              ? `${t('clocked_in')} (${clockInTime || '08:30 AM'})`
              : t('clock_in')}
          </span>
        </button>

        {/* Quick Action Button */}
        <div className="relative" ref={actionRef}>
          <button
            onClick={() => setQuickActionOpen(!quickActionOpen)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={15} />
            <span className="hidden md:inline">{t('quick_action')}</span>
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${
                quickActionOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {quickActionOpen && (
            <div className="absolute right-0 mt-2 w-64 glass-dropdown rounded-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('quick_actions_title')}
              </div>

              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  openModal('add-employee');
                }}
                className="w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 hover:bg-slate-100/70 transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <UserCheck size={14} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">{t('action_add_employee')}</div>
                  <div className="text-[10px] text-slate-500">{t('action_add_employee_sub')}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  openModal('request-leave');
                }}
                className="w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 hover:bg-slate-100/70 transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <CalendarPlus size={14} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">{t('action_request_leave')}</div>
                  <div className="text-[10px] text-slate-500">{t('action_request_leave_sub')}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  openModal('run-payroll');
                }}
                className="w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 hover:bg-slate-100/70 transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <DollarSign size={14} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">{t('action_run_payroll')}</div>
                  <div className="text-[10px] text-slate-500">{t('action_run_payroll_sub')}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  openModal('post-announcement');
                }}
                className="w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 hover:bg-slate-100/70 transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-pink-50 text-pink-600">
                  <Megaphone size={14} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">{t('action_announcement')}</div>
                  <div className="text-[10px] text-slate-500">{t('action_announcement_sub')}</div>
                </div>
              </button>

              <div className="my-1 border-t border-slate-100"></div>

              <Link
                href="/tools?tab=letters"
                onClick={() => setQuickActionOpen(false)}
                className="w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 hover:bg-slate-100/70 transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-violet-50 text-violet-600">
                  <FileText size={14} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">{t('action_hr_letter')}</div>
                  <div className="text-[10px] text-slate-500">{t('action_hr_letter_sub')}</div>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Global Website Theme Switcher */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="p-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title={language === 'km' ? 'ប្តូររចនាប័ទ្មផ្ទាំងប្រព័ន្ធ (System Theme)' : 'Switch System Theme'}
          >
            {theme === 'midnight' ? (
              <Moon size={16} className="text-indigo-400" />
            ) : theme === 'indigo' ? (
              <Flame size={16} className="text-cyan-400" />
            ) : (
              <Sun size={16} className="text-amber-500" />
            )}
          </button>

          {themeOpen && (
            <div className="absolute right-0 mt-2 w-52 glass-dropdown rounded-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('theme_label')}
              </div>

              <button
                onClick={() => {
                  setTheme('nordic');
                  setThemeOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer ${
                  theme === 'nordic' ? 'bg-indigo-50 font-bold text-indigo-700' : 'hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun size={15} className="text-amber-500" />
                  <span>{t('theme_light')}</span>
                </div>
                {theme === 'nordic' && <Check size={14} className="text-indigo-600" />}
              </button>

              <button
                onClick={() => {
                  setTheme('midnight');
                  setThemeOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer ${
                  theme === 'midnight' ? 'bg-indigo-50 font-bold text-indigo-700' : 'hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Moon size={15} className="text-indigo-400" />
                  <span>{t('theme_dark')}</span>
                </div>
                {theme === 'midnight' && <Check size={14} className="text-indigo-600" />}
              </button>

              <button
                onClick={() => {
                  setTheme('indigo');
                  setThemeOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer ${
                  theme === 'indigo' ? 'bg-indigo-50 font-bold text-indigo-700' : 'hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Flame size={15} className="text-cyan-400" />
                  <span>{t('theme_indigo')}</span>
                </div>
                {theme === 'indigo' && <Check size={14} className="text-indigo-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 relative transition-colors shadow-2xs cursor-pointer"
            title={language === 'km' ? 'ការជូនដំណឹង' : 'Notifications'}
          >
            <Bell size={16} />
            {unreadNotificationsCount > 0 && (
              <>
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-rose-400 animate-ping opacity-30"></span>
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              </>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 glass-dropdown rounded-2xl shadow-xl border border-slate-200/80 p-0 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">
                    {language === 'km' ? 'ការជូនដំណឹង (Notifications)' : 'Notifications'}
                  </span>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {unreadNotificationsCount} {language === 'km' ? 'ថ្មី' : 'new'}
                    </span>
                  )}
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllNotificationsAsRead();
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    <CheckCheck size={13} />
                    <span>{t('mark_all_read')}</span>
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 px-4 py-1.5 border-b border-slate-100/80 bg-white">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    notifFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {t('all_notifications')} ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('unread')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    notifFilter === 'unread'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {t('unread_notifications')} ({unreadNotificationsCount})
                </button>
              </div>

              {/* List */}
              <div className="divide-y divide-slate-100/80 max-h-80 overflow-y-auto">
                {displayedNotifications.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2">
                      <BellOff size={18} />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">{t('no_notifications')}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t('caught_up_message')}</p>
                  </div>
                ) : (
                  displayedNotifications.map((n) => {
                    const iconConfig = getNotificationIcon(n.type);
                    const Icon = iconConfig.icon;
                    const itemTitle = language === 'km' && n.title_km ? n.title_km : n.title;
                    const itemMessage = language === 'km' && n.message_km ? n.message_km : n.message;
                    const timeAgo = formatTimeAgo(n.created_at, language);

                    return (
                      <div
                        key={n.id}
                        className={`group relative flex items-start gap-3 px-4 py-2.5 transition-colors cursor-pointer ${
                          !n.is_read
                            ? 'bg-indigo-50/20 hover:bg-indigo-50/40'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <Link
                          href={n.link || '/'}
                          onClick={() => {
                            if (!n.is_read) {
                              markNotificationAsRead(n.id, true);
                            }
                            setNotificationsOpen(false);
                          }}
                          className="flex items-start gap-3 flex-1 min-w-0"
                        >
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${iconConfig.color}`}>
                            <Icon size={15} />
                          </div>
                          <div className="flex-1 min-w-0 pr-12">
                            <p className={`text-xs leading-snug truncate ${!n.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                              {itemTitle}
                            </p>
                            {itemMessage && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {itemMessage}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">
                              {timeAgo}
                            </p>
                          </div>
                        </Link>

                        {/* Unread dot & hover action buttons */}
                        <div className="absolute right-3 top-3 flex items-center gap-1">
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 group-hover:hidden shrink-0"></span>
                          )}
                          <div className="hidden group-hover:flex items-center gap-1 bg-white/90 shadow-2xs rounded-lg p-0.5 border border-slate-200/60">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markNotificationAsRead(n.id, !n.is_read);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                              title={n.is_read ? t('mark_as_unread') || 'Mark unread' : t('mark_as_read') || 'Mark read'}
                            >
                              <Check size={12} className={n.is_read ? 'text-slate-300' : 'text-indigo-600'} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationItem(n.id);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title={t('delete_notification') || 'Delete'}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50/70 text-[11px]">
                  <button
                    onClick={() => clearAllNotificationsContext()}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer font-medium"
                  >
                    {t('clear_all_notifications')}
                  </button>
                  <span className="text-slate-400 text-[10px]">
                    HESTRA HRM Notification Center
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Authenticated User Persona Dropdown */}
        <div className="relative" ref={personaRef}>
          <button
            onClick={() => setPersonaOpen(!personaOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <div className="relative">
              <img
                src={currentPersona.avatar}
                alt={currentPersona.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white"></span>
            </div>
            <div className="hidden sm:block text-left text-xs leading-tight pr-1">
              <div className="font-bold text-slate-800">{formatLocalizedText(currentPersona.name, language)}</div>
              <div className="text-[10px] text-slate-400 font-medium">
                {currentPersona.role}
              </div>
            </div>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {personaOpen && (
            <div className="absolute right-0 mt-2 w-72 glass-dropdown rounded-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Authenticated User Card */}
              <div className="flex items-center gap-3 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <img
                  src={currentPersona.avatar}
                  alt={currentPersona.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {formatLocalizedText(currentPersona.name, language)}
                    </p>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        currentPersona.role === 'Admin'
                          ? 'bg-purple-100 text-purple-700'
                          : currentPersona.role === 'Manager'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {currentPersona.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {formatLocalizedText(currentPersona.title || '', language)}
                  </p>
                  {currentPersona.email && (
                    <p className="text-[10px] text-slate-400 truncate">
                      {currentPersona.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="my-2 border-t border-slate-100"></div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setPersonaOpen(false);
                    openModal('change-password');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70 rounded-xl transition-colors cursor-pointer"
                >
                  <KeyRound size={15} className="text-indigo-600" />
                  <span>{language === 'km' ? 'ប្តូរពាក្យសម្ងាត់ (Change Password)' : 'Change Password'}</span>
                </button>

                <Link
                  href="/login"
                  onClick={() => setPersonaOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70 rounded-xl transition-colors"
                >
                  <LogIn size={15} className="text-slate-400" />
                  <span>{language === 'km' ? 'ទំព័រចូលប្រើប្រព័ន្ធ (Login Page)' : 'Go to Login Portal'}</span>
                </Link>

                <button
                  onClick={() => {
                    setPersonaOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>{language === 'km' ? 'ចាកចេញពីប្រព័ន្ធ (Sign Out)' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
