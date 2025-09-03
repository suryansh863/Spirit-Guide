from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class DrinkType(str, Enum):
    WHISKEY = "whiskey"
    BEER = "beer"
    VODKA = "vodka"
    RUM = "rum"
    GIN = "gin"
    WINE = "wine"

class FlavorProfile(str, Enum):
    SMOKY = "smoky"
    SWEET = "sweet"
    SPICY = "spicy"
    FRUITY = "fruity"
    HERBAL = "herbal"
    CITRUS = "citrus"
    VANILLA = "vanilla"
    OAKY = "oaky"
    PEATY = "peaty"
    SMOOTH = "smooth"
    CARAMEL = "caramel"
    CLEAN = "clean"
    REFRESHING = "refreshing"
    JUNIPER = "juniper"
    FLORAL = "floral"
    BALANCED = "balanced"
    LIGHT = "light"
    RICH = "rich"
    CRISP = "crisp"
    HONEY = "honey"
    COMPLEX = "complex"
    COCONUT = "coconut"

class Occasion(str, Enum):
    PARTY = "party"
    DINNER = "dinner"
    GIFT = "gift"
    CASUAL = "casual"
    CELEBRATION = "celebration"
    BUSINESS = "business"

class Drink(BaseModel):
    id: str
    name: str
    brand: str
    type: DrinkType
    price: float = Field(..., description="Price in INR")
    abv: Optional[float] = Field(None, description="Alcohol by volume percentage")
    description: str
    flavors: List[FlavorProfile]
    available_states: List[str]
    image_url: Optional[str] = None
    category: Optional[str] = None
    region: Optional[str] = None
    age_statement: Optional[str] = None

class RecommendationRequest(BaseModel):
    budget: float = Field(..., ge=100, le=50000, description="Budget in INR")
    drink_type: DrinkType
    state: str = Field(..., description="Indian state for availability check")
    occasion: Occasion
    flavor_preferences: Optional[List[FlavorProfile]] = []
    min_abv: Optional[float] = Field(None, ge=0, le=100)
    max_abv: Optional[float] = Field(None, ge=0, le=100)

class Pairing(BaseModel):
    type: str = Field(..., description="Type of pairing: food or cocktail")
    name: str
    description: str
    ingredients: Optional[List[str]] = None

class DrinkRecommendation(BaseModel):
    drink: Drink
    score: float = Field(..., description="Recommendation score (0-1)")
    pairings: List[Pairing]
    why_recommended: str = Field(..., description="AI explanation for recommendation")

class RecommendationResponse(BaseModel):
    recommendations: List[DrinkRecommendation]
    total_found: int
    budget_range: str
    search_criteria: RecommendationRequest

class DrinkDetailResponse(BaseModel):
    drink: Drink
    pairings: List[Pairing]
    similar_drinks: List[Drink]
    availability_info: dict
