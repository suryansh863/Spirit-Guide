import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
               // Add timeout to prevent hanging requests
  timeout: 15000, // 15 seconds timeout
})

// Cache for static data
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('API Timeout:', error.message)
      return Promise.reject(new Error('Request timed out. Please try again.'))
    }
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Cache helper function
const getCachedData = (key) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}

export const recommendationAPI = {
  // Get drink recommendations with timeout handling
  getRecommendations: async (requestData) => {
    try {
      const response = await api.post('/pricing/recommendations', requestData)
      return response.data
    } catch (error) {
      if (error.message.includes('timeout')) {
        throw new Error('Request took too long. Please try again.')
      }
      throw error
    }
  },

  // Get quick recommendations
  getQuickRecommendations: async (drinkType, budget, state) => {
    const response = await api.get('/pricing/recommendations/quick', {
      params: { drink_type: drinkType, budget, state }
    })
    return response.data
  }
}

export const drinksAPI = {
  // Get all drinks with optional filters
  getDrinks: async (filters = {}) => {
    const response = await api.get('/drinks', { params: filters })
    return response.data
  },

  // Get drink by ID
  getDrinkById: async (drinkId) => {
    const response = await api.get(`/drinks/${drinkId}`)
    return response.data
  },

  // Get drink types with caching
  getDrinkTypes: async () => {
    const cacheKey = 'drinkTypes'
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const response = await api.get('/drinks/types')
    setCachedData(cacheKey, response.data)
    return response.data
  },

  // Get flavor profiles with caching
  getFlavorProfiles: async () => {
    const cacheKey = 'flavorProfiles'
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const response = await api.get('/drinks/flavors')
    setCachedData(cacheKey, response.data)
    return response.data
  }
}

export const statesAPI = {
  // Get all states with caching
  getStates: async () => {
    const cacheKey = 'states'
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const response = await api.get('/states')
    setCachedData(cacheKey, response.data)
    return response.data
  },

  // Get state restrictions
  getStateRestrictions: async () => {
    const response = await api.get('/states/restrictions')
    return response.data
  },

  // Get state info
  getStateInfo: async (stateName) => {
    const response = await api.get(`/states/${stateName}/info`)
    return response.data
  }
}

export default api
