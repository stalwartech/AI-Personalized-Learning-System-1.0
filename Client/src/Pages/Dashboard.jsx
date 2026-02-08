import { LucideArrowRight } from 'lucide-react'
import React from 'react'

const Dashboard = () => {
  return (
    <>
      <h1>Welcome back, Stalwart!</h1>
      <p>You are on a 7-days streak, keep it up</p>

      <div>
        <p>CONTINUE LEARNING</p>
        <h2>Intorduction to Machine Learning</h2>
        
        <p>Lesson 5 of 8. 65% complete</p>
        <button>Continue Lesson <LucideArrowRight/></button>
      </div>
    </>
  )
}

export default Dashboard