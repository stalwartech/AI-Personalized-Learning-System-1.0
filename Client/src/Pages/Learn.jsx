import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosConfig';

const Learn = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  
  const apiURL = import.meta.env.VITE_BASE_URL;
  
  useEffect(() => {
    loadCourse();
  }, [courseId]);
  
  const loadCourse = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get token
      const token = localStorage.getItem('token');
      
      // Log everything for debugging
      const requestURL = `${apiURL}/api/courses/${courseId}`;
      console.log('═══════════════════════════════════════════');
      console.log('📚 LOADING COURSE - DEBUG INFO');
      console.log('═══════════════════════════════════════════');
      console.log('Course ID from useParams():', courseId);
      console.log('Course ID type:', typeof courseId);
      console.log('Course ID is undefined?', courseId === undefined);
      console.log('Course ID is "undefined" string?', courseId === 'undefined');
      console.log('API URL:', apiURL);
      console.log('Full Request URL:', requestURL);
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      console.log('═══════════════════════════════════════════');
      
      // CRITICAL CHECK: Stop if courseId is undefined
      if (!courseId || courseId === 'undefined') {
        throw new Error(`Invalid course ID: "${courseId}". Check your App.jsx route configuration!`);
      }
      
      // Store debug info in state so we can show it if needed
      setDebugInfo({
        courseId,
        apiURL,
        requestURL,
        hasToken: !!token
      });
      
      // Make request
      const response = await axiosInstance.get(`${apiURL}/api/courses/${courseId}`);
      
      console.log('✅ Response received:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      // Extract course data
      const courseData = response.data.data.course;
      
      if (!courseData) {
        throw new Error('Course data is empty in response');
      }
      
      if (!courseData.lessons || courseData.lessons.length === 0) {
        throw new Error('Course has no lessons');
      }
      
      setCourse(courseData);
      
      console.log('✅ Course loaded successfully!');
      console.log('   Title:', courseData.title);
      console.log('   Total lessons:', courseData.lessons.length);
      console.log('   First lesson:', courseData.lessons[0]?.title);
      
    } catch (error) {
      console.error('═══════════════════════════════════════════');
      console.error('❌ ERROR LOADING COURSE');
      console.error('═══════════════════════════════════════════');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
        
        // Set specific error messages based on status code
        if (error.response.status === 401) {
          setError('Authentication failed. Please login again.');
          setTimeout(() => navigate('/login'), 2000);
        } else if (error.response.status === 404) {
          setError(`Course not found. Course ID: ${courseId}`);
        } else if (error.response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(error.response.data?.message || 'Failed to load course');
        }
      } else if (error.request) {
        console.error('Request made but no response:', error.request);
        setError('Cannot connect to server. Is the backend running?');
      } else {
        console.error('Error setting up request:', error.message);
        setError(error.message);
      }
      
      console.error('═══════════════════════════════════════════');
    } finally {
      setLoading(false);
    }
  };
  
  const goToNextLesson = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('🎉 You are on the last lesson!');
    }
  };
  
  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('📚 You are on the first lesson!');
    }
  };
  
  const jumpToLesson = (index) => {
    setCurrentLessonIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-700 font-medium">Loading course...</p>
          <p className="mt-2 text-sm text-gray-500">Course ID: {courseId}</p>
        </div>
      </div>
    );
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR STATE WITH DEBUG INFO
  // ═══════════════════════════════════════════════════════════════════════════
  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white border-2 border-red-300 rounded-lg p-8 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-red-700 mb-4">❌ Error Loading Course</h1>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-medium mb-2">Error Message:</p>
            <p className="text-red-600">{error || 'Unknown error occurred'}</p>
          </div>
          
          {debugInfo && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="font-bold text-gray-700 mb-3">🔍 Debug Information:</p>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Course ID:</span> <code className="bg-gray-200 px-2 py-1 rounded">{debugInfo.courseId}</code></p>
                <p><span className="font-medium">API URL:</span> <code className="bg-gray-200 px-2 py-1 rounded">{debugInfo.apiURL}</code></p>
                <p><span className="font-medium">Request URL:</span> <code className="bg-gray-200 px-2 py-1 rounded text-xs">{debugInfo.requestURL}</code></p>
                <p><span className="font-medium">Has Token:</span> {debugInfo.hasToken ? '✅ Yes' : '❌ No'}</p>
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="font-bold text-blue-700 mb-2">💡 Troubleshooting Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-900">
              <li>Check if backend is running on port 5000</li>
              <li>Verify course ID exists in database</li>
              <li>Check browser console (F12) for detailed errors</li>
              <li>Verify you're logged in (check token in localStorage)</li>
              <li>Check .env file has VITE_BASE_URL=http://localhost:5000</li>
            </ol>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
            >
              ← Back to Dashboard
            </button>
            <button 
              onClick={loadCourse}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GET CURRENT LESSON DATA
  // ═══════════════════════════════════════════════════════════════════════════
  const currentLesson = course.lessons[currentLessonIndex];
  const lessonNumber = currentLessonIndex + 1;
  const totalLessons = course.lessons.length;
  
  const selectedVideo = currentLesson.videoOptions && currentLesson.videoOptions.length > 0 
    ? currentLesson.videoOptions[0] 
    : null;
  
  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = currentLessonIndex === totalLessons - 1;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:text-indigo-800 font-medium mb-3 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600 mt-2 text-lg">{course.description}</p>
          <div className="mt-3 flex gap-3 text-sm">
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">
              {course.difficulty}
            </span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">
              {totalLessons} Lessons
            </span>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* SIDEBAR - LESSONS LIST */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm sticky top-4">
              <h2 className="font-bold text-xl mb-4 text-gray-900">
                📚 Lessons ({totalLessons})
              </h2>
              
              <div className="space-y-2">
                {course.lessons.map((lesson, index) => (
                  <div
                    key={lesson._id || index}
                    onClick={() => jumpToLesson(index)}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-all
                      ${index === currentLessonIndex 
                        ? 'bg-indigo-600 text-white shadow-md transform scale-105' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-bold flex-shrink-0 text-lg">
                        {lesson.completed ? '✓' : index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight">
                          {lesson.title}
                        </p>
                        <p className={`text-xs mt-1 ${
                          index === currentLessonIndex ? 'text-indigo-200' : 'text-gray-500'
                        }`}>
                          {lesson.estimatedDuration || 15} min
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* MAIN CONTENT */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              
              {/* LESSON TITLE */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentLesson.title}
                </h2>
                <p className="text-gray-600 text-lg">
                  Lesson {lessonNumber} of {totalLessons} • {currentLesson.estimatedDuration || 15} minutes
                </p>
              </div>
              
              {/* PAGINATION - TOP */}
              <div className="flex justify-between items-center mb-6 pb-6 border-b-2 border-gray-100">
                <button
                  onClick={goToPreviousLesson}
                  disabled={isFirstLesson}
                  className={`
                    px-5 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2
                    ${isFirstLesson 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    }
                  `}
                >
                  ← Previous
                </button>
                
                <span className="text-gray-700 font-bold text-lg">
                  {lessonNumber} / {totalLessons}
                </span>
                
                <button
                  onClick={goToNextLesson}
                  disabled={isLastLesson}
                  className={`
                    px-5 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2
                    ${isLastLesson 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    }
                  `}
                >
                  Next →
                </button>
              </div>
              
              {/* VIDEO SECTION */}
              {selectedVideo ? (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    📺 Video Lesson
                  </h3>
                  
                  <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-lg">
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={selectedVideo.embedUrl}
                      title={selectedVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-bold text-gray-900 text-lg">{selectedVideo.title}</h4>
                    <p className="text-gray-600 mt-1">
                      By {selectedVideo.channelTitle}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-yellow-800">⚠️ No video available for this lesson</p>
                </div>
              )}
              
              {/* NOTES SECTION */}
              {currentLesson.notes && currentLesson.notes.markdown ? (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      📝 Study Notes
                    </h3>
                    
                    {currentLesson.notes.pdfUrl && (
                      <a
                        href={`${apiURL}${currentLesson.notes.pdfUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        📄 Download PDF
                      </a>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    {currentLesson.notes.markdown.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-3xl font-bold mt-8 mb-4 first:mt-0 text-gray-900">{line.slice(2)}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-2xl font-bold mt-6 mb-3 text-gray-900">{line.slice(3)}</h2>;
                      } else if (line.startsWith('### ')) {
                        return <h3 key={index} className="text-xl font-bold mt-5 mb-2 text-gray-900">{line.slice(4)}</h3>;
                      } else if (line.startsWith('- ')) {
                        return <li key={index} className="ml-6 mb-2 text-gray-700 list-disc">{line.slice(2)}</li>;
                      } else if (line.trim() !== '') {
                        return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{line}</p>;
                      }
                      return null;
                    })}
                  </div>
                </div>
              ) : (
                <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-600">📝 No study notes available for this lesson</p>
                </div>
              )}
              
              {/* LESSON OVERVIEW */}
              {currentLesson.content && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    📖 Lesson Overview
                  </h3>
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-lg">
                    <p className="text-gray-800 leading-relaxed">{currentLesson.content}</p>
                  </div>
                </div>
              )}
              
              {/* PAGINATION - BOTTOM */}
              <div className="flex justify-between items-center mt-10 pt-6 border-t-2 border-gray-100">
                <button
                  onClick={goToPreviousLesson}
                  disabled={isFirstLesson}
                  className={`
                    px-6 py-3 rounded-lg font-semibold transition-all
                    ${isFirstLesson 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    }
                  `}
                >
                  ← Previous Lesson
                </button>
                
                <span className="text-gray-700 font-bold text-lg">
                  {lessonNumber} / {totalLessons}
                </span>
                
                <button
                  onClick={goToNextLesson}
                  disabled={isLastLesson}
                  className={`
                    px-6 py-3 rounded-lg font-semibold transition-all
                    ${isLastLesson 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    }
                  `}
                >
                  Next Lesson →
                </button>
              </div>
              
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Learn;