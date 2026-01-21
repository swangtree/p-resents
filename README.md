# P-resents

A gift exchange matching application built with Next.js and FastAPI.

## Project Structure

```
p-resents/
├── apps/
│   ├── web/        # Next.js frontend
│   └── api/        # FastAPI backend
├── packages/       # Shared packages (future)
└── package.json    # Root workspace config
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Python 3.11+ (for API)

### Installation

```bash
# Install JS dependencies
pnpm install

# Install Python dependencies (for API)
cd apps/api
pip install -r requirements.txt
```

### Development

```bash
# Run the web app (localhost:3000)
pnpm dev

# Run the API (localhost:8000)
pnpm api:dev
```

### Other Commands

```bash
# Build the web app
pnpm build

# Lint the web app
pnpm lint

# Run API tests
pnpm api:test
```

## Apps

### Web (`apps/web`)

Next.js 15 frontend with React 19, TypeScript, and Tailwind CSS. Uses Supabase for authentication and database.

### API (`apps/api`)

FastAPI backend providing matching algorithms using scipy optimization.
