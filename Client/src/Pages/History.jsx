import React from 'react'
import Card from '../components/Card'
import ProgressBar from '../components/ProgressBar'
import axiosInstance from '../../services/axiosConfig'


const History = () => {

  const getData = async () => {
    try {
        const data = await axiosInstance.get('http://localhost:3021/api/courses/history')
        const response = data.data.data.courses
        console.log(response)
    } catch (error) {
      console.log(error)
    }
  }
  getData()
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
        <div className="w-full border border-gray-300 rounded-xl overflow-hidden hover:translate-t-3 hover:scale-105 hover:duration-300 hover:ease-in-out">

      {/* Header */}
      <div className="bg-amber-500 px-6 py-4">
        <p className="text-sm">Generated 2 days ago</p>
        <p className="text-2xl font-bold">Javascript for Beginners</p>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex justify-between">
          <p>6 lessons</p>
          <p>Beginner</p>
        </div>

        <ProgressBar value={60}/>

        <div className="pt-4 flex gap-4 w-full">
          <button className="py-1.5 px-10 bg-[#4f46e5] rounded-lg text-white w-full">Continue</button>
          <button className="py-1.5 px-10 rounded-lg border border-gray-400 w-full">Delete</button>
        </div>
      </div>

    </div>
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