from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./nba_analytics.db")

engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    elo_rating = Column(Float, default=1500.0)
    home_court_advantage = Column(Float, default=3.0)
    
    home_games = relationship("Game", foreign_keys="Game.home_team_id")
    away_games = relationship("Game", foreign_keys="Game.away_team_id")

class Game(Base):
    __tablename__ = "games"
    
    id = Column(String, primary_key=True, index=True)
    home_team_id = Column(Integer, ForeignKey("teams.id"))
    away_team_id = Column(Integer, ForeignKey("teams.id"))
    game_time = Column(DateTime)
    status = Column(String, default="upcoming")  # upcoming, live, finished
    sport = Column(String, default="basketball")  # basketball, football
    
    home_team = relationship("Team", foreign_keys=[home_team_id])
    away_team = relationship("Team", foreign_keys=[away_team_id])
    odds_snapshots = relationship("OddsSnapshot", back_populates="game")

class OddsSnapshot(Base):
    __tablename__ = "odds_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(String, ForeignKey("games.id"))
    sportsbook = Column(String)
    moneyline_home = Column(Float)
    moneyline_away = Column(Float)
    spread_home = Column(Float)
    spread_home_odds = Column(Float)
    spread_away = Column(Float)
    spread_away_odds = Column(Float)
    total_line = Column(Float)
    total_over_odds = Column(Float)
    total_under_odds = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    game = relationship("Game", back_populates="odds_snapshots")

class TeamStats(Base):
    __tablename__ = "team_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    date = Column(DateTime)
    points_scored = Column(Float)
    points_allowed = Column(Float)
    result = Column(String)  # W, L

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
