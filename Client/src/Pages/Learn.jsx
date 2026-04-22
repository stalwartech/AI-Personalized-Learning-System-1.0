import React from 'react'

const Learn = () => {
  const Document= `## Conditional Statements in JavaScript

Conditional statements are used to make decisions in JavaScript. 
They control the flow of execution by running code only when a condition evaluates to true.

`
  return (
    <div className='w-full p-10'>
      {/* First Section */}
      <div className='mt-10 flex justify-between w-full'>
        <div>
          <p className='text-sm text-gray-500'>AI-Generated Course</p>
          <p className='text-3xl font-bold'> Conditional Statement in Javascript </p>
        </div>
        <p className='text-gray-500 mt-6'>Lesson 3 of 6</p>
      </div>
      <hr className='text-gray-500 mt-2.5'/>

      {/* Second Section */}
      <div>
        <iframe className='pt-4 w-full' width="560" height="315" src="https://www.youtube.com/embed/nI8PYZNFtac?si=cOnhQOpLLgYPpMkS" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        <div>
          <h1>Learning Context</h1>
          <p><pre>{Document}</pre></p>
        </div>
      </div>
        
    </div>
  )
}

export default Learn