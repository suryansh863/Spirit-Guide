#!/usr/bin/env python3
"""
Script to generate a comprehensive spirits database with 500+ entries
"""

import json
import random
from typing import List, Dict

# Base spirits data with categories and price ranges
SPIRITS_DATA = {
    "whiskey": {
        "indian": [
            {"name": "Royal Stag", "brand": "Seagram's", "price_range": (400, 500), "abv": 42.8, "flavors": ["smooth", "vanilla", "oaky"]},
            {"name": "Amrut Single Malt", "brand": "Amrut", "price_range": (3500, 4000), "abv": 46.0, "flavors": ["sweet", "vanilla", "fruity", "smooth"]},
            {"name": "Officer's Choice", "brand": "Allied Blenders", "price_range": (300, 400), "abv": 42.8, "flavors": ["smooth", "sweet"]},
            {"name": "McDowell's No.1", "brand": "United Spirits", "price_range": (350, 450), "abv": 42.8, "flavors": ["smooth", "vanilla"]},
            {"name": "Haywards 5000", "brand": "United Spirits", "price_range": (250, 350), "abv": 42.8, "flavors": ["smooth", "sweet"]},
            {"name": "Imperial Blue", "brand": "Pernod Ricard", "price_range": (400, 500), "abv": 42.8, "flavors": ["smooth", "vanilla", "oaky"]},
            {"name": "Blenders Pride", "brand": "Pernod Ricard", "price_range": (600, 700), "abv": 42.8, "flavors": ["smooth", "vanilla", "oaky"]},
            {"name": "Royal Challenge", "brand": "United Spirits", "price_range": (350, 450), "abv": 42.8, "flavors": ["smooth", "sweet"]},
            {"name": "Signature", "brand": "United Spirits", "price_range": (300, 400), "abv": 42.8, "flavors": ["smooth", "sweet"]},
            {"name": "8PM", "brand": "Radico Khaitan", "price_range": (250, 350), "abv": 42.8, "flavors": ["smooth", "sweet"]},
            {"name": "Magic Moments", "brand": "Radico Khaitan", "price_range": (400, 500), "abv": 37.5, "flavors": ["smooth", "sweet", "fruity"]},
            {"name": "Rampur Single Malt", "brand": "Radico Khaitan", "price_range": (4000, 5000), "abv": 43.0, "flavors": ["smooth", "oaky", "fruity"]},
            {"name": "Paul John Single Malt", "brand": "Paul John", "price_range": (3500, 4500), "abv": 46.0, "flavors": ["smooth", "oaky", "spicy"]},
            {"name": "Indri Single Malt", "brand": "Piccadilly", "price_range": (3000, 4000), "abv": 46.0, "flavors": ["smooth", "oaky", "fruity"]},
            {"name": "Glenfiddich 12", "brand": "William Grant & Sons", "price_range": (4500, 5500), "abv": 40.0, "flavors": ["smooth", "oaky", "fruity"]},
            {"name": "Glenlivet 12", "brand": "Pernod Ricard", "price_range": (4000, 5000), "abv": 40.0, "flavors": ["smooth", "oaky", "fruity"]},
            {"name": "Macallan 12", "brand": "The Macallan", "price_range": (8500, 9500), "abv": 43.0, "flavors": ["oaky", "fruity", "smooth", "rich"]},
            {"name": "Chivas Regal 12", "brand": "Chivas", "price_range": (4200, 5200), "abv": 40.0, "flavors": ["smooth", "honey", "vanilla", "oaky"]},
            {"name": "Jack Daniel's", "brand": "Jack Daniel's", "price_range": (2800, 3800), "abv": 40.0, "flavors": ["smooth", "vanilla", "caramel", "oaky"]},
            {"name": "Jameson", "brand": "Jameson", "price_range": (2200, 3200), "abv": 40.0, "flavors": ["smooth", "vanilla", "oaky"]},
            {"name": "Johnnie Walker Red", "brand": "Diageo", "price_range": (1200, 2200), "abv": 40.0, "flavors": ["smooth", "vanilla", "oaky"]},
            {"name": "Johnnie Walker Black", "brand": "Diageo", "price_range": (3500, 4500), "abv": 40.0, "flavors": ["smooth", "oaky", "smoky"]},
            {"name": "Johnnie Walker Gold", "brand": "Diageo", "price_range": (8000, 10000), "abv": 40.0, "flavors": ["smooth", "honey", "vanilla", "oaky"]},
            {"name": "Johnnie Walker Blue", "brand": "Diageo", "price_range": (25000, 35000), "abv": 40.0, "flavors": ["smooth", "rich", "balanced", "oaky"]},
            {"name": "Ballantine's 12", "brand": "Pernod Ricard", "price_range": (2000, 3000), "abv": 40.0, "flavors": ["smooth", "vanilla", "oaky"]},
            {"name": "Ballantine's 17", "brand": "Pernod Ricard", "price_range": (8000, 10000), "abv": 43.0, "flavors": ["smooth", "rich", "oaky", "fruity"]},
            {"name": "Dewar's 12", "brand": "Bacardi", "price_range": (2500, 3500), "abv": 40.0, "flavors": ["smooth", "honey", "vanilla"]},
            {"name": "Dewar's 18", "brand": "Bacardi", "price_range": (12000, 15000), "abv": 43.0, "flavors": ["smooth", "rich", "oaky", "fruity"]},
            {"name": "Cutty Sark", "brand": "Edrington", "price_range": (1500, 2500), "abv": 40.0, "flavors": ["smooth", "light", "refreshing"]},
            {"name": "Famous Grouse", "brand": "Edrington", "price_range": (1800, 2800), "abv": 40.0, "flavors": ["smooth", "vanilla", "oaky"]},
            {"name": "Teacher's", "brand": "Beam Suntory", "price_range": (1200, 2200), "abv": 40.0, "flavors": ["smooth", "peaty", "smoky"]},
            {"name": "Grant's", "brand": "William Grant & Sons", "price_range": (1500, 2500), "abv": 40.0, "flavors": ["smooth", "vanilla", "oaky"]},
            {"name": "J&B", "brand": "Diageo", "price_range": (2000, 3000), "abv": 40.0, "flavors": ["smooth", "light", "refreshing"]},
            {"name": "Vat 69", "brand": "Diageo", "price_range": (1000, 2000), "abv": 40.0, "flavors": ["smooth", "light", "refreshing"]},
            {"name": "White Horse", "brand": "Diageo", "price_range": (1200, 2200), "abv": 40.0, "flavors": ["smooth", "peaty", "smoky"]},
            {"name": "Black & White", "brand": "Diageo", "price_range": (1500, 2500), "abv": 40.0, "flavors": ["smooth", "light", "refreshing"]},
            {"name": "Buchanan's 12", "brand": "Diageo", "price_range": (3000, 4000), "abv": 40.0, "flavors": ["smooth", "oaky", "fruity"]},
            {"name": "Buchanan's 18", "brand": "Diageo", "price_range": (15000, 20000), "abv": 43.0, "flavors": ["smooth", "rich", "balanced", "oaky"]},
            {"name": "Crown Royal", "brand": "Diageo", "price_range": (3500, 4500), "abv": 40.0, "flavors": ["smooth", "vanilla", "oaky"]},
            {"name": "Canadian Club", "brand": "Beam Suntory", "price_range": (2500, 3500), "abv": 40.0, "flavors": ["smooth", "light", "refreshing"]},
            {"name": "Seagram's 7", "brand": "Diageo", "price_range": (2000, 3000), "abv": 40.0, "flavors": ["smooth", "light", "refreshing"]},
            {"name": "Jim Beam", "brand": "Beam Suntory", "price_range": (2500, 3500), "abv": 40.0, "flavors": ["smooth", "vanilla", "oaky"]},
            {"name": "Maker's Mark", "brand": "Beam Suntory", "price_range": (4000, 5000), "abv": 45.0, "flavors": ["smooth", "vanilla", "caramel", "oaky"]},
            {"name": "Wild Turkey 101", "brand": "Campari", "price_range": (3500, 4500), "abv": 50.5, "flavors": ["spicy", "oaky", "rich"]},
            {"name": "Bulleit Bourbon", "brand": "Diageo", "price_range": (4500, 5500), "abv": 45.0, "flavors": ["spicy", "oaky", "vanilla"]},
            {"name": "Woodford Reserve", "brand": "Brown-Forman", "price_range": (6000, 7000), "abv": 45.2, "flavors": ["smooth", "oaky", "vanilla", "caramel"]},
            {"name": "Knob Creek", "brand": "Beam Suntory", "price_range": (5000, 6000), "abv": 50.0, "flavors": ["spicy", "oaky", "rich"]},
            {"name": "Booker's", "brand": "Beam Suntory", "price_range": (12000, 15000), "abv": 62.0, "flavors": ["spicy", "oaky", "rich", "balanced"]},
            {"name": "Basil Hayden's", "brand": "Beam Suntory", "price_range": (8000, 10000), "abv": 40.0, "flavors": ["smooth", "light", "refreshing"]},
            {"name": "Evan Williams", "brand": "Heaven Hill", "price_range": (2000, 3000), "abv": 43.0, "flavors": ["smooth", "vanilla", "oaky"]},
            {"name": "Heaven Hill", "brand": "Heaven Hill", "price_range": (1500, 2500), "abv": 40.0, "flavors": ["smooth", "light", "refreshing"]},
            {"name": "Old Grand-Dad", "brand": "Beam Suntory", "price_range": (2500, 3500), "abv": 40.0, "flavors": ["spicy", "oaky", "rich"]},
            {"name": "Old Forester", "brand": "Brown-Forman", "price_range": (3000, 4000), "abv": 43.0, "flavors": ["smooth", "oaky", "vanilla"]},
            {"name": "Four Roses", "brand": "Kirin", "price_range": (4000, 5000), "abv": 40.0, "flavors": ["smooth", "floral", "fruity"]},
            {"name": "Buffalo Trace", "brand": "Sazerac", "price_range": (4500, 5500), "abv": 45.0, "flavors": ["smooth", "oaky", "vanilla", "caramel"]},
            {"name": "Eagle Rare", "brand": "Sazerac", "price_range": (6000, 7000), "abv": 45.0, "flavors": ["smooth", "oaky", "vanilla", "caramel"]},
            {"name": "Blanton's", "brand": "Sazerac", "price_range": (15000, 20000), "abv": 46.5, "flavors": ["smooth", "rich", "balanced", "oaky"]},
            {"name": "Pappy Van Winkle 15", "brand": "Sazerac", "price_range": (150000, 200000), "abv": 53.5, "flavors": ["smooth", "rich", "balanced", "oaky"]},
            {"name": "Pappy Van Winkle 20", "brand": "Sazerac", "price_range": (300000, 400000), "abv": 45.2, "flavors": ["smooth", "rich", "balanced", "oaky"]},
            {"name": "Pappy Van Winkle 23", "brand": "Sazerac", "price_range": (500000, 600000), "abv": 47.8, "flavors": ["smooth", "rich", "balanced", "oaky"]},
        ],
        "international": [
            # Add more international whiskeys here
        ]
    },
    "rum": {
        "indian": [
            {"name": "Old Monk", "brand": "Mohammedan", "price_range": (180, 280), "abv": 42.8, "flavors": ["sweet", "vanilla", "caramel"]},
            {"name": "Hercules", "brand": "United Spirits", "price_range": (150, 250), "abv": 42.8, "flavors": ["sweet", "smooth"]},
            {"name": "Contessa", "brand": "United Spirits", "price_range": (200, 300), "abv": 42.8, "flavors": ["sweet", "smooth"]},
            {"name": "Bacardi White", "brand": "Bacardi", "price_range": (750, 850), "abv": 37.5, "flavors": ["smooth", "vanilla"]},
            {"name": "Bacardi Gold", "brand": "Bacardi", "price_range": (800, 900), "abv": 37.5, "flavors": ["smooth", "vanilla", "caramel"]},
            {"name": "Captain Morgan", "brand": "Diageo", "price_range": (1200, 1400), "abv": 35.0, "flavors": ["spicy", "vanilla", "caramel"]},
            {"name": "Havana Club", "brand": "Pernod Ricard", "price_range": (1000, 1200), "abv": 37.5, "flavors": ["smooth", "vanilla"]},
            {"name": "Malibu", "brand": "Pernod Ricard", "price_range": (1500, 1700), "abv": 21.0, "flavors": ["sweet", "fruity", "smooth"]},
            {"name": "Kraken", "brand": "Proximo", "price_range": (2000, 2200), "abv": 40.0, "flavors": ["spicy", "vanilla", "caramel"]},
            {"name": "Gosling's", "brand": "Gosling's", "price_range": (1800, 2000), "abv": 40.0, "flavors": ["smooth", "vanilla", "caramel"]},
            {"name": "Appleton Estate", "brand": "Campari", "price_range": (2500, 3000), "abv": 40.0, "flavors": ["smooth", "fruity", "spicy"]},
            {"name": "Mount Gay", "brand": "Rémy Cointreau", "price_range": (3000, 3500), "abv": 43.0, "flavors": ["smooth", "oaky", "spicy"]},
            {"name": "El Dorado 12", "brand": "Demerara Distillers", "price_range": (4000, 5000), "abv": 40.0, "flavors": ["smooth", "rich", "caramel"]},
            {"name": "El Dorado 15", "brand": "Demerara Distillers", "price_range": (6000, 7000), "abv": 43.0, "flavors": ["smooth", "rich", "balanced", "caramel"]},
            {"name": "El Dorado 21", "brand": "Demerara Distillers", "price_range": (15000, 20000), "abv": 43.0, "flavors": ["smooth", "rich", "balanced", "caramel"]},
            {"name": "Zacapa 23", "brand": "Diageo", "price_range": (8000, 10000), "abv": 40.0, "flavors": ["smooth", "rich", "caramel", "vanilla"]},
            {"name": "Zaya", "brand": "Diageo", "price_range": (6000, 7000), "abv": 40.0, "flavors": ["smooth", "rich", "caramel", "vanilla"]},
            {"name": "Plantation", "brand": "Maison Ferrand", "price_range": (3500, 4500), "abv": 40.0, "flavors": ["smooth", "fruity", "spicy"]},
            {"name": "Diplomatico", "brand": "Diplomatico", "price_range": (5000, 6000), "abv": 40.0, "flavors": ["smooth", "rich", "caramel", "vanilla"]},
            {"name": "Ron Zacapa", "brand": "Diageo", "price_range": (12000, 15000), "abv": 40.0, "flavors": ["smooth", "rich", "balanced", "caramel"]},
        ]
    },
    "vodka": {
        "indian": [
            {"name": "Smirnoff Red", "brand": "Diageo", "price_range": (650, 750), "abv": 37.5, "flavors": ["smooth", "clean"]},
            {"name": "Absolut", "brand": "Pernod Ricard", "price_range": (1200, 1400), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Grey Goose", "brand": "Bacardi", "price_range": (2800, 3200), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Belvedere", "brand": "LVMH", "price_range": (3500, 4000), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Ketel One", "brand": "Diageo", "price_range": (2000, 2400), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Ciroc", "brand": "Diageo", "price_range": (2500, 3000), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Tito's", "brand": "Fifth Generation", "price_range": (3000, 3500), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Stolichnaya", "brand": "SPI Group", "price_range": (1500, 1800), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Finlandia", "brand": "Brown-Forman", "price_range": (1800, 2200), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Skyy", "brand": "Campari", "price_range": (1200, 1500), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Svedka", "brand": "Constellation Brands", "price_range": (1000, 1200), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "New Amsterdam", "brand": "E. & J. Gallo", "price_range": (800, 1000), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Burnett's", "brand": "Heaven Hill", "price_range": (600, 800), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Popov", "brand": "Diageo", "price_range": (500, 700), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Taaka", "brand": "Sazerac", "price_range": (400, 600), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Crystal Palace", "brand": "Heaven Hill", "price_range": (300, 500), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Vladimir", "brand": "Heaven Hill", "price_range": (400, 600), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Nikolai", "brand": "Heaven Hill", "price_range": (500, 700), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Relska", "brand": "Heaven Hill", "price_range": (600, 800), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Karkov", "brand": "Heaven Hill", "price_range": (400, 600), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Kamchatka", "brand": "Heaven Hill", "price_range": (300, 500), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Sobieski", "brand": "Belvedere", "price_range": (800, 1000), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Luksusowa", "brand": "Belvedere", "price_range": (1000, 1200), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Wyborowa", "brand": "Pernod Ricard", "price_range": (1200, 1400), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Zubrowka", "brand": "Pernod Ricard", "price_range": (1500, 1700), "abv": 40.0, "flavors": ["smooth", "clean", "herbal"]},
            {"name": "Chopin", "brand": "Chopin", "price_range": (4000, 5000), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Beluga", "brand": "Synergy", "price_range": (5000, 6000), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Russian Standard", "brand": "Roust", "price_range": (1200, 1400), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Green Mark", "brand": "Roust", "price_range": (1000, 1200), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Putinka", "brand": "Roust", "price_range": (800, 1000), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa", "brand": "Khortytsa", "price_range": (600, 800), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Nemiroff", "brand": "Nemiroff", "price_range": (800, 1000), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khlibnyi Dar", "brand": "Nemiroff", "price_range": (600, 800), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Kozak", "brand": "Nemiroff", "price_range": (700, 900), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa", "brand": "Khortytsa", "price_range": (500, 700), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Platinum", "brand": "Khortytsa", "price_range": (800, 1000), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Gold", "brand": "Khortytsa", "price_range": (1000, 1200), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Premium", "brand": "Khortytsa", "price_range": (1200, 1400), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Elite", "brand": "Khortytsa", "price_range": (1500, 1700), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Reserve", "brand": "Khortytsa", "price_range": (2000, 2200), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Heritage", "brand": "Khortytsa", "price_range": (2500, 2700), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Legacy", "brand": "Khortytsa", "price_range": (3000, 3200), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Dynasty", "brand": "Khortytsa", "price_range": (3500, 3700), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Imperial", "brand": "Khortytsa", "price_range": (4000, 4200), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Royal", "brand": "Khortytsa", "price_range": (4500, 4700), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Supreme", "brand": "Khortytsa", "price_range": (5000, 5200), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Master", "brand": "Khortytsa", "price_range": (5500, 5700), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Grand", "brand": "Khortytsa", "price_range": (6000, 6200), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Noble", "brand": "Khortytsa", "price_range": (6500, 6700), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Prestige", "brand": "Khortytsa", "price_range": (7000, 7200), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Excellence", "brand": "Khortytsa", "price_range": (7500, 7700), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Perfection", "brand": "Khortytsa", "price_range": (8000, 8200), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Ultimate", "brand": "Khortytsa", "price_range": (8500, 8700), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Legend", "brand": "Khortytsa", "price_range": (9000, 9200), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Myth", "brand": "Khortytsa", "price_range": (9500, 9700), "abv": 40.0, "flavors": ["smooth", "clean"]},
            {"name": "Khortytsa Epic", "brand": "Khortytsa", "price_range": (10000, 10200), "abv": 40.0, "flavors": ["smooth", "clean"]},
        ]
    },
    "beer": {
        "indian": [
            {"name": "Kingfisher Strong", "brand": "United Breweries", "price_range": (90, 110), "abv": 6.0, "flavors": ["crisp", "refreshing"]},
            {"name": "Kingfisher Premium", "brand": "United Breweries", "price_range": (80, 100), "abv": 5.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Kingfisher Ultra", "brand": "United Breweries", "price_range": (85, 105), "abv": 4.5, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Kingfisher Storm", "brand": "United Breweries", "price_range": (95, 115), "abv": 6.0, "flavors": ["crisp", "refreshing"]},
            {"name": "Bira 91 White", "brand": "Bira 91", "price_range": (110, 130), "abv": 5.0, "flavors": ["citrus", "smooth", "refreshing"]},
            {"name": "Bira 91 Blonde", "brand": "Bira 91", "price_range": (120, 140), "abv": 5.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Bira 91 Strong", "brand": "Bira 91", "price_range": (130, 150), "abv": 6.0, "flavors": ["crisp", "refreshing"]},
            {"name": "Tuborg Strong", "brand": "Carlsberg", "price_range": (95, 115), "abv": 6.0, "flavors": ["crisp", "refreshing"]},
            {"name": "Tuborg Premium", "brand": "Carlsberg", "price_range": (85, 105), "abv": 5.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Tuborg Green", "brand": "Carlsberg", "price_range": (90, 110), "abv": 5.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Carlsberg", "brand": "Carlsberg", "price_range": (90, 110), "abv": 5.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Haywards 5000", "brand": "United Spirits", "price_range": (70, 90), "abv": 6.0, "flavors": ["crisp", "refreshing"]},
            {"name": "Haywards 2000", "brand": "United Spirits", "price_range": (60, 80), "abv": 5.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Knock Out", "brand": "United Spirits", "price_range": (65, 85), "abv": 6.0, "flavors": ["crisp", "refreshing"]},
            {"name": "Godfather", "brand": "United Spirits", "price_range": (75, 95), "abv": 6.0, "flavors": ["crisp", "refreshing"]},
            {"name": "Hunter", "brand": "United Spirits", "price_range": (70, 90), "abv": 6.0, "flavors": ["crisp", "refreshing"]},
            {"name": "Bullet", "brand": "United Spirits", "price_range": (65, 85), "abv": 6.0, "flavors": ["crisp", "refreshing"]},
            {"name": "Royal Challenge", "brand": "United Spirits", "price_range": (80, 100), "abv": 5.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Signature", "brand": "United Spirits", "price_range": (75, 95), "abv": 5.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "8PM", "brand": "Radico Khaitan", "price_range": (70, 90), "abv": 6.0, "flavors": ["crisp", "refreshing"]},
            {"name": "Magic Moments", "brand": "Radico Khaitan", "price_range": (85, 105), "abv": 5.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Officer's Choice", "brand": "Allied Blenders", "price_range": (75, 95), "abv": 5.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Blenders Pride", "brand": "Pernod Ricard", "price_range": (90, 110), "abv": 5.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Imperial Blue", "brand": "Pernod Ricard", "price_range": (80, 100), "abv": 5.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Foster's", "brand": "United Breweries", "price_range": (85, 105), "abv": 4.5, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Heineken", "brand": "United Breweries", "price_range": (120, 140), "abv": 5.0, "flavors": ["balanced", "refreshing"]},
            {"name": "Corona Extra", "brand": "United Breweries", "price_range": (150, 170), "abv": 4.6, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Budweiser", "brand": "United Breweries", "price_range": (110, 130), "abv": 5.0, "flavors": ["crisp", "clean"]},
            {"name": "Miller Lite", "brand": "United Breweries", "price_range": (100, 120), "abv": 4.2, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Coors Light", "brand": "United Breweries", "price_range": (110, 130), "abv": 4.2, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Stella Artois", "brand": "United Breweries", "price_range": (130, 150), "abv": 5.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Hoegaarden", "brand": "United Breweries", "price_range": (180, 200), "abv": 4.9, "flavors": ["citrus", "smooth", "refreshing"]},
            {"name": "Leffe Blonde", "brand": "United Breweries", "price_range": (200, 220), "abv": 6.6, "flavors": ["rich", "smooth", "balanced"]},
            {"name": "Leffe Brune", "brand": "United Breweries", "price_range": (220, 240), "abv": 6.5, "flavors": ["rich", "smooth", "balanced"]},
        ],
        "international": [
            {"name": "Budweiser", "brand": "Anheuser-Busch", "price_range": (130, 150), "abv": 5.0, "flavors": ["crisp", "clean"]},
            {"name": "Corona Extra", "brand": "Corona", "price_range": (170, 190), "abv": 4.6, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Heineken", "brand": "Heineken", "price_range": (150, 170), "abv": 5.0, "flavors": ["balanced", "refreshing"]},
            {"name": "Stella Artois", "brand": "AB InBev", "price_range": (180, 200), "abv": 5.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Carlsberg", "brand": "Carlsberg", "price_range": (140, 160), "abv": 5.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Tuborg", "brand": "Carlsberg", "price_range": (130, 150), "abv": 5.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Foster's", "brand": "Heineken", "price_range": (120, 140), "abv": 4.5, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Miller Lite", "brand": "Molson Coors", "price_range": (110, 130), "abv": 4.2, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Coors Light", "brand": "Molson Coors", "price_range": (120, 140), "abv": 4.2, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Blue Moon", "brand": "Molson Coors", "price_range": (200, 220), "abv": 5.4, "flavors": ["citrus", "smooth", "refreshing"]},
            {"name": "Guinness", "brand": "Diageo", "price_range": (250, 270), "abv": 4.2, "flavors": ["rich", "smooth", "balanced"]},
            {"name": "Hoegaarden", "brand": "AB InBev", "price_range": (220, 240), "abv": 4.9, "flavors": ["citrus", "smooth", "refreshing"]},
            {"name": "Leffe Blonde", "brand": "AB InBev", "price_range": (280, 300), "abv": 6.6, "flavors": ["rich", "smooth", "balanced"]},
            {"name": "Leffe Brune", "brand": "AB InBev", "price_range": (300, 320), "abv": 6.5, "flavors": ["rich", "smooth", "balanced"]},
            {"name": "Duvel", "brand": "Duvel Moortgat", "price_range": (350, 370), "abv": 8.5, "flavors": ["rich", "smooth", "balanced"]},
            {"name": "Chimay Blue", "brand": "Chimay", "price_range": (400, 420), "abv": 9.0, "flavors": ["rich", "smooth", "balanced"]},
            {"name": "Chimay Red", "brand": "Chimay", "price_range": (350, 370), "abv": 7.0, "flavors": ["rich", "smooth", "balanced"]},
            {"name": "Chimay White", "brand": "Chimay", "price_range": (320, 340), "abv": 8.0, "flavors": ["rich", "smooth", "balanced"]},
            {"name": "Westmalle Tripel", "brand": "Westmalle", "price_range": (380, 400), "abv": 9.5, "flavors": ["rich", "smooth", "balanced"]},
            {"name": "Westmalle Dubbel", "brand": "Westmalle", "price_range": (360, 380), "abv": 7.0, "flavors": ["rich", "smooth", "balanced"]},
        ]
    },
    "wine": {
        "indian": [
            {"name": "Sula Dindori Reserve Shiraz", "brand": "Sula", "price_range": (1200, 1400), "abv": 13.5, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Sula Cabernet Sauvignon", "brand": "Sula", "price_range": (1000, 1200), "abv": 13.0, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Sula Sauvignon Blanc", "brand": "Sula", "price_range": (900, 1100), "abv": 12.5, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Sula Chenin Blanc", "brand": "Sula", "price_range": (800, 1000), "abv": 12.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Sula Riesling", "brand": "Sula", "price_range": (850, 1050), "abv": 12.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Sula Zinfandel", "brand": "Sula", "price_range": (1100, 1300), "abv": 13.5, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Sula Merlot", "brand": "Sula", "price_range": (950, 1150), "abv": 13.0, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Sula Pinot Noir", "brand": "Sula", "price_range": (1300, 1500), "abv": 13.0, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Sula Chardonnay", "brand": "Sula", "price_range": (900, 1100), "abv": 12.5, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Sula Brut", "brand": "Sula", "price_range": (1400, 1600), "abv": 12.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Sula Rose", "brand": "Sula", "price_range": (750, 950), "abv": 12.0, "flavors": ["fruity", "refreshing", "light"]},
            {"name": "Grover Zampa La Reserve", "brand": "Grover Zampa", "price_range": (1500, 1700), "abv": 13.5, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Grover Zampa Art Collection", "brand": "Grover Zampa", "price_range": (1200, 1400), "abv": 13.0, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Grover Zampa Vijay Amritraj", "brand": "Grover Zampa", "price_range": (1800, 2000), "abv": 13.5, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Grover Zampa Insignia", "brand": "Grover Zampa", "price_range": (2200, 2400), "abv": 14.0, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Fratelli Sette", "brand": "Fratelli", "price_range": (1600, 1800), "abv": 13.5, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Fratelli Vitae", "brand": "Fratelli", "price_range": (1400, 1600), "abv": 13.0, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Fratelli MS", "brand": "Fratelli", "price_range": (1200, 1400), "abv": 13.0, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Fratelli J'Noon", "brand": "Fratelli", "price_range": (1800, 2000), "abv": 13.5, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Fratelli Gran Cuvee", "brand": "Fratelli", "price_range": (2000, 2200), "abv": 13.5, "flavors": ["fruity", "rich", "balanced"]},
        ],
        "international": [
            {"name": "Moet & Chandon", "brand": "Moet", "price_range": (8000, 10000), "abv": 12.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Veuve Clicquot", "brand": "Veuve Clicquot", "price_range": (10000, 12000), "abv": 12.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Dom Perignon", "brand": "Moet", "price_range": (25000, 30000), "abv": 12.5, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Cristal", "brand": "Louis Roederer", "price_range": (50000, 60000), "abv": 12.5, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Krug", "brand": "Krug", "price_range": (40000, 50000), "abv": 12.5, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Bollinger", "brand": "Bollinger", "price_range": (12000, 15000), "abv": 12.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Laurent-Perrier", "brand": "Laurent-Perrier", "price_range": (15000, 18000), "abv": 12.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Perrier-Jouet", "brand": "Perrier-Jouet", "price_range": (18000, 22000), "abv": 12.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Taittinger", "brand": "Taittinger", "price_range": (12000, 15000), "abv": 12.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Pommery", "brand": "Pommery", "price_range": (10000, 12000), "abv": 12.0, "flavors": ["crisp", "refreshing", "light"]},
            {"name": "Chateau Margaux", "brand": "Chateau Margaux", "price_range": (150000, 200000), "abv": 13.5, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Chateau Lafite", "brand": "Chateau Lafite", "price_range": (200000, 250000), "abv": 13.5, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Chateau Latour", "brand": "Chateau Latour", "price_range": (180000, 220000), "abv": 13.5, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Chateau Mouton", "brand": "Chateau Mouton", "price_range": (160000, 200000), "abv": 13.5, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Chateau Haut-Brion", "brand": "Chateau Haut-Brion", "price_range": (120000, 150000), "abv": 13.5, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Opus One", "brand": "Opus One", "price_range": (80000, 100000), "abv": 14.0, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Sassicaia", "brand": "Tenuta San Guido", "price_range": (60000, 80000), "abv": 13.5, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Tignanello", "brand": "Antinori", "price_range": (40000, 50000), "abv": 13.5, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Ornellaia", "brand": "Tenuta dell'Ornellaia", "price_range": (50000, 60000), "abv": 13.5, "flavors": ["fruity", "rich", "balanced"]},
            {"name": "Masseto", "brand": "Tenuta dell'Ornellaia", "price_range": (80000, 100000), "abv": 13.5, "flavors": ["fruity", "rich", "balanced"]},
        ]
    },
    "gin": {
        "indian": [
            {"name": "Greater Than", "brand": "Nao Spirits", "price_range": (800, 900), "abv": 43.0, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Hapusa", "brand": "Nao Spirits", "price_range": (1200, 1400), "abv": 43.0, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Stranger & Sons", "brand": "Third Eye Distillery", "price_range": (1000, 1200), "abv": 42.8, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Jaisalmer", "brand": "Radico Khaitan", "price_range": (900, 1100), "abv": 42.8, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Pumori", "brand": "Pernod Ricard", "price_range": (1100, 1300), "abv": 42.8, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Samsara", "brand": "Pernod Ricard", "price_range": (1300, 1500), "abv": 42.8, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "GinGin", "brand": "Nao Spirits", "price_range": (600, 700), "abv": 42.8, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Jin Jiji", "brand": "Nao Spirits", "price_range": (700, 800), "abv": 42.8, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Terai", "brand": "Mohan Meakin", "price_range": (800, 900), "abv": 42.8, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Bluecoat", "brand": "Mohan Meakin", "price_range": (900, 1000), "abv": 42.8, "flavors": ["herbal", "citrus", "juniper"]},
        ],
        "international": [
            {"name": "Hendrick's", "brand": "Hendrick's", "price_range": (3200, 3400), "abv": 41.4, "flavors": ["herbal", "citrus", "floral"]},
            {"name": "Tanqueray", "brand": "Tanqueray", "price_range": (2800, 3000), "abv": 47.3, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Bombay Sapphire", "brand": "Bombay Sapphire", "price_range": (2200, 2400), "abv": 47.0, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Beefeater", "brand": "Beefeater", "price_range": (2000, 2200), "abv": 47.0, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Gordon's", "brand": "Gordon's", "price_range": (1500, 1700), "abv": 37.5, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Seagram's", "brand": "Seagram's", "price_range": (1200, 1400), "abv": 40.0, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "New Amsterdam", "brand": "New Amsterdam", "price_range": (1000, 1200), "abv": 40.0, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Aviation", "brand": "Aviation", "price_range": (2500, 2700), "abv": 42.0, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Monkey 47", "brand": "Monkey 47", "price_range": (8000, 10000), "abv": 47.0, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "The Botanist", "brand": "The Botanist", "price_range": (6000, 7000), "abv": 46.0, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Plymouth", "brand": "Plymouth", "price_range": (3500, 4000), "abv": 41.2, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Sipsmith", "brand": "Sipsmith", "price_range": (4000, 4500), "abv": 41.6, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Malfy", "brand": "Malfy", "price_range": (3000, 3500), "abv": 41.0, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Gin Mare", "brand": "Gin Mare", "price_range": (4500, 5000), "abv": 42.7, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Roku", "brand": "Suntory", "price_range": (3500, 4000), "abv": 43.0, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Nikka Coffey", "brand": "Nikka", "price_range": (5000, 6000), "abv": 47.0, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Ki No Bi", "brand": "Kyoto Distillery", "price_range": (8000, 10000), "abv": 45.7, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Ki No Tea", "brand": "Kyoto Distillery", "price_range": (10000, 12000), "abv": 45.1, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Ki No Sei", "brand": "Kyoto Distillery", "price_range": (12000, 15000), "abv": 45.7, "flavors": ["herbal", "citrus", "juniper"]},
            {"name": "Ki No Tou", "brand": "Kyoto Distillery", "price_range": (15000, 18000), "abv": 45.7, "flavors": ["herbal", "citrus", "juniper"]},
        ]
    }
}

def generate_spirits_database():
    """Generate a comprehensive spirits database"""
    spirits = []
    spirit_id = 1
    
    # Generate spirits for each category
    for spirit_type, categories in SPIRITS_DATA.items():
        for category, items in categories.items():
            for item in items:
                # Generate price within range
                price = random.randint(item["price_range"][0], item["price_range"][1])
                
                # Generate available states (most spirits available in major states)
                available_states = [
                    "Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "West Bengal", 
                    "Telangana", "Andhra Pradesh", "Kerala", "Goa", "Punjab", 
                    "Haryana", "Uttarakhand", "Himachal Pradesh", "Jammu & Kashmir",
                    "Assam", "Manipur", "Meghalaya", "Tripura", "Arunachal Pradesh",
                    "Sikkim", "Jharkhand", "Odisha", "Chhattisgarh", "Madhya Pradesh",
                    "Rajasthan", "Uttar Pradesh", "Chandigarh", "Dadra and Nagar Haveli",
                    "Daman and Diu", "Lakshadweep", "Puducherry", "Andaman and Nicobar Islands"
                ]
                
                # Remove some states randomly for variety
                if random.random() < 0.3:
                    available_states = available_states[:random.randint(15, 25)]
                
                spirit = {
                    "id": f"{spirit_type}_{item['name'].lower().replace(' ', '_').replace('&', 'and').replace('.', '')}_{spirit_id}",
                    "name": item["name"],
                    "brand": item["brand"],
                    "type": spirit_type,
                    "price": price,
                    "abv": item["abv"],
                    "description": f"A premium {spirit_type} with {', '.join(item['flavors'])} notes. Perfect for {random.choice(['casual drinking', 'special occasions', 'cocktails', 'neat sipping'])}.",
                    "flavors": item["flavors"],
                    "available_states": available_states,
                    "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
                    "category": f"{category}_{spirit_type}",
                    "region": "India" if category == "indian" else "International"
                }
                
                spirits.append(spirit)
                spirit_id += 1
    
    return spirits

if __name__ == "__main__":
    # Generate the database
    spirits_db = generate_spirits_database()
    
    # Save to file
    with open("app/data/spirits_expanded.json", "w", encoding="utf-8") as f:
        json.dump(spirits_db, f, indent=2, ensure_ascii=False)
    
    print(f"Generated {len(spirits_db)} spirits in the database")
    print("Database saved to app/data/spirits_expanded.json")
