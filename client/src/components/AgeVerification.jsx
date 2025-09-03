import { useState } from 'react'
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react'

const AgeVerification = ({ onVerify }) => {
  const [isVerified, setIsVerified] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  const handleVerify = () => {
    setIsVerified(true)
    setTimeout(() => {
      onVerify(true)
    }, 1000)
  }

  const handleDecline = () => {
    setShowWarning(true)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {!isVerified && !showWarning ? (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-amber-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Age Verification Required
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              You must be at least 25 years old to access Spirit Guide. 
              This app is designed for responsible adults who can legally purchase and consume alcohol in India.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Important Notice:</p>
                  <p>Please drink responsibly and comply with local laws and regulations regarding alcohol consumption.</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleDecline}
                className="flex-1 btn-secondary"
              >
                I'm under 25
              </button>
              <button
                onClick={handleVerify}
                className="flex-1 btn-primary"
              >
                I'm 25 or older
              </button>
            </div>
          </div>
        ) : showWarning ? (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            
            <p className="text-gray-600 mb-6">
              Spirit Guide is only available to users who are 25 years or older. 
              Please return when you meet the age requirement.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Legal Notice:</strong> Underage drinking is illegal and can have serious health and legal consequences.
              </p>
            </div>
            
            <button
              onClick={() => window.close()}
              className="btn-secondary w-full"
            >
              Close Browser
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Spirit Guide!
            </h2>
            
            <p className="text-gray-600">
              Age verification successful. Enjoy responsibly!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgeVerification
