from app.utils.llm_client import call_llm

FINAL_SYSTEM = """
You are a strict JSON formatter.
Your ONLY job: Combine all agent outputs and return a **valid JSON array**.
RULES:
- NO explanations
- NO markdown
- NO code fences
- NO text outside the JSON
- Output MUST be a pure JSON array
"""

async def finalize_reviews(agent_outputs):
    combined = "\n".join(agent_outputs)

    prompt = f"""
Combine and clean up these JSON review outputs:
{combined}

Return a **single JSON array**.
"""

    try:
        return await call_llm(FINAL_SYSTEM, prompt)
    except Exception:
        return "[]"
