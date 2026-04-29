import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  GraduationCap,
  Loader2,
  PlayCircle,
  Search,
  Trash2,
} from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../services/axiosConfig'

const filters = [
  { label: 'All', value: '' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Abandoned', value: 'abandoned' },
]

const History = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [activeFilter, setActiveFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const formatDate = (date) => {
    if (!date) return 'Recently'

    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  }

  const getCourses = async (status = '') => {
    try {
      setLoading(true)
      setError('')

      const allCourses = []
      const limit = 50
      let skip = 0
      let hasMore = true

      while (hasMore) {
        const response = await axiosInstance.get('/api/courses/history', {
          params: {
            limit,
            skip,
            ...(status ? { status } : {}),
          },
        })

        const pageCourses = response.data.data.courses || []
        const pagination = response.data.data.pagination

        allCourses.push(...pageCourses)
        hasMore = Boolean(pagination?.hasMore)
        skip += limit
      }

      setCourses(allCourses)
    } catch (error) {
      console.log(error)
      setError(error.response?.data?.message || 'Failed to load course history')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCourses(activeFilter)
  }, [activeFilter])

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) return courses

    return courses.filter((course) => {
      return [
        course.title,
        course.description,
        course.searchQuery,
        course.category,
        course.difficulty,
      ].some((value) => value?.toLowerCase().includes(normalizedSearch))
    })
  }, [courses, searchTerm])

  const courseStats = useMemo(() => {
    return {
      total: courses.length,
      completed: courses.filter((course) => course.status === 'completed').length,
      inProgress: courses.filter((course) => course.status === 'in-progress').length,
    }
  }, [courses])

  return (
    <main className='min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mx-auto flex max-w-7xl flex-col gap-6'>
        <section className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='text-sm font-semibold text-[#4f46e5]'>Course library</p>
            <h1 className='mt-1 text-2xl font-bold text-slate-950 sm:text-3xl'>My Courses</h1>
            <p className='mt-2 max-w-2xl text-sm text-slate-500 sm:text-base'>
              Browse every generated course, continue learning, and track completion from one place.
            </p>
          </div>

          <div className='grid grid-cols-3 gap-2 sm:min-w-[360px]'>
            <MiniStat label='Total' value={courseStats.total} />
            <MiniStat label='Active' value={courseStats.inProgress} />
            <MiniStat label='Done' value={courseStats.completed} />
          </div>
        </section>

        <section className='rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5'>
          <div className='flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
            <label className='relative block w-full xl:max-w-md'>
              <Search className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
              <input
                type='search'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Search courses, topics, categories...'
                className='h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-100'
              />
            </label>

            <div className='flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0'>
              <div className='hidden items-center gap-2 pr-1 text-sm font-semibold text-slate-500 sm:flex'>
                <Filter size={17} />
                Filter
              </div>
              {filters.map((filter) => (
                <button
                  key={filter.label}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    activeFilter === filter.value
                      ? 'bg-[#4f46e5] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading && (
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className='h-64 animate-pulse rounded-lg border border-slate-200 bg-white' />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className='rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700'>
            {error}
          </div>
        )}

        {!loading && !error && filteredCourses.length === 0 && (
          <div className='rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center'>
            <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-[#4f46e5]'>
              <GraduationCap size={24} />
            </div>
            <h2 className='mt-4 text-lg font-bold text-slate-950'>No courses found</h2>
            <p className='mt-2 text-sm text-slate-500'>
              {searchTerm ? 'Try a different search term or clear your filter.' : 'Generated courses will appear here.'}
            </p>
          </div>
        )}

        {!loading && !error && filteredCourses.length > 0 && (
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {filteredCourses.map((course) => {
              const progress = course.progress?.percentage || 0
              const totalLessons = course.progress?.totalLessons || course.lessons?.length || 0
              const completedLessons = course.progress?.completedLessons || course.lessons?.filter((lesson) => lesson.completed).length || 0

              return (
                <article
                  key={course._id}
                  className='flex min-h-[280px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#4f46e5] hover:shadow-md'
                >
                  <div className='border-b border-slate-100 bg-slate-950 p-5 text-white'>
                    <div className='flex items-start justify-between gap-3'>
                      <span className='rounded-full bg-white/10 px-3 py-1 text-xs font-bold capitalize text-indigo-100'>
                        {course.status?.replace('-', ' ') || 'course'}
                      </span>
                      <span className='rounded-full bg-[#4f46e5] px-3 py-1 text-xs font-bold capitalize'>
                        {course.difficulty}
                      </span>
                    </div>
                    <h2 className='mt-4 line-clamp-2 text-xl font-bold'>{course.title}</h2>
                    <p className='mt-2 line-clamp-2 text-sm text-slate-300'>
                      {course.description || course.searchQuery || 'AI-generated learning path'}
                    </p>
                  </div>

                  <div className='flex flex-1 flex-col p-5'>
                    <div className='grid grid-cols-2 gap-3 text-sm'>
                      <InfoPill icon={BookOpen} label={`${totalLessons} lessons`} />
                      <InfoPill icon={CheckCircle2} label={`${completedLessons} complete`} />
                      <InfoPill icon={CalendarDays} label={formatDate(course.createdAt)} />
                      <InfoPill icon={Clock3} label={`${course.analytics?.totalTimeSpent || 0} min`} />
                    </div>

                    <div className='mt-5'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='font-semibold text-slate-700'>Progress</span>
                        <span className='font-bold text-[#4f46e5]'>{progress}%</span>
                      </div>
                      <div className='mt-2 h-3 overflow-hidden rounded-full bg-slate-200'>
                        <div
                          className='h-full rounded-full bg-[#4f46e5] transition-all duration-500'
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className='mt-auto flex gap-3 pt-5'>
                      <button
                        onClick={() => navigate(`/Learn/${course._id}`)}
                        className='inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#4338ca]'
                      >
                        <PlayCircle size={17} />
                        {progress > 0 ? 'Continue' : 'Start'}
                      </button>
                      <button
                        type='button'
                        className='inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                        aria-label={`Delete ${course.title}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

const MiniStat = ({ label, value }) => (
  <div className='rounded-lg border border-slate-200 bg-white px-4 py-3 text-center shadow-sm'>
    <p className='text-xl font-bold text-slate-950'>{value}</p>
    <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>{label}</p>
  </div>
)

const InfoPill = ({ icon: Icon, label }) => (
  <div className='flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-600'>
    <Icon size={16} className='shrink-0 text-slate-400' />
    <span className='truncate'>{label}</span>
  </div>
)

export default History
