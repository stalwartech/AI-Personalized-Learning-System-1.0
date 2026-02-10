import { LucideBook, LucideBookOpen, LucideChartNoAxesColumn, LucideLayoutDashboard, LucidePower, LucideSettings, LucideTelescope } from 'lucide-react'
import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
        <div className='bg-[#1f2937] w-50 flex flex-col justify-between h-screen text-white py-10'>
        <div className='flex flex-col gap-2 items-start'>
            <NavLink to="/" className={({ isActive }) => `w-full py-2 flex gap-2 items-center pl-10 ${isActive ? "bg-[#9CA3AF]" : "hover:bg-[#9CA3AF]"}`}><LucideLayoutDashboard />Dashboard</NavLink>
            <NavLink to="/learn" className={({ isActive }) => `w-full py-2 flex gap-2 items-center pl-10 ${isActive ? "bg-[#9CA3AF]" : "hover:bg-[#9CA3AF]"}`}><LucideBookOpen />Learn</NavLink>
            <NavLink to="/Progress" className={({ isActive }) => `w-full py-2 flex gap-2 items-center pl-10 ${isActive ? "bg-[#9CA3AF]" : "hover:bg-[#9CA3AF]"}`}><LucideChartNoAxesColumn />Progress</NavLink>
            <NavLink to="/History" className={({ isActive }) => `w-full py-2 flex gap-2 items-center pl-10 ${isActive ? "bg-[#9CA3AF]" : "hover:bg-[#9CA3AF]"}`}><LucideTelescope />History</NavLink>
            <NavLink to="/Settings" className={({ isActive }) => `w-full py-2 flex gap-2 items-center pl-10 ${isActive ? "bg-[#9CA3AF]" : "hover:bg-[#9CA3AF]"}`}><LucideSettings />Settings</NavLink>
        </div>

            <div className='flex flex-col items-start'>
                <button className='hover:bg-[#9CA3AF] py-2 flex gap-2 pl-10 w-full'><LucidePower/>Logout</button>
            </div>
        </div>
  )
}

export default Sidebar