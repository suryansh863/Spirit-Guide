import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility function to merge Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format price in Indian Rupees
export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Format ABV percentage
export function formatABV(abv) {
  if (!abv) return 'Not specified'
  return `${abv}% ABV`
}

// Get drink type display name
export function getDrinkTypeLabel(type) {
  const typeLabels = {
    whiskey: 'Whiskey',
    beer: 'Beer',
    vodka: 'Vodka',
    rum: 'Rum',
    gin: 'Gin',
    wine: 'Wine',
    liqueur: 'Liqueur'
  }
  return typeLabels[type] || type
}

// Get occasion display name
export function getOccasionLabel(occasion) {
  const occasionLabels = {
    party: 'Party',
    dinner: 'Dinner',
    gift: 'Gift',
    casual: 'Casual',
    celebration: 'Celebration',
    business: 'Business'
  }
  return occasionLabels[occasion] || occasion
}

// Get flavor display name
export function getFlavorLabel(flavor) {
  const flavorLabels = {
    smoky: 'Smoky',
    sweet: 'Sweet',
    spicy: 'Spicy',
    fruity: 'Fruity',
    herbal: 'Herbal',
    citrus: 'Citrus',
    vanilla: 'Vanilla',
    oaky: 'Oaky',
    peaty: 'Peaty',
    smooth: 'Smooth',
    caramel: 'Caramel',
    clean: 'Clean',
    refreshing: 'Refreshing',
    juniper: 'Juniper',
    floral: 'Floral',
    balanced: 'Balanced',
    light: 'Light',
    rich: 'Rich',
    crisp: 'Crisp',
    honey: 'Honey',
    complex: 'Complex',
    coconut: 'Coconut'
  }
  return flavorLabels[flavor] || flavor
}

// Calculate recommendation score percentage
export function getScorePercentage(score) {
  return Math.round(score * 100)
}

// Get score color based on value
export function getScoreColor(score) {
  if (score >= 0.8) return 'text-green-600'
  if (score >= 0.6) return 'text-yellow-600'
  if (score >= 0.4) return 'text-orange-600'
  return 'text-red-600'
}

// Get score background color
export function getScoreBgColor(score) {
  if (score >= 0.8) return 'bg-green-100'
  if (score >= 0.6) return 'bg-yellow-100'
  if (score >= 0.4) return 'bg-orange-100'
  return 'bg-red-100'
}

// Debounce function
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Local storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return defaultValue
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }
}

// Generate random ID
export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

// Validate email format
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Format date
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

// Truncate text
export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

// Capitalize first letter
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Get external purchase links
export function getPurchaseLinks(drinkName, state) {
  const links = {
    'Living Liquidz': `https://livingliquidz.com/search?q=${encodeURIComponent(drinkName)}`,
    'Nature\'s Basket': `https://www.naturesbasket.co.in/search?q=${encodeURIComponent(drinkName)}`,
    'Amazon': `https://www.amazon.in/s?k=${encodeURIComponent(drinkName + ' alcohol')}`,
    'BigBasket': `https://www.bigbasket.com/search/?q=${encodeURIComponent(drinkName)}`
  }
  
  return links
}
