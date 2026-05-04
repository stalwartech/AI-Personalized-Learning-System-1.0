import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// import './CourseViewer.css';

/**
 * ============================================================================
 * COURSE VIEWER WITH LESSON PAGINATION - BEGINNER FRIENDLY
 * ============================================================================
 * 
 * This component displays a course with pagination through lessons
 * 
 * Features:
 * 1. View one lesson at a time
 * 2. Navigate with "Previous" and "Next" buttons
 * 3. Watch YouTube videos for each lesson
 * 4. Read AI-generated study notes
 * 5. Mark lessons as complete
 * 6. Download PDF notes
 * 7. Track progress through course
 * 
 * PAGINATION CONCEPT:
 * - Think of lessons like pages in a book
 * - currentLessonIndex = which page you're on (0, 1, 2, ...)
 * - Next button = currentLessonIndex + 1
 * - Previous button = currentLessonIndex - 1
 */

const CourseViewer = () => {
  // ──────────────────────────────────────────────────────────────────────────
  // HOOKS
  // ──────────────────────────────────────────────────────────────────────────
  
  // Get courseId from URL (e.g., /course/abc123)
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // ──────────────────────────────────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────────────────────────────────
  
  // Course data from backend
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // PAGINATION STATE - Which lesson we're viewing
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  // Index 0 = First lesson
  // Index 1 = Second lesson
  // Index 2 = Third lesson, etc.
  
  // Active tab (what content to show)
  const [activeTab, setActiveTab] = useState('video'); // 'video', 'notes', or 'complete'
  
  // Quiz score input
  const [quizScore, setQuizScore] = useState('');

  // ──────────────────────────────────────────────────────────────────────────
  // LOAD COURSE ON PAGE LOAD
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchCourseFromBackend();
  }, [courseId]);

  // ──────────────────────────────────────────────────────────────────────────
  // FUNCTION: FETCH COURSE FROM BACKEND
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Gets the complete course with all lessons from backend
   */
  const fetchCourseFromBackend = async () => {
    try {
      setLoading(true);
      
      // Get JWT token
      const token = localStorage.getItem('token');
      
      // Send GET request to backend
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/courses/${courseId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      // Save course data
      const courseData = response.data.data.course;
      setCourse(courseData);
      
      console.log('✅ Course loaded:', courseData.title);
      console.log('   Total lessons:', courseData.lessons.length);
      
    } catch (error) {
      console.error('❌ Error loading course:', error);
      alert('Failed to load course. Redirecting to dashboard...');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // FUNCTION: GO TO NEXT LESSON (PAGINATION)
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Move to the next lesson
   * Example: If on lesson 2, move to lesson 3
   */
  const goToNextLesson = () => {
    // Check if there's a next lesson
    if (currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      setActiveTab('video'); // Switch back to video tab
      setQuizScore(''); // Clear quiz score
      
      console.log(`📖 Moving to lesson ${currentLessonIndex + 2}`);
      
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Already on last lesson
      alert('🎉 You\'re on the last lesson!');
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // FUNCTION: GO TO PREVIOUS LESSON (PAGINATION)
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Move to the previous lesson
   * Example: If on lesson 3, move to lesson 2
   */
  const goToPreviousLesson = () => {
    // Check if there's a previous lesson
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      setActiveTab('video'); // Switch back to video tab
      setQuizScore(''); // Clear quiz score
      
      console.log(`📖 Moving to lesson ${currentLessonIndex}`);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Already on first lesson
      alert('📚 You\'re on the first lesson!');
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // FUNCTION: GO TO SPECIFIC LESSON
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Jump directly to a specific lesson by clicking on sidebar
   */
  const goToLesson = (lessonIndex) => {
    setCurrentLessonIndex(lessonIndex);
    setActiveTab('video');
    setQuizScore('');
    
    console.log(`📖 Jumping to lesson ${lessonIndex + 1}`);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ──────────────────────────────────────────────────────────────────────────
  // FUNCTION: SELECT VIDEO
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * When user selects a different video option for the lesson
   */
  const handleSelectVideo = async (videoId) => {
    try {
      const token = localStorage.getItem('token');
      const currentLesson = course.lessons[currentLessonIndex];
      
      // Send request to backend to save video choice
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/courses/${courseId}/lessons/${currentLesson._id}/video`,
        { videoId: videoId },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      // Reload course to get updated data
      await fetchCourseFromBackend();
      
      console.log('✅ Video selection saved');
      
    } catch (error) {
      console.error('❌ Error selecting video:', error);
      alert('Failed to save video selection');
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // FUNCTION: MARK LESSON AS COMPLETE
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Mark current lesson as completed and move to next
   */
  const handleCompleteLesson = async () => {
    try {
      const token = localStorage.getItem('token');
      const currentLesson = course.lessons[currentLessonIndex];
      
      // Prepare data to send
      const data = {
        timeSpent: currentLesson.estimatedDuration || 15
      };
      
      // Add quiz score if provided
      if (quizScore && quizScore.trim() !== '') {
        data.quizScore = parseInt(quizScore);
      }
      
      // Send completion request to backend
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/courses/${courseId}/lessons/${currentLesson._id}/complete`,
        data,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      console.log('✅ Lesson marked as complete!');
      
      // Reload course to update progress
      await fetchCourseFromBackend();
      
      // Check if this is the last lesson
      if (currentLessonIndex === course.lessons.length - 1) {
        // Last lesson completed - course finished!
        alert('🎉 Congratulations! You completed the entire course!');
        navigate('/dashboard');
      } else {
        // Move to next lesson
        alert('✅ Lesson completed! Moving to next lesson...');
        goToNextLesson();
      }
      
    } catch (error) {
      console.error('❌ Error completing lesson:', error);
      alert('Failed to mark lesson as complete');
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ──────────────────────────────────────────────────────────────────────────
  if (loading || !course) {
    return (
      <div className="loading-screen">
        <span className="spinner"></span>
        <p>Loading course...</p>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET CURRENT LESSON DATA
  // ──────────────────────────────────────────────────────────────────────────
  // Get the lesson we're currently viewing based on currentLessonIndex
  const currentLesson = course.lessons[currentLessonIndex];
  
  // Get the selected video for this lesson
  const selectedVideo = currentLesson.videoOptions.find(
    video => video.videoId === currentLesson.selectedVideo
  ) || currentLesson.videoOptions[0]; // Default to first video if none selected

  // Calculate pagination info
  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = currentLessonIndex === course.lessons.length - 1;
  const lessonNumber = currentLessonIndex + 1; // Display as 1, 2, 3 (not 0, 1, 2)
  const totalLessons = course.lessons.length;

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="course-viewer">
      
      {/* ═══════════════════════════════════════════════════════════════════
          SIDEBAR - List of all lessons
          ═══════════════════════════════════════════════════════════════════ */}
      <aside className="sidebar">
        
        {/* Course Info */}
        <div className="course-info">
          <button 
            onClick={() => navigate('/')} 
            className="btn-back"
          >
            ← Back to Dashboard
          </button>
          
          <h2>{course.title}</h2>
          
          {/* Overall Progress Bar */}
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${course.progress.percentage}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {course.progress.completedLessons} / {totalLessons} lessons completed
            </p>
          </div>
        </div>

        {/* Lessons List */}
        <div className="lessons-list">
          <h3>Lessons</h3>
          {course.lessons.map((lesson, index) => (
            <div
              key={lesson._id}
              className={`lesson-item ${
                index === currentLessonIndex ? 'active' : ''
              } ${lesson.completed ? 'completed' : ''}`}
              onClick={() => goToLesson(index)}
            >
              {/* Lesson Number/Check */}
              <span className="lesson-number">
                {lesson.completed ? '✓' : index + 1}
              </span>
              
              {/* Lesson Details */}
              <div className="lesson-details">
                <h4>{lesson.title}</h4>
                <span className="lesson-duration">
                  {lesson.estimatedDuration} min
                </span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA - Current lesson content
          ═══════════════════════════════════════════════════════════════════ */}
      <main className="main-content">
        
        {/* Lesson Header with Pagination Info */}
        <div className="lesson-header">
          <div>
            <h1>{currentLesson.title}</h1>
            <p className="lesson-meta">
              Lesson {lessonNumber} of {totalLessons} • {currentLesson.estimatedDuration} minutes
              {currentLesson.completed && <span className="completed-badge">✓ Completed</span>}
            </p>
          </div>
        </div>

        {/* ═══ PAGINATION CONTROLS - TOP ═══ */}
        <div className="pagination-controls">
          <button 
            className="btn-pagination btn-previous"
            onClick={goToPreviousLesson}
            disabled={isFirstLesson}
          >
            ← Previous Lesson
          </button>
          
          <span className="pagination-info">
            Lesson {lessonNumber} / {totalLessons}
          </span>
          
          <button 
            className="btn-pagination btn-next"
            onClick={goToNextLesson}
            disabled={isLastLesson}
          >
            Next Lesson →
          </button>
        </div>

        {/* Tabs for different content */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            📺 Video
          </button>
          <button 
            className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            📝 Notes
          </button>
          <button 
            className={`tab ${activeTab === 'complete' ? 'active' : ''}`}
            onClick={() => setActiveTab('complete')}
          >
            ✅ Complete Lesson
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          
          {/* ═══ VIDEO TAB ═══ */}
          {activeTab === 'video' && (
            <div className="video-section">
              
              {/* YouTube Video Player */}
              {selectedVideo && (
                <>
                  <div className="video-player">
                    <iframe
                      width="100%"
                      height="500"
                      src={selectedVideo.embedUrl}
                      title={selectedVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>

                  {/* Video Info */}
                  <div className="video-info">
                    <h3>{selectedVideo.title}</h3>
                    <p>By {selectedVideo.channelTitle}</p>
                    <p>{selectedVideo.duration} • {selectedVideo.viewCount}</p>
                  </div>
                </>
              )}

              {/* Alternative Videos */}
              {currentLesson.videoOptions.length > 1 && (
                <div className="alternative-videos">
                  <h4>Alternative Videos (Choose your preferred one):</h4>
                  <div className="video-options">
                    {currentLesson.videoOptions.map(video => (
                      <div 
                        key={video.videoId}
                        className={`video-option ${
                          video.videoId === currentLesson.selectedVideo ? 'selected' : ''
                        }`}
                        onClick={() => handleSelectVideo(video.videoId)}
                      >
                        <img src={video.thumbnail} alt={video.title} />
                        <div className="video-option-info">
                          <h5>{video.title}</h5>
                          <p>{video.channelTitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lesson Content */}
              <div className="lesson-content">
                <h3>Lesson Overview</h3>
                <p>{currentLesson.content}</p>
              </div>
            </div>
          )}

          {/* ═══ NOTES TAB ═══ */}
          {activeTab === 'notes' && (
            <div className="notes-section">
              <div className="notes-header">
                <h3>Study Notes</h3>
                {currentLesson.notes.pdfUrl && (
                  <a 
                    href={`${import.meta.env.VITE_BASE_URL}${currentLesson.notes.pdfUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-download-pdf"
                  >
                    📄 Download PDF
                  </a>
                )}
              </div>
              
              {/* Display Markdown Notes */}
              <div className="notes-content">
                {currentLesson.notes.markdown.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={index}>{line.slice(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={index}>{line.slice(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={index}>{line.slice(4)}</h3>;
                  } else if (line.startsWith('- ')) {
                    return <li key={index}>{line.slice(2)}</li>;
                  } else if (line.trim() !== '') {
                    return <p key={index}>{line}</p>;
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          {/* ═══ COMPLETE LESSON TAB ═══ */}
          {activeTab === 'complete' && (
            <div className="complete-section">
              {!currentLesson.completed ? (
                <>
                  <h3>Complete This Lesson</h3>
                  <p>Mark this lesson as completed to track your progress.</p>
                  
                  {/* Optional Quiz Score */}
                  <div className="quiz-score-input">
                    <label>Quiz Score (Optional - 0 to 100):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={quizScore}
                      onChange={(e) => setQuizScore(e.target.value)}
                      placeholder="Enter your score if you took a quiz"
                    />
                  </div>
                  
                  {/* Complete Button */}
                  <button 
                    className="btn-complete"
                    onClick={handleCompleteLesson}
                  >
                    ✅ Mark as Complete & Continue
                  </button>
                </>
              ) : (
                <div className="completed-message">
                  <h2>✅ Lesson Completed!</h2>
                  {currentLesson.quizScore && (
                    <p className="quiz-score">Quiz Score: {currentLesson.quizScore}%</p>
                  )}
                  <p>Great job! Ready for the next lesson?</p>
                  {!isLastLesson && (
                    <button 
                      className="btn-complete"
                      onClick={goToNextLesson}
                    >
                      Next Lesson →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══ PAGINATION CONTROLS - BOTTOM ═══ */}
        <div className="pagination-controls pagination-bottom">
          <button 
            className="btn-pagination btn-previous"
            onClick={goToPreviousLesson}
            disabled={isFirstLesson}
          >
            ← Previous Lesson
          </button>
          
          <span className="pagination-info">
            Lesson {lessonNumber} / {totalLessons}
          </span>
          
          <button 
            className="btn-pagination btn-next"
            onClick={goToNextLesson}
            disabled={isLastLesson}
          >
            Next Lesson →
          </button>
        </div>

      </main>
    </div>
  );
};

export default CourseViewer;