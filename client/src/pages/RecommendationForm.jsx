import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Wine, 
  MapPin, 
  Calendar, 
  Palette,
  Loader2,
  ArrowRight,
  Info
} from 'lucide-react'
import { drinksAPI, statesAPI } from '../services/api'
import { formatPrice, getDrinkTypeLabel, getOccasionLabel, getFlavorLabel } from '../utils/helpers'

// Skeleton loading components
const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
)

const SkeletonButton = () => (
  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
)

const RecommendationForm = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [loadedSections, setLoadedSections] = useState({
    drinkTypes: false,
    states: false,
    flavors: false
  })
  const [formData, setFormData] = useState({
    budget: 2000,
    drink_type: 'whiskey',
    state: 'Delhi',
    occasion: 'casual',
    flavor_preferences: []
  })
  
  const [options, setOptions] = useState({
    drinkTypes: [],
    states: [],
    occasions: [
      { value: 'party', label: 'Party' },
      { value: 'dinner', label: 'Dinner' },
      { value: 'gift', label: 'Gift' },
      { value: 'casual', label: 'Casual' },
      { value: 'celebration', label: 'Celebration' },
      { value: 'business', label: 'Business' }
    ],
    flavors: []
  })

  useEffect(() => {
    loadOptions()
  }, [])

  const loadOptions = async () => {
    setIsLoadingOptions(true)
    
    try {
      // Load drink types first (most important)
      const drinkTypesRes = await drinksAPI.getDrinkTypes()
      setOptions(prev => ({ ...prev, drinkTypes: drinkTypesRes.drink_types }))
      setLoadedSections(prev => ({ ...prev, drinkTypes: true }))
      
      // Load states and flavors in parallel
      const [statesRes, flavorsRes] = await Promise.all([
        statesAPI.getStates(),
        drinksAPI.getFlavorProfiles()
      ])
      
      setOptions(prev => ({
        ...prev,
        states: statesRes.states,
        flavors: flavorsRes.flavors
      }))
      
      setLoadedSections({
        drinkTypes: true,
        states: true,
        flavors: true
      })
    } catch (error) {
      console.error('Error loading options:', error)
      // Set default values if API fails
      setOptions(prev => ({
        ...prev,
        drinkTypes: prev.drinkTypes.length > 0 ? prev.drinkTypes : [
          { value: 'whiskey', label: 'Whiskey' },
          { value: 'beer', label: 'Beer' },
          { value: 'vodka', label: 'Vodka' },
          { value: 'rum', label: 'Rum' },
          { value: 'gin', label: 'Gin' },
          { value: 'wine', label: 'Wine' }
        ],
        states: prev.states.length > 0 ? prev.states : [
          { value: 'Delhi', label: 'Delhi' },
          { value: 'Maharashtra', label: 'Maharashtra' },
          { value: 'Karnataka', label: 'Karnataka' }
        ],
        flavors: prev.flavors.length > 0 ? prev.flavors : [
          { value: 'smoky', label: 'Smoky' },
          { value: 'sweet', label: 'Sweet' },
          { value: 'spicy', label: 'Spicy' },
          { value: 'fruity', label: 'Fruity' }
        ]
      }))
    } finally {
      setIsLoadingOptions(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFlavorToggle = (flavor) => {
    setFormData(prev => ({
      ...prev,
      flavor_preferences: prev.flavor_preferences.includes(flavor)
        ? prev.flavor_preferences.filter(f => f !== flavor)
        : [...prev.flavor_preferences, flavor]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Store form data in localStorage for results page
      localStorage.setItem('recommendationFormData', JSON.stringify(formData))
      
      // Navigate to results page
      navigate('/results')
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const budgetMarks = [
    { value: 200, label: '₹200' },
    { value: 500, label: '₹500' },
    { value: 1000, label: '₹1K' },
    { value: 2000, label: '₹2K' },
    { value: 5000, label: '₹5K' },
    { value: 10000, label: '₹10K' },
    { value: 20000, label: '₹20K' },
    { value: 50000, label: '₹50K' }
  ]

  // Show skeleton loading while options are loading
  if (isLoadingOptions) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded mb-2 w-3/4 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
          </div>
          
          {/* Form Skeleton */}
          <div className="space-y-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Wine className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Get Your Perfect Drink
          </h1>
          <p className="text-gray-600">
            Tell us your preferences and we'll find the perfect drink for you
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Budget Section */}
          <div className="card">
            <div className="flex items-center mb-4">
              <span className="text-2xl text-primary-600 mr-2">₹</span>
              <h2 className="text-xl font-semibold text-gray-900">Budget</h2>
            </div>
            <div className="mb-6">
              {/* Budget Display */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {formatPrice(formData.budget)}
                </div>
                <div className="text-sm text-gray-500">
                  Will show spirits from ₹{(formData.budget * 0.25).toFixed(0)} to ₹{formData.budget}
                </div>
              </div>

              {/* Quick Budget Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {budgetMarks.map((mark) => (
                  <button
                    key={mark.value}
                    type="button"
                    onClick={() => handleInputChange('budget', mark.value)}
                    className={`py-3 px-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                      formData.budget === mark.value
                        ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md'
                        : 'border-gray-200 hover:border-primary-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {mark.label}
                  </button>
                ))}
              </div>

              {/* Custom Budget Slider */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>₹200</span>
                  <span>₹50,000</span>
                </div>
                
                <div className="relative">
                  <input
                    type="range"
                    min="200"
                    max="50000"
                    step="100"
                    value={formData.budget}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      handleInputChange('budget', value);
                    }}
                    className="w-full slider-custom"
                  />
                </div>

                {/* Budget Categories */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Budget</span>
                  <span>Premium</span>
                  <span>Luxury</span>
                </div>
              </div>
            </div>
          </div>

          {/* Drink Type Section */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Wine className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Drink Type</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {options.drinkTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('drink_type', type.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.drink_type === type.value
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* State Section */}
          <div className="card">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Your State</h2>
            </div>
            <select
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="select-field"
            >
              {options.states.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">
              We'll show you drinks available in your state
            </p>
          </div>

          {/* Occasion Section */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Occasion</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {options.occasions.map((occasion) => (
                <button
                  key={occasion.value}
                  type="button"
                  onClick={() => handleInputChange('occasion', occasion.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.occasion === occasion.value
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {occasion.label}
                </button>
              ))}
            </div>
          </div>

          {/* Flavor Preferences Section */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Palette className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Flavor Preferences</h2>
              <Info className="w-4 h-4 text-gray-400 ml-2" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Select your preferred flavors (optional)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {options.flavors.map((flavor) => (
                <button
                  key={flavor.value}
                  type="button"
                  onClick={() => handleFlavorToggle(flavor.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.flavor_preferences.includes(flavor.value)
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {flavor.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary text-lg py-4 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Finding Your Perfect Drink...
              </>
            ) : (
              <>
                Get Recommendations
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>

        {/* Summary */}
        <div className="mt-8 card bg-primary-50 border-primary-200">
          <h3 className="font-semibold text-primary-800 mb-2">Your Preferences Summary</h3>
          <div className="text-sm text-primary-700 space-y-1">
            <p>Budget: {formatPrice(formData.budget)}</p>
            <p>Drink Type: {getDrinkTypeLabel(formData.drink_type)}</p>
            <p>State: {formData.state}</p>
            <p>Occasion: {getOccasionLabel(formData.occasion)}</p>
            {formData.flavor_preferences.length > 0 && (
              <p>Flavors: {formData.flavor_preferences.map(f => getFlavorLabel(f)).join(', ')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecommendationForm
