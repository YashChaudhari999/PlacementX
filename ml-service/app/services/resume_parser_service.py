import fitz  # PyMuPDF
import docx
import io
import logging
from app.preprocessing.resume_processing import process_resume_text

logger = logging.getLogger(__name__)

class ResumeParserService:
    def parse_pdf(self, file_bytes: bytes) -> str:
        text = ""
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page in doc:
                text += page.get_text()
            doc.close()
        except Exception as e:
            logger.error(f"Error parsing PDF: {e}")
            raise ValueError(f"Failed to parse PDF: {e}")
        return text

    def parse_docx(self, file_bytes: bytes) -> str:
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        except Exception as e:
            logger.error(f"Error parsing DOCX: {e}")
            raise ValueError(f"Failed to parse DOCX: {e}")
        return text

    def parse_resume(self, file_bytes: bytes, filename: str) -> dict:
        """Parses a resume file and extracts structured data."""
        text = ""
        
        if filename.lower().endswith(".pdf"):
            text = self.parse_pdf(file_bytes)
        elif filename.lower().endswith(".docx"):
            text = self.parse_docx(file_bytes)
        else:
            raise ValueError("Unsupported file format. Only PDF and DOCX are supported.")
            
        if not text.strip():
            raise ValueError("Could not extract any text from the document.")

        return process_resume_text(text)
