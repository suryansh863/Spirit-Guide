import { Link } from 'react-router-dom'
import { 
  Wine, 
  Sparkles, 
  MapPin, 
  DollarSign, 
  Users, 
  Shield,
  ArrowRight,
  Star,
  CheckCircle
} from 'lucide-react'

const LandingPage = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Recommendations',
      description: 'Get personalized drink suggestions based on your preferences, budget, and occasion.'
    },
    {
      icon: MapPin,
      title: 'State-Specific Availability',
      description: 'Find drinks available in your state with accurate pricing and legal compliance.'
    },
    {
      icon: DollarSign,
      title: 'Budget-Friendly Options',
      description: 'Discover great drinks within your budget range, from affordable to premium selections.'
    },
    {
      icon: Users,
      title: 'Perfect for Any Occasion',
      description: 'Whether it\'s a party, dinner, gift, or casual drink, we\'ve got you covered.'
    }
  ]

  const testimonials = [
    {
      name: 'Rahul Sharma',
      location: 'Delhi',
      rating: 5,
      comment: 'Found the perfect whiskey for my anniversary dinner. The AI recommendations were spot on!'
    },
    {
      name: 'Priya Patel',
      location: 'Mumbai',
      rating: 5,
      comment: 'Great app for discovering new drinks within my budget. Love the food pairing suggestions.'
    },
    {
      name: 'Arjun Singh',
      location: 'Bangalore',
      rating: 4,
      comment: 'The state-specific availability feature is brilliant. No more disappointment at the store.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-amber-50 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-6">
              <Wine className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover Your Perfect
              <span className="text-primary-600"> Drink</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-powered alcohol recommendations tailored for the Indian market. 
              Find the best whiskey, beer, vodka, rum, or gin based on your budget, 
              location, and preferences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/recommend"
                className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <button className="btn-secondary text-lg px-8 py-3">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Spirit Guide?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our intelligent system considers everything from your budget to local availability 
              to provide the perfect recommendations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get personalized recommendations in just a few simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full text-white text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tell Us Your Preferences
              </h3>
              <p className="text-gray-600">
                Choose your drink type, budget, state, occasion, and flavor preferences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full text-white text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI Analyzes & Matches
              </h3>
              <p className="text-gray-600">
                Our AI considers availability, pricing, and your preferences to find perfect matches.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full text-white text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get Your Recommendations
              </h3>
              <p className="text-gray-600">
                Receive top recommendations with detailed descriptions and pairing suggestions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied users who found their perfect drink
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-semibold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Discover Your Perfect Drink?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users who trust Spirit Guide for their drink recommendations
          </p>
          <Link
            to="/recommend"
            className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg inline-flex items-center transition-colors duration-200"
          >
            Start Your Journey
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Safety Notice */}
      <section className="py-12 px-4 bg-amber-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-amber-600 mr-3" />
            <h3 className="text-xl font-semibold text-amber-800">
              Drink Responsibly
            </h3>
          </div>
          <p className="text-amber-700">
            This app is for educational and entertainment purposes. Please drink responsibly 
            and comply with local laws and regulations regarding alcohol consumption.
          </p>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
