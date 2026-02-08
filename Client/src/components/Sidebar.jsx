import { LucideBook, LucideBookOpen, LucideChartNoAxesColumn, LucideLayoutDashboard, LucidePower, LucideSettings, LucideTelescope } from 'lucide-react'
import React from 'react'

const Sidebar = () => {
  return (
        <div className='bg-[#1f2937] w-50 flex flex-col justify-between h-screen text-white py-10'>
            <div className='flex flex-col gap-2 items-start pl-12'>
                <button className='hover:bg-[#9CA3AF] py-2 flex gap-2'><LucideLayoutDashboard/>  Dashboard</button>
                <button className='hover:bg-[#9CA3AF] py-2 flex gap-2'><LucideBookOpen/>Learn</button>
                <button className='hover:bg-[#9CA3AF] py-2 flex gap-2'> <LucideChartNoAxesColumn/>Progress</button>
                <button className='hover:bg-[#9CA3AF] py-2 flex gap-2'><LucideTelescope/>Explore</button>
                <button className='hover:bg-[#9CA3AF] py-2 flex gap-2'><LucideSettings/>Settings</button>
            </div>

            <div className='flex flex-col items-start pl-12'>
                <button className='hover:bg-[#9CA3AF] py-2 flex gap-2'><LucidePower/>Logout</button>
            </div>
        </div>
  )
}

export default Sidebar