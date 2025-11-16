from fastapi import FastAPI
from app.routers.review_router import router as review_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(
    title="PR Review Agent",
    description="Automated Pull Request Review System using multi-agent LLMs"    
)
origins = [
    "http://localhost:5173",  # Vite/React dev
    "http://127.0.0.1:5173",
    "http://localhost:3000",   # Next.js alternative port
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # ALLOW frontend origin(s)
    allow_credentials=True,
    allow_methods=["*"],          # GET, POST, OPTIONS…
    allow_headers=["*"],
)


app.include_router(review_router)