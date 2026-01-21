"""
P-resents API

FastAPI service for gift exchange matching algorithms.
Supports multiple rulesets: Secret Santa (Random, Max Utility, Max Fairness) and White Elephant.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers import recalculate, finalize

# Create FastAPI app
app = FastAPI(
    title="P-resents API",
    description="Gift exchange matching algorithms service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(recalculate.router, tags=["Matching"])
app.include_router(finalize.router, tags=["Matching"])


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API information."""
    return {
        "service": "P-resents API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "docs": "/docs",
            "recalculate": "POST /recalculate",
            "finalize": "POST /finalize_group"
        }
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "p-resents-api"
    }