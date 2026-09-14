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

# Massively expanded taxonomy for software, hardware, and soft skills
SKILL_TAXONOMY = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "go", "rust", "ruby", "php", "swift", "kotlin", "scala", "dart", "perl", "r", "matlab", "shell", "bash",
    # Frontend Web
    "react", "angular", "vue", "vue.js", "next.js", "nuxt", "svelte", "html", "html5", "css", "css3", "sass", "less", "bootstrap", "tailwind", "jquery", "webgl",
    # Backend & Frameworks
    "node.js", "node", "express", "django", "flask", "fastapi", "spring", "spring boot", "asp.net", "laravel", "ruby on rails", "nestjs", "graphql", "rest api", "grpc",
    # Databases
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "sqlite", "oracle", "sql server", "cassandra", "dynamodb", "neo4j", "mariadb", "couchbase",
    # Cloud & DevOps
    "docker", "kubernetes", "aws", "gcp", "azure", "jenkins", "github actions", "gitlab ci", "terraform", "ansible", "puppet", "chef", "linux", "unix", "ci/cd",
    # AI / Data Science
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "matplotlib", "seaborn",
    "data analysis", "data engineering", "big data", "hadoop", "spark", "kafka", "airflow", "databricks", "snowflake", "tableau", "powerbi",
    # Mobile
    "android", "ios", "react native", "flutter", "xamarin",
    # Game Dev / Other
    "unity", "unreal engine", "blender", "maya",
    # Soft skills & business
    "project management", "agile", "scrum", "kanban", "leadership", "communication", "teamwork", "problem solving", "critical thinking"
}

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()

def extract_personal_info(text: str, doc=None) -> dict:
    personal = {
        "name": {"value": None, "confidence": 0.0},
        "email": {"value": None, "confidence": 0.0},
        "phone": {"value": None, "confidence": 0.0},
        "location": {"value": None, "confidence": 0.0}
    }
    
    # Extract Email
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    if email_match:
        personal["email"] = {"value": email_match.group(), "confidence": 0.99}

    # Extract Phone
    phone_match = re.search(r'(\+\d{1,3}[-.\s]??)?\(?\d{3}\)?[-.\s]??\d{3}[-.\s]??\d{4}', text)
    if phone_match:
        personal["phone"] = {"value": phone_match.group(), "confidence": 0.95}

    if doc:
        # Extract Name using spaCy PERSON entity
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                personal["name"] = {"value": ent.text, "confidence": 0.75}
                break
        
        # Extract Location using GPE
        for ent in doc.ents:
            if ent.label_ == "GPE":
                personal["location"] = {"value": ent.text, "confidence": 0.80}
                break
                
    return personal

def extract_skills(text: str) -> dict:
    """Extract skills based on matching against an expanded taxonomy."""
    text_lower = text.lower()
    found_skills = set()
    
    for skill in SKILL_TAXONOMY:
        # Word boundary to avoid partial matches like 'c' in 'cat'
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(skill.title())
            
    confidence = 0.90 if found_skills else 0.0
    return {"value": sorted(list(found_skills)), "confidence": confidence}

def extract_education(text: str, doc=None) -> dict:
    education_list = []
    
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
            education_list.append({
                "degree": value, 
                "institution": None, 
                "graduation_year": None, 
                "score": None
            })

    # Find CGPA or Percentage
    cgpa_match = re.search(r'(cgpa|gpa)[\s:]*([0-9]{1,2}\.[0-9]{1,2})', text, re.IGNORECASE)
    percentage_match = re.search(r'([0-9]{2,3}(?:\.[0-9]{1,2})?)\s*%', text)
    
    if education_list:
        if cgpa_match:
            education_list[0]["score"] = cgpa_match.group(2) + " CGPA"
        elif percentage_match:
            education_list[0]["score"] = percentage_match.group(1) + "%"

        if doc:
            orgs = [ent.text for ent in doc.ents if ent.label_ == 'ORG' and ('university' in ent.text.lower() or 'college' in ent.text.lower() or 'institute' in ent.text.lower())]
            if orgs:
                education_list[0]["institution"] = orgs[0]
                
            dates = [ent.text for ent in doc.ents if ent.label_ == 'DATE' and re.search(r'\b(19|20)\d{2}\b', ent.text)]
            if dates:
                education_list[0]["graduation_year"] = dates[0]
                
    confidence = 0.85 if education_list else 0.0
    return {"value": education_list, "confidence": confidence}

def extract_experience(text: str, doc=None) -> dict:
    experience_list = []
    
    if doc:
        # Heuristic-based: Find ORGs that might be companies and associate with preceding/following job titles
        orgs = [ent.text for ent in doc.ents if ent.label_ == 'ORG' and 'university' not in ent.text.lower() and 'college' not in ent.text.lower()]
        job_titles = ["developer", "engineer", "manager", "analyst", "consultant", "intern", "architect", "scientist", "designer", "lead"]
        
        for org in orgs[:5]: # Limit to top 5
            role = None
            for title in job_titles:
                if re.search(r'\b' + title + r'\b', text, re.IGNORECASE):
                    role = title.title()
                    break
            
            if role:
                experience_list.append({
                    "company": org,
                    "role": role,
                    "duration": None,
                    "responsibilities": []
                })
                
    confidence = 0.70 if experience_list else 0.0
    return {"value": experience_list, "confidence": confidence}

def process_resume_text(text: str) -> dict:
    if not text or not text.strip():
        return {
            "personal": {"name": {"value": None, "confidence": 0.0}, "email": {"value": None, "confidence": 0.0}, "phone": {"value": None, "confidence": 0.0}, "location": {"value": None, "confidence": 0.0}},
            "education": {"value": [], "confidence": 0.0},
            "skills": {"value": [], "confidence": 0.0},
            "experience": {"value": [], "confidence": 0.0},
            "projects": {"value": [], "confidence": 0.0},
            "metadata": {
                "overall_confidence": 0.0,
                "warnings": ["Empty document text"]
            }
        }
        
    cleaned = clean_text(text)
    doc = nlp(cleaned) if nlp else None
    
    personal = extract_personal_info(cleaned, doc)
    skills = extract_skills(cleaned)
    education = extract_education(cleaned, doc)
    experience = extract_experience(cleaned, doc)
    
    overall_conf = (
        personal["email"]["confidence"] + 
        personal["phone"]["confidence"] + 
        skills["confidence"] + 
        education["confidence"]
    ) / 4.0
    
    return {
        "personal": personal,
        "education": education,
        "skills": skills,
        "experience": experience,
        "projects": {"value": [], "confidence": 0.0},
        "certifications": {"value": [], "confidence": 0.0},
        "achievements": {"value": [], "confidence": 0.0},
        "metadata": {
            "overall_confidence": round(overall_conf, 2),
            "warnings": ["spaCy model not loaded"] if not doc else []
        }
    }
