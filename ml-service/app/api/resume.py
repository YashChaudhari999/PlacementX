from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.resume_parser_service import ResumeParserService

router = APIRouter()
parser_service = ResumeParserService()

@router.post("/parse")
async def parse_resume(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        parsed_data = parser_service.parse_resume(contents, file.filename)
        return {
            "success": True,
            "data": parsed_data
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error during resume parsing")
