import Sidebar from './components/Sidebar'
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import Dashboard from './Pages/Dashboard'
import Learn from './Pages/Learn'
import Progress from './Pages/Progress'
import Login from './Pages/Login'
import Register from './Pages/Register'
import Settings from './Pages/Settings'
import History from './Pages/History'
import Premium from './Pages/Premium'
import Quiz from './Pages/Quiz'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

const ProtectedLayout = () => (
  <div className="min-h-screen bg-slate-50 lg:flex">
    <Sidebar />
    <div className="min-w-0 flex-1 pb-24 lg:pb-0">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/Learn" element={<Learn />} />
        <Route path="/Learn/:courseId" element={<Learn />} />
        <Route path="/Progress" element={<Progress />} />
        <Route path="/History" element={<History />} />
        <Route path="/Premium" element={<Premium />} />
        <Route path="/Quiz" element={<Quiz />} />
        <Route path="/Quiz/:courseId" element={<Quiz />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  </div>
)

function App() {


  return (
    <>
   <BrowserRouter>
  <Routes>

    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route path="/*" element={
        <ProtectedRoute>
          <ProtectedLayout />
        </ProtectedRoute>
      }
    />

  </Routes>
</BrowserRouter>

    </>
  )
}

export default App
