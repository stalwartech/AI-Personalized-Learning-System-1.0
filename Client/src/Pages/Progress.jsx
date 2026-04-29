import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  Loader2,
  Target,
  TrendingUp,
} from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import axiosInstance from '../../services/axiosConfig'

const Progress = () => {
  const [progress, setProgress] = useState(null)
  const [weeklyActivity, setWeeklyActivity] = useState([])
  const [topicsMastery, setTopicsMastery] = useState([])
  const [performanceTrends, setPerformanceTrends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProgressData = async () => {
      try {
        setLoading(true)
        setError('')

        const [progressResponse, weeklyResponse, topicsResponse, trendsResponse] = await Promise.all([
          axiosInstance.get('/api/progress'),
          axiosInstance.get('/api/progress/weekly-activity'),
          axiosInstance.get('/api/progress/topics-mastery'),
          axiosInstance.get('/api/progress/performance-trends'),
        ])

        setProgress(progressResponse.data.data.progress)
        setWeeklyActivity(weeklyResponse.data.data.weeklyActivity || [])
        setTopicsMastery(topicsResponse.data.data.topicsMastery || [])
        setPerformanceTrends(trendsResponse.data.data.trends || [])
      } catch (error) {
        console.log(error)
        setError(error.response?.data?.message || 'Failed to load progress analytics')
      } finally {
        setLoading(false)
      }
    }

    loadProgressData()
  }, [])

  const stats = progress?.totalStats || {}
  const velocity = progress?.learningVelocity || {}
  const weakAreas = progress?.weakAreas || []

  const learningHours = Number(((stats.totalLearningTime || 0) / 60).toFixed(1))
  const completionRate = stats.coursesGenerated > 0
    ? Math.round(((stats.coursesCompleted || 0) / stats.coursesGenerated) * 100)
    : 0

  const topMastery = useMemo(() => topicsMastery.slice(0, 5), [topicsMastery])
  const maxWeeklyHours = Math.max(...weeklyActivity.map((day) => day.hours), 1)
  const chartPoints = buildLinePoints(performanceTrends)

  if (loading) {
    return (
      <main className='min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8'>
        <div className='mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center'>
          <div className='flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm'>
            <Loader2 className='animate-spin text-[#4f46e5]' size={22} />
            Loading progress analytics...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className='min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mx-auto flex max-w-7xl flex-col gap-6'>
        <section className='flex flex-col gap-2'>
          <p className='text-sm font-semibold text-[#4f46e5]'>Learning analytics</p>
          <h1 className='text-2xl font-bold text-slate-950 sm:text-3xl'>Your Progress</h1>
          <p className='max-w-2xl text-sm text-slate-500 sm:text-base'>
            See your learning time, completion pace, course mastery, and areas that need review.
          </p>
        </section>

        {error && (
          <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700'>
            {error}
          </div>
        )}

        <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <MetricCard icon={Clock3} label='Learning time' value={`${learningHours}h`} detail='Total time spent learning' />
          <MetricCard icon={Target} label='Average quiz score' value={`${stats.averageQuizScore || 0}%`} detail='Across completed quizzes' />
          <MetricCard icon={CheckCircle2} label='Completion rate' value={`${completionRate}%`} detail={`${stats.coursesCompleted || 0}/${stats.coursesGenerated || 0} courses completed`} />
          <MetricCard icon={BookOpenCheck} label='Lessons completed' value={stats.totalLessonsCompleted || 0} detail={`${stats.coursesInProgress || 0} courses in progress`} />
        </section>

        <section className='grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]'>
          <Panel title='Weekly Activity' subtitle='Hours studied and lessons completed over your latest active days.' icon={BarChart3}>
            {weeklyActivity.length > 0 ? (
              <div className='mt-6 flex h-72 items-end gap-3 overflow-x-auto pb-2'>
                {weeklyActivity.map((day) => {
                  const barHeight = Math.max((day.hours / maxWeeklyHours) * 100, day.hours > 0 ? 8 : 2)

                  return (
                    <div key={`${day.date}-${day.day}`} className='flex min-w-14 flex-1 flex-col items-center gap-3'>
                      <div className='flex h-52 w-full items-end rounded-lg bg-slate-100 p-2'>
                        <div
                          className='w-full rounded-md bg-[#4f46e5] transition-all duration-500'
                          style={{ height: `${barHeight}%` }}
                          title={`${day.hours}h, ${day.lessonsCompleted} lessons`}
                        />
                      </div>
                      <div className='text-center'>
                        <p className='text-sm font-bold text-slate-800'>{day.day}</p>
                        <p className='text-xs text-slate-500'>{day.hours}h</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState text='Complete a lesson to start building your weekly activity chart.' />
            )}
          </Panel>

          <Panel title='Learning Velocity' subtitle='Your current weekly rhythm.' icon={Flame}>
            <div className='mt-5 grid gap-3'>
              <VelocityRow label='Lessons per day' value={velocity.lessonsPerDay || 0} />
              <VelocityRow label='Active days this week' value={velocity.activeDaysPerWeek || 0} />
              <VelocityRow label='Average session' value={`${velocity.avgSessionLength || 0} min`} />
            </div>
            <div className='mt-5 rounded-lg bg-indigo-50 p-4 text-sm text-indigo-800'>
              {velocity.activeDaysPerWeek > 0
                ? `You studied on ${velocity.activeDaysPerWeek} day${velocity.activeDaysPerWeek === 1 ? '' : 's'} recently. Keep the rhythm steady.`
                : 'Complete a lesson to start tracking your learning rhythm.'}
            </div>
          </Panel>
        </section>

        <section className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]'>
          <Panel title='Quiz Performance Trend' subtitle='Average quiz scores by week.' icon={TrendingUp}>
            {performanceTrends.length > 0 ? (
              <div className='mt-6'>
                <div className='relative h-64 rounded-lg bg-slate-100 p-4'>
                  <svg viewBox='0 0 100 100' preserveAspectRatio='none' className='h-full w-full overflow-visible'>
                    <polyline
                      points={chartPoints}
                      fill='none'
                      stroke='#4f46e5'
                      strokeWidth='3'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    {performanceTrends.map((item, index) => {
                      const x = performanceTrends.length === 1 ? 50 : (index / (performanceTrends.length - 1)) * 100
                      const y = 100 - (item.averageScore || 0)

                      return <circle key={item.week} cx={x} cy={y} r='2.4' fill='#4f46e5' />
                    })}
                  </svg>
                </div>
                <div className='mt-3 flex justify-between gap-2 text-xs text-slate-500'>
                  {performanceTrends.map((item) => (
                    <span key={item.week}>{formatShortDate(item.week)}</span>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState text='Quiz score trends will appear after you complete lessons with quiz scores.' />
            )}
          </Panel>

          <Panel title='Review Focus' subtitle='Topics where quiz scores need attention.' icon={AlertTriangle}>
            <div className='mt-5 flex flex-col gap-3'>
              {weakAreas.length > 0 ? (
                weakAreas.slice(0, 5).map((area) => (
                  <div key={`${area.topic}-${area.score}`} className='rounded-lg border border-amber-200 bg-amber-50 p-4'>
                    <div className='flex items-center justify-between gap-3'>
                      <p className='font-bold text-amber-950'>{area.topic}</p>
                      <span className='rounded-full bg-white px-2 py-1 text-sm font-bold text-amber-700'>{area.score}%</span>
                    </div>
                    <p className='mt-1 text-sm text-amber-700'>Review recommended</p>
                  </div>
                ))
              ) : (
                <EmptyState text='No weak areas yet. Scores below 75% will show here for review.' />
              )}
            </div>
          </Panel>
        </section>

        <Panel title='Course Mastery' subtitle='Progress across your generated courses.' icon={GraduationCap}>
          {topMastery.length > 0 ? (
            <div className='mt-5 grid gap-3'>
              {topMastery.map((course) => (
                <div key={course.courseId} className='rounded-lg border border-slate-200 p-4'>
                  <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                      <h3 className='font-bold text-slate-950'>{course.title}</h3>
                      <p className='mt-1 text-sm capitalize text-slate-500'>{course.difficulty} • {course.status?.replace('-', ' ')}</p>
                    </div>
                    <span className='w-fit rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-[#4f46e5]'>
                      {course.progressPercentage}%
                    </span>
                  </div>
                  <div className='mt-4 h-3 overflow-hidden rounded-full bg-slate-200'>
                    <div
                      className='h-full rounded-full bg-[#4f46e5] transition-all duration-500'
                      style={{ width: `${course.progressPercentage}%` }}
                    />
                  </div>
                  <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500'>
                    <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                    <span>Quiz: {course.averageQuizScore === null ? 'No score yet' : `${course.averageQuizScore}%`}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text='Generate and complete courses to see mastery progress here.' />
          )}
        </Panel>
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
      <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-[#4f46e5]'>
        <Icon size={23} />
      </div>
    </div>
    <p className='mt-4 text-sm text-slate-500'>{detail}</p>
  </div>
)

const Panel = ({ title, subtitle, icon: Icon, children }) => (
  <section className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
    <div className='flex items-start gap-3'>
      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700'>
        <Icon size={20} />
      </div>
      <div>
        <h2 className='text-lg font-bold text-slate-950'>{title}</h2>
        <p className='mt-1 text-sm text-slate-500'>{subtitle}</p>
      </div>
    </div>
    {children}
  </section>
)

const VelocityRow = ({ label, value }) => (
  <div className='flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3'>
    <span className='text-sm font-medium text-slate-500'>{label}</span>
    <span className='font-bold text-slate-950'>{value}</span>
  </div>
)

const EmptyState = ({ text }) => (
  <div className='mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500'>
    {text}
  </div>
)

const buildLinePoints = (trends) => {
  if (trends.length === 0) return ''
  if (trends.length === 1) return `50,${100 - (trends[0].averageScore || 0)}`

  return trends.map((item, index) => {
    const x = (index / (trends.length - 1)) * 100
    const y = 100 - (item.averageScore || 0)
    return `${x},${y}`
  }).join(' ')
}

const formatShortDate = (date) => {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(date))
}

export default Progress
