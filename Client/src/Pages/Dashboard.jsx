import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  History,
  Layers3,
  Loader2,
  PlayCircle,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../services/axiosConfig'

const difficultyOptions = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
]

const starterTopics = [
  'Learn JavaScript',
  'System design basics',
  'Data analysis with Python',
  'Digital marketing',
]

const suggestedTopics = [
  'Learn JavaScript',
  'React for beginners',
  'Node.js backend development',
  'Python programming fundamentals',
  'Data analysis with Python',
  'Machine learning basics',
  'UI UX design principles',
  'Digital marketing',
  'Product management basics',
  'Cybersecurity fundamentals',
  'Database design with MongoDB',
  'SQL for data analysis',
  'System design basics',
  'Cloud computing with AWS',
  'Git and GitHub workflow',
  'Technical writing',
  'Public speaking',
  'Financial literacy',
  'Project management',
  'Mobile app development',
]

const Dashboard = () => {
  const navigate = useNavigate()

  const [user, setUser] = useState('')
  const [stats, setStats] = useState({
    coursesGenerated: 0,
    coursesInProgress: 0,
    coursesCompleted: 0,
    totalLearningTime: 0,
    averageQuizScore: 0,
    totalLessonsCompleted: 0,
  })
  const [courses, setCourses] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [difficulty, setDifficulty] = useState('beginner')
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const getDashboardData = useCallback(async () => {
    try {
      setLoading(true)

      const [profileResponse, progressResponse, historyResponse] = await Promise.all([
        axiosInstance.get('/api/settings/profile'),
        axiosInstance.get('/api/progress'),
        axiosInstance.get('/api/courses/history', {
          params: { limit: 6, skip: 0 },
        }),
      ])

      setUser(profileResponse.data.data.user.fullName || '')
      setStats(progressResponse.data.data.progress.totalStats)
      setCourses(historyResponse.data.data.courses || [])
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getDashboardData()
  }, [getDashboardData])

  const continueCourse = useMemo(() => {
    return courses.find((course) => course.status === 'in-progress') || courses[0]
  }, [courses])

  const recentSearches = useMemo(() => {
    const uniqueSearches = []

    courses.forEach((course) => {
      if (course.searchQuery && !uniqueSearches.includes(course.searchQuery)) {
        uniqueSearches.push(course.searchQuery)
      }
    })

    return uniqueSearches.slice(0, 4)
  }, [courses])

  const courseSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const combinedSuggestions = [...recentSearches, ...suggestedTopics]
    const uniqueSuggestions = [...new Set(combinedSuggestions)]

    if (!query) {
      return uniqueSuggestions.slice(0, 6)
    }

    return uniqueSuggestions
      .filter((topic) => topic.toLowerCase().includes(query))
      .slice(0, 6)
  }, [recentSearches, searchQuery])

  const selectSuggestion = (topic) => {
    setSearchQuery(topic)
    setShowSuggestions(false)
  }

  const handleGenerateCourse = async (e) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    setError('')
    setGenerating(true)

    try {
      const response = await axiosInstance.post('/api/courses/generate', {
        query: searchQuery.trim(),
        difficulty,
      })

      const newCourse = response.data.data.course
      navigate(`/Learn/${newCourse._id}`)
    } catch (error) {
      let errorMessage = 'Failed to generate course. Please try again.'

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message === 'timeout of 120000ms exceeded') {
        errorMessage = 'Course generation timed out. Please try again.'
      } else if (!error.response) {
        errorMessage = 'Cannot connect to backend. Is the server running?'
      }

      setError(errorMessage)
      console.error('Course generation failed:', error)
    } finally {
      setGenerating(false)
    }
  }

  const firstName = user ? user.split(' ')[0] : 'there'
  const learningHours = Number(((stats.totalLearningTime || 0) / 60).toFixed(1))
  const completionRate = stats.coursesGenerated > 0
    ? Math.round(((stats.coursesCompleted || 0) / stats.coursesGenerated) * 100)
    : 0
  const progressPercentage = continueCourse?.progress?.percentage || 0
  const completedLessons = continueCourse?.progress?.completedLessons || 0
  const totalLessons = continueCourse?.progress?.totalLessons || continueCourse?.lessons?.length || 0

  return (
    <main className='min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mx-auto flex max-w-7xl flex-col gap-6'>
        <section className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <p className='text-sm font-semibold text-[#4f46e5]'>Dashboard</p>
            <h1 className='mt-1 text-2xl font-bold text-slate-950 sm:text-3xl'>What do you want to learn, {firstName}?</h1>
            <p className='mt-2 max-w-2xl text-sm text-slate-500 sm:text-base'>
              Start with a topic. Your course, lessons, videos, study notes, and PDFs will be created for you.
            </p>
          </div>

          <div className='flex flex-col gap-2 sm:flex-row'>
            <button
              onClick={() => navigate('/Progress')}
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#4f46e5] hover:text-[#4f46e5]'
            >
              <BarChart3 size={18} />
              Analytics
            </button>
            <button
              onClick={() => navigate('/History')}
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800'
            >
              <History size={18} />
              My Courses
            </button>
          </div>
        </section>

        <section className='rounded-xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-6 lg:p-8'>
          <div className='grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-center'>
            <div>
              <div className='flex items-center gap-3'>
                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#4f46e5] text-white'>
                  <Sparkles size={24} />
                </div>
                <div>
                  <p className='text-sm font-semibold uppercase tracking-wide text-[#4f46e5]'>Main feature</p>
                  <h2 className='text-xl font-bold text-slate-950 sm:text-2xl'>Create a personalized course</h2>
                </div>
              </div>

              <p className='mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base'>
                Type any topic, choose a level, and jump straight into your generated course when it is ready.
              </p>

              <form onSubmit={handleGenerateCourse} className='mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_170px]'>
                <label className='relative block'>
                  <Search className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={20} />
                  <input
                    type='text'
                    value={searchQuery}
                    placeholder='e.g. Learn backend development with Node.js'
                    className='h-14 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-100'
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                    disabled={generating}
                    autoFocus
                    required
                  />
                  {showSuggestions && courseSuggestions.length > 0 && (
                    <div className='absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl'>
                      <div className='border-b border-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-400'>
                        Suggestions
                      </div>
                      <div className='max-h-72 overflow-y-auto p-2'>
                        {courseSuggestions.map((topic) => (
                          <button
                            key={topic}
                            type='button'
                            onMouseDown={(event) => {
                              event.preventDefault()
                              selectSuggestion(topic)
                            }}
                            className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-[#4f46e5]'
                          >
                            <Search size={16} className='shrink-0 text-slate-400' />
                            <span className='min-w-0 truncate'>{topic}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </label>

                <select
                  className='h-14 rounded-lg border border-slate-300 bg-white px-3 font-semibold text-slate-700 outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-100'
                  onChange={(e) => setDifficulty(e.target.value)}
                  value={difficulty}
                  disabled={generating}
                  aria-label='Course difficulty'
                >
                  {difficultyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  type='submit'
                  className='inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-5 text-base font-bold text-white shadow-sm transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:bg-indigo-300'
                  disabled={generating}
                >
                  {generating ? <Loader2 className='animate-spin' size={20} /> : <Plus size={20} />}
                  {generating ? 'Creating' : 'Create course'}
                </button>
              </form>

              <div className='mt-4 flex flex-wrap gap-2'>
                {starterTopics.map((topic) => (
                  <button
                    key={topic}
                    type='button'
                    onClick={() => selectSuggestion(topic)}
                    disabled={generating}
                    className='rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-[#4f46e5] hover:bg-indigo-50 hover:text-[#4f46e5] disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {topic}
                  </button>
                ))}
              </div>

              {error && (
                <div className='mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700'>
                  {error}
                </div>
              )}

              {generating && (
                <div className='mt-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3'>
                  <p className='text-sm font-semibold text-indigo-800'>Creating your course...</p>
                  <p className='mt-1 text-sm text-indigo-700'>This can take about a minute while lessons, videos, notes, and PDFs are prepared.</p>
                </div>
              )}
            </div>

            <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
              <p className='text-sm font-bold text-slate-950'>What you get</p>
              <div className='mt-4 grid gap-3'>
                <FeatureLine icon={BookOpen} text='Structured lesson path' />
                <FeatureLine icon={PlayCircle} text='Video resources' />
                <FeatureLine icon={Sparkles} text='Markdown notes and PDFs' />
                <FeatureLine icon={TrendingUp} text='Progress tracking' />
              </div>
            </div>
          </div>
        </section>

        <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <MetricCard icon={Layers3} label='Courses' value={stats.coursesGenerated || 0} detail={`${stats.coursesInProgress || 0} in progress`} />
          <MetricCard icon={CheckCircle2} label='Completion' value={`${completionRate}%`} detail={`${stats.coursesCompleted || 0} completed`} />
          <MetricCard icon={Clock3} label='Learning time' value={`${learningHours}h`} detail='Total tracked time' />
          <MetricCard icon={Target} label='Quiz average' value={`${stats.averageQuizScore || 0}%`} detail={`${stats.totalLessonsCompleted || 0} lessons completed`} />
        </section>

        <section className='grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]'>
          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>Current course</p>
                <h2 className='mt-1 line-clamp-2 text-xl font-bold text-slate-950'>
                  {continueCourse ? continueCourse.title : 'No active course'}
                </h2>
              </div>
              {continueCourse && (
                <span className='rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold capitalize text-[#4f46e5]'>
                  {continueCourse.difficulty}
                </span>
              )}
            </div>

            {loading ? (
              <div className='mt-6 h-36 animate-pulse rounded-lg bg-slate-100' />
            ) : continueCourse ? (
              <div className='mt-6'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='font-medium text-slate-500'>Course progress</span>
                  <span className='font-bold text-slate-950'>{progressPercentage}%</span>
                </div>
                <div className='mt-2 h-3 overflow-hidden rounded-full bg-slate-200'>
                  <div
                    className='h-full rounded-full bg-[#4f46e5] transition-all duration-500'
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className='mt-3 text-sm text-slate-500'>
                  {completedLessons} of {totalLessons} lessons complete
                </p>
                <button
                  onClick={() => navigate(`/Learn/${continueCourse._id}`)}
                  className='mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800'
                >
                  <PlayCircle size={18} />
                  Continue learning
                </button>
              </div>
            ) : (
              <div className='mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500'>
                Generate your first course to start tracking progress.
              </div>
            )}
          </div>
        </section>

        <section className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]'>
          <DashboardPanel
            title='Recent courses'
            subtitle='Continue or review your latest generated courses.'
            actionLabel='View all'
            onAction={() => navigate('/History')}
          >
            <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className='h-40 animate-pulse rounded-lg bg-slate-100' />
                ))
              ) : courses.length > 0 ? (
                courses.slice(0, 3).map((course) => (
                  <button
                    key={course._id}
                    onClick={() => navigate(`/Learn/${course._id}`)}
                    className='rounded-lg border border-slate-200 p-4 text-left transition hover:border-[#4f46e5] hover:shadow-sm'
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <h3 className='line-clamp-2 font-bold text-slate-950'>{course.title}</h3>
                      <span className='rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-600'>
                        {course.status?.replace('-', ' ')}
                      </span>
                    </div>
                    <p className='mt-2 text-sm capitalize text-slate-500'>{course.difficulty}</p>
                    <div className='mt-4 h-2 overflow-hidden rounded-full bg-slate-200'>
                      <div
                        className='h-full rounded-full bg-[#4f46e5]'
                        style={{ width: `${course.progress?.percentage || 0}%` }}
                      />
                    </div>
                    <p className='mt-2 text-sm font-medium text-slate-500'>{course.progress?.percentage || 0}% complete</p>
                  </button>
                ))
              ) : (
                <div className='rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500 md:col-span-2 xl:col-span-3'>
                  Your generated courses will appear here.
                </div>
              )}
            </div>
          </DashboardPanel>

          <DashboardPanel title='Recent topics' subtitle='Quickly reuse recent course prompts.'>
            <div className='mt-4 flex flex-col gap-2'>
              {loading ? (
                <>
                  <div className='h-11 animate-pulse rounded-lg bg-slate-100' />
                  <div className='h-11 animate-pulse rounded-lg bg-slate-100' />
                  <div className='h-11 animate-pulse rounded-lg bg-slate-100' />
                </>
              ) : recentSearches.length > 0 ? (
                recentSearches.map((query) => (
                  <button
                    key={query}
                    onClick={() => setSearchQuery(query)}
                    className='flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:border-[#4f46e5] hover:bg-indigo-50 hover:text-[#4f46e5]'
                  >
                    <span className='min-w-0 truncate'>{query}</span>
                    <ArrowRight size={16} className='shrink-0' />
                  </button>
                ))
              ) : (
                <p className='rounded-lg bg-slate-50 p-4 text-sm text-slate-500'>No recent topics yet.</p>
              )}
            </div>
          </DashboardPanel>
        </section>
      </div>
    </main>
  )
}

const MetricCard = ({ icon: Icon, label, value, detail }) => (
  <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
    <div className='flex items-center justify-between gap-3'>
      <div>
        <p className='text-sm font-medium text-slate-500'>{label}</p>
        <p className='mt-2 text-3xl font-bold text-slate-950'>{value}</p>
      </div>
      <div className='flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-[#4f46e5]'>
        <Icon size={22} />
      </div>
    </div>
    <p className='mt-4 text-sm text-slate-500'>{detail}</p>
  </div>
)

const FeatureLine = ({ icon: Icon, text }) => (
  <div className='flex items-center gap-3 rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-slate-700'>
    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-[#4f46e5]'>
      <Icon size={17} />
    </div>
    {text}
  </div>
)

const DashboardPanel = ({ title, subtitle, actionLabel, onAction, children }) => (
  <section className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
    <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
      <div>
        <h2 className='text-lg font-bold text-slate-950'>{title}</h2>
        <p className='mt-1 text-sm text-slate-500'>{subtitle}</p>
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          className='inline-flex items-center gap-2 text-sm font-bold text-[#4f46e5] hover:text-[#4338ca]'
        >
          {actionLabel}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
    {children}
  </section>
)

export default Dashboard
