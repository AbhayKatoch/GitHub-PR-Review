from app.utils.llm_client import call_llm

SECURITY_SYSTEM = """
You are a senior security engineer reviewing code for vulnerabilities.
Find security risks like:
- SQL injection
- command injection
- unsafe eval
- secrets in code
- insecure crypto
- missing input validation
Return only valid JSON.
"""

def build_prompt(changes):
    prompt = "Analyze these added lines for SECURITY vulnerabilities:\n\n"
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

async def security_review(changes):
    try:
        return await call_llm(SECURITY_SYSTEM, build_prompt(changes))
    except Exception as e:
        return f"[]  // logic agent failed: {str(e)}"
