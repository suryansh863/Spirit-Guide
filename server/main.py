from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

from app.routes import recommendations, drinks, states
from app.services.ai_service import init_openai

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Spirit Guide API",
    description="AI-powered alcohol recommendation API for the Indian market",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
init_openai()

# Include routers
app.include_router(recommendations.router, prefix="/api", tags=["recommendations"])
app.include_router(drinks.router, prefix="/api", tags=["drinks"])
app.include_router(states.router, prefix="/api", tags=["states"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Spirit Guide API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "spirit-guide-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "true").lower() == "true"
    )
