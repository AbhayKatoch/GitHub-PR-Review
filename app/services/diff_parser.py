from unidiff import PatchSet
from fastapi import HTTPException

def parse_diff(diff_text: str):
    try:
        patch = PatchSet(diff_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse GitHub diff: {str(e)}")
    parsed = []

    for file in patch:
        file_path = file.path

        for hunk in file:
            for line in hunk:
                if line.is_added:
                    parsed.append({
                        "file": file_path,
                        "line_number": line.target_line_no,
                        "code": line.value.strip()
                    })

    return parsed
