from fastapi import APIRouter
from typing import List, Dict

router = APIRouter()

@router.get("/states")
async def get_states():
    """
    Get list of Indian states where alcohol is available.
    """
    return {
        "states": [
            {"value": "Delhi", "label": "Delhi"},
            {"value": "Maharashtra", "label": "Maharashtra"},
            {"value": "Karnataka", "label": "Karnataka"},
            {"value": "Tamil Nadu", "label": "Tamil Nadu"},
            {"value": "West Bengal", "label": "West Bengal"},
            {"value": "Telangana", "label": "Telangana"},
            {"value": "Andhra Pradesh", "label": "Andhra Pradesh"},
            {"value": "Kerala", "label": "Kerala"},
            {"value": "Goa", "label": "Goa"},
            {"value": "Punjab", "label": "Punjab"},
            {"value": "Haryana", "label": "Haryana"},
            {"value": "Uttarakhand", "label": "Uttarakhand"},
            {"value": "Himachal Pradesh", "label": "Himachal Pradesh"},
            {"value": "Jammu & Kashmir", "label": "Jammu & Kashmir"},
            {"value": "Assam", "label": "Assam"},
            {"value": "Manipur", "label": "Manipur"},
            {"value": "Meghalaya", "label": "Meghalaya"},
            {"value": "Tripura", "label": "Tripura"},
            {"value": "Arunachal Pradesh", "label": "Arunachal Pradesh"},
            {"value": "Sikkim", "label": "Sikkim"},
            {"value": "Jharkhand", "label": "Jharkhand"},
            {"value": "Odisha", "label": "Odisha"},
            {"value": "Chhattisgarh", "label": "Chhattisgarh"},
            {"value": "Madhya Pradesh", "label": "Madhya Pradesh"},
            {"value": "Rajasthan", "label": "Rajasthan"},
            {"value": "Uttar Pradesh", "label": "Uttar Pradesh"},
            {"value": "Chandigarh", "label": "Chandigarh"},
            {"value": "Dadra and Nagar Haveli", "label": "Dadra and Nagar Haveli"},
            {"value": "Daman and Diu", "label": "Daman and Diu"},
            {"value": "Lakshadweep", "label": "Lakshadweep"},
            {"value": "Puducherry", "label": "Puducherry"},
            {"value": "Andaman and Nicobar Islands", "label": "Andaman and Nicobar Islands"}
        ]
    }

@router.get("/states/restrictions")
async def get_state_restrictions():
    """
    Get information about alcohol restrictions by state.
    """
    return {
        "restrictions": {
            "Gujarat": {
                "status": "Prohibited",
                "description": "Complete prohibition on alcohol sale and consumption",
                "exceptions": "Medical and industrial use only"
            },
            "Bihar": {
                "status": "Prohibited",
                "description": "Complete prohibition on alcohol sale and consumption",
                "exceptions": "Medical and industrial use only"
            },
            "Nagaland": {
                "status": "Prohibited",
                "description": "Complete prohibition on alcohol sale and consumption",
                "exceptions": "Medical and industrial use only"
            },
            "Lakshadweep": {
                "status": "Prohibited",
                "description": "Complete prohibition on alcohol sale and consumption",
                "exceptions": "Medical and industrial use only"
            },
            "Kerala": {
                "status": "Restricted",
                "description": "Limited availability through government outlets only",
                "exceptions": "Tourist areas may have special permits"
            },
            "Mizoram": {
                "status": "Restricted",
                "description": "Limited availability through government outlets only",
                "exceptions": "Tourist areas may have special permits"
            },
            "Manipur": {
                "status": "Restricted",
                "description": "Limited availability through government outlets only",
                "exceptions": "Tourist areas may have special permits"
            }
        },
        "general_info": {
            "legal_age": "Most states require 25+ years for alcohol consumption",
            "purchase_hours": "Typically 10 AM to 10 PM, varies by state",
            "government_control": "Many states have government-run liquor stores",
            "online_delivery": "Available in select states with proper licensing"
        }
    }

@router.get("/states/{state_name}/info")
async def get_state_info(state_name: str):
    """
    Get detailed information about alcohol availability in a specific state.
    """
    state_info = {
        "Delhi": {
            "availability": "Available",
            "legal_age": 25,
            "purchase_hours": "10:00 AM - 10:00 PM",
            "government_stores": True,
            "private_stores": True,
            "online_delivery": True,
            "special_notes": "Delhi has both government and private liquor stores"
        },
        "Mumbai": {
            "availability": "Available",
            "legal_age": 25,
            "purchase_hours": "10:00 AM - 10:00 PM",
            "government_stores": True,
            "private_stores": True,
            "online_delivery": True,
            "special_notes": "Maharashtra has a mix of government and private outlets"
        },
        "Bangalore": {
            "availability": "Available",
            "legal_age": 21,
            "purchase_hours": "10:00 AM - 11:00 PM",
            "government_stores": True,
            "private_stores": True,
            "online_delivery": True,
            "special_notes": "Karnataka has liberal alcohol policies"
        },
        "Chennai": {
            "availability": "Available",
            "legal_age": 21,
            "purchase_hours": "10:00 AM - 10:00 PM",
            "government_stores": True,
            "private_stores": False,
            "online_delivery": False,
            "special_notes": "Tamil Nadu has government-controlled liquor sales"
        },
        "Kolkata": {
            "availability": "Available",
            "legal_age": 25,
            "purchase_hours": "10:00 AM - 10:00 PM",
            "government_stores": True,
            "private_stores": False,
            "online_delivery": False,
            "special_notes": "West Bengal has government-controlled liquor sales"
        }
    }
    
    if state_name in state_info:
        return {"state": state_name, **state_info[state_name]}
    else:
        return {
            "state": state_name,
            "availability": "Available",
            "legal_age": 25,
            "purchase_hours": "10:00 AM - 10:00 PM",
            "government_stores": True,
            "private_stores": False,
            "online_delivery": False,
            "special_notes": "Standard alcohol regulations apply"
        }
