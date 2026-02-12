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
          <h1 className='text-xl w-53'>Full Name</h1>
          <input type="text" placeholder='Enter your name' className='border rounded-md w-[60%] p-1'/>
        </div>
          
        {/* Email Address */}
        <div className='flex gap-12 mt-6 w-[70%]'>
          <h1 className='text-xl w-53'>Email Address</h1>
          <input type="email" placeholder='stalwartdev@gmail.com' className='border rounded-md w-[60%] p-1'/>
      </div>
      </div>

          {/* Security */}
      <div className='p-6 w-full border rounded-lg border-gray-400 mt-4'>
        <h1 className='text-2xl font-bold pb-'>Security</h1>
        <hr className='text-gray-400 pb-4'/>

        {/* Cuurent Password */}
        <div className='flex gap-12 mt-6 w-[70%]'>
          <h1 className='text-xl w-53'>Current Password</h1>
          <input type="password" placeholder='Enter Current Password' className='border rounded-md w-[60%] p-1'/>
        </div>

          {/* Cuurent Password */}
        <div className='flex gap-12 mt-6 w-[70%]'>
          <h1 className='text-xl w-53'>New Password</h1>
          <input type="password" placeholder="Enter New Password" className='border rounded-md w-[60%] p-1'/>
        </div>          
          
        {/* Email Address */}
        <div className='flex gap-12 mt-6 w-[70%]'>
          <h1 className='text-xl w-53'>Confirm New Password</h1>
          <input type="password" placeholder='Confirm New Password' className='border rounded-md w-[60%] p-1'/>
      </div>
      </div>
 
      {/* profile Information */}
      <div className='p-6 w-full border rounded-lg border-gray-400 mt-4'>
        <h1 className='text-2xl font-bold pb-'>Account Action</h1>
        <hr className='text-gray-400 pb-4'/>

        {/* Full Name */}
        <div className='flex justify-between pr-4 mt-6 w-[70%]'>
          <div className='flex flex-col w-53'>
            <h1 className='text-xl w-53'>Delete Account</h1>
            <p className='text-sm text-gray-500'>Permanently delete your account and all data</p>
          </div>
          <button className='text-white bg-red-600 rounded-md p-2 my-4 font-bold'>Delete Account</button>
        </div>
     
      </div>

  <button className='text-white bg-[#4f46e5] rounded-md p-2 my-4 font-bold'>Save Changes</button>



    </div>
  )
}

export default Settings