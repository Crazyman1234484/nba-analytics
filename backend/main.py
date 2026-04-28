import os
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uvicorn
from datetime import datetime

from database import init_db, get_db, engine, Base, Game, Team, OddsSnapshot
from models import GameResponse, GameWithOdds, TeamResponse, OddsSnapshotResponse, ImpliedProbability
from odds_fetcher import fetch_nba_odds, fetch_nfl_odds, american_to_implied, american_to_decimal, american_to_fractional
from elo import calculate_win_probability

API_KEY = os.getenv("NBA_ANALYTICS_API_KEY")
app = FastAPI(title="NBA Analytics API")

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response

def verify_api_key(x_api_key: str = Header(None, alias="X-API-KEY")):
    if API_KEY:
        if not x_api_key or x_api_key != API_KEY:
            raise HTTPException(status_code=401, detail="Invalid API key")
    return True

# app definition moved earlier to ensure middleware has a valid app instance

# CORS middleware
origins = os.getenv("CORS_ALLOW_ORIGINS")
if origins:
    allow_origins = [o.strip() for o in origins.split(",") if o.strip()]
else:
    allow_origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/")
async def root():
    return {"message": "NBA Analytics API"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/games", response_model=List[GameResponse], dependencies=[Depends(verify_api_key)])
async def get_games(sport: str = None, db: Session = Depends(get_db)):
    """Get all games, optionally filtered by sport"""
    if sport:
        games = db.query(Game).filter(Game.sport == sport).order_by(Game.game_time).all()
    else:
        games = db.query(Game).order_by(Game.game_time).all()
    return games

@app.get("/api/games/{game_id}", response_model=GameWithOdds, dependencies=[Depends(verify_api_key)])
async def get_game_with_odds(game_id: str, db: Session = Depends(get_db)):
    """Get game with odds and model probability"""
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Get current odds (most recent snapshot)
    current_odds = db.query(OddsSnapshot).filter(
        OddsSnapshot.game_id == game_id
    ).order_by(OddsSnapshot.timestamp.desc()).all()
    
    # Get opening odds (first snapshot)
    opening_odds = db.query(OddsSnapshot).filter(
        OddsSnapshot.game_id == game_id
    ).order_by(OddsSnapshot.timestamp.asc()).first()
    
    # Calculate model probability
    model_prob = None
    if game.home_team and game.away_team:
        home_prob = calculate_win_probability(
            game.home_team.elo_rating,
            game.away_team.elo_rating,
            game.home_team.home_court_advantage
        )
        model_prob = {
            "home": home_prob,
            "away": 1 - home_prob
        }
    
    return GameWithOdds(
        id=game.id,
        home_team=game.home_team,
        away_team=game.away_team,
        game_time=game.game_time,
        status=game.status,
        sport=game.sport,
        current_odds=current_odds,
        opening_odds=opening_odds,
        model_probability=model_prob
    )

@app.get("/api/odds/conversion", dependencies=[Depends(verify_api_key)])
async def convert_odds(american_odds: int):
    """Convert American odds to other formats"""
    return ImpliedProbability(
        american_odds=american_odds,
        implied_probability=american_to_implied(american_odds),
        decimal_odds=american_to_decimal(american_odds),
        fractional_odds=american_to_fractional(american_odds)
    )

@app.post("/api/odds/fetch", dependencies=[Depends(verify_api_key)])
async def fetch_and_store_odds(sport: str = "basketball", db: Session = Depends(get_db)):
    """Fetch odds from API and store in database"""
    if sport == "basketball":
        odds_data = await fetch_nba_odds()
    elif sport == "football":
        odds_data = await fetch_nfl_odds()
    else:
        return {"message": "Invalid sport. Use 'basketball' or 'football'"}
    
    stored_count = 0
    for game_data in odds_data:
        # Check if game exists
        game = db.query(Game).filter(Game.id == game_data["id"]).first()
        
        if not game:
            # Create or get teams
            home_team = db.query(Team).filter(Team.name == game_data["home_team"]).first()
            if not home_team:
                home_team = Team(name=game_data["home_team"])
                db.add(home_team)
                db.commit()
                db.refresh(home_team)
            
            away_team = db.query(Team).filter(Team.name == game_data["away_team"]).first()
            if not away_team:
                away_team = Team(name=game_data["away_team"])
                db.add(away_team)
                db.commit()
                db.refresh(away_team)
            
            # Create game with sport field
            game = Game(
                id=game_data["id"],
                home_team_id=home_team.id,
                away_team_id=away_team.id,
                game_time=datetime.fromisoformat(game_data["commence_time"].replace("Z", "+00:00")),
                status="upcoming",
                sport=game_data.get("sport", sport)
            )
            db.add(game)
            db.commit()
            db.refresh(game)
        
        # Store odds snapshots
        for bookmaker in game_data["bookmakers"]:
            markets = {m["key"]: m for m in bookmaker["markets"]}
            
            # Moneyline
            if "h2h" in markets:
                h2h = {o["name"]: o for o in markets["h2h"]["outcomes"]}
                moneyline_home = h2h.get(game_data["home_team"], {}).get("price")
                moneyline_away = h2h.get(game_data["away_team"], {}).get("price")
            else:
                moneyline_home = None
                moneyline_away = None
            
            # Spread
            if "spreads" in markets:
                spreads = {o["name"]: o for o in markets["spreads"]["outcomes"]}
                spread_home = spreads.get(game_data["home_team"], {}).get("point", 0)
                spread_home_odds = spreads.get(game_data["home_team"], {}).get("price")
                spread_away = spreads.get(game_data["away_team"], {}).get("point", 0)
                spread_away_odds = spreads.get(game_data["away_team"], {}).get("price")
            else:
                spread_home = None
                spread_home_odds = None
                spread_away = None
                spread_away_odds = None
            
            # Totals
            if "totals" in markets:
                totals = {o["name"]: o for o in markets["totals"]["outcomes"]}
                total_line = totals.get("Over", {}).get("point", 0)
                total_over_odds = totals.get("Over", {}).get("price")
                total_under_odds = totals.get("Under", {}).get("price")
            else:
                total_line = None
                total_over_odds = None
                total_under_odds = None
            
            snapshot = OddsSnapshot(
                game_id=game.id,
                sportsbook=bookmaker["title"],
                moneyline_home=moneyline_home,
                moneyline_away=moneyline_away,
                spread_home=spread_home,
                spread_home_odds=spread_home_odds,
                spread_away=spread_away,
                spread_away_odds=spread_away_odds,
                total_line=total_line,
                total_over_odds=total_over_odds,
                total_under_odds=total_under_odds,
                timestamp=datetime.utcnow()
            )
            db.add(snapshot)
            stored_count += 1
        
        db.commit()
    
    return {"message": f"Stored {stored_count} odds snapshots"}

@app.get("/api/teams", response_model=List[TeamResponse], dependencies=[Depends(verify_api_key)])
async def get_teams(db: Session = Depends(get_db)):
    """Get all teams with Elo ratings"""
    teams = db.query(Team).all()
    return teams

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
