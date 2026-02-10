import React from 'react'

const Settings = () => {
  return (
    <div className='w-full pt-10 pr-10'>
      {/* Heading */}
      <h1 className='text-3xl font-bold'>Settings</h1>
      {/* profile Information */}
      <div className='p-6 w-full border rounded-lg border-gray-400 mt-4'>
        <h1 className='text-2xl font-bold'>Profile Information</h1>
        <div className='flex justify-between mt-6'>
          <h1 className='text-xl'>Full Name</h1>
          <input type="text" className='border rounded-lg' />
        </div>
      </div>
    </div>
  )
}

export default Settings