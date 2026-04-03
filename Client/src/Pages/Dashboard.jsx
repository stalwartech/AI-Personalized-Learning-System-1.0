import { LucideArrowRight, LucideChevronRight, LucideHistory, LucideRecycle } from 'lucide-react'
import React, { useState } from 'react'
import axiosInstance from '../../services/axiosConfig'

const Dashboard = () => {

// navigate - helps   
// Javscript logic code here 
  const [User, setUser] = useState("")
  const [courseCount, setCourseCount] = useState(0)
  const [progressCount , setProgressCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0);

  // FORM IPUTS - What the user types
  const [searchQuery, setSearchQuery] = useState(''); // learn javascript""
  const [difficulty, setDifficulty] = useState('Beginner'); // Beginner, Intermediate, Advanced

  // LOADING STATES - Show spinners when things are happening
  const [generating, setGenerating] = useState(false); // true = showing "Generating..." spinner
  const [loadingCourses, setLoadingCourses] = useState(true); // true = loading course list

  // ERROR HANDLING - Store error messages to show user
  const [error, setError] = useState(''); // "Failed to generate course" or empty string

  // COURSES DATA - List of all user's courses from backend
  const [courses, setCourses] = useState([]); // Array of course objects

  
const apiURL = import.meta.env.VITE_BASE_URL
const getData = async () => {
  try{
    const response = await axiosInstance.get(apiURL+"/api/settings/profile")  
    setUser(response.data.data.user.fullName)    
  }
  catch(error){
    console.log(error);
  }
}

const getCourseData = async () => {
  try {
      const response = await axiosInstance.get(apiURL+"/api/progress")
      const Stats = response.data.data.progress.totalStats
      setCourseCount(Stats.coursesGenerated);
      setProgressCount(Stats.coursesInProgress);
      setCompletedCount(Stats.coursesCompleted);
  } catch (error) {
    console.log(error)
  }
}

getData()
getCourseData()


  return (
    <div className='w-full pr-10'>
      {/* First section */}
      <h1 className='text-3xl text pt-10'>Welcome back, {User}!</h1>
      <p className='text-gray-400 pt-2'>What will you like to learn today?</p>

      

      {/* Second Section */}
      <div className='border p-4 rounded-lg mt-4 border-gray-300'>
        <div className='flex gap-2 w-full'>
          <input type="text" placeholder='e.g Learn javascript' className='border p-2 rounded-md border-gray-300 w-[70%]' />
          <select className='border p-2.5 rounded-lg border-gray-300'>
            <option value="">Select level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
          </select>
          <button className='bg-[#4f46e5] text-white p-2.5 rounded-md font-bold'>Generate Course</button>
        </div>
        <p className='text-gray-400 text-sm pt-4'>AI would create a personlaized leaening path git any topic you want</p>
      </div>
      
      {/* Third Section */}
      <div className='bg-[#4f46e5] p-10 w-full mt-4 rounded-lg'>
        <h1 className='text-gray-300 pb-4'>CONTINUE LEARNING</h1>
        <h1 className='text-gray-300 text-3xl pb-4'>Javascript for absolute beginners</h1>
        <p className='text-sm text-gray-300 pb-2'>Ai-generated Course</p>
        <progress max="100" value="45" className='border rounded-4xl w-full'>45%</progress>
        {/* <ProgressBar value={40}/> */}
        <p className='text-sm text-gray-300 pt-2'>Lesson 3 of 6 || 50% complete</p>
        <button className='flex text-[#4f46e5] p-2.5 bg-white rounded-lg mt-4'>Continue Lesson <LucideChevronRight/></button>
      </div>

      {/* Fourth Section */}
      <div className='flex gap-3 mt-4'>
        <div className='bg-gray-100 flex flex-col w-full rounded-md p-4 border border-gray-300'>
          <h1 className='text-3xl font-bold text-center'>{courseCount}</h1>
          <p className='text-sm text-center text-gray-500'>Courses Generated</p>
        </div>
           <div className='bg-gray-100 flex flex-col w-full rounded-md p-4 border border-gray-300'>
          <h1 className='text-3xl font-bold text-center'>{progressCount}</h1>
          <p className='text-sm text-center text-gray-500'>In Progress</p>
        </div>
           <div className='bg-gray-100 flex flex-col w-full rounded-md p-4 border border-gray-300'>
          <h1 className='text-3xl font-bold text-center'>{completedCount}</h1>
          <p className='text-sm text-center text-gray-500'>Completed</p>
        </div>
      </div>

      {/* Fifth Section */}
      <div className='bg-gray-100 p-4 mt-4 rounded-md border border-gray-300'>
        <h1 className='flex gap-2 font-bold pb-2'>Your Recent Searches <LucideHistory/></h1>
        <div className='flex flex-col gap-2'>
          <p className='p-2 border rounded-md border-gray-300 text-gray-500'>Javascript for beginners</p>
          <p className='p-2 border rounded-md border-gray-300 text-gray-500'>Understanding system design in Javascript</p>
        </div>
      </div>


    </div>
  )
}

export default Dashboard