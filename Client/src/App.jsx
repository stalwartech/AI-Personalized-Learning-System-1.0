import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Sidebar from './components/Sidebar'
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Dashboard from './Pages/Dashboard'
import Learn from './Pages/Learn'
import Progress from './Pages/Progress'
import Login from './Pages/Login'
import Register from './Pages/Register'
import Explore from './Pages/Explore'
import Settings from './Pages/Settings'
function App() {


  return (
    <>
    <BrowserRouter>
      {/* <Route path='/Login' element={<Login/>}/>
      <Route path='/Register' element={<Register/>}/> */}

      <div className='flex gap-10'>
        <Sidebar/>
          <Routes>
            <Route path='/' element={<Dashboard/>}/>
            <Route path='/Learn' element={<Learn/>}/>
            <Route path='/Progress' element={<Progress/>}/>
            <Route path='/Explore' element={<Explore/>}/>
            <Route path='/Settings' element={<Settings/>}/>
          </Routes>
      </div>
    </BrowserRouter>

    </>
  )
}

export default App
