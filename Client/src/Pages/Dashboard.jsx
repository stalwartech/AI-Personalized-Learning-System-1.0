import { LucideArrowRight, LucideChevronRight } from 'lucide-react'
import React from 'react'

const Dashboard = () => {
  return (
    <div>
      {/* First section */}
      <h1 className='text-3xl text'>Welcome back, Stalwart!</h1>
      <p className='text-gray-400'>What will you like to learn today?</p>

      {/* Second Section */}
      <div className='border p-4 rounded-lg border-gray-300'>
        <div className='flex gap-2 w-full'>
          <input type="text" placeholder='e.g Learn javascript' className='border p-2 rounded-md border-gray-300'/>
          <button className='bg-[#4f46e5] text-white p-2.5 rounded-md font-bold'>Generate Course</button>
        </div>
        <p className='text-gray-400 text-sm'>AI would create a personlaized leaening path git any topic you want</p>
      </div>
      
      {/* Third Section */}
      <div className='bg-[#4f46e5] p-10 w-full mt-4 rounded-lg'>
        <h1 className='text-gray-300 pb-4'>CONTINUE LEARNING</h1>
        <h1 className='text-gray-300 text-3xl pb-4'>How to bake banana bread</h1>
        <p className='text-sm text-gray-300 pb-2'>Ai-generated Course</p>
        <progress max="100" value="45" className='border rounded-4xl'>45%</progress>
        <p className='text-sm text-gray-300 pt-2'>Lesson 3 of 6 || 50% complete</p>
        <button className='flex text-[#4f46e5] p-2.5 bg-white rounded-lg mt-4'>Continue Lesson <LucideChevronRight/></button>
      </div>

      {/* Fourth Section */}
      <div>
        <div>
          <h1>8</h1>
          <p className=''>Topics Generated</p>
        </div>
      </div>


    </div>
  )
}

export default Dashboard