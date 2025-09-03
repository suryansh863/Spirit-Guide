import os
import openai
from typing import List, Dict, Any
from ..models.drink import Drink, Pairing, DrinkRecommendation, FlavorProfile, Occasion
import json

# Initialize OpenAI client
def init_openai():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is required")
    openai.api_key = api_key

def generate_recommendation_explanation(drink: Drink, request_data: Dict[str, Any]) -> str:
    """Generate AI explanation for why a drink was recommended."""
    
    budget = request_data.get('budget', 0)
    budget_percentage = (drink.price / budget * 100) if budget > 0 else 0
    
    prompt = f"""
    You are a premium whiskey expert recommending spirits to Indian customers.
    
    Explain why {drink.name} ({drink.brand}) is one of the BEST whiskeys under ₹{budget} for:
    - Budget: ₹{budget} (This drink costs ₹{drink.price} - {budget_percentage:.1f}% of budget)
    - Drink Type: {request_data['drink_type']}
    - State: {request_data['state']}
    - Occasion: {request_data['occasion']}
    - Flavor Preferences: {', '.join(request_data.get('flavor_preferences', []))}
    
    Drink Details:
    - Price: ₹{drink.price}
    - ABV: {drink.abv}%
    - Flavors: {', '.join(drink.flavors)}
    - Description: {drink.description}
    
    Provide a compelling 2-3 sentence explanation that highlights:
    1. Why this is exceptional value for money
    2. How it perfectly matches their preferences
    3. Why it's worth the price point
    4. Perfect for their specific occasion
    
    Make them feel confident about choosing this premium whiskey. Be enthusiastic and persuasive.
    """
    
    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a knowledgeable sommelier and spirits expert specializing in the Indian market. Provide concise, helpful explanations for drink recommendations."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.7,
            timeout=10  # 10 second timeout
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"AI explanation generation failed: {e}")
        return f"Perfect match for your {request_data['occasion']} occasion with {', '.join(drink.flavors)} flavors within your budget."

def generate_pairings(drink: Drink, occasion: str, use_ai: bool = False) -> List[Pairing]:
    """Generate food and cocktail pairings for a drink."""
    
    # If AI is not requested or fails, use enhanced fallback immediately
    if not use_ai:
        return generate_enhanced_default_pairings(drink, occasion)
    
    # Enhanced prompt for more diverse pairings
    prompt = f"""
    As a culinary expert specializing in food and cocktail pairings for alcoholic beverages, suggest 3 food pairings and 2 cocktail options for {drink.name} ({drink.brand}) for a {occasion} occasion.
    
    Drink Details:
    - Type: {drink.type}
    - Flavors: {', '.join(drink.flavors)}
    - Description: {drink.description}
    - ABV: {drink.abv}%
    
    Consider the specific drink type and create pairings that would be:
    1. Authentic to the drink's origin/culture
    2. Complementary to the flavor profile
    3. Suitable for the occasion
    4. Accessible and practical
    
    For each pairing, provide:
    1. Name
    2. Brief description (1-2 sentences explaining why it pairs well)
    3. For cocktails: list of main ingredients
    
    Format as JSON:
    {{
        "pairings": [
            {{"type": "food", "name": "...", "description": "..."}},
            {{"type": "food", "name": "...", "description": "..."}},
            {{"type": "food", "name": "...", "description": "..."}},
            {{"type": "cocktail", "name": "...", "description": "...", "ingredients": ["...", "..."]}},
            {{"type": "cocktail", "name": "...", "description": "...", "ingredients": ["...", "..."]}}
        ]
    }}
    """
    
    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a culinary expert specializing in food and cocktail pairings for alcoholic beverages. Provide practical, delicious pairing suggestions that are authentic and complementary."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=400,
            temperature=0.8,
            timeout=8  # 8 second timeout
        )
        
        content = response.choices[0].message.content.strip()
        # Try to parse JSON response
        try:
            data = json.loads(content)
            pairings = []
            for pairing_data in data.get("pairings", []):
                pairing = Pairing(
                    type=pairing_data["type"],
                    name=pairing_data["name"],
                    description=pairing_data["description"],
                    ingredients=pairing_data.get("ingredients")
                )
                pairings.append(pairing)
            return pairings
        except json.JSONDecodeError:
            # Fallback to enhanced default pairings
            return generate_enhanced_default_pairings(drink, occasion)
            
    except Exception as e:
        print(f"AI pairing generation failed: {e}")
        # Fallback to enhanced default pairings
        return generate_enhanced_default_pairings(drink, occasion)

def generate_enhanced_default_pairings(drink: Drink, occasion: str) -> List[Pairing]:
    """Generate enhanced default pairings when AI fails, with more variety and drink-specific options."""
    
    pairings = []
    
    # Enhanced food pairings based on drink type and occasion
    if drink.type == "whiskey":
        if occasion == "dinner":
            pairings.extend([
                Pairing(type="food", name="Tandoori Lamb Chops", description="Spicy grilled lamb with smoky notes that complement the whiskey's rich character."),
                Pairing(type="food", name="Aged Cheddar Cheese", description="Sharp, mature cheese brings out the whiskey's vanilla and oak notes."),
                Pairing(type="food", name="Dark Chocolate Truffles", description="Rich chocolate enhances the whiskey's caramel and spice undertones.")
            ])
        elif occasion == "casual":
            pairings.extend([
                Pairing(type="food", name="Spiced Mixed Nuts", description="Warm spices in nuts complement the whiskey's complex flavor profile."),
                Pairing(type="food", name="Smoked Salmon Canapés", description="Smoky fish pairs beautifully with the whiskey's peaty notes."),
                Pairing(type="food", name="Caramel Popcorn", description="Sweet caramel enhances the whiskey's vanilla and toffee flavors.")
            ])
        else:  # party/celebration
            pairings.extend([
                Pairing(type="food", name="Mini Beef Sliders", description="Rich beef patties complement the whiskey's bold, full-bodied character."),
                Pairing(type="food", name="Blue Cheese Stuffed Olives", description="Salty, tangy olives contrast nicely with the whiskey's sweetness."),
                Pairing(type="food", name="Chocolate Covered Coffee Beans", description="Coffee notes enhance the whiskey's roasted, complex flavors.")
            ])
            
    elif drink.type == "beer":
        if occasion == "casual":
            pairings.extend([
                Pairing(type="food", name="Butter Chicken Sliders", description="Creamy curry pairs perfectly with the refreshing beer."),
                Pairing(type="food", name="Spicy Nachos", description="Crunchy chips with cheese and jalapeños complement the beer's crispness."),
                Pairing(type="food", name="Grilled Paneer Skewers", description="Light, grilled cheese pairs well with beer's refreshing profile.")
            ])
        else:
            pairings.extend([
                Pairing(type="food", name="Fish & Chips", description="Classic pub food that complements any beer style."),
                Pairing(type="food", name="Biryani", description="Aromatic rice dish pairs beautifully with beer's carbonation."),
                Pairing(type="food", name="Chicken Wings", description="Spicy wings are perfect with cold beer.")
            ])
            
    elif drink.type == "vodka":
        if occasion == "party":
            pairings.extend([
                Pairing(type="food", name="Caviar on Blinis", description="Premium pairing that showcases vodka's clean, neutral character."),
                Pairing(type="food", name="Smoked Salmon Canapés", description="Delicate fish flavors are enhanced by clean vodka."),
                Pairing(type="food", name="Mini Crab Cakes", description="Light seafood pairs beautifully with vodka's crisp profile.")
            ])
        else:
            pairings.extend([
                Pairing(type="food", name="Fresh Oysters", description="Briny oysters are perfect with chilled vodka."),
                Pairing(type="food", name="Cucumber Sandwiches", description="Light, refreshing sandwiches complement vodka's clean taste."),
                Pairing(type="food", name="Lemon Herb Hummus", description="Fresh herbs and citrus enhance vodka's subtle flavors.")
            ])
            
    elif drink.type == "rum":
        if occasion == "casual":
            pairings.extend([
                Pairing(type="food", name="Caribbean Jerk Chicken", description="Spiced chicken complements rum's tropical, sweet character."),
                Pairing(type="food", name="Coconut Shrimp", description="Tropical flavors that pair naturally with rum."),
                Pairing(type="food", name="Mango Salsa with Chips", description="Sweet, tropical fruit enhances rum's fruity notes.")
            ])
        else:
            pairings.extend([
                Pairing(type="food", name="Chocolate Lava Cake", description="Rich chocolate pairs beautifully with rum's sweetness."),
                Pairing(type="food", name="Pineapple Upside Down Cake", description="Tropical dessert that complements rum perfectly."),
                Pairing(type="food", name="Spiced Nuts", description="Warm spices enhance rum's complex flavor profile.")
            ])
            
    elif drink.type == "gin":
        if occasion == "casual":
            pairings.extend([
                Pairing(type="food", name="Cucumber & Mint Salad", description="Fresh cucumber enhances gin's botanical notes."),
                Pairing(type="food", name="Smoked Salmon", description="Light fish pairs beautifully with gin's crisp profile."),
                Pairing(type="food", name="Herb-Roasted Olives", description="Herbs complement gin's botanical complexity.")
            ])
        else:
            pairings.extend([
                Pairing(type="food", name="Seafood Platter", description="Fresh seafood showcases gin's clean, botanical character."),
                Pairing(type="food", name="Goat Cheese Crostini", description="Tangy cheese pairs well with gin's herbal notes."),
                Pairing(type="food", name="Lemon Herb Chicken", description="Citrus and herbs enhance gin's botanical profile.")
            ])
            
    elif drink.type == "wine":
        if drink.flavors and "red" in str(drink.flavors).lower():
            pairings.extend([
                Pairing(type="food", name="Aged Cheese Board", description="Rich cheeses complement red wine's tannins and fruit."),
                Pairing(type="food", name="Grilled Lamb", description="Rich meat pairs beautifully with full-bodied red wine."),
                Pairing(type="food", name="Dark Chocolate", description="Bittersweet chocolate enhances red wine's complexity.")
            ])
        else:
            pairings.extend([
                Pairing(type="food", name="Fresh Seafood", description="Light seafood pairs perfectly with white wine's crispness."),
                Pairing(type="food", name="Goat Cheese", description="Tangy cheese complements white wine's acidity."),
                Pairing(type="food", name="Light Pasta", description="Simple pasta dishes pair well with white wine.")
            ])
    
    # Enhanced cocktail suggestions based on drink type
    if drink.type == "whiskey":
        pairings.extend([
            Pairing(
                type="cocktail",
                name="Old Fashioned",
                description="Classic cocktail that showcases the whiskey's rich flavors with bitters and sugar.",
                ingredients=["Whiskey", "Angostura bitters", "Sugar cube", "Orange peel", "Ice"]
            ),
            Pairing(
                type="cocktail",
                name="Whiskey Sour",
                description="Refreshing cocktail with citrus that balances the whiskey's bold character.",
                ingredients=["Whiskey", "Fresh lemon juice", "Simple syrup", "Egg white", "Ice"]
            )
        ])
    elif drink.type == "vodka":
        pairings.extend([
            Pairing(
                type="cocktail",
                name="Moscow Mule",
                description="Refreshing cocktail with ginger beer and lime that highlights vodka's clean profile.",
                ingredients=["Vodka", "Ginger beer", "Fresh lime juice", "Mint sprig", "Ice"]
            ),
            Pairing(
                type="cocktail",
                name="Vodka Martini",
                description="Elegant classic that showcases vodka's smooth, clean character.",
                ingredients=["Vodka", "Dry vermouth", "Lemon twist or olives", "Ice"]
            )
        ])
    elif drink.type == "rum":
        pairings.extend([
            Pairing(
                type="cocktail",
                name="Mojito",
                description="Fresh and minty cocktail perfect for warm weather and casual occasions.",
                ingredients=["White rum", "Fresh mint leaves", "Lime juice", "Simple syrup", "Soda water", "Ice"]
            ),
            Pairing(
                type="cocktail",
                name="Dark 'n' Stormy",
                description="Spicy cocktail with ginger beer that complements rum's sweetness.",
                ingredients=["Dark rum", "Ginger beer", "Lime juice", "Ice"]
            )
        ])
    elif drink.type == "gin":
        pairings.extend([
            Pairing(
                type="cocktail",
                name="Gin & Tonic",
                description="Timeless classic that highlights gin's botanical complexity with refreshing tonic.",
                ingredients=["Gin", "Premium tonic water", "Lime wedge", "Ice"]
            ),
            Pairing(
                type="cocktail",
                name="Negroni",
                description="Sophisticated cocktail that showcases gin's herbal notes with sweet vermouth and Campari.",
                ingredients=["Gin", "Sweet vermouth", "Campari", "Orange peel", "Ice"]
            )
        ])
    elif drink.type == "beer":
        pairings.extend([
            Pairing(
                type="cocktail",
                name="Beer Shandy",
                description="Refreshing mix of beer and lemonade perfect for casual gatherings.",
                ingredients=["Beer", "Fresh lemonade", "Lemon slice", "Ice"]
            ),
            Pairing(
                type="cocktail",
                name="Black Velvet",
                description="Elegant mix of stout and champagne for special occasions.",
                ingredients=["Stout beer", "Champagne or sparkling wine", "Chilled glasses"]
            )
        ])
    elif drink.type == "wine":
        pairings.extend([
            Pairing(
                type="cocktail",
                name="Wine Spritzer",
                description="Light, refreshing cocktail that's perfect for casual occasions.",
                ingredients=["White wine", "Soda water", "Lemon slice", "Ice"]
            ),
            Pairing(
                type="cocktail",
                name="Sangria",
                description="Fruity wine cocktail that's great for parties and gatherings.",
                ingredients=["Red wine", "Fresh fruits", "Brandy", "Orange liqueur", "Ice"]
            )
        ])
    
    return pairings

# Keep the old function for backward compatibility but mark as deprecated
def generate_default_pairings(drink: Drink, occasion: str) -> List[Pairing]:
    """Generate default pairings when AI fails. (Deprecated - use generate_enhanced_default_pairings)"""
    return generate_enhanced_default_pairings(drink, occasion)

def calculate_recommendation_score(drink: Drink, request_data: Dict[str, Any]) -> float:
    """Calculate a recommendation score (0-1) based on user preferences."""
    
    score = 0.0
    max_score = 0.0
    
    # Indian brand preference (25% weight) - Prioritize Indian brands
    indian_brand_weight = 0.25
    max_score += indian_brand_weight
    
    # Check if it's an Indian brand
    indian_brands = {
        "United Breweries", "Bira 91", "United Spirits", "Radico Khaitan", 
        "Allied Blenders", "Pernod Ricard", "Carlsberg", "Nao Spirits", 
        "Third Eye Distillery", "Mohan Meakin", "Sula", "Grover Zampa", "Fratelli"
    }
    
    if drink.brand in indian_brands or drink.region == "India":
        score += indian_brand_weight * 1.0  # Full score for Indian brands
    else:
        score += indian_brand_weight * 0.3  # Lower score for international brands
    
    # Budget compatibility (30% weight)
    budget_weight = 0.3
    max_score += budget_weight
    
    if drink.price <= request_data['budget']:
        # Higher score for drinks closer to budget
        price_ratio = drink.price / request_data['budget']
        if price_ratio >= 0.7:  # Good value
            score += budget_weight * 1.0
        elif price_ratio >= 0.5:
            score += budget_weight * 0.8
        else:
            score += budget_weight * 0.6
    
    # Flavor preference matching (25% weight)
    flavor_weight = 0.25
    max_score += flavor_weight
    
    user_flavors = set(request_data.get('flavor_preferences', []))
    drink_flavors = set(drink.flavors)
    
    if user_flavors and drink_flavors:
        flavor_overlap = len(user_flavors.intersection(drink_flavors))
        flavor_score = flavor_overlap / len(user_flavors)
        score += flavor_weight * flavor_score
    elif not user_flavors:
        # If no flavor preferences, give full score
        score += flavor_weight * 1.0
    
    # ABV preference (15% weight)
    abv_weight = 0.15
    max_score += abv_weight
    
    min_abv = request_data.get('min_abv')
    max_abv = request_data.get('max_abv')
    
    if drink.abv and min_abv and max_abv:
        if min_abv <= drink.abv <= max_abv:
            score += abv_weight * 1.0
        else:
            score += abv_weight * 0.3
    elif not min_abv and not max_abv:
        # If no ABV preferences, give full score
        score += abv_weight * 1.0
    
    # Availability in state (5% weight)
    availability_weight = 0.05
    max_score += availability_weight
    
    if request_data['state'] in drink.available_states:
        score += availability_weight * 1.0
    
    return score / max_score if max_score > 0 else 0.0
