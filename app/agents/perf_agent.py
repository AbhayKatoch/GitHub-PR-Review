from app.utils.llm_client import call_llm

PERF_SYSTEM = """
You are a performance engineering expert.
Identify performance issues such as:
- O(n^2) loops
- repeated DB calls
- unnecessary computations
- blocking operations in async code
- inefficient I/O
Return only valid JSON.
"""

def build_prompt(changes):
    prompt = "Analyze these added lines for PERFORMANCE issues:\n\n"
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

async def performance_review(changes):
    try:
        return await call_llm(PERF_SYSTEM, build_prompt(changes))
    except Exception as e:
        return f"[]  // logic agent failed: {str(e)}"
