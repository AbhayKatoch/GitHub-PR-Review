from app.utils.llm_client import call_llm

STYLE_SYSTEM = """
You are a code readability/style reviewer.
Find issues related to:
- naming
- complexity
- missing docstrings
- bad formatting
- unclear expressions
Return only valid JSON.
"""

def build_prompt(changes):
    prompt = "Analyze these added lines for STYLE & READABILITY issues:\n\n"
    for c in changes:
        prompt += f"{c['file']}:{c['line_number']} → {c['code']}\n"
    prompt += """

Return JSON array with:
[
  {
    "file": "",
    "line": 0,
    "severity": "",
    "comment": "",
    "suggestion": ""
  }
]
"""
    return prompt

async def style_review(changes):
    try:
        return await call_llm(STYLE_SYSTEM, build_prompt(changes))
    except Exception as e:
        return f"[]  // logic agent failed: {str(e)}"


