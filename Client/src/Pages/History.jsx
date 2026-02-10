import React from 'react'
import Card from '../components/Card'

const History = () => {
  return (
    <div className='pt-10 pr-10 w-full'>
      {/* First section */}
      <div className='w-[60%] flex gap-4'>
        <button className='bg-[#4f46e5] text-white px-4 py-2 rounded-lg'>All</button>
        <button className='rounded bg-gray-100 px-4 py-2'>In Progress</button>
        <button className='rounded bg-gray-100 px-4 py-2'>Completed</button>
        <button className='rounded bg-gray-100 px-4 py-2'>Abandoned</button>
      </div>

      {/* Cards */}
      <div className='grid grid-cols-3 gap-4 mt-4'>
      <Card/>
      <Card/>
      <Card/>
      <Card/>
      <Card/>
      <Card/>
      </div>
    </div>
  )
}

export default History