import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';

/**
 * ============================================================================
 * DASHBOARD COMPONENT - BEGINNER FRIENDLY VERSION
 * ============================================================================
 * 
 * This is the main page where users can:
 * 1. Generate new AI-powered courses
 * 2. See all their previous courses
 * 3. Navigate to course details
 * 4. Delete courses they don't want anymore
 * 
 * IMPORTANT CONCEPTS:
 * - useState: Stores data that can change (like form inputs, courses list)
 * - useEffect: Runs code when component loads (like fetching courses from backend)
 * - axios: Library that talks to the backend server
 * - async/await: Waits for backend responses before continuing
 */

const Dashboard = () => {
  // ──────────────────────────────────────────────────────────────────────────
  // HOOKS - Special React functions
  // ──────────────────────────────────────────────────────────────────────────
  
  // navigate - helps us move to different pages
  const navigate = useNavigate();
  
  // user and logout come from AuthContext (login system)
  const { user, logout } = useAuth();
  
  // ──────────────────────────────────────────────────────────────────────────
  // STATE - Variables that can change and trigger re-renders
  // ──────────────────────────────────────────────────────────────────────────
  
  // FORM INPUTS - What the user types
  const [searchQuery, setSearchQuery] = useState(''); // "Learn Python"
  const [difficulty, setDifficulty] = useState('beginner'); // "beginner", "intermediate", "advanced"
  
  // LOADING STATES - Show spinners when things are happening
  const [generating, setGenerating] = useState(false); // true = showing "Generating..." spinner
  const [loadingCourses, setLoadingCourses] = useState(true); // true = loading course list
  
  // ERROR HANDLING - Store error messages to show user
  const [error, setError] = useState(''); // "Failed to generate course" or empty string
  
  // COURSES DATA - List of all user's courses from backend
  const [courses, setCourses] = useState([]); // Array of course objects
  
  // ──────────────────────────────────────────────────────────────────────────
  // useEffect - Runs when component first loads
  // ──────────────────────────────────────────────────────────────────────────
  // Think of this as: "When page opens, fetch user's courses from backend"
  
  useEffect(() => {
    fetchCoursesFromBackend();
  }, []); // Empty array [] means "run only once when component loads"

  // ──────────────────────────────────────────────────────────────────────────
  // FUNCTION 1: FETCH COURSES FROM BACKEND
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * This function talks to the backend to get all user's courses
   * 
   * How it works:
   * 1. Get token from localStorage (proves user is logged in)
   * 2. Send GET request to backend with token
   * 3. Backend checks token and returns user's courses
   * 4. We save courses in state and display them
   */
  const fetchCoursesFromBackend = async () => {
    try {
      // Show loading spinner
      setLoadingCourses(true);
      
      // Step 1: Get the JWT token from browser storage
      // This token proves the user is logged in
      const token = localStorage.getItem('token');
      
      // Step 2: Make HTTP GET request to backend
      // axios.get() sends a GET request to the URL
      const response = await axios.get('http://localhost:5000/api/courses/history', {
        // params = query parameters in URL (?limit=20)
        params: {
          limit: 20 // Get maximum 20 courses
        },
        // headers = extra info sent with request
        headers: {
          // Authorization header contains the JWT token
          // Format: "Bearer abc123token456"
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Step 3: Extract courses from response
      // Backend sends: { success: true, data: { courses: [...] } }
      const coursesFromBackend = response.data.data.courses;
      
      // Step 4: Save courses in state
      // This triggers React to re-render and show the courses
      setCourses(coursesFromBackend);
      
      // Log success message for debugging
      console.log('✅ Loaded courses:', coursesFromBackend.length);
      
    } catch (error) {
      // If anything goes wrong, show error in console
      console.error('❌ Error fetching courses:', error);
      
      // If user is not authenticated (401 error), redirect to login
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please login again.');
        logout();
        navigate('/login');
      }
      
    } finally {
      // This runs whether success or error
      // Hide loading spinner
      setLoadingCourses(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // FUNCTION 2: GENERATE NEW COURSE
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * This is the MAIN FEATURE - Generate AI course
   * 
   * What happens when user clicks "Generate Course":
   * 1. Get form data (what they want to learn + difficulty)
   * 2. Send it to backend
   * 3. Backend calls OpenRouter/Gemini AI (takes 30-60 seconds)
   * 4. Backend finds YouTube videos
   * 5. Backend generates study notes
   * 6. Backend saves course to MongoDB
   * 7. Backend sends complete course back to us
   * 8. We display the new course
   */
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
      
      // Step 2: Log what we're generating (for debugging)
      console.log('🎓 Starting course generation...');
      console.log('   Topic:', searchQuery);
      console.log('   Difficulty:', difficulty);
      
      // Step 3: Send POST request to backend
      // POST = sending data to create something new
      const response = await axios.post(
        'http://localhost:5000/api/courses/generate', // Backend URL
        {
          // REQUEST BODY - Data we're sending
          query: searchQuery,      // "Learn Python"
          difficulty: difficulty    // "beginner"
        },
        {
          // REQUEST HEADERS
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          // TIMEOUT - Wait up to 2 minutes (course generation is slow)
          timeout: 120000 // 120 seconds = 2 minutes
        }
      );
      
      // Step 4: Extract the new course from response
      // Backend sends: { success: true, data: { course: {...} } }
      const newCourse = response.data.data.course;
      
      // Step 5: Add new course to the TOP of the courses list
      // ...courses means "all existing courses"
      // [newCourse, ...courses] means "new course first, then all old courses"
      setCourses([newCourse, ...courses]);
      
      // Step 6: Clear the search input
      setSearchQuery('');
      
      // Step 7: Show success message
      console.log('✅ Course generated successfully!');
      console.log('   Title:', newCourse.title);
      console.log('   Lessons:', newCourse.lessons.length);
      alert(`✅ Course "${newCourse.title}" created successfully!`);
      
    } catch (error) {
      // Something went wrong - show error to user
      
      // Try to get error message from backend
      let errorMessage = 'Failed to generate course. Please try again.';
      
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
      
      // Show error in red box
      setError(errorMessage);
      
      // Log detailed error for debugging
      console.error('❌ Course generation failed:', error);
      
    } finally {
      // Hide "Generating..." spinner and enable button
      setGenerating(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // FUNCTION 3: DELETE COURSE
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Delete a course from database
   * 
   * Steps:
   * 1. Ask user to confirm
   * 2. Send DELETE request to backend
   * 3. Remove course from our list
   */
  const handleDeleteCourse = async (courseId, courseTitle) => {
    // Step 1: Ask user to confirm deletion
    const confirmDelete = window.confirm(`Are you sure you want to delete "${courseTitle}"?`);
    
    // If user clicked "Cancel", stop here
    if (!confirmDelete) return;
    
    try {
      // Step 2: Get token
      const token = localStorage.getItem('token');
      
      // Step 3: Send DELETE request to backend
      await axios.delete(
        `http://localhost:5000/api/courses/${courseId}`, // URL with course ID
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Step 4: Remove course from our list
      // filter() keeps all courses EXCEPT the one we deleted
      const updatedCourses = courses.filter(course => course._id !== courseId);
      setCourses(updatedCourses);
      
      // Log success
      console.log('🗑️ Course deleted successfully');
      
    } catch (error) {
      console.error('❌ Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // FUNCTION 4: HANDLE INPUT CHANGES
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Update state when user types in search box
   * 
   * e.target.value = what the user typed
   */
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  /**
   * Update state when user selects difficulty
   */
  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER - HTML that gets displayed
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard">
      
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            {/* Show user's name */}
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p>What would you like to learn today?</p>
          </div>
          
          {/* Logout button */}
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        
        {/* ── COURSE GENERATION SECTION ────────────────────────────────────── */}
        <section className="generate-section">
          <h2>Generate New Course</h2>
          
          {/* FORM - When submitted, calls handleGenerateCourse */}
          <form onSubmit={handleGenerateCourse} className="generate-form">
            <div className="form-row">
              
              {/* SEARCH INPUT - What to learn */}
              <input
                type="text"
                className="search-input"
                placeholder="What do you want to learn? (e.g., Python, React, Marketing...)"
                value={searchQuery}
                onChange={handleSearchChange}
                disabled={generating} // Disable while generating
                required // Can't submit empty
              />
              
              {/* DIFFICULTY DROPDOWN */}
              <select
                className="difficulty-select"
                value={difficulty}
                onChange={handleDifficultyChange}
                disabled={generating}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              
              {/* SUBMIT BUTTON */}
              <button 
                type="submit" 
                className="btn-generate"
                disabled={generating} // Disable while generating
              >
                {generating ? (
                  <>
                    {/* Show spinner when generating */}
                    <span className="spinner"></span>
                    Generating...
                  </>
                ) : (
                  '🚀 Generate Course'
                )}
              </button>
            </div>
          </form>

          {/* ERROR MESSAGE - Only shows if error exists */}
          {error && (
            <div className="error-banner">
              ❌ {error}
            </div>
          )}

          {/* PROGRESS INFO - Only shows while generating */}
          {generating && (
            <div className="generating-info">
              <div className="progress-steps">
                <div className="step">🤖 AI is creating your course structure...</div>
                <div className="step">📺 Finding the best YouTube videos...</div>
                <div className="step">📝 Generating study notes...</div>
                <div className="step">📄 Creating PDF downloads...</div>
              </div>
              <p className="tip">
                💡 This takes 30-60 seconds. Please don't refresh the page!
              </p>
            </div>
          )}
        </section>

        {/* ── COURSES LIST SECTION ──────────────────────────────────────────── */}
        <section className="courses-section">
          <h2>Your Courses ({courses.length})</h2>
          
          {/* LOADING STATE - Show while fetching courses */}
          {loadingCourses ? (
            <div className="loading-courses">
              <span className="spinner"></span>
              Loading courses...
            </div>
          ) : 
          
          /* EMPTY STATE - Show if no courses */
          courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No courses yet</h3>
              <p>Generate your first course above to get started!</p>
            </div>
          ) : 
          
          /* COURSES GRID - Show all courses */
          (
            <div className="courses-grid">
              {/* Loop through each course and display it */}
              {courses.map(course => (
                <div key={course._id} className="course-card">
                  
                  {/* Course Title and Difficulty Badge */}
                  <div className="course-header">
                    <h3>{course.title}</h3>
                    <span className={`badge badge-${course.difficulty}`}>
                      {course.difficulty}
                    </span>
                  </div>
                  
                  {/* Course Description */}
                  <p className="course-description">{course.description}</p>
                  
                  {/* Course Stats */}
                  <div className="course-stats">
                    <span>📚 {course.lessons.length} lessons</span>
                    <span>
                      {/* Calculate total duration */}
                      ⏱️ {course.lessons.reduce((total, lesson) => 
                        total + (lesson.estimatedDuration || 15), 0
                      )} min
                    </span>
                    <span>🎯 {course.progress.completedLessons} completed</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${course.progress.percentage}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {course.progress.percentage}% complete
                    </span>
                  </div>
                  
                  {/* Course Footer - Status and Date */}
                  <div className="course-footer">
                    <span className="course-status">{course.status}</span>
                    <span className="course-date">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="course-actions">
                    {/* View/Continue Button */}
                    <button 
                      className="btn btn-primary btn-view"
                      onClick={() => navigate(`/course/${course._id}`)}
                    >
                      {course.progress.percentage === 0 ? 'Start Course' : 'Continue'}
                    </button>
                    
                    {/* Delete Button */}
                    <button 
                      className="btn btn-danger btn-delete"
                      onClick={(e) => {
                        e.stopPropagation(); // Don't trigger card click
                        handleDeleteCourse(course._id, course.title);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Dashboard;