from fastapi import APIRouter
from app.models.review_request import ReviewRequest
from app.services.agent_orchestrator import run_review_pipeline

router = APIRouter(prefix="/review", tags=["Review"])

@router.post("")
async def review_pr(data: ReviewRequest):
    result = await run_review_pipeline(data.pr_url)
    return result