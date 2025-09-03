import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import RecommendationForm from './pages/RecommendationForm'
import ResultsPage from './pages/ResultsPage'
import AgeVerification from './components/AgeVerification'
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  const [isAgeVerified, setIsAgeVerified] = useState(false)
  const [showAgeVerification, setShowAgeVerification] = useState(true)

  useEffect(() => {
    // Check if user has already verified their age
    const verified = localStorage.getItem('ageVerified')
    if (verified === 'true') {
      setIsAgeVerified(true)
      setShowAgeVerification(false)
    }
  }, [])

  const handleAgeVerification = (verified) => {
    if (verified) {
      setIsAgeVerified(true)
      setShowAgeVerification(false)
      localStorage.setItem('ageVerified', 'true')
    }
  }

  if (showAgeVerification) {
    return <AgeVerification onVerify={handleAgeVerification} />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/recommend" element={<RecommendationForm />} />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
