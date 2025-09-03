import json
from typing import List, Dict, Any
from ..models.drink import Drink, DrinkRecommendation, RecommendationRequest, RecommendationResponse
from .ai_service import generate_recommendation_explanation, generate_pairings, calculate_recommendation_score

class RecommendationService:
    def __init__(self):
        self.drinks = self._load_drinks()
    
    def _load_drinks(self) -> List[Drink]:
        """Load drinks from JSON file."""
        try:
            # Try to load expanded database first, fallback to original
            try:
                with open("app/data/spirits_expanded.json", "r", encoding="utf-8") as f:
                    drinks_data = json.load(f)
            except FileNotFoundError:
                with open("app/data/drinks.json", "r", encoding="utf-8") as f:
                    drinks_data = json.load(f)
            
            return [Drink(**drink) for drink in drinks_data]
        except Exception as e:
            print(f"Error loading drinks: {e}")
            return []
    
    def get_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        """Get drink recommendations based on user preferences."""
        
        # Filter drinks based on criteria
        filtered_drinks = self._filter_drinks(request)
        
        # Calculate scores and create recommendations
        recommendations = []
        for drink in filtered_drinks:
            score = calculate_recommendation_score(drink, request.dict())
            
            # Check if user wants AI explanations and pairings
            use_ai_pairings = getattr(request, 'use_ai_pairings', False)
            
            if use_ai_pairings:
                # Generate AI explanations and pairings
                why_recommended = generate_recommendation_explanation(drink, request.dict())
                pairings = generate_pairings(drink, request.occasion, use_ai=True)
            else:
                # Use fallback explanations and pairings for faster performance
                why_recommended = f"Perfect match for your {request.occasion} occasion with {', '.join(drink.flavors)} flavors within your budget."
                pairings = generate_pairings(drink, request.occasion, use_ai=False)
            
            recommendation = DrinkRecommendation(
                drink=drink,
                score=score,
                pairings=pairings,
                why_recommended=why_recommended
            )
            recommendations.append(recommendation)
        
        # Sort by score (highest first) and take top 5
        recommendations.sort(key=lambda x: x.score, reverse=True)
        top_recommendations = recommendations[:5]
        
        # Determine budget range
        budget_range = self._get_budget_range(request.budget)
        
        return RecommendationResponse(
            recommendations=top_recommendations,
            total_found=len(filtered_drinks),
            budget_range=budget_range,
            search_criteria=request
        )
    
    def _filter_drinks(self, request: RecommendationRequest) -> List[Drink]:
        """Filter drinks based on user preferences."""
        filtered = []
        
        # Calculate minimum price (25% of budget)
        min_price = request.budget * 0.25
        
        for drink in self.drinks:
            # Check drink type
            if drink.type != request.drink_type:
                continue
            
            # Check budget (don't exceed budget)
            if drink.price > request.budget:
                continue
            
            # Check minimum price (don't show below 25% of budget)
            if drink.price < min_price:
                continue
            
            # Check state availability
            if request.state not in drink.available_states:
                continue
            
            # Check ABV range if specified
            if request.min_abv and drink.abv and drink.abv < request.min_abv:
                continue
            if request.max_abv and drink.abv and drink.abv > request.max_abv:
                continue
            
            # Check flavor preferences if specified
            if request.flavor_preferences:
                drink_flavors = set(drink.flavors)
                user_flavors = set(request.flavor_preferences)
                if not drink_flavors.intersection(user_flavors):
                    continue
            
            filtered.append(drink)
        
        return filtered
    
    def _get_budget_range(self, budget: float) -> str:
        """Get budget range description."""
        min_price = budget * 0.25
        if budget <= 500:
            return f"Budget-friendly (₹{min_price:.0f}-₹{budget})"
        elif budget <= 1500:
            return f"Mid-range (₹{min_price:.0f}-₹{budget})"
        elif budget <= 5000:
            return f"Premium (₹{min_price:.0f}-₹{budget})"
        elif budget <= 20000:
            return f"Luxury (₹{min_price:.0f}-₹{budget})"
        else:
            return f"Ultra-Premium (₹{min_price:.0f}-₹{budget})"
    
    def get_drink_by_id(self, drink_id: str) -> Drink:
        """Get a specific drink by ID."""
        for drink in self.drinks:
            if drink.id == drink_id:
                return drink
        return None
    
    def get_similar_drinks(self, drink: Drink, limit: int = 3) -> List[Drink]:
        """Get similar drinks based on type and price range."""
        similar = []
        price_range = (drink.price * 0.7, drink.price * 1.3)
        
        for other_drink in self.drinks:
            if other_drink.id == drink.id:
                continue
            
            if other_drink.type == drink.type:
                if price_range[0] <= other_drink.price <= price_range[1]:
                    similar.append(other_drink)
            
            if len(similar) >= limit:
                break
        
        return similar
    
    def get_drinks_by_type(self, drink_type: str) -> List[Drink]:
        """Get all drinks of a specific type."""
        return [drink for drink in self.drinks if drink.type == drink_type]
    
    def get_drinks_by_state(self, state: str) -> List[Drink]:
        """Get all drinks available in a specific state."""
        return [drink for drink in self.drinks if state in drink.available_states]
    
    def get_drinks_by_price_range(self, min_price: float, max_price: float) -> List[Drink]:
        """Get drinks within a price range."""
        return [drink for drink in self.drinks if min_price <= drink.price <= max_price]
