import httpx
import os
from fastapi import HTTPException
import re
from dotenv import load_dotenv
load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

def validate_pr_url(pr_url: str):
    pattern = r"https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/\d+"
    if not re.match(pattern, pr_url):
        raise HTTPException(status_code=400, detail="Invalid GitHub PR URL format.")
    

async def fetch_pr_diff(pr_url:str)-> str:
    validate_pr_url(pr_url)
    owner, repo , number = parse_pr_url(pr_url)
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3.diff"
    }

    url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{number}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"GitHub API Error: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"GitHub request failed: {str(e)}")

    return response.text

def parse_pr_url(url: str):
    parts = url.split("/")
    owner = parts[3]
    repo = parts[4]
    number = parts[6]
    return owner, repo, int(number)