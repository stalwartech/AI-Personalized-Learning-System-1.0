import {
  Loader2,
  LockKeyhole,
  Mail,
  Save,
  Settings as SettingsIcon,
  SlidersHorizontal,
  Trash2,
  UserRound,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import axiosInstance from '../../services/axiosConfig'
import Alert from '../components/Alert'
import ConfirmationPopup from '../components/ConfirmationPopUp'

const paceOptions = [
  { label: 'Relaxed', value: 'relaxed', description: 'A lighter pace for steady learning.' },
  { label: 'Moderate', value: 'moderate', description: 'A balanced pace for most learners.' },
  { label: 'Intensive', value: 'intensive', description: 'A faster pace for deep focus.' },
]

const difficultyOptions = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
]

const Settings = () => {
  const [loading, setLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
  })

  const [preferences, setPreferences] = useState({
    learningPace: 'moderate',
    defaultDifficulty: 'beginner',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await axiosInstance.get('/api/settings/profile')
        const user = response.data.data.user

        setProfile({
          fullName: user.fullName || '',
          email: user.email || '',
        })

        setPreferences({
          learningPace: user.preferences?.learningPace || 'moderate',
          defaultDifficulty: user.preferences?.defaultDifficulty || 'beginner',
        })
      } catch (error) {
        console.log(error)
        setError(error.response?.data?.message || 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [])

  const getErrorMessage = (error, fallback) => {
    return error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || fallback
  }

  const showSuccess = (text) => {
    setMessage(text)
    setError('')
    setTimeout(() => setMessage(''), 3000)
  }

  const updateProfile = async (event) => {
    event.preventDefault()

    try {
      setProfileSaving(true)
      setError('')

      const response = await axiosInstance.put('/api/settings/profile', {
        fullName: profile.fullName.trim(),
        email: profile.email.trim(),
      })

      const user = response.data.data.user
      setProfile({
        fullName: user.fullName || '',
        email: user.email || '',
      })
      showSuccess('Profile updated successfully')
    } catch (error) {
      console.log(error)
      setError(getErrorMessage(error, 'Failed to update profile'))
    } finally {
      setProfileSaving(false)
    }
  }

  const updatePreferences = async () => {
    try {
      setProfileSaving(true)
      setError('')

      const response = await axiosInstance.put('/api/settings/preferences', preferences)
      const user = response.data.data.user

      setPreferences({
        learningPace: user.preferences?.learningPace || preferences.learningPace,
        defaultDifficulty: user.preferences?.defaultDifficulty || preferences.defaultDifficulty,
      })
      showSuccess('Learning preferences updated')
    } catch (error) {
      console.log(error)
      setError(getErrorMessage(error, 'Failed to update preferences'))
    } finally {
      setProfileSaving(false)
    }
  }

  const changePassword = async (event) => {
    event.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirmation do not match')
      return
    }

    try {
      setPasswordSaving(true)
      setError('')

      await axiosInstance.put('/api/settings/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      showSuccess('Password changed successfully')
    } catch (error) {
      console.log(error)
      setError(getErrorMessage(error, 'Failed to change password'))
    } finally {
      setPasswordSaving(false)
    }
  }

  const deleteAccount = async (password) => {
    try {
      setDeleteLoading(true)
      setError('')

      const response = await axiosInstance.delete('/api/settings/account', {
        data: { password },
      })

      if (response.data?.success) {
        sessionStorage.setItem('accountDeletedMessage', 'Account deleted successfully.')
        localStorage.removeItem('token')
        window.location.href = '/login'
        return
      }

      throw new Error(response.data?.message || 'Failed to delete account')
    } catch (error) {
      console.log(error)
      const message = getErrorMessage(error, 'Failed to delete account')
      setError(message)
      throw new Error(message)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <main className='min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8'>
        <div className='mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center'>
          <div className='flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm'>
            <Loader2 className='animate-spin text-[#4f46e5]' size={22} />
            Loading settings...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className='min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mx-auto flex max-w-5xl flex-col gap-6'>
        <section>
          <p className='text-sm font-semibold text-[#4f46e5]'>Account</p>
          <h1 className='mt-1 text-2xl font-bold text-slate-950 sm:text-3xl'>Settings</h1>
          <p className='mt-2 max-w-2xl text-sm text-slate-500 sm:text-base'>
            Manage your profile, learning preferences, password, and account access.
          </p>
        </section>

        <Alert
          type={error ? 'error' : 'success'}
          message={error || message}
          onClose={() => {
            setError('')
            setMessage('')
          }}
        />

        <form onSubmit={updateProfile} className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
          <SectionHeader icon={UserRound} title='Profile Information' description='Update your name and email address.' />

          <div className='mt-6 grid gap-4 md:grid-cols-2'>
            <TextField
              icon={UserRound}
              label='Full name'
              value={profile.fullName}
              onChange={(value) => setProfile((current) => ({ ...current, fullName: value }))}
              placeholder='Enter your full name'
              required
            />
            <TextField
              icon={Mail}
              type='email'
              label='Email address'
              value={profile.email}
              onChange={(value) => setProfile((current) => ({ ...current, email: value }))}
              placeholder='you@example.com'
              required
            />
          </div>

          <div className='mt-6 flex justify-end'>
            <PrimaryButton loading={profileSaving} icon={Save}>
              Save profile
            </PrimaryButton>
          </div>
        </form>

        <section className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
          <SectionHeader icon={SlidersHorizontal} title='Learning Preferences' description='Set defaults for newly generated courses.' />

          <div className='mt-6 grid gap-5 lg:grid-cols-[1fr_260px]'>
            <div>
              <p className='mb-3 text-sm font-bold text-slate-700'>Learning pace</p>
              <div className='grid gap-3 sm:grid-cols-3'>
                {paceOptions.map((option) => (
                  <button
                    key={option.value}
                    type='button'
                    onClick={() => setPreferences((current) => ({ ...current, learningPace: option.value }))}
                    className={`rounded-lg border p-4 text-left transition ${
                      preferences.learningPace === option.value
                        ? 'border-[#4f46e5] bg-indigo-50 text-[#4f46e5]'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <p className='font-bold'>{option.label}</p>
                    <p className='mt-1 text-sm text-slate-500'>{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <label className='block'>
              <span className='mb-3 block text-sm font-bold text-slate-700'>Default difficulty</span>
              <select
                value={preferences.defaultDifficulty}
                onChange={(event) => setPreferences((current) => ({ ...current, defaultDifficulty: event.target.value }))}
                className='h-12 w-full rounded-lg border border-slate-300 bg-white px-3 font-semibold text-slate-700 outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-100'
              >
                {difficultyOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className='mt-6 flex justify-end'>
            <button
              type='button'
              onClick={updatePreferences}
              disabled={profileSaving}
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:bg-indigo-300'
            >
              {profileSaving ? <Loader2 className='animate-spin' size={18} /> : <Save size={18} />}
              Save preferences
            </button>
          </div>
        </section>

        <form onSubmit={changePassword} className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
          <SectionHeader icon={LockKeyhole} title='Security' description='Change your password using your current password.' />

          <div className='mt-6 grid gap-4 md:grid-cols-3'>
            <TextField
              icon={LockKeyhole}
              type='password'
              label='Current password'
              value={passwordForm.currentPassword}
              onChange={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))}
              placeholder='Current password'
              required
            />
            <TextField
              icon={LockKeyhole}
              type='password'
              label='New password'
              value={passwordForm.newPassword}
              onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))}
              placeholder='Minimum 8 characters'
              required
            />
            <TextField
              icon={LockKeyhole}
              type='password'
              label='Confirm password'
              value={passwordForm.confirmPassword}
              onChange={(value) => setPasswordForm((current) => ({ ...current, confirmPassword: value }))}
              placeholder='Repeat new password'
              required
            />
          </div>

          <div className='mt-6 flex justify-end'>
            <PrimaryButton loading={passwordSaving} icon={LockKeyhole}>
              Change password
            </PrimaryButton>
          </div>
        </form>

        <section className='rounded-lg border border-red-200 bg-white p-5 shadow-sm sm:p-6'>
          <SectionHeader icon={Trash2} title='Danger Zone' description='Permanently delete your account and learning data.' danger />

          <div className='mt-6 flex justify-end'>
            <button
              type='button'
              onClick={() => setDeleteModalOpen(true)}
              disabled={deleteLoading}
              className='inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300'
            >
              {deleteLoading ? <Loader2 className='animate-spin' size={18} /> : <Trash2 size={18} />}
              Delete account
            </button>
          </div>
        </section>

        <ConfirmationPopup
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={deleteAccount}
          variant='danger'
          title='Delete account?'
          message='This will permanently delete your account, courses, and progress. Enter your password to continue.'
          confirmLabel='Delete account'
          cancelLabel='Cancel'
          requirePassword
          passwordLabel='Confirm password'
          passwordPlaceholder='Enter your password'
        />
      </div>
    </main>
  )
}

const SectionHeader = ({ icon: Icon, title, description, danger = false }) => (
  <div className='flex items-start gap-3'>
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
      danger ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-[#4f46e5]'
    }`}>
      <Icon size={20} />
    </div>
    <div>
      <h2 className='text-lg font-bold text-slate-950'>{title}</h2>
      <p className='mt-1 text-sm text-slate-500'>{description}</p>
    </div>
  </div>
)

const TextField = ({ icon: Icon, label, value, onChange, type = 'text', placeholder, required = false }) => (
  <label className='block'>
    <span className='mb-2 block text-sm font-bold text-slate-700'>{label}</span>
    <div className='relative'>
      <Icon className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className='h-12 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-100'
      />
    </div>
  </label>
)

const PrimaryButton = ({ loading, icon: Icon, children }) => (
  <button
    type='submit'
    disabled={loading}
    className='inline-flex items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:bg-indigo-300'
  >
    {loading ? <Loader2 className='animate-spin' size={18} /> : <Icon size={18} />}
    {children}
  </button>
)

export default Settings
