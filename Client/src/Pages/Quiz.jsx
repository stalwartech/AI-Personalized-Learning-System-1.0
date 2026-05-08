import {
  ArrowRight,
  CheckCircle2,
  Crown,
  HelpCircle,
  Loader2,
  LockKeyhole,
  RefreshCw,
  Search,
  Trophy,
  XCircle,
} from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import axiosInstance from '../../services/axiosConfig'
import Alert from '../components/Alert'

const getErrorMessage = (error, fallback) => {
  return error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || fallback
}

const Quiz = () => {
  const { courseId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialTopic = searchParams.get('topic') || ''

  const [topic, setTopic] = useState(initialTopic)
  const [quiz, setQuiz] = useState(null)
  const [access, setAccess] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(Boolean(courseId || initialTopic))
  const [error, setError] = useState('')
  const [upgradeRequired, setUpgradeRequired] = useState(false)
  const [history, setHistory] = useState([])
  const [historyStats, setHistoryStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
  })
  const [savingAttempt, setSavingAttempt] = useState(false)

  const loadQuizHistory = async () => {
    try {
      const response = await axiosInstance.get('/api/quizzes/history')
      setHistory(response.data.data.attempts || [])
      setHistoryStats(response.data.data.stats || {
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
      })
    } catch (error) {
      console.log(error)
    }
  }

  const loadCourseQuiz = async () => {
    if (!courseId) return

    try {
      setLoading(true)
      setError('')
      setUpgradeRequired(false)
      setSubmitted(false)
      setAnswers({})

      const response = await axiosInstance.get(`/api/quizzes/course/${courseId}`)
      setQuiz(response.data.data.quiz)
      setAccess(response.data.data.access)
    } catch (error) {
      console.log(error)
      setUpgradeRequired(Boolean(error.response?.data?.upgradeRequired))
      setError(getErrorMessage(error, 'Failed to load quiz'))
    } finally {
      setLoading(false)
    }
  }

  const loadRandomQuiz = async (event) => {
    event?.preventDefault()

    if (!topic.trim()) {
      setError('Enter a topic to generate a random quiz')
      return
    }

    try {
      setLoading(true)
      setError('')
      setUpgradeRequired(false)
      setSubmitted(false)
      setAnswers({})

      const response = await axiosInstance.get('/api/quizzes/random', {
        params: { topic: topic.trim() },
      })
      setQuiz(response.data.data.quiz)
      setAccess(response.data.data.access)
    } catch (error) {
      console.log(error)
      setUpgradeRequired(Boolean(error.response?.data?.upgradeRequired))
      setError(getErrorMessage(error, 'Failed to generate quiz'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuizHistory()

    if (courseId) {
      loadCourseQuiz()
    } else if (initialTopic) {
      loadRandomQuiz()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const score = useMemo(() => {
    if (!quiz) return 0

    return quiz.questions.reduce((total, question, index) => {
      return total + (answers[index] === question.correctAnswer ? 1 : 0)
    }, 0)
  }, [answers, quiz])

  const answeredCount = Object.keys(answers).length
  const canSubmit = quiz && answeredCount === quiz.questions.length

  const submitAnswers = async () => {
    if (!quiz || !canSubmit) return

    try {
      setSavingAttempt(true)
      setError('')

      await axiosInstance.post(`/api/quizzes/${quiz._id}/attempts`, {
        answers,
      })

      setSubmitted(true)
      loadQuizHistory()
    } catch (error) {
      console.log(error)
      setError(getErrorMessage(error, 'Failed to save quiz attempt'))
    } finally {
      setSavingAttempt(false)
    }
  }

  return (
    <main className='min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mx-auto flex max-w-6xl flex-col gap-6'>
        <section className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='text-sm font-semibold text-[#4f46e5]'>Quiz Center</p>
            <h1 className='mt-1 text-2xl font-bold text-slate-950 sm:text-3xl'>
              {courseId ? 'Course completion quiz' : 'Random topic quiz'}
            </h1>
            <p className='mt-2 max-w-2xl text-sm text-slate-500 sm:text-base'>
              Test what you know with AI-generated questions. Free users can access 3 questions per quiz.
            </p>
          </div>

          <button
            type='button'
            onClick={() => navigate('/Premium')}
            className='inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800'
          >
            <Crown size={17} />
            Unlock all questions
          </button>
        </section>

        <Alert
          type={upgradeRequired ? 'info' : 'error'}
          message={error}
          actionLabel={upgradeRequired ? 'View Premium' : undefined}
          onAction={upgradeRequired ? () => navigate('/Premium') : undefined}
          onClose={() => {
            setError('')
            setUpgradeRequired(false)
          }}
        />

        <section className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
          <form onSubmit={loadRandomQuiz} className='grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]'>
            <label className='relative block'>
              <Search className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
              <input
                type='text'
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder='Generate a random quiz by topic, e.g. JavaScript arrays'
                className='h-12 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-100'
              />
            </label>
            <button
              type='submit'
              disabled={loading}
              className='inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-5 text-sm font-bold text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:bg-indigo-300'
            >
              {loading && !courseId ? <Loader2 className='animate-spin' size={18} /> : <RefreshCw size={18} />}
              Random quiz
            </button>
          </form>
        </section>

        {loading && (
          <div className='flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-5 text-slate-600 shadow-sm'>
            <Loader2 className='animate-spin text-[#4f46e5]' size={20} />
            Generating quiz questions...
          </div>
        )}

        {quiz && !loading && (
          <>
            <section className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
              <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                <div>
                  <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>{quiz.source} quiz</p>
                  <h2 className='mt-1 text-xl font-bold text-slate-950'>{quiz.topic}</h2>
                  <p className='mt-2 text-sm text-slate-500'>
                    Showing {quiz.accessibleQuestions} of {quiz.totalQuestions} generated questions.
                  </p>
                </div>
                {access?.upgradeRequired && (
                  <div className='rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800'>
                    <div className='flex items-center gap-2'>
                      <LockKeyhole size={17} />
                      {access.lockedQuestions} questions locked for premium.
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className='grid gap-4'>
              {quiz.questions.map((question, questionIndex) => {
                const selected = answers[questionIndex]
                const isCorrect = selected === question.correctAnswer

                return (
                  <article key={`${question.question}-${questionIndex}`} className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
                    <div className='flex items-start gap-3'>
                      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[#4f46e5]'>
                        <HelpCircle size={19} />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <h3 className='font-bold text-slate-950'>
                          {questionIndex + 1}. {question.question}
                        </h3>
                        <div className='mt-4 grid gap-2'>
                          {question.options.map((option) => {
                            const checked = selected === option
                            const showCorrect = submitted && option === question.correctAnswer
                            const showWrong = submitted && checked && !isCorrect

                            return (
                              <button
                                key={option}
                                type='button'
                                onClick={() => !submitted && setAnswers((current) => ({ ...current, [questionIndex]: option }))}
                                className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${
                                  showCorrect
                                    ? 'border-green-300 bg-green-50 text-green-800'
                                    : showWrong
                                      ? 'border-red-300 bg-red-50 text-red-800'
                                      : checked
                                        ? 'border-[#4f46e5] bg-indigo-50 text-[#4f46e5]'
                                        : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <span>{option}</span>
                                {showCorrect && <CheckCircle2 size={17} />}
                                {showWrong && <XCircle size={17} />}
                              </button>
                            )
                          })}
                        </div>

                        {submitted && (
                          <p className='mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600'>
                            {question.explanation || `Correct answer: ${question.correctAnswer}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>

            <section className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
              {submitted ? (
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-11 w-11 items-center justify-center rounded-lg bg-green-50 text-green-600'>
                      <Trophy size={22} />
                    </div>
                    <div>
                      <p className='text-lg font-bold text-slate-950'>Score: {score}/{quiz.questions.length}</p>
                      <p className='text-sm text-slate-500'>Review the explanations above, then try another quiz.</p>
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      setSubmitted(false)
                      setAnswers({})
                    }}
                    className='inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-[#4f46e5] hover:text-[#4f46e5]'
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                  <p className='text-sm font-semibold text-slate-600'>
                    Answered {answeredCount}/{quiz.questions.length} questions
                  </p>
                  <button
                    type='button'
                    onClick={submitAnswers}
                    disabled={!canSubmit || savingAttempt}
                    className='inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-5 text-sm font-bold text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:bg-indigo-300'
                  >
                    {savingAttempt ? <Loader2 className='animate-spin' size={17} /> : <ArrowRight size={17} />}
                    {savingAttempt ? 'Saving' : 'Submit answers'}
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        <section className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>Performance</p>
              <h2 className='mt-1 text-xl font-bold text-slate-950'>Quiz history</h2>
            </div>
            <div className='grid grid-cols-3 gap-2 text-center sm:min-w-[360px]'>
              <HistoryStat label='Attempts' value={historyStats.totalAttempts} />
              <HistoryStat label='Average' value={`${historyStats.averageScore}%`} />
              <HistoryStat label='Best' value={`${historyStats.bestScore}%`} />
            </div>
          </div>

          <div className='mt-5 grid gap-3'>
            {history.length > 0 ? (
              history.map((attempt) => (
                <article key={attempt._id} className='rounded-lg border border-slate-200 p-4'>
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                      <h3 className='font-bold text-slate-950'>{attempt.topic}</h3>
                      <p className='mt-1 text-sm capitalize text-slate-500'>
                        {attempt.source} quiz • {new Date(attempt.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className='rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-[#4f46e5]'>
                      {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className='rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500'>
                No quiz attempts yet. Submit a quiz to start tracking performance.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

const HistoryStat = ({ label, value }) => (
  <div className='rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'>
    <p className='text-lg font-bold text-slate-950'>{value}</p>
    <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>{label}</p>
  </div>
)

export default Quiz
