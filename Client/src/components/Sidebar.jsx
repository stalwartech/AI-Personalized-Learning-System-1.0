import {
  BarChart3,
  BookOpen,
  Crown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  HelpCircle,
  Settings,
} from 'lucide-react'
import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const menuItems = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    activePaths: ['/'],
  },
  {
    label: 'Courses',
    path: '/History',
    icon: BookOpen,
    activePaths: ['/History', '/Learn'],
  },
  {
    label: 'Progress',
    path: '/Progress',
    icon: BarChart3,
    activePaths: ['/Progress'],
  },
  {
    label: 'Quiz',
    path: '/Quiz',
    icon: HelpCircle,
    activePaths: ['/Quiz'],
  },
  {
    label: 'Premium',
    path: '/Premium',
    icon: Crown,
    activePaths: ['/Premium'],
  },
  {
    label: 'Settings',
    path: '/Settings',
    icon: Settings,
    activePaths: ['/Settings'],
  },
]

const Sidebar = () => {
  const location = useLocation()

  const logout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const isItemActive = (item) => {
    if (item.path === '/') {
      return location.pathname === '/'
    }

    return item.activePaths.some((path) => location.pathname.startsWith(path))
  }

  return (
    <>
      <aside className='hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-slate-950 px-4 py-5 text-white lg:sticky lg:top-0 lg:flex lg:flex-col'>
        <div className='flex items-center gap-3 px-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-[#4f46e5]'>
            <GraduationCap size={22} />
          </div>
          <div className='min-w-0'>
            <p className='truncate text-sm font-semibold text-slate-300'>AI Learning</p>
            <h1 className='truncate text-lg font-bold'>Study Hub</h1>
          </div>
        </div>

        <nav className='mt-8 flex flex-1 flex-col gap-1'>
          {menuItems.map((item) => (
            <SidebarLink key={item.path} item={item} active={isItemActive(item)} />
          ))}
        </nav>

        <button
          onClick={logout}
          className='mt-6 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white'
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      <header className='sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-[#4f46e5] text-white'>
            <GraduationCap size={20} />
          </div>
          <div>
            <p className='text-xs font-medium text-slate-500'>AI Learning</p>
            <h1 className='text-base font-bold text-slate-950'>Study Hub</h1>
          </div>
        </div>

        <button
          onClick={logout}
          aria-label='Logout'
          className='flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600'
        >
          <LogOut size={19} />
        </button>
      </header>

      <nav className='fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-slate-200 bg-white px-1 py-2 shadow-lg lg:hidden'>
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isItemActive(item)

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold transition ${
                active
                  ? 'bg-indigo-50 text-[#4f46e5]'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={20} />
              <span className='truncate'>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </>
  )
}

const SidebarLink = ({ item, active }) => {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
        active
          ? 'bg-[#4f46e5] text-white shadow-sm'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      {item.label}
    </NavLink>
  )
}

export default Sidebar
