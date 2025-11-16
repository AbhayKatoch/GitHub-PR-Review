import asyncio
from app.services.github_service import fetch_pr_diff
from app.services.diff_parser import parse_diff
from app.agents.logic_agent import logic_review
from app.agents.perf_agent import performance_review
from app.agents.security_agent import security_review
from app.agents.style_agent import style_review
from app.agents.final_agent import finalize_reviews

async def run_review_pipeline(pr_url: str):
    diff = await fetch_pr_diff(pr_url)
    parsed_changes = parse_diff(diff)

    logic_task = logic_review(parsed_changes)
    perf_task = performance_review(parsed_changes)
    sec_task = security_review(parsed_changes)
    style_task = style_review(parsed_changes)

    logic, perf, sec, style = await asyncio.gather(
        logic_task, perf_task, sec_task, style_task
    )

    result = await finalize_reviews([logic, perf, sec, style])
    return result
