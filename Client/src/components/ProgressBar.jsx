import React from 'react'

const ProgressBar = ({value}) => {
  return (
    <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
      <div
        className="bg-[#4f46e5] h-3 rounded-full transition-all duration-500 ease-in-out"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export default ProgressBar

