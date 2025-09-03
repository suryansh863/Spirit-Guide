from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..models.drink import RecommendationRequest, RecommendationResponse, DrinkRecommendation
from ..services.recommendation_service import RecommendationService

router = APIRouter()

# Dependency to get recommendation service
def get_recommendation_service():
    return RecommendationService()

@router.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(
    request: RecommendationRequest,
    service: RecommendationService = Depends(get_recommendation_service)
):
    """
    Get drink recommendations based on user preferences.
    
    - **budget**: Maximum budget in INR
    - **drink_type**: Type of drink (whiskey, beer, vodka, rum, gin)
    - **state**: Indian state for availability check
    - **occasion**: Occasion for drinking (party, dinner, gift, etc.)
    - **flavor_preferences**: Optional list of preferred flavors
    - **min_abv**: Optional minimum alcohol percentage
    - **max_abv**: Optional maximum alcohol percentage
    """
    try:
        recommendations = service.get_recommendations(request)
        
        if not recommendations.recommendations:
            raise HTTPException(
                status_code=404,
                detail=f"No drinks found matching your criteria. Try adjusting your budget (₹{request.budget}) or preferences."
            )
        
        return recommendations
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@router.get("/recommendations/quick", response_model=List[DrinkRecommendation])
async def get_quick_recommendations(
    drink_type: str,
    budget: float,
    state: str,
    service: RecommendationService = Depends(get_recommendation_service)
):
    """
    Get quick drink recommendations with minimal parameters.
    """
    try:
        # Create a basic request
        request = RecommendationRequest(
            budget=budget,
            drink_type=drink_type,
            state=state,
            occasion="casual"
        )
        
        recommendations = service.get_recommendations(request)
        return recommendations.recommendations[:3]  # Return top 3
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating quick recommendations: {str(e)}")
