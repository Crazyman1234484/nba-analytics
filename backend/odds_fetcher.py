import httpx
from datetime import datetime
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv

load_dotenv()

ODDS_API_KEY = os.getenv("ODDS_API_KEY", "")

async def fetch_nba_odds() -> List[Dict]:
    """Fetch NBA odds from The Odds API"""
    if not ODDS_API_KEY:
        # Return mock data if no API key
        return get_mock_odds()
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.the-odds-api.com/v4/sports/basketball_nba/odds",
                params={
                    "apiKey": ODDS_API_KEY,
                    "regions": "us",
                    "markets": "h2h,spreads,totals",
                    "oddsFormat": "american"
                }
            )
            response.raise_for_status()
            data = response.json()
            # Add sport field to each game
            for game in data:
                game['sport'] = 'basketball'
            return data
    except Exception as e:
        print(f"Error fetching NBA odds: {e}")
        return get_mock_odds()

async def fetch_nfl_odds() -> List[Dict]:
    """Fetch NFL odds from The Odds API"""
    if not ODDS_API_KEY:
        return []
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds",
                params={
                    "apiKey": ODDS_API_KEY,
                    "regions": "us",
                    "markets": "h2h,spreads,totals",
                    "oddsFormat": "american"
                }
            )
            response.raise_for_status()
            data = response.json()
            # Add sport field to each game
            for game in data:
                game['sport'] = 'football'
            return data
    except Exception as e:
        print(f"Error fetching NFL odds: {e}")
        return []

def get_mock_odds() -> List[Dict]:
    """Return mock NBA odds data for development"""
    return [
        {
            "id": "game1",
            "sport_key": "basketball_nba",
            "sport_title": "NBA",
            "commence_time": "2026-04-30T19:30:00Z",
            "home_team": "Los Angeles Lakers",
            "away_team": "Boston Celtics",
            "bookmakers": [
                {
                    "key": "draftkings",
                    "title": "DraftKings",
                    "last_update": "2026-04-27T20:00:00Z",
                    "markets": [
                        {
                            "key": "h2h",
                            "last_update": "2026-04-27T20:00:00Z",
                            "outcomes": [
                                {"name": "Los Angeles Lakers", "price": -150},
                                {"name": "Boston Celtics", "price": +130}
                            ]
                        },
                        {
                            "key": "spreads",
                            "last_update": "2026-04-27T20:00:00Z",
                            "outcomes": [
                                {"name": "Los Angeles Lakers", "price": -110, "point": -3.5},
                                {"name": "Boston Celtics", "price": -110, "point": +3.5}
                            ]
                        },
                        {
                            "key": "totals",
                            "last_update": "2026-04-27T20:00:00Z",
                            "outcomes": [
                                {"name": "Over", "price": -110, "point": 224.5},
                                {"name": "Under", "price": -110, "point": 224.5}
                            ]
                        }
                    ]
                },
                {
                    "key": "fanduel",
                    "title": "FanDuel",
                    "last_update": "2026-04-27T20:00:00Z",
                    "markets": [
                        {
                            "key": "h2h",
                            "last_update": "2026-04-27T20:00:00Z",
                            "outcomes": [
                                {"name": "Los Angeles Lakers", "price": -155},
                                {"name": "Boston Celtics", "price": +135}
                            ]
                        },
                        {
                            "key": "spreads",
                            "last_update": "2026-04-27T20:00:00Z",
                            "outcomes": [
                                {"name": "Los Angeles Lakers", "price": -108, "point": -3.5},
                                {"name": "Boston Celtics", "price": -112, "point": +3.5}
                            ]
                        },
                        {
                            "key": "totals",
                            "last_update": "2026-04-27T20:00:00Z",
                            "outcomes": [
                                {"name": "Over", "price": -108, "point": 224.5},
                                {"name": "Under", "price": -112, "point": 224.5}
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "id": "game2",
            "sport_key": "basketball_nba",
            "sport_title": "NBA",
            "commence_time": "2026-04-30T22:00:00Z",
            "home_team": "Golden State Warriors",
            "away_team": "Phoenix Suns",
            "bookmakers": [
                {
                    "key": "draftkings",
                    "title": "DraftKings",
                    "last_update": "2026-04-27T20:00:00Z",
                    "markets": [
                        {
                            "key": "h2h",
                            "last_update": "2026-04-27T20:00:00Z",
                            "outcomes": [
                                {"name": "Golden State Warriors", "price": +110},
                                {"name": "Phoenix Suns", "price": -130}
                            ]
                        },
                        {
                            "key": "spreads",
                            "last_update": "2026-04-27T20:00:00Z",
                            "outcomes": [
                                {"name": "Golden State Warriors", "price": -110, "point": +2.5},
                                {"name": "Phoenix Suns", "price": -110, "point": -2.5}
                            ]
                        },
                        {
                            "key": "totals",
                            "last_update": "2026-04-27T20:00:00Z",
                            "outcomes": [
                                {"name": "Over", "price": -110, "point": 238.5},
                                {"name": "Under", "price": -110, "point": 238.5}
                            ]
                        }
                    ]
                }
            ]
        }
    ]

def american_to_implied(american_odds: int) -> float:
    """Convert American odds to implied probability"""
    if american_odds > 0:
        return 100 / (american_odds + 100)
    else:
        return abs(american_odds) / (abs(american_odds) + 100)

def american_to_decimal(american_odds: int) -> float:
    """Convert American odds to decimal odds"""
    if american_odds > 0:
        return (american_odds / 100) + 1
    else:
        return (100 / abs(american_odds)) + 1

def american_to_fractional(american_odds: int) -> str:
    """Convert American odds to fractional odds"""
    if american_odds > 0:
        numerator = american_odds
        denominator = 100
    else:
        numerator = 100
        denominator = abs(american_odds)
    
    # Simplify fraction
    from math import gcd
    divisor = gcd(int(numerator), int(denominator))
    return f"{numerator//divisor}/{denominator//divisor}"
