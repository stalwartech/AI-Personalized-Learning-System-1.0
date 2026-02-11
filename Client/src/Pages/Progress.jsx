import { LucideArrowUp } from 'lucide-react'
import React from 'react'

const Progress = () => {
  return (
    <div className='w-full py-10 pr-10'>
      {/* The first section */}
      <h1 className='font-bold text-3xl'>Learning Analytics</h1>
      <p className='text-gray-500'>Track your learning patterns and performance</p>

      {/* Second section */}
      <div className='grid grid-cols-3 gap-4 w-full mt-4'>
        <div className='flex p-4 w-full flex-col bg-gray-100 border border-gray-400 rounded-lg items-center'>
          <p className='font-bold text-4xl'>47.5h</p>
          <p>Total learning Time</p>
          <p className='flex text-green-700'><LucideArrowUp/> 12% vs last month</p>
        </div>
         <div className='flex p-4  flex-col bg-gray-100 border border-gray-400 rounded-lg items-center'>
          <p className='font-bold text-4xl'>82%</p>
          <p>Average Quiz Score</p>
          <p className='flex text-green-700'><LucideArrowUp/> 12% improvement</p>
        </div>
         <div className='flex p-4  flex-col bg-gray-100 border border-gray-400 rounded-lg items-center'>
          <p className='font-bold text-4xl'>3/8</p>
          <p>Completion Rate</p>
          <p className='flex text-green-700'><LucideArrowUp/> 38% of started courses</p>
        </div>
      </div>
    </div>
  )
}

export default Progress