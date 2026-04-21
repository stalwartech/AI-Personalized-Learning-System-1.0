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
  const [difficulty, setDifficulty] = useState('beginner'); // Beginner, Intermediate, Advanced

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

const changeCourseLevel = (e) => {
  console.log(difficulty)
  setDifficulty(e.target.value)
}

const getInputQuery = (e) => {
  setSearchQuery(e.target.value)
  console.log(searchQuery);
}
const handleGenerateCourse = async (e) => {
  // Prevent page refresh (default form behavior)
  e.preventDefault();
  
  // Clear any previous errors
  setError('');
  
  // Show "Generating..." spinner and disable button
  setGenerating(true);

  try {
    // Step 1: Get the JWT token
    const token = localStorage.getItem('token');

    // Step 2 Log that the user is generating a course and it is loading already 
    console.log('Generating course...');
    console.log("topic", searchQuery);
    console.log("difficulty", difficulty);

    // Step 3: Send ythe post request to the backend to generate the course
    // This will send the searchquery to the backend as the object 
    console.log( apiURL+"/api/courses/generate")
    const response = await axiosInstance.post(
        apiURL+"/api/courses/generate", 
        { 
          query: searchQuery, difficulty: difficulty 
        },
      );
      
      // console.log(apiURL);
    
    // Step 4: Hide the "Generating..." spinner and enable button
    setGenerating(false);

    // Step 5: Add new course to the TOP of the course list 
    // ...Course means all existing course data
    setCourses([newCourse, ...courses])

    // Step 6 clear the search query 
    setSearchQuery("")

    // Step 7 SHow success message 
    console.log('Course generated successfully!');
    console.log(response.data.data.course);
    console.log(response.data.data.course);
    alert(`Course generated successfully! ${newCourse.title}`);

  } catch (error) {
     // Try to get error message from backend
      let errorMessage = 'Failed to generate course. Please try again.';
      console.log(error.response, 'here i am ');
      
      if (error.response && error.response.data && error.response.data.message) {
        // Backend sent specific error message
        errorMessage = error.response.data.message;
      } else if (error.message === 'timeout of 120000ms exceeded') {
        // Request took too long
        errorMessage = 'Course generation timed out. Backend might be slow or offline.';
      } else if (!error.response) {
        // No response from server
        errorMessage = 'Cannot connect to backend. Is the server running on port 5000?';
      }

      // show error message in the red box 
      setError(errorMessage)

      // log detailed error for debugging 
      console.log("Course generation failed", error)
  }
  finally{
    // Hide "generating..." spinner and enable button 
    setGenerating(false)
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
          <input type="text"
          value={searchQuery}
          placeholder='e.g Learn javascript' className='border p-2 rounded-md border-gray-300 w-[70%]' 
          onChange={getInputQuery}
          disabled={generating}
          required />
          <select className='border p-2.5 rounded-lg border-gray-300' onChange={changeCourseLevel} value={difficulty} disabled={generating}>
            <option value="">Select level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
          <button type='submit' className='bg-[#4f46e5] text-white p-2.5 rounded-md font-bold' onClick={handleGenerateCourse}>Generate Course</button>
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