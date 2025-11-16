from app.utils.llm_client import call_llm

LOGIC_SYSTEM = """
You are a senior backend engineer expert in reviewing code logic.
Return only valid JSON.
"""

def build_logic_prompt(changes):
    text = ""
    for c in changes:
        text += f"{c['file']}:{c['line_number']} → {c['code']}\n"
    return text

def build_prompt(changes):
    prompt = "Analyze the following added lines for logic issues:\n\n"
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

async def logic_review(changes):
    try:
        return await call_llm(LOGIC_SYSTEM, build_prompt(changes))
    except Exception as e:
        return f"[]  // logic agent failed: {str(e)}"
