from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..models.drink import Drink, DrinkDetailResponse
from ..services.recommendation_service import RecommendationService
from ..services.ai_service import generate_pairings

router = APIRouter()

# Dependency to get recommendation service
def get_recommendation_service():
    return RecommendationService()

@router.get("/drinks/types")
async def get_drink_types():
    """
    Get all available drink types.
    """
    return {
        "drink_types": [
            {"value": "whiskey", "label": "Whiskey"},
            {"value": "beer", "label": "Beer"},
            {"value": "vodka", "label": "Vodka"},
            {"value": "rum", "label": "Rum"},
            {"value": "gin", "label": "Gin"},
            {"value": "wine", "label": "Wine"}
        ]
    }

@router.get("/drinks/flavors")
async def get_flavor_profiles():
    """
    Get all available flavor profiles.
    """
    return {
        "flavors": [
            {"value": "smoky", "label": "Smoky"},
            {"value": "sweet", "label": "Sweet"},
            {"value": "spicy", "label": "Spicy"},
            {"value": "fruity", "label": "Fruity"},
            {"value": "herbal", "label": "Herbal"},
            {"value": "citrus", "label": "Citrus"},
            {"value": "vanilla", "label": "Vanilla"},
            {"value": "oaky", "label": "Oaky"},
            {"value": "peaty", "label": "Peaty"},
            {"value": "smooth", "label": "Smooth"},
            {"value": "caramel", "label": "Caramel"},
            {"value": "clean", "label": "Clean"},
            {"value": "refreshing", "label": "Refreshing"},
            {"value": "juniper", "label": "Juniper"},
            {"value": "floral", "label": "Floral"},
            {"value": "balanced", "label": "Balanced"},
            {"value": "light", "label": "Light"},
            {"value": "rich", "label": "Rich"},
            {"value": "crisp", "label": "Crisp"},
            {"value": "honey", "label": "Honey"},
            {"value": "complex", "label": "Complex"},
            {"value": "coconut", "label": "Coconut"}
        ]
    }

@router.get("/drinks", response_model=List[Drink])
async def get_drinks(
    drink_type: str = None,
    state: str = None,
    min_price: float = None,
    max_price: float = None,
    service: RecommendationService = Depends(get_recommendation_service)
):
    """
    Get drinks with optional filtering.
    
    - **drink_type**: Filter by drink type
    - **state**: Filter by availability in state
    - **min_price**: Minimum price filter
    - **max_price**: Maximum price filter
    """
    try:
        drinks = service.drinks
        
        # Apply filters
        if drink_type:
            drinks = [d for d in drinks if d.type == drink_type]
        
        if state:
            drinks = [d for d in drinks if state in d.available_states]
        
        if min_price is not None:
            drinks = [d for d in drinks if d.price >= min_price]
        
        if max_price is not None:
            drinks = [d for d in drinks if d.price <= max_price]
        
        return drinks
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving drinks: {str(e)}")

@router.get("/drinks/{drink_id}", response_model=DrinkDetailResponse)
async def get_drink_details(
    drink_id: str,
    service: RecommendationService = Depends(get_recommendation_service)
):
    """
    Get detailed information about a specific drink including pairings and similar drinks.
    """
    try:
        drink = service.get_drink_by_id(drink_id)
        
        if not drink:
            raise HTTPException(
                status_code=404,
                detail=f"Drink with ID '{drink_id}' not found"
            )
        
        # Generate pairings for the drink
        pairings = generate_pairings(drink, "casual")
        
        # Get similar drinks
        similar_drinks = service.get_similar_drinks(drink)
        
        # Get availability info
        availability_info = {
            "available_states": drink.available_states,
            "total_states": len(drink.available_states),
            "price_range": f"₹{drink.price}",
            "abv": f"{drink.abv}%" if drink.abv else "Not specified"
        }
        
        return DrinkDetailResponse(
            drink=drink,
            pairings=pairings,
            similar_drinks=similar_drinks,
            availability_info=availability_info
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving drink details: {str(e)}")