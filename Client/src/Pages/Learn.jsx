import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosConfig';
import PopupAlert from '../components/PopupAlert';

const parseInlineMarkdown = (text) => {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-sm text-indigo-700">
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-gray-950">{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} className="italic text-gray-800">{part.slice(1, -1)}</em>;
    }

    return part;
  });
};

const parseMarkdownBlocks = (markdown) => {
  const lines = markdown.split('\n');
  const blocks = [];
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    if (/^---+$/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'divider' });
      return;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      return;
    }

    if (line.startsWith('> ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'quote', text: line.slice(2) });
      return;
    }

    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      if (!list || list.ordered) {
        flushList();
        list = { type: 'list', ordered: false, items: [] };
      }
      list.items.push(bulletMatch[1]);
      return;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      if (!list || !list.ordered) {
        flushList();
        list = { type: 'list', ordered: true, items: [] };
      }
      list.items.push(orderedMatch[1]);
      return;
    }

    flushList();
    paragraph.push(line);
  });

  flushParagraph();
  flushList();

  return blocks;
};

const MarkdownNotes = ({ markdown }) => {
  const blocks = parseMarkdownBlocks(markdown);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="space-y-5">
        {blocks.map((block, index) => {
          if (block.type === 'heading') {
            const headingClasses = {
              1: 'text-3xl font-bold text-slate-950 border-b border-slate-200 pb-3',
              2: 'text-2xl font-bold text-slate-900 mt-8',
              3: 'text-xl font-bold text-slate-900 mt-6',
              4: 'text-lg font-bold text-slate-800 mt-5',
            };
            const Tag = `h${Math.min(block.level, 4)}`;

            return (
              <Tag key={index} className={headingClasses[block.level] || headingClasses[4]}>
                {parseInlineMarkdown(block.text)}
              </Tag>
            );
          }

          if (block.type === 'paragraph') {
            return (
              <p key={index} className="text-base leading-8 text-slate-700">
                {parseInlineMarkdown(block.text)}
              </p>
            );
          }

          if (block.type === 'quote') {
            return (
              <blockquote key={index} className="rounded-lg border-l-4 border-indigo-500 bg-indigo-50 px-4 py-3 text-slate-700">
                {parseInlineMarkdown(block.text)}
              </blockquote>
            );
          }

          if (block.type === 'divider') {
            return <hr key={index} className="border-slate-200" />;
          }

          if (block.type === 'list') {
            const ListTag = block.ordered ? 'ol' : 'ul';

            return (
              <ListTag
                key={index}
                className={`space-y-3 rounded-lg bg-slate-50 p-4 text-slate-700 ${
                  block.ordered ? 'list-decimal pl-8' : 'list-disc pl-8'
                }`}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="leading-7 marker:font-bold marker:text-indigo-600">
                    {parseInlineMarkdown(item)}
                  </li>
                ))}
              </ListTag>
            );
          }

          return null;
        })}
      </div>
    </article>
  );
};

const Learn = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [popupAlert, setPopupAlert] = useState(null);
  
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const lessonStartedAtRef = useRef(Date.now());
  
  const apiURL = import.meta.env.VITE_BASE_URL;

  const showPopupAlert = useCallback((message, variant = 'info', title = 'Notice') => {
    setPopupAlert({ message, variant, title });
  }, []);
  
  const loadCourse = useCallback(async ({ silent = false, preserveLesson = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
        setError('');
        setDebugInfo(null);
      }
      
      // Get token
      const token = localStorage.getItem('token');
      console.log(token)
      
      // Log everything for debugging
      const requestURL = `${apiURL}/api/courses/${courseId}`; // Full request URL
      console.log(requestURL);
      
      console.log('═══════════════════════════════════════════');
      console.log('📚 LOADING COURSE - DEBUG INFO');
      console.log('═══════════════════════════════════════════');
      console.log('Course ID from useParams():', courseId);
      console.log('Course ID type:', typeof courseId);
      console.log('Course ID is undefined?', courseId === undefined);
      console.log('Course ID is "undefined" string?', courseId === 'undefined');
      console.log('API URL:', apiURL);
      console.log('Full Request URL:', requestURL); // Full request URL
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      console.log('═══════════════════════════════════════════');

      // Store debug info in state so we can show it if needed
      setDebugInfo({
        courseId,
        apiURL,
        requestURL,
        hasToken: !!token
      });
      
      // CRITICAL CHECK: Stop if courseId is undefined
      if (!courseId || courseId === 'undefined') {
        throw new Error(`Invalid course ID: "${courseId}". Check your App.jsx route configuration!`);
      }

      // Make request
      const response = await axiosInstance.get(`/api/courses/${courseId}`);
      
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
      if (!preserveLesson) {
        setCurrentLessonIndex(0);
      }
      
      console.log('✅ Course loaded successfully!');
      console.log('   Title:', courseData.title);
      console.log('   Total lessons:', courseData.lessons.length);
      console.log('   First lesson:', courseData.lessons[0]?.title);
      
    } catch (error) {
      if (silent) {
        console.error('Silent course refresh failed:', error);
        return;
      }

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
      if (!silent) {
        setLoading(false);
      }
    }
  }, [apiURL, courseId, navigate]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  useEffect(() => {
    if (!course) return undefined;

    const hasGeneratingLessons = course.generationStatus === 'generating'
      || course.lessons?.some((lesson) => ['pending', 'generating'].includes(lesson.generationStatus));

    if (!hasGeneratingLessons) return undefined;

    const intervalId = window.setInterval(() => {
      loadCourse({ silent: true, preserveLesson: true });
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [course, loadCourse]);

  useEffect(() => {
    lessonStartedAtRef.current = Date.now();
  }, [currentLessonIndex]);

  const getCurrentLessonTimeSpent = () => {
    const elapsedMinutes = (Date.now() - lessonStartedAtRef.current) / 60000;
    return Math.max(0.01, Number(elapsedMinutes.toFixed(2)));
  };
  
  const isLessonReady = (lesson) => {
    return !lesson.generationStatus || lesson.generationStatus === 'ready';
  };

  const canOpenLesson = (index) => {
    const lesson = course.lessons[index];
    return isLessonReady(lesson) && (index === 0 || lesson?.completed || course.lessons[index - 1]?.completed);
  };

  const goToNextLesson = () => {
    if (!course.lessons[currentLessonIndex]?.completed) {
      showPopupAlert('Complete this lesson first so your course progress can be updated.', 'warning');
      return;
    }

    if (currentLessonIndex < course.lessons.length - 1) {
      const nextLesson = course.lessons[currentLessonIndex + 1];

      if (!isLessonReady(nextLesson)) {
        showPopupAlert('The next lesson is still being generated. It will appear here shortly.', 'info');
        return;
      }

      setCurrentLessonIndex(currentLessonIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showPopupAlert('You are on the last lesson!', 'success', 'Last Lesson');
    }
  };
  
  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showPopupAlert('You are on the first lesson!', 'info', 'First Lesson');
    }
  };
  
  const jumpToLesson = (index) => {
    if (!canOpenLesson(index)) {
      showPopupAlert('Complete the previous lesson before opening this one.', 'warning');
      return;
    }

    setCurrentLessonIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeCurrentLesson = async () => {
    try {
      const currentLesson = course.lessons[currentLessonIndex];

      if (!isLessonReady(currentLesson)) {
        showPopupAlert('This lesson is still being generated. Please wait a moment.', 'info');
        return;
      }

      if (!currentLesson || currentLesson.completed) {
        goToNextLesson();
        return;
      }

      setCompletingLesson(true);

      const response = await axiosInstance.put(
        `/api/courses/${courseId}/lessons/${currentLesson._id}/complete`,
        {
          timeSpent: getCurrentLessonTimeSpent(),
        }
      );

      const updatedLesson = response.data.data.lesson;
      const courseProgress = response.data.data.courseProgress;

      setCourse((previousCourse) => {
        const updatedLessons = previousCourse.lessons.map((lesson) => {
          return lesson._id === updatedLesson._id ? { ...lesson, ...updatedLesson } : lesson;
        });

        return {
          ...previousCourse,
          lessons: updatedLessons,
          progress: courseProgress,
          status: courseProgress?.percentage === 100 ? 'completed' : previousCourse.status,
        };
      });

      if (currentLessonIndex === course.lessons.length - 1) {
        navigate(`/Quiz/${courseId}`);
      } else {
        const nextLesson = course.lessons[currentLessonIndex + 1];

        if (isLessonReady(nextLesson)) {
          setCurrentLessonIndex(currentLessonIndex + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          showPopupAlert('Nice work. The next lesson is still being generated and will unlock shortly.', 'success', 'Lesson Complete');
        }
      }
    } catch (error) {
      console.error('Lesson completion failed:', error);
      const validationError = error.response?.data?.errors?.[0]?.msg;
      const serverError = error.response?.data?.error;
      const message = validationError || serverError || error.response?.data?.message || 'Failed to complete lesson';

      showPopupAlert(message, 'error', 'Lesson Error');
    } finally {
      setCompletingLesson(false);
    }
  };

  const downloadPdf = async (pdfUrl) => {
    try {
      setDownloadingPdf(true);

      const response = await axiosInstance.get(pdfUrl, {
        responseType: 'blob',
      });

      const filename = pdfUrl.split('/').pop() || 'lesson-notes.pdf';
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');

      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('PDF download failed:', error);
      showPopupAlert(error.response?.data?.message || 'Failed to download PDF', 'error', 'Download Error');
    } finally {
      setDownloadingPdf(false);
    }
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
              onClick={() => navigate('/')}
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
  const isCurrentLessonCompleted = currentLesson.completed === true;
  const isCurrentLessonReady = isLessonReady(currentLesson);
  const generatingLessonsCount = course.lessons.filter((lesson) => ['pending', 'generating'].includes(lesson.generationStatus)).length;
  const courseProgress = course.progress?.percentage || 0;
  const completedLessons = course.progress?.completedLessons || course.lessons.filter((lesson) => lesson.completed).length;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">
      <PopupAlert
        open={Boolean(popupAlert)}
        title={popupAlert?.title}
        message={popupAlert?.message}
        variant={popupAlert?.variant}
        onClose={() => setPopupAlert(null)}
      />
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={() => navigate('/')}
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
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
              {completedLessons}/{totalLessons} Complete
            </span>
            {generatingLessonsCount > 0 && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                {generatingLessonsCount} Generating
              </span>
            )}
          </div>
          <div className="mt-5">
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${courseProgress}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-medium text-gray-600">{courseProgress}% course progress</p>
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
                {course.lessons.map((lesson, index) => {
                  const unlocked = canOpenLesson(index);
                  const lessonReady = isLessonReady(lesson);

                  return (
                    <div
                      key={lesson._id || index}
                      onClick={() => jumpToLesson(index)}
                      className={`
                        p-3 rounded-lg transition-all
                        ${index === currentLessonIndex 
                          ? 'bg-indigo-600 text-white shadow-md transform scale-105' 
                          : unlocked
                            ? 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow cursor-pointer'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70'
                        }
                      `}
                    >
                    <div className="flex items-start gap-3">
                      <span className="font-bold shrink-0 text-lg">
                        {lesson.completed ? '✓' : unlocked ? index + 1 : '🔒'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight">
                          {lesson.title}
                        </p>
                        <p className={`text-xs mt-1 ${
                          index === currentLessonIndex ? 'text-indigo-200' : 'text-gray-500'
                        }`}>
                          {!lessonReady ? 'Generating...' : lesson.completed ? 'Completed' : `${lesson.estimatedDuration || 15} min`}
                        </p>
                      </div>
                    </div>
                    </div>
                  );
                })}
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
                <span className={`inline-flex mt-3 px-3 py-1 rounded-full text-sm font-semibold ${
                  !isCurrentLessonReady
                    ? 'bg-yellow-100 text-yellow-800'
                    : isCurrentLessonCompleted
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {!isCurrentLessonReady ? 'Generating lesson...' : isCurrentLessonCompleted ? '✓ Completed' : 'Not completed yet'}
                </span>
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
                  disabled={isLastLesson || !isCurrentLessonCompleted}
                  className={`
                    px-5 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2
                    ${isLastLesson || !isCurrentLessonCompleted
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    }
                  `}
                >
                  Next →
                </button>
              </div>
              
              {/* VIDEO SECTION */}
              {!isCurrentLessonReady ? (
                <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-yellow-800 font-medium">This lesson video is being prepared in the background.</p>
                </div>
              ) : selectedVideo ? (
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
              {!isCurrentLessonReady ? (
                <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-yellow-800 font-medium">Study notes are still generating. This page will refresh automatically.</p>
                </div>
              ) : currentLesson.notes && currentLesson.notes.markdown ? (
                <div className="mb-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Markdown notes</p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Study Notes
                      </h3>
                    </div>
                    
                    {currentLesson.notes.pdfUrl && (
                      <button
                        type="button"
                        onClick={() => downloadPdf(currentLesson.notes.pdfUrl)}
                        disabled={downloadingPdf}
                        className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        {downloadingPdf ? 'Downloading...' : '📄 Download PDF'}
                      </button>
                    )}
                  </div>
                  
                  <MarkdownNotes markdown={currentLesson.notes.markdown} />
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

              {/* COMPLETE LESSON */}
              <div className={`rounded-xl border p-6 ${
                isCurrentLessonCompleted
                  ? 'bg-green-50 border-green-200'
                  : 'bg-indigo-50 border-indigo-200'
              }`}>
                <h3 className={`text-2xl font-bold mb-2 ${
                  isCurrentLessonCompleted ? 'text-green-900' : 'text-indigo-900'
                }`}>
                  {isCurrentLessonCompleted ? '✓ Lesson Completed' : 'Complete This Lesson'}
                </h3>
                <p className={isCurrentLessonCompleted ? 'text-green-700' : 'text-indigo-700'}>
                  {isCurrentLessonCompleted
                    ? 'Your progress has been saved. You can move to the next lesson.'
                    : 'Mark this lesson as complete to update your course progress and unlock the next lesson.'}
                </p>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  {!isCurrentLessonCompleted && (
                    <button
                      type="button"
                      onClick={completeCurrentLesson}
                      disabled={completingLesson || !isCurrentLessonReady}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                      {!isCurrentLessonReady ? 'Generating...' : completingLesson ? 'Saving Progress...' : isLastLesson ? 'Complete Course' : 'Complete & Continue'}
                    </button>
                  )}

                  {isCurrentLessonCompleted && !isLastLesson && (
                    <button
                      type="button"
                      onClick={goToNextLesson}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      Next Lesson →
                    </button>
                  )}

                  {isCurrentLessonCompleted && isLastLesson && (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate(`/Quiz/${courseId}`)}
                        className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        Take Course Quiz
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        Back to Dashboard
                      </button>
                    </>
                  )}
                </div>
              </div>
              
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
                  disabled={isLastLesson || !isCurrentLessonCompleted}
                  className={`
                    px-6 py-3 rounded-lg font-semibold transition-all
                    ${isLastLesson || !isCurrentLessonCompleted
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
