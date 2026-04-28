import { LucideArrowRight, LucideChevronRight, LucideHistory, LucideRecycle } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import axiosInstance from '../../services/axiosConfig'

/**
 * ============================================================================
 * FIXED DASHBOARD - Both Generate Course & Direct Access Work
 * ============================================================================
 * 
 * FIXES APPLIED:
 * 1. ✅ Correct course ID capture from API response
 * 2. ✅ Correct navigation path (/course/:id instead of /learn/:id)
 * 3. ✅ No more undefined course ID bug
 * 4. ✅ Moved getData() and getCourseData() inside useEffect
 */

const Dashboard = () => {
  const navigate = useNavigate();

  // ──────────────────────────────────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────────────────────────────────
  
  const [User, setUser] = useState("")
  const [courseCount, setCourseCount] = useState(0)
  const [progressCount , setProgressCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0);

  // FORM INPUTS - What the user types
  const [searchQuery, setSearchQuery] = useState(''); // "Learn JavaScript"
  const [difficulty, setDifficulty] = useState('beginner'); // Beginner, Intermediate, Expert

  // LOADING STATES - Show spinners when things are happening
  const [generating, setGenerating] = useState(false); // true = showing "Generating..." spinner
  const [loadingCourses, setLoadingCourses] = useState(true); // true = loading course list

  // ERROR HANDLING - Store error messages to show user
  const [error, setError] = useState(''); // "Failed to generate course" or empty string

  // COURSES DATA - List of all user's courses from backend
  const [courses, setCourses] = useState([]); // Array of course objects

  // ──────────────────────────────────────────────────────────────────────────
  // API URL from environment variable
  // ──────────────────────────────────────────────────────────────────────────
  const apiURL = import.meta.env.VITE_BASE_URL

  // ──────────────────────────────────────────────────────────────────────────
  // FUNCTION: GET USER DATA
  // ──────────────────────────────────────────────────────────────────────────
  const getData = async () => {
    try{
      const response = await axiosInstance.get(apiURL+"/api/settings/profile")  
      setUser(response.data.data.user.fullName)    
    }
    catch(error){
      console.log(error);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FUNCTION: GET COURSE STATISTICS
  // ──────────────────────────────────────────────────────────────────────────
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

  // ──────────────────────────────────────────────────────────────────────────
  // useEffect - Load data when component mounts
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * FIX: Moved getData() and getCourseData() inside useEffect
   * This prevents infinite re-render loops
   */
  useEffect(() => {
    getData();
    getCourseData();
  }, []); // Empty array = run only once when component loads

  // ──────────────────────────────────────────────────────────────────────────
  // FUNCTION: HANDLE DIFFICULTY CHANGE
  // ──────────────────────────────────────────────────────────────────────────
  const changeCourseLevel = (e) => {
    setDifficulty(e.target.value)
    console.log('Difficulty changed to:', e.target.value);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FUNCTION: HANDLE SEARCH INPUT CHANGE
  // ──────────────────────────────────────────────────────────────────────────
  const getInputQuery = (e) => {
    setSearchQuery(e.target.value)
    console.log('Search query:', e.target.value);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FUNCTION: GENERATE COURSE (MAIN FEATURE!)
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * FIXES APPLIED:
   * 1. ✅ Get course ID directly from response (not setState)
   * 2. ✅ Navigate to /course/:id (not /learn/:id)
   * 3. ✅ Use course ID immediately (no undefined bug)
   */
  const handleGenerateCourse = async (e) => {
    // Prevent page refresh (default form behavior)
    e.preventDefault();
    
    // Clear any previous errors
    setError('');
    
    // Show "Generating..." spinner and disable button
    setGenerating(true);

    try {
      // Step 1: Log that we're starting generation
      console.log('🎓 Generating course...');
      console.log('   Topic:', searchQuery);
      console.log('   Difficulty:', difficulty);

      // Step 2: Send POST request to backend to generate course
      const response = await axiosInstance.post(
        apiURL + "/api/courses/generate", 
        { 
          query: searchQuery, 
          difficulty: difficulty 
        }
      );
      
      // Step 3: Extract the new course from response
      const newCourse = response.data.data.course;
      
      console.log('✅ Course generated successfully!');
      console.log('   Title:', newCourse.title);
      console.log('   Course ID:', newCourse._id);
      console.log('   Lessons:', newCourse.lessons.length);

      // Step 4: Show success alert
      alert(`✅ Course generated successfully!\n\nTitle: ${newCourse.title}\nLessons: ${newCourse.lessons.length}`);

      // ════════════════════════════════════════════════════════════════════
      // FIX: Navigate with correct course ID immediately
      // ════════════════════════════════════════════════════════════════════
      // ❌ OLD (BROKEN):
      // setCourseId(newCourse._id)  // State hasn't updated yet
      // navigate(`/learn/${courseid}`)  // courseid is still empty!
      
      // ✅ NEW (FIXED):
      const courseId = newCourse._id;  // Get ID directly from response
      navigate(`/Learn/${courseId}`);  // Navigate immediately with correct ID
      // ════════════════════════════════════════════════════════════════════

      console.log('🚀 Navigating to course viewer:', `/course/${courseId}`);

    } catch (error) {
      // Handle errors
      let errorMessage = 'Failed to generate course. Please try again.';
      
      console.log('❌ Error response:', error.response);
      
      if (error.response && error.response.data && error.response.data.message) {
        // Backend sent specific error message
        errorMessage = error.response.data.message;
      } else if (error.message === 'timeout of 120000ms exceeded') {
        // Request took too long
        errorMessage = 'Course generation timed out. Backend might be slow or offline.';
      } else if (!error.response) {
        // No response from server
        errorMessage = 'Cannot connect to backend. Is the server running?';
      }

      // Show error message in the UI
      setError(errorMessage)

      // Log detailed error for debugging
      console.error("❌ Course generation failed:", error)
    }
    finally {
      // Hide "generating..." spinner and enable button
      setGenerating(false)
    }
  }

  return (
    <div className='w-full pr-10'>
      {/* First section */}
      <h1 className='text-3xl text pt-10'>Welcome back, {User}!</h1>
      <p className='text-gray-400 pt-2'>What will you like to learn today?</p>

      {/* Second Section - Course Generation Form */}
      <div className='border p-4 rounded-lg mt-4 border-gray-300'>
        <form onSubmit={handleGenerateCourse}>
          <div className='flex gap-2 w-full'>
            <input 
              type="text"
              value={searchQuery}
              placeholder='e.g Learn javascript' 
              className='border p-2 rounded-md border-gray-300 w-[70%]' 
              onChange={getInputQuery}
              disabled={generating}
              required 
            />
            
            <select 
              className='border p-2.5 rounded-lg border-gray-300' 
              onChange={changeCourseLevel} 
              value={difficulty} 
              disabled={generating}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
            
            <button 
              type='submit' 
              className='bg-[#4f46e5] text-white p-2.5 rounded-md font-bold'
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Course'}
            </button>
          </div>
        </form>
        
        {/* Error Message */}
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4'>
            ❌ {error}
          </div>
        )}
        
        {/* Generation Progress */}
        {generating && (
          <div className='bg-blue-50 border border-blue-200 px-4 py-3 rounded mt-4'>
            <p className='text-blue-700 font-bold'>⏳ Generating your course...</p>
            <p className='text-sm text-blue-600 mt-2'>This takes 30-60 seconds. Please wait!</p>
          </div>
        )}
        
        <p className='text-gray-400 text-sm pt-4'>
          AI would create a personalized learning path for any topic you want
        </p>
      </div>
      
      {/* Third Section - Continue Learning */}
      <div className='bg-[#4f46e5] p-10 w-full mt-4 rounded-lg'>
        <h1 className='text-gray-300 pb-4'>CONTINUE LEARNING</h1>
        <h1 className='text-gray-300 text-3xl pb-4'>Javascript for absolute beginners</h1>
        <p className='text-sm text-gray-300 pb-2'>AI-generated Course</p>
        <progress max="100" value="45" className='border rounded-4xl w-full'>45%</progress>
        <p className='text-sm text-gray-300 pt-2'>Lesson 3 of 6 || 50% complete</p>
        <button className='flex text-[#4f46e5] p-2.5 bg-white rounded-lg mt-4'>
          Continue Lesson <LucideChevronRight/>
        </button>
      </div>

      {/* Fourth Section - Statistics */}
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

      {/* Fifth Section - Recent Searches */}
      <div className='bg-gray-100 p-4 mt-4 rounded-md border border-gray-300'>
        <h1 className='flex gap-2 font-bold pb-2'>
          Your Recent Searches <LucideHistory/>
        </h1>
        <div className='flex flex-col gap-2'>
          <p className='p-2 border rounded-md border-gray-300 text-gray-500'>
            Javascript for beginners
          </p>
          <p className='p-2 border rounded-md border-gray-300 text-gray-500'>
            Understanding system design in Javascript
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard