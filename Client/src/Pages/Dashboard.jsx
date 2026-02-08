import { LucideArrowRight } from 'lucide-react'
import React from 'react'

const Dashboard = () => {
  return (
    <div className=''>
      <h1 className='text-3xl text'>Welcome back, Stalwart!</h1>
      <p>You are on a 7-days streak, keep it up</p>

      <div className='border rounded-2xl bg-amber-400'>
        <p>CONTINUE LEARNING</p>
        <h2>Intorduction to Machine Learning</h2>
        
        <p>Lesson 5 of 8. 65% complete</p>
        <button className='font-normal'>Continue Lesson <LucideArrowRight/></button>
      </div>
    </div>
  )
}

export default Dashboard