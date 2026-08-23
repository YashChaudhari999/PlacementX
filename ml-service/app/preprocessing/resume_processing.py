import spacy
import re
import logging

logger = logging.getLogger(__name__)

# Load the small english model for NLP
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    logger.warning("Spacy model 'en_core_web_sm' not found. Will use basic extraction.")
    nlp = None

SKILL_TAXONOMY = {
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
    "react", "angular", "vue", "node.js", "express", "django", "flask", "spring boot",
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "docker", "kubernetes", "aws", "gcp", "azure", "jenkins", "github actions",
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch",
    "scikit-learn", "pandas", "numpy", "data analysis", "data engineering", "html", "css"
}

def clean_text(text: str) -> str:
    # Remove excessive newlines and whitespace
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()

def extract_personal_info(text: str, doc=None) -> dict:
    personal = {
        "name": None,
        "email": None,
        "phone": None,
        "location": None
    }
    
    # Extract Email
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    if email_match:
        personal["email"] = email_match.group()

    # Extract Phone
    phone_match = re.search(r'(\+\d{1,3}[-.\s]??)?\(?\d{3}\)?[-.\s]??\d{3}[-.\s]??\d{4}', text)
    if phone_match:
        personal["phone"] = phone_match.group()

    if doc:
        # Extract Name using spaCy PERSON entity
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                personal["name"] = ent.text
                break
        
        # Extract Location using GPE
        for ent in doc.ents:
            if ent.label_ == "GPE":
                personal["location"] = ent.text
                break
                
    return personal

def extract_skills(text: str) -> list:
    """Extract skills based on matching against a taxonomy."""
    text_lower = text.lower()
    found_skills = set()
    
    for skill in SKILL_TAXONOMY:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(skill.title())
            
    return sorted(list(found_skills))

def extract_education(text: str, doc=None) -> list:
    education = []
    
    degrees = {
        "bachelor": "Bachelor's Degree",
        "b.tech": "Bachelor of Technology",
        "b.e": "Bachelor of Engineering",
        "bsc": "Bachelor of Science",
        "master": "Master's Degree",
        "m.tech": "Master of Technology",
        "m.e": "Master of Engineering",
        "msc": "Master of Science",
        "mba": "Master of Business Administration",
        "phd": "Doctor of Philosophy",
        "doctorate": "Doctorate"
    }
    
    for key, value in degrees.items():
        if re.search(r'\b' + re.escape(key) + r'\b', text, re.IGNORECASE):
            # Try to find year/institution near it if doc is available, but for now simple fallback
            education.append({"degree": value, "institution": None, "graduation_year": None, "score": None})

    # Find CGPA or Percentage
    cgpa_match = re.search(r'(cgpa|gpa)[\s:]*([0-9]{1,2}\.[0-9]{1,2})', text, re.IGNORECASE)
    percentage_match = re.search(r'([0-9]{2,3}(?:\.[0-9]{1,2})?)\s*%', text)
    
    if education:
        if cgpa_match:
            education[0]["score"] = cgpa_match.group(2) + " CGPA"
        elif percentage_match:
            education[0]["score"] = percentage_match.group(1) + "%"

        if doc:
            orgs = [ent.text for ent in doc.ents if ent.label_ == 'ORG' and ('university' in ent.text.lower() or 'college' in ent.text.lower() or 'institute' in ent.text.lower())]
            if orgs:
                education[0]["institution"] = orgs[0]
                
            dates = [ent.text for ent in doc.ents if ent.label_ == 'DATE' and re.search(r'\b(19|20)\d{2}\b', ent.text)]
            if dates:
                education[0]["graduation_year"] = dates[0]

    return education

def extract_experience(text: str, doc=None) -> list:
    experience = []
    if doc:
        # Very heuristic-based: Find ORGs that might be companies and associate with preceding/following job titles
        orgs = [ent.text for ent in doc.ents if ent.label_ == 'ORG' and 'university' not in ent.text.lower() and 'college' not in ent.text.lower()]
        job_titles = ["developer", "engineer", "manager", "analyst", "consultant", "intern", "architect"]
        
        for org in orgs[:3]: # Limit to top 3
            # Find if there's a title nearby
            role = None
            for title in job_titles:
                if re.search(r'\b' + title + r'\b', text, re.IGNORECASE):
                    role = title.title()
                    break
            
            if role:
                experience.append({
                    "company": org,
                    "role": role,
                    "duration": None,
                    "responsibilities": []
                })
    return experience

def process_resume_text(text: str) -> dict:
    cleaned = clean_text(text)
    doc = nlp(cleaned) if nlp else None
    
    personal = extract_personal_info(cleaned, doc)
    skills = extract_skills(cleaned)
    education = extract_education(cleaned, doc)
    experience = extract_experience(cleaned, doc)
    
    return {
        "personal": personal,
        "education": education,
        "skills": skills,
        "experience": experience,
        "projects": [], # Could be extracted with more complex rules
        "certifications": [],
        "achievements": [],
        "metadata": {
            "confidence": 0.85 if doc else 0.5,
            "warnings": ["spaCy model not loaded"] if not doc else []
        }
    }
