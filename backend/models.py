from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class TeamResponse(BaseModel):
    id: int
    name: str
    elo_rating: float
    home_court_advantage: float
    
    class Config:
        from_attributes = True

class GameResponse(BaseModel):
    id: str
    home_team: TeamResponse
    away_team: TeamResponse
    game_time: datetime
    status: str
    sport: str
    
    class Config:
        from_attributes = True

class OddsSnapshotResponse(BaseModel):
    id: int
    game_id: str
    sportsbook: str
    moneyline_home: float
    moneyline_away: float
    spread_home: float
    spread_home_odds: float
    spread_away: float
    spread_away_odds: float
    total_line: float
    total_over_odds: float
    total_under_odds: float
    timestamp: datetime
    
    class Config:
        from_attributes = True

class GameWithOdds(BaseModel):
    id: str
    home_team: TeamResponse
    away_team: TeamResponse
    game_time: datetime
    status: str
    sport: str
    current_odds: List[OddsSnapshotResponse]
    opening_odds: Optional[OddsSnapshotResponse]
    model_probability: Optional[dict]

class EloUpdate(BaseModel):
    team_id: int
    new_elo: float

class ImpliedProbability(BaseModel):
    american_odds: float
    implied_probability: float
    decimal_odds: float
    fractional_odds: str
