import React from 'react'

const Learn = () => {
  const Document= `## Conditional Statements in JavaScript

Conditional statements are used to make decisions in JavaScript. 
They control the flow of execution by running code only when a condition evaluates to true.

### What a Conditional Statement Is

A conditional statement checks a condition and decides which block of code should run.

Example (plain text):

if (age >= 18) {
console.log("Access granted")
}

### The "if" Statement

The "if" statement runs code only when the condition is true.

Example:

if (isLoggedIn) {
console.log("Welcome back")
}

### "if...else"

Used when there are two possible outcomes.

Example:

if (score >= 50) {
console.log("Pass")
} else {
console.log("Fail")
}

### "else if" (Multiple Conditions)

Conditions are checked from top to bottom. The first true condition runs.

Example:

if (score >= 70) {
console.log("A")
} else if (score >= 60) {
console.log("B")
} else if (score >= 50) {
console.log("C")
} else {
console.log("F")
}

### "switch" Statement

Used when comparing one value against many possible cases.

Example:

switch (role) {
case "admin":
console.log("Full access")
break
case "user":
console.log("Limited access")
break
default:
console.log("No access")
}

### Ternary Operator

A short form of if...else. Use only for simple conditions.

Example:

const status = age >= 18 ? "Adult" : "Minor"

### Logical Operators in Conditions

AND (&&): all conditions must be true
OR (||): at least one condition must be true
NOT (!): reverses a condition

Examples:

if (isLoggedIn && isAdmin) {
console.log("Welcome admin")
}

if (!isVerified) {
console.log("Verify your account")
}

### Truthy and Falsy Values

Falsy values in JavaScript are:

false, 0, "", null, undefined, NaN

Example:

if ("0") {
console.log("This runs")
}

if (0) {
console.log("This does not run")
}

### Common Weaknesses Most People Have

Using assignment instead of comparison:

if (x = 5) {
console.log("Runs but wrong")
}

Correct comparison:

if (x === 5) {
console.log("Correct comparison")
}

Confusing == and ===:

5 == "5" returns true
5 === "5" returns false

Always use ===.

Wrong condition order:

if (score >= 50) {
console.log("Pass")
} else if (score >= 70) {
console.log("Excellent")
}

Correct order:

if (score >= 70) {
console.log("Excellent")
} else if (score >= 50) {
console.log("Pass")
}

Overusing the ternary operator:

isAdmin ? isVerified ? "Yes" : "No" : "Denied"

This hurts readability. Use if...else when logic grows.

Forgetting "break" in switch causes unintended fall-through.

Assuming values are boolean:

if (user.isActive)

If the value is not strictly true or false, bugs can occur. Always know your data type.

### Key Takeaways

Conditional statements control decision-making
Use === instead of ==
Condition order matters
Understand truthy and falsy values
Keep logic simple and readable
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