# NBA Analytics Terminal

A lean, focused sports analytics platform for NBA games with odds tracking, implied probability calculations, and simple statistical modeling.

## Features

- **Real-time Odds Comparison**: Compare odds from multiple sportsbooks for NBA games
- **Implied Probability Calculations**: Convert American odds to implied probabilities
- **Elo Rating Model**: Simple statistical model for predicting game outcomes
- **Line Movement Tracking**: Track how odds change over time
- **Bloomberg-Terminal UI**: Clean, data-heavy interface with 3-panel layout
- **Model vs Market Comparison**: Compare statistical model predictions with market odds

## Tech Stack

- **Backend**: Python + FastAPI
- **Database**: SQLite
- **Frontend**: Next.js 14 + TypeScript + TailwindCSS
- **Charts**: Recharts

## Project Structure

```
nba-analytics/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # SQLAlchemy models
│   ├── models.py            # Pydantic models
│   ├── elo.py               # Elo rating calculations
│   ├── odds_fetcher.py      # Odds API integration
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variables template
└── frontend/
    ├── src/
    │   ├── app/
    │   │   └── page.tsx     # Main dashboard
    │   ├── components/      # React components
    │   ├── lib/             # Utilities
    │   └── types/           # TypeScript types
    └── package.json         # Node dependencies
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file (optional, for real API integration):
```bash
cp .env.example .env
```

4. Start the backend server:
```bash
python main.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000` (or the next available port)

## Vercel + Render Deployment

This project is configured to run with:
- Frontend on Vercel: `https://sports-betting-odds-two.vercel.app`
- Backend on Render: `https://nba-analytics-backend.onrender.com`

### Frontend (Vercel) env vars

Set this in Vercel project settings:
```bash
NEXT_PUBLIC_API_BASE_URL=https://nba-analytics-backend.onrender.com/api
```

### Backend (Render) env vars

Set these in Render service settings:
```bash
CORS_ALLOW_ORIGINS=https://sports-betting-odds-two.vercel.app
DATABASE_URL=sqlite:///./nba_analytics.db
```

For a public dashboard, keep `NBA_ANALYTICS_API_KEY` empty.  
If you set `NBA_ANALYTICS_API_KEY`, browser requests must include `X-API-KEY` or they will return 401.

### Quick validation

1. Open `https://sports-betting-odds-two.vercel.app` and confirm games load.
2. Check API health: `https://nba-analytics-backend.onrender.com/health`
3. Check games endpoint: `https://nba-analytics-backend.onrender.com/api/games?sport=basketball`

## Usage

1. Start both the backend and frontend servers
2. Open the frontend in your browser
3. Click "REFRESH" to fetch the latest NBA odds
4. Select a game from the left panel to view detailed analysis
5. View odds, line movements, and model vs market comparisons in the right panel

## API Endpoints

- `GET /api/games` - Get all NBA games
- `GET /api/games/{game_id}` - Get game with odds and model probability
- `POST /api/odds/fetch` - Fetch odds from API and store in database
- `GET /api/odds/conversion?american_odds={odds}` - Convert odds formats
- `GET /api/teams` - Get all teams with Elo ratings

## Data Sources

Currently uses mock data for demonstration. To integrate with real odds APIs:

1. Sign up for [The Odds API](https://the-odds-api.com/) (free tier: 500 requests/month)
2. Add your API key to the backend `.env` file:
   ```
   ODDS_API_KEY=your_api_key_here
   ```
3. The app will automatically use real data when the key is configured

## Model Details

### Elo Rating System
- Base rating: 1500
- Home court advantage: +3 points
- K-factor: 32 (standard for sports)
- Recent form multiplier: Exponential decay over last 5-10 games

### Probability Calculation
- Adjusted home Elo = Home Elo + Home Court Advantage
- Expected score = 1 / (1 + 10^((Away Elo - Adjusted Home Elo) / 400))

## Development Notes

- The database is SQLite and will be created automatically on first run
- Odds are stored as snapshots to track line movement over time
- The UI uses a Bloomberg-terminal aesthetic with green text on black background
- All odds are in American format by default but can be converted

## Future Enhancements

- [ ] Add scheduled odds fetching (cron jobs)
- [ ] Implement more sophisticated statistical models
- [ ] Add historical accuracy tracking
- [ ] Expand to other sports (NFL, MLB, soccer)
- [ ] Add AI-generated match summaries
- [ ] Implement alert system for large line movements
- [ ] Add user authentication and saved preferences
