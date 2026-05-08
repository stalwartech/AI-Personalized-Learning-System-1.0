import {
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Crown,
  FileText,
  Infinity,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const benefits = [
  {
    icon: Infinity,
    title: 'Generate more courses',
    description: 'Move beyond the free course limit and keep building learning paths whenever curiosity hits.',
  },
  {
    icon: BookOpen,
    title: 'Deeper lesson paths',
    description: 'Create richer course libraries for programming, business, exams, hobbies, and career growth.',
  },
  {
    icon: FileText,
    title: 'Notes and PDFs',
    description: 'Keep access to generated study notes and downloadable PDFs for repeated review.',
  },
  {
    icon: TrendingUp,
    title: 'Progress tracking',
    description: 'Track your completion, quiz scores, learning time, and weak areas across more courses.',
  },
]

const included = [
  'Unlimited personalized course generation',
  'Video resources for each lesson',
  'Markdown notes and PDF study material',
  'Learning analytics and progress history',
  'Priority access to future learning features',
]

const Premium = () => {
  const navigate = useNavigate()

  return (
    <main className='min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mx-auto flex max-w-6xl flex-col gap-6'>
        <section className='overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-sm'>
          <div className='grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8'>
            <div>
              <div className='inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-[#4f46e5]'>
                <Crown size={16} />
                Premium
              </div>
              <h1 className='mt-4 max-w-3xl text-3xl font-bold text-slate-950 sm:text-4xl'>
                Keep generating courses without the free limit.
              </h1>
              <p className='mt-4 max-w-2xl text-base leading-7 text-slate-500'>
                Premium is for learners who want to build a larger personal course library, explore more topics, and keep all learning material organized in one place.
              </p>

              <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
                <button
                  type='button'
                  className='inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-5 text-sm font-bold text-white transition hover:bg-[#4338ca]'
                >
                  <Zap size={18} />
                  Upgrade now
                </button>
                <button
                  type='button'
                  onClick={() => navigate('/')}
                  className='inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-[#4f46e5] hover:text-[#4f46e5]'
                >
                  Back to dashboard
                </button>
              </div>
            </div>

            <aside className='rounded-lg border border-slate-200 bg-slate-50 p-5'>
              <div className='flex items-center gap-3'>
                <div className='flex h-11 w-11 items-center justify-center rounded-lg bg-[#4f46e5] text-white'>
                  <Sparkles size={22} />
                </div>
                <div>
                  <p className='text-sm font-semibold text-slate-500'>Premium plan</p>
                  <p className='text-2xl font-bold text-slate-950'>Upgrade access</p>
                </div>
              </div>

              <div className='mt-5 grid gap-3'>
                {included.map((item) => (
                  <div key={item} className='flex items-start gap-3 text-sm font-semibold text-slate-700'>
                    <CheckCircle2 size={17} className='mt-0.5 shrink-0 text-green-600' />
                    {item}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          {benefits.map((benefit) => {
            const Icon = benefit.icon

            return (
              <article key={benefit.title} className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
                <div className='flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-[#4f46e5]'>
                  <Icon size={22} />
                </div>
                <h2 className='mt-4 text-lg font-bold text-slate-950'>{benefit.title}</h2>
                <p className='mt-2 text-sm leading-6 text-slate-500'>{benefit.description}</p>
              </article>
            )
          })}
        </section>

        <section className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='flex items-start gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600'>
                <BadgeCheck size={21} />
              </div>
              <div>
                <h2 className='text-lg font-bold text-slate-950'>Designed for consistent learners</h2>
                <p className='mt-1 max-w-2xl text-sm text-slate-500'>
                  Upgrade when your free courses are no longer enough for your learning goals.
                </p>
              </div>
            </div>
            <button
              type='button'
              className='inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800'
            >
              <Crown size={17} />
              Choose Premium
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Premium
