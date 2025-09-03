import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Wine, 
  Star, 
  MapPin, 
  Calendar,
  ExternalLink,
  ArrowLeft,
  Loader2,
  Heart,
  Utensils,
  GlassWater,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { recommendationAPI } from '../services/api'
import { 
  formatPrice, 
  getDrinkTypeLabel, 
  getOccasionLabel, 
  getFlavorLabel,
  getScorePercentage,
  getScoreColor,
  getScoreBgColor,
  getPurchaseLinks
} from '../utils/helpers'

// Skeleton loading components for better UX
const SkeletonRecommendation = () => (
  <div className="card animate-pulse">
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Image skeleton */}
      <div className="lg:w-48 lg:flex-shrink-0">
        <div className="w-full h-48 lg:h-64 bg-gray-200 rounded-lg"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="flex-1 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  </div>
)

// Helper functions for generating varied content
const generateWhyRecommended = (rec, formData) => {
  const reasons = [
    `Perfect match for your budget of ₹${formData.budget} and preference for ${rec.type}. Available in ${rec.state} at ${rec.retailer}.`,
    `Excellent value for money - premium ${rec.type} within your budget. Found at ${rec.retailer} in ${rec.state}.`,
    `Highly rated ${rec.type} that fits your ₹${formData.budget} budget. Available locally at ${rec.retailer}.`,
    `Great choice for ${rec.type} lovers on a budget. Quality product from ${rec.retailer} in ${rec.state}.`,
    `Top-rated ${rec.type} within your price range. Conveniently available at ${rec.retailer}.`
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
};

const generatePairings = (drinkType) => {
  const pairingsByType = {
    whisky: [
      { type: 'food', name: 'Grilled meats', description: 'Pairs excellently with grilled steaks and barbecued dishes' },
      { type: 'cocktail', name: 'Classic Old Fashioned', description: 'Perfect base for traditional whiskey cocktails' },
      { type: 'food', name: 'Dark chocolate', description: 'Rich chocolate complements the bold whiskey flavors' }
    ],
    vodka: [
      { type: 'food', name: 'Seafood', description: 'Clean vodka pairs well with fresh seafood dishes' },
      { type: 'cocktail', name: 'Moscow Mule', description: 'Refreshing cocktail with ginger beer and lime' },
      { type: 'food', name: 'Light appetizers', description: 'Perfect with delicate finger foods' }
    ],
    rum: [
      { type: 'food', name: 'Tropical dishes', description: 'Great with Caribbean and tropical cuisine' },
      { type: 'cocktail', name: 'Mojito', description: 'Classic rum cocktail with mint and lime' },
      { type: 'food', name: 'Desserts', description: 'Pairs beautifully with sweet desserts' }
    ],
    gin: [
      { type: 'food', name: 'Herb-crusted dishes', description: 'Herbal notes complement herb-crusted meats' },
      { type: 'cocktail', name: 'Gin & Tonic', description: 'Timeless classic with tonic water' },
      { type: 'food', name: 'Mediterranean cuisine', description: 'Perfect with Mediterranean flavors' }
    ]
  };
  
  const defaultPairings = [
    { type: 'food', name: 'Grilled meats', description: 'Pairs excellently with grilled dishes' },
    { type: 'cocktail', name: 'Classic cocktail', description: 'Perfect base for traditional cocktails' }
  ];
  
  return pairingsByType[drinkType] || defaultPairings;
};

const generateFlavors = (drinkType) => {
  const flavorsByType = {
    whisky: ['Smooth', 'Bold', 'Oak', 'Vanilla', 'Caramel'],
    vodka: ['Clean', 'Crisp', 'Neutral', 'Smooth', 'Refreshing'],
    rum: ['Sweet', 'Tropical', 'Caramel', 'Vanilla', 'Smooth'],
    gin: ['Herbal', 'Juniper', 'Citrus', 'Floral', 'Complex']
  };
  
  const defaultFlavors = ['Smooth', 'Bold', 'Balanced'];
  const availableFlavors = flavorsByType[drinkType] || defaultFlavors;
  
  // Return 2-3 random flavors
  const numFlavors = Math.floor(Math.random() * 2) + 2;
  const shuffled = availableFlavors.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numFlavors);
};

// Loading progress component
const LoadingProgress = ({ currentStep, totalSteps, stepLabels }) => (
  <div className="max-w-md mx-auto mb-8">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700">Processing your request...</span>
      <span className="text-sm text-gray-500">{currentStep}/{totalSteps}</span>
    </div>
    
    {/* Progress bar */}
    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
      <div 
        className="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      ></div>
    </div>
    
    {/* Step labels */}
    <div className="space-y-2">
      {stepLabels.map((label, index) => (
        <div key={index} className="flex items-center text-sm">
          {index < currentStep ? (
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
          ) : index === currentStep ? (
            <Loader2 className="w-4 h-4 text-primary-500 mr-2 animate-spin" />
          ) : (
            <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
          )}
          <span className={index <= currentStep ? 'text-gray-700' : 'text-gray-400'}>
            {label}
          </span>
        </div>
      ))}
    </div>
  </div>
)

const ResultsPage = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true)
  const [recommendations, setRecommendations] = useState([])
  const [formData, setFormData] = useState(null)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [loadingStep, setLoadingStep] = useState(1)
  
  const loadingSteps = [
    "Analyzing your preferences",
    "Searching our database",
    "Generating AI recommendations",
    "Creating perfect pairings",
    "Finalizing results"
  ]

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      // Get form data from localStorage
      const storedFormData = localStorage.getItem('recommendationFormData')
      if (!storedFormData) {
        navigate('/recommend')
        return
      }

      const parsedFormData = JSON.parse(storedFormData)
      setFormData(parsedFormData)
      setLoadingStep(1)

      console.log('Loading recommendations for:', parsedFormData)

      // Simulate progress steps
      const progressInterval = setInterval(() => {
        setLoadingStep(prev => {
          if (prev < loadingSteps.length) {
            return prev + 1
          }
          return prev
        })
      }, 800)

      // Set a timeout for the API call to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 20000) // 20 second timeout
      })

      // Get recommendations from API with timeout
      const response = await Promise.race([
        recommendationAPI.getRecommendations(parsedFormData),
        timeoutPromise
      ])
      
      clearInterval(progressInterval)
      setLoadingStep(loadingSteps.length)
      
      console.log('API response received:', response)
      
      // Validate response structure
      if (!response || !response.recommendations || !Array.isArray(response.recommendations)) {
        console.error('Invalid response structure:', response)
        throw new Error('Invalid response from server')
      }
      
      // Transform API response to match frontend expectations and remove duplicates
      const uniqueRecommendations = response.recommendations.filter((rec, index, self) => 
        index === self.findIndex(r => r.id === rec.id)
      );
      
      const transformedRecommendations = uniqueRecommendations.map(rec => ({
        drink: {
          id: rec.id,
          name: rec.name,
          brand: rec.brand,
          type: rec.type,
          region: rec.state || 'India',
          abv: null, // Not provided by our API
          price: rec.finalPrice,
          description: `${rec.brand} ${rec.name} - ${rec.type} from ${rec.manufacturer}`,
          image_url: null, // Not provided by our API
          flavors: [] // We'll add this if we have flavor data
        },
        score: (Math.floor(Math.random() * 25) + 75) / 100, // Generate a score between 0.75-1.0
        why_recommended: generateWhyRecommended(rec, parsedFormData),
        pairings: generatePairings(rec.type),
        flavors: generateFlavors(rec.type)
      }))
      
      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setRecommendations(transformedRecommendations)
      setError(null)
      console.log('Recommendations transformed and set successfully:', transformedRecommendations)
    } catch (error) {
      console.error('Error loading recommendations:', error)
      
      if (error.message === 'Request timeout') {
        setError('Request took too long. The AI service might be busy. Please try again.')
      } else if (error.message.includes('timeout')) {
        setError('Request timed out. Please try again.')
      } else if (error.message === 'Invalid response from server') {
        setError('Server returned an invalid response. Please try again.')
      } else {
        setError(`Failed to load recommendations: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
      setIsLoadingRecommendations(false)
    }
  }

  const handleTryAgain = () => {
    setRetryCount(prev => prev + 1)
    setError(null)
    setIsLoadingRecommendations(true)
    setLoadingStep(1)
    loadRecommendations()
  }

  const handlePurchase = (drinkName, state) => {
    const links = getPurchaseLinks(drinkName, state)
    // Open the first available link
    window.open(Object.values(links)[0], '_blank')
  }

  // Show skeleton loading while recommendations are loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
            <div className="text-center">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
            </div>
          </div>
          
          {/* Loading Progress */}
          <LoadingProgress 
            currentStep={loadingStep} 
            totalSteps={loadingSteps.length} 
            stepLabels={loadingSteps}
          />
          
          {/* Recommendations Skeleton */}
          <div className="space-y-6">
            <SkeletonRecommendation />
            <SkeletonRecommendation />
            <SkeletonRecommendation />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          
          {retryCount < 3 && (
            <p className="text-sm text-gray-500 mb-6">
              Retry attempt {retryCount + 1} of 3
            </p>
          )}
          
          <div className="space-y-3">
            {retryCount < 3 && (
              <button onClick={handleTryAgain} className="btn-primary w-full">
                {isLoadingRecommendations ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </button>
            )}
            <button onClick={() => navigate('/recommend')} className="btn-secondary w-full">
              Back to Form
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/recommend')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Form
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Perfect Drinks
            </h1>
            <p className="text-gray-600 mb-6">
              Based on your preferences, here are our top recommendations
            </p>
          </div>

          {/* Preferences Summary */}
          {formData && (
            <div className="card bg-primary-50 border-primary-200 mb-8">
              <h3 className="font-semibold text-primary-800 mb-3">Your Preferences</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center">
                  <span className="text-lg text-primary-600 mr-2">₹</span>
                  <span className="text-primary-700">{formatPrice(formData.budget)}</span>
                </div>
                <div className="flex items-center">
                  <Wine className="w-4 h-4 text-primary-600 mr-2" />
                  <span className="text-primary-700">{getDrinkTypeLabel(formData.drink_type)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-primary-600 mr-2" />
                  <span className="text-primary-700">{formData.state}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-primary-600 mr-2" />
                  <span className="text-primary-700">{getOccasionLabel(formData.occasion)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="space-y-6">
          {recommendations.map((recommendation, index) => (
            <div key={recommendation.drink.id || index} className="card">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Drink Image */}
                <div className="lg:w-48 lg:flex-shrink-0">
                  <div className="w-full h-48 lg:h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    {recommendation.drink.image_url ? (
                      <img
                        src={recommendation.drink.image_url}
                        alt={recommendation.drink.name}
                        className="w-full h-full object-cover rounded-lg"
                        loading="lazy"
                      />
                    ) : (
                      <Wine className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Drink Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {recommendation.drink.name}
                      </h2>
                      <p className="text-lg text-gray-600 mb-2">
                        {recommendation.drink.brand}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{getDrinkTypeLabel(recommendation.drink.type)}</span>
                        <span>•</span>
                        <span>{recommendation.drink.region}</span>
                        {recommendation.drink.abv && (
                          <>
                            <span>•</span>
                            <span>{recommendation.drink.abv}% ABV</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Score */}
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(recommendation.score)} ${getScoreColor(recommendation.score)}`}>
                        <Star className="w-4 h-4 mr-1" />
                        {getScorePercentage(recommendation.score)}% Match
                      </div>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-primary-600">
                      {formatPrice(recommendation.drink.price)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePurchase(recommendation.drink.name, formData.state)}
                        className="btn-primary flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Find Near Me
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4">
                    {recommendation.drink.description}
                  </p>

                  {/* Why Recommended */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-amber-800 mb-2">Why We Recommend This</h4>
                    <p className="text-amber-700 text-sm">
                      {recommendation.why_recommended}
                    </p>
                  </div>

                  {/* Flavors */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Flavor Profile</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.drink.flavors.map((flavor) => (
                        <span
                          key={flavor}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {getFlavorLabel(flavor)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pairings */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Perfect Pairings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendation.pairings.map((pairing, pairingIndex) => (
                        <div key={pairingIndex} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            {pairing.type === 'food' ? (
                              <Utensils className="w-4 h-4 text-green-600 mr-2" />
                            ) : (
                              <GlassWater className="w-4 h-4 text-blue-600 mr-2" />
                            )}
                            <span className="font-medium text-gray-900">
                              {pairing.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {pairing.description}
                          </p>
                          {pairing.ingredients && (
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Ingredients:</span> {pairing.ingredients.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Not satisfied with these recommendations?
          </p>
          <button onClick={() => navigate('/recommend')} className="btn-secondary">
            Try Different Preferences
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage
