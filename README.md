# Spirit Guide - AI-Powered Alcohol Recommendation App

A full-stack AI-powered alcohol recommendation app designed specifically for the Indian market. The app helps users discover the best whiskey, beer, vodka, rum, or gin based on their budget, location, preferences, and occasion.

## 🚀 Features

- **Smart Recommendations**: AI-powered drink suggestions based on user preferences
- **Indian Market Focus**: State-specific availability and pricing
- **Mobile-First Design**: Responsive layout optimized for mobile devices
- **Cocktail & Food Pairings**: AI-generated pairing suggestions
- **Budget Filtering**: Price-based recommendations
- **Regional Compliance**: Handles state-level alcohol regulations

## 🛠 Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Vite (for fast development)
- React Router
- Axios for API calls

### Backend
- Python 3.11+
- FastAPI
- OpenAI API integration
- Pydantic for data validation
- Uvicorn for ASGI server

## 📁 Project Structure

```
spirit-guide/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── data/          # Static data and constants
│   ├── public/            # Static assets
│   └── package.json
├── server/                # FastAPI backend
│   ├── app/
│   │   ├── models/        # Pydantic models
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   └── data/          # Drink database
│   ├── main.py           # FastAPI app entry point
│   └── requirements.txt
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- OpenAI API key

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

5. Run the backend server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

## 🔧 Environment Variables

Create a `.env` file in the server directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 📊 Data Structure

The app uses a curated dataset of Indian and imported alcoholic beverages with the following structure:

```json
{
  "id": "unique_id",
  "name": "Drink Name",
  "type": "whiskey|beer|vodka|rum|gin",
  "brand": "Brand Name",
  "price": 1000,
  "abv": 40.0,
  "description": "Tasting notes and description",
  "flavors": ["smoky", "sweet", "spicy"],
  "available_states": ["Delhi", "Mumbai", "Bangalore"],
  "image_url": "https://example.com/image.jpg",
  "category": "single_malt|blended|premium"
}
```

## 🎯 API Endpoints

### POST /api/recommendations
Get drink recommendations based on user preferences

**Request Body:**
```json
{
  "budget": 1000,
  "drink_type": "whiskey",
  "state": "Delhi",
  "occasion": "dinner",
  "flavor_preferences": ["smoky", "sweet"]
}
```

### GET /api/drinks/{drink_id}
Get detailed information about a specific drink

### GET /api/states
Get list of Indian states where alcohol is available

### GET /api/drink-types
Get available drink types

## 🎨 UI Components

- **Landing Page**: Brand introduction and app overview
- **Recommendation Form**: User input form with sliders and dropdowns
- **Results Page**: Drink recommendations with details and pairings
- **Drink Detail Modal**: Detailed view of selected drink
- **Age Verification**: Modal for age verification (25+ requirement)

## 🔒 Legal Compliance

- Age verification (25+ requirement for most Indian states)
- State-specific availability handling
- Regional pricing differences
- Compliance with local alcohol regulations

## 🚀 Deployment

### Backend Deployment (Railway/Render)
1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy to Vercel or Netlify
3. Set environment variables for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue on GitHub.

---

**Note**: This app is for educational and entertainment purposes. Please drink responsibly and comply with local laws and regulations regarding alcohol consumption and purchase.
