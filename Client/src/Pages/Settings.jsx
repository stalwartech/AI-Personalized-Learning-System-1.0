import React from 'react'

const Settings = () => {
  return (
    <div className='w-full pt-10 pr-10'>
      {/* Heading */}
      <h1 className='text-3xl font-bold'>Settings</h1>
      
      {/* profile Information */}
      <div className='p-6 w-full border rounded-lg border-gray-400 mt-4'>
        <h1 className='text-2xl font-bold pb-'>Profile Information</h1>
        <hr className='text-gray-400 pb-4'/>

        {/* Full Name */}
        <div className='flex gap-12 mt-6 w-[70%]'>
          <h1 className='text-xl w-35'>Full Name</h1>
          <input type="text" className='border rounded-md w-[60%]' />
        </div>
          
          {/* Email Address */}
          <div className='flex gap-12 mt-6 w-[70%]'>
          <h1 className='text-xl w-35'>Email Address</h1>
          <input type="text" className='border rounded-lg w-[60%]' />
        </div>
      </div>


    </div>
  )
}

export default Settings