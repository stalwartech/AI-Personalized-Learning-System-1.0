import React from 'react'
import ProgressBar from './ProgressBar'

const Card = () => {
  return (
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
  )
}

export default Card
