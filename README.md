# P-resents

A smart gift exchange platform that uses algorithmic matching to pair givers with receivers based on preferences. Named after the [Pareto efficiency](https://en.wikipedia.org/wiki/Pareto_efficiency) principle, the system helps groups achieve optimal outcomes where no one can be made happier without making someone else less happy.

## Features

- **Multiple Matching Algorithms** - Choose from Random, Max Utility, Max Fairness, or White Elephant
- **Preference-Based Matching** - Users input giving/receiving preferences on practicality, novelty, and sentimentality
- **Interest Matching** - Bonus scoring for shared interests between givers and receivers
- **Exclusion Support** - Specify people you shouldn't be matched with (e.g., couples, family members)
- **Admin Dashboard** - Group creators can compare algorithm statistics before finalizing
- **Privacy First** - Users only see their own match after finalization
- **Email Notifications** - Automatic email when matches are finalized (optional)
- **Live Demo** - Try it without signing up at `/demo`

## Tech Stack

### Frontend (`apps/web`)

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5 | React framework with App Router |
| React | 19.1 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| react-hook-form | 7.x | Form handling |
| Zod | 4.x | Schema validation |
| Supabase | 2.x | Auth & database client |

### Backend (`apps/api`)

| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | Latest | Python web framework |
| Pydantic | 2.x | Request/response validation |
| SciPy | Latest | Hungarian algorithm (linear_sum_assignment) |
| NumPy | Latest | Matrix operations |
| Resend | 2.x | Email notifications |

### Infrastructure

- **Package Manager**: pnpm (monorepo)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **API Deployment**: Fly.io
- **Frontend Deployment**: Vercel (recommended)

## Project Structure

```
p-resents/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   └── src/
│   │       ├── app/            # Pages (login, dashboard, results, demo, etc.)
│   │       ├── components/     # React components
│   │       ├── services/       # API & Supabase clients
│   │       ├── types/          # TypeScript definitions
│   │       └── lib/            # Utilities
│   └── api/                    # FastAPI backend
│       ├── main.py             # App entry point
│       ├── controllers/        # Route handlers
│       ├── algorithms/         # Matching algorithms
│       ├── models/             # Pydantic models
│       ├── services/           # Email service
│       ├── utils/              # Utility calculator
│       └── tests/              # pytest tests
└── package.json                # Root workspace config
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Python 3.9+ (for API)
- Supabase account (for database/auth)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/p-resents.git
cd p-resents

# Install JS dependencies
pnpm install

# Install Python dependencies
cd apps/api
pip install -r requirements.txt
cd ../..
```

### Environment Variables

Create `apps/web/.env.local`:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000  # or https://your-api.fly.dev
```

For the API (optional, for email notifications):

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx      # Get from https://resend.com
EMAIL_FROM=P-resents <noreply@your-domain.com>
APP_URL=https://your-app-url.com
```

### Development

```bash
# Terminal 1: Run the web app (localhost:3000)
pnpm dev

# Terminal 2: Run the API (localhost:8000)
pnpm api:dev
```

### Available Commands

```bash
# Development
pnpm dev              # Run web app
pnpm api:dev          # Run API with hot reload

# Build & Lint
pnpm build            # Build web app for production
pnpm lint             # Lint web app

# Testing
pnpm api:test         # Run API tests (106 tests)
```

## Matching Algorithms

P-resents supports four matching algorithms, each optimizing for different goals:

### 1. Random Matching

**Best for:** Groups that want simplicity and true randomness.

- Generates valid derangements (no one gets themselves) via rejection sampling
- Respects exclusion constraints
- Falls back to circular matching if no valid random solution is found

### 2. Max Utility (Hungarian Algorithm)

**Best for:** Maximizing overall group happiness.

- Uses the [Hungarian algorithm](https://en.wikipedia.org/wiki/Hungarian_algorithm) (`scipy.optimize.linear_sum_assignment`)
- Finds the globally optimal assignment that maximizes total utility
- Deterministic - always produces the same result for the same inputs
- Time complexity: O(n³)

### 3. Max Fairness (Minimax)

**Best for:** Ensuring no one gets a bad match.

- Optimizes for the minimum utility (raises the floor)
- For groups ≤8: Exhaustive search through all permutations
- For groups >8: Greedy approach prioritizing worst-off users
- Trades total utility for more equal distribution

### 4. White Elephant Simulation

**Best for:** Groups playing White Elephant / Yankee Swap.

- Runs 1000 Monte Carlo simulations of the game
- Models stealing behavior based on user preferences
- Returns optimal play order and expected outcomes
- Tracks metrics: average steals, times stolen from, happiness variance

## Utility Calculation

The utility score (0-10) for a giver→receiver pair is calculated as:

```
Utility = Preference Alignment + Interest Bonus

Preference Alignment (0-7.5):
- Practicality match:    2.5 × (1 - |giver.practicality - receiver.practicality| / 4)
- Novelty match:         2.5 × (1 - |giver.novelty - receiver.novelty| / 4)
- Thoughtfulness match:  2.5 × (1 - |giver.thoughtfulness - receiver.thoughtfulness| / 4)

Interest Bonus (0-2.5):
- 0.5 points per shared interest (max 5 interests counted)
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/recalculate` | POST | Calculate statistics for all algorithms |
| `/finalize_group` | POST | Generate final pairings for chosen algorithm |
| `/send_notifications` | POST | Send email notifications to group members |
| `/docs` | GET | Interactive API documentation (Swagger UI) |

## Database Schema

| Table | Description |
|-------|-------------|
| `groups` | Gift exchange groups (id, name, group_code, created_by) |
| `profile` | User profiles with group membership |
| `preferences` | User preferences (ratings 1-5, interests[], exclusions[]) |
| `match_results` | Final pairings, play order, statistics (JSONB) |

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set framework preset to "Next.js"
3. Set root directory to `apps/web`
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL`
5. Deploy

### Backend (Fly.io)

```bash
cd apps/api

# First time setup
fly launch --name your-api-name --region lax

# Deploy updates
fly deploy

# Set secrets (optional, for email)
fly secrets set RESEND_API_KEY=re_xxx EMAIL_FROM="P-resents <noreply@example.com>" APP_URL=https://your-app.com
```

The API includes a `Dockerfile` and `fly.toml` configuration ready for deployment.

## Testing

The API includes 106 unit tests covering all algorithms:

```bash
cd apps/api
pytest                    # Run all tests
pytest -v                 # Verbose output
pytest tests/test_max_utility_matching.py  # Run specific file
```

Test coverage:
- `test_utility_calculator.py` - Preference alignment, shared interests, edge cases
- `test_random_matching.py` - Derangements, exclusions, small groups
- `test_max_utility_matching.py` - Optimal pairing, constraints
- `test_max_fairness_matching.py` - Minimax optimization, variance
- `test_white_elephant.py` - Simulation, stealing logic, play order
- `test_endpoints.py` - API integration tests

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes
4. Run tests (`pnpm api:test`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feat/amazing-feature`)
7. Open a Pull Request

## License

MIT
