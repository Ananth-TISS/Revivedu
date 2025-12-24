from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai import OpenAITextToSpeech
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT and Password settings
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'revivedu-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ Authentication Models ============
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserResponse(BaseModel):
    id: str
    name: str
    email: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# ============ Child Profile Models ============
class ChildProfileInput(BaseModel):
    name: str
    age: int
    grade: Optional[str] = None
    interests: List[str] = []

class ChildProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    age: int
    grade: Optional[str] = None
    interests: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChildProfileResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    name: str
    age: int
    grade: Optional[str] = None
    interests: List[str]
    created_at: str

# ============ Activity Models ============
class ActivityInput(BaseModel):
    age: int
    subjects: List[str]
    intelligences: List[str]
    tools: List[str]
    child_id: Optional[str] = None

class Activity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    child_id: Optional[str] = None
    age: int
    subjects: List[str]
    intelligences: List[str]
    tools: List[str]
    title: str
    objective: str
    description: str
    expected_outcome: str
    materials_required: List[str]
    curricular_areas: dict
    instructions: List[str]
    success_metrics: List[str]
    reflection_question: str
    learning_outcomes: List[str] = []
    skills: List[str] = []
    estimated_time: Optional[str] = None
    extensions: List[str] = []
    discussion_questions: List[str] = []
    real_world_connection: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ActivityResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    child_id: Optional[str] = None
    age: int
    subjects: List[str]
    intelligences: List[str]
    tools: List[str]
    title: str
    objective: Optional[str] = None
    description: str
    expected_outcome: Optional[str] = None
    materials_required: List[str] = []
    curricular_areas: Optional[dict] = None
    instructions: List[str]
    success_metrics: List[str] = []
    reflection_question: Optional[str] = None
    learning_outcomes: List[str] = []
    skills: List[str] = []
    estimated_time: Optional[str] = None
    extensions: List[str] = []
    discussion_questions: List[str] = []
    real_world_connection: Optional[str] = None
    created_at: str

class FeedbackInput(BaseModel):
    activity_id: str
    child_id: Optional[str] = None
    rating: int
    experience: str
    outcomes: str
    suggestions: Optional[str] = None

class Feedback(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    activity_id: str
    child_id: Optional[str] = None
    rating: int
    experience: str
    outcomes: str
    suggestions: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Artifact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    activity_id: str
    child_id: Optional[str] = None
    filename: str
    content_type: str
    file_data: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ArtifactResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    activity_id: str
    child_id: Optional[str] = None
    filename: str
    content_type: str
    file_data: str
    created_at: str

class ExposureReport(BaseModel):
    child_id: str
    child_name: str
    total_activities: int
    intelligence_exposure: dict
    subject_exposure: dict
    skills_developed: List[str]
    average_rating: float
    strengths: List[str]
    recommendations: List[str]
    generated_at: str

# ============ Helper Functions ============
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[dict]:
    if not credentials:
        return None
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
        return user
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

async def generate_activity_with_ai(input_data: ActivityInput) -> dict:
    try:
        emergent_key = os.environ.get('EMERGENT_LLM_KEY')
        
        subjects_str = ", ".join(input_data.subjects)
        intelligences_str = ", ".join(input_data.intelligences)
        tools_str = ", ".join(input_data.tools)
        
        prompt = f"""As an expert in educational program design with specialized knowledge of NCF-SE 2023 framework and National Institute of Open Schooling (NIOS) curriculum standards, create a comprehensive, contextualized learning activity for a {input_data.age}-year-old gifted/homeschooled child in India.

**Context:**
- Age: {input_data.age} years
- Subjects: {subjects_str}
- Multiple Intelligences (Howard Gardner): {intelligences_str}
- Available Materials: {tools_str}

**Requirements:**
Design an activity that:
1. Aligns with NCF-SE 2023 framework and NIOS curriculum standards
2. Promotes Multiple Intelligences development
3. Develops 21st century skills (critical thinking, creativity, collaboration, communication)
4. Incorporates Social and Emotional Learning (SEL) elements
5. Is age-appropriate, engaging, and culturally relevant to Indian context
6. Uses only the available materials at home
7. Supports both gifted learners and homeschooling needs

**Required Format (respond ONLY with valid JSON):**
{{
  "title": "Concise, engaging activity name",
  "objective": "Clear, measurable learning goals aligned with developmental needs and curricular standards",
  "description": "Brief overview (2-3 sentences) summarizing purpose and context",
  "expected_outcome": "Specific skills, knowledge, or attitudes the child will develop",
  "materials_required": ["Material 1", "Material 2", ...],
  "curricular_areas": {{
    "ncf_se_2023": ["Relevant domain/area from NCF-SE 2023"],
    "nios_subjects": ["Relevant NIOS subject alignment for grades 10/12"],
    "learning_domains": ["Cognitive", "Affective", "Psychomotor", "Social-Emotional"]
  }},
  "instructions": ["Detailed Step 1", "Detailed Step 2", ...],
  "success_metrics": ["Quantifiable indicator 1", "Observable behavior 2", ...],
  "reflection_question": "Thought-provoking prompt for critical thinking and self-assessment",
  "learning_outcomes": ["Specific learning outcome 1", "Specific learning outcome 2", ...],
  "skills": ["21st century skill 1", "SEL competency 2", ...],
  "estimated_time": "Duration range (e.g., 45-60 minutes)",
  "extensions": ["Advanced challenge 1", "Alternative approach 2", ...],
  "discussion_questions": ["Question for deeper reflection 1", "Question 2", ...],
  "real_world_connection": "How this activity connects to real-world applications and Indian context"
}}

Make it pedagogically sound, differentiated, and holistic."""
        
        chat = LlmChat(
            api_key=emergent_key,
            session_id=f"activity_{uuid.uuid4()}",
            system_message="You are an expert in educational program design with specialized knowledge of NCF-SE 2023 framework, National Institute of Open Schooling (NIOS) curriculum standards, NEP 2020, and Howard Gardner's Multiple Intelligences theory. You design pedagogically sound, differentiated learning activities for gifted and homeschooled children in India, ensuring alignment with national curricula while promoting holistic development. Always respond with valid JSON only."
        )
        chat.with_model("openai", "gpt-5.1")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        import json
        response_text = response.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        activity_data = json.loads(response_text.strip())
        return activity_data
        
    except Exception as e:
        logger.error(f"Error generating activity: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate activity: {str(e)}")

# ============ Authentication Routes ============
@api_router.post("/auth/signup", response_model=TokenResponse)
async def signup(user_data: UserSignup):
    try:
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user = User(
            name=user_data.name,
            email=user_data.email,
            password_hash=hash_password(user_data.password)
        )
        
        doc = user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
        
        access_token = create_access_token(data={"sub": user.id})
        user_response = UserResponse(id=user.id, name=user.name, email=user.email)
        
        return TokenResponse(access_token=access_token, token_type="bearer", user=user_response)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in signup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    try:
        user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
        if not user or not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        access_token = create_access_token(data={"sub": user["id"]})
        user_response = UserResponse(id=user["id"], name=user["name"], email=user["email"])
        
        return TokenResponse(access_token=access_token, token_type="bearer", user=user_response)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in login: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return UserResponse(**current_user)

# ============ Child Profile Routes ============
@api_router.post("/children", response_model=ChildProfileResponse)
async def create_child_profile(profile_data: ChildProfileInput, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        child = ChildProfile(
            user_id=current_user["id"],
            name=profile_data.name,
            age=profile_data.age,
            grade=profile_data.grade,
            interests=profile_data.interests
        )
        
        doc = child.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.children.insert_one(doc)
        
        return ChildProfileResponse(**doc)
        
    except Exception as e:
        logger.error(f"Error creating child profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/children", response_model=List[ChildProfileResponse])
async def get_children(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        children = await db.children.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(100)
        return [ChildProfileResponse(**child) for child in children]
        
    except Exception as e:
        logger.error(f"Error fetching children: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/children/{child_id}", response_model=ChildProfileResponse)
async def get_child(child_id: str, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        child = await db.children.find_one({"id": child_id, "user_id": current_user["id"]}, {"_id": 0})
        if not child:
            raise HTTPException(status_code=404, detail="Child profile not found")
        return ChildProfileResponse(**child)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching child: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/children/{child_id}", response_model=ChildProfileResponse)
async def update_child(child_id: str, profile_data: ChildProfileInput, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        child = await db.children.find_one({"id": child_id, "user_id": current_user["id"]}, {"_id": 0})
        if not child:
            raise HTTPException(status_code=404, detail="Child profile not found")
        
        update_data = profile_data.model_dump()
        await db.children.update_one(
            {"id": child_id, "user_id": current_user["id"]},
            {"$set": update_data}
        )
        
        updated_child = await db.children.find_one({"id": child_id}, {"_id": 0})
        return ChildProfileResponse(**updated_child)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating child: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/children/{child_id}")
async def delete_child(child_id: str, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        result = await db.children.delete_one({"id": child_id, "user_id": current_user["id"]})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Child profile not found")
        return {"message": "Child profile deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting child: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ Activity Routes ============
@api_router.get("/")
async def root():
    return {"message": "Revivedu API - Reviving Education Through Intelligence"}

@api_router.post("/activities/generate", response_model=ActivityResponse)
async def create_activity(input_data: ActivityInput):
    try:
        ai_response = await generate_activity_with_ai(input_data)
        
        activity = Activity(
            child_id=input_data.child_id,
            age=input_data.age,
            subjects=input_data.subjects,
            intelligences=input_data.intelligences,
            tools=input_data.tools,
            title=ai_response["title"],
            objective=ai_response["objective"],
            description=ai_response["description"],
            expected_outcome=ai_response["expected_outcome"],
            materials_required=ai_response["materials_required"],
            curricular_areas=ai_response["curricular_areas"],
            instructions=ai_response["instructions"],
            success_metrics=ai_response["success_metrics"],
            reflection_question=ai_response["reflection_question"],
            learning_outcomes=ai_response.get("learning_outcomes", []),
            skills=ai_response.get("skills", []),
            estimated_time=ai_response.get("estimated_time"),
            extensions=ai_response.get("extensions", []),
            discussion_questions=ai_response.get("discussion_questions", []),
            real_world_connection=ai_response.get("real_world_connection")
        )
        
        doc = activity.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.activities.insert_one(doc)
        
        return ActivityResponse(**doc)
        
    except Exception as e:
        logger.error(f"Error creating activity: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/activities", response_model=List[ActivityResponse])
async def get_activities(
    subject: Optional[str] = None,
    intelligence: Optional[str] = None,
    age: Optional[int] = None,
    child_id: Optional[str] = None
):
    try:
        query = {}
        if subject:
            query['subjects'] = subject
        if intelligence:
            query['intelligences'] = intelligence
        if age:
            query['age'] = age
        if child_id:
            query['child_id'] = child_id
        
        activities = await db.activities.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
        return [ActivityResponse(**activity) for activity in activities]
        
    except Exception as e:
        logger.error(f"Error fetching activities: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/activities/{activity_id}", response_model=ActivityResponse)
async def get_activity(activity_id: str):
    try:
        activity = await db.activities.find_one({"id": activity_id}, {"_id": 0})
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        return ActivityResponse(**activity)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching activity: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/feedback")
async def submit_feedback(feedback_input: FeedbackInput):
    try:
        feedback = Feedback(**feedback_input.model_dump())
        doc = feedback.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.feedbacks.insert_one(doc)
        return {"message": "Feedback submitted successfully", "id": feedback.id}
        
    except Exception as e:
        logger.error(f"Error submitting feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/feedback/{activity_id}")
async def get_feedback(activity_id: str):
    try:
        feedbacks = await db.feedbacks.find({"activity_id": activity_id}, {"_id": 0}).to_list(100)
        return feedbacks
        
    except Exception as e:
        logger.error(f"Error fetching feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/artifacts")
async def upload_artifact(
    activity_id: str = Form(...),
    child_id: Optional[str] = Form(None),
    file: UploadFile = File(...)
):
    try:
        content = await file.read()
        file_data = base64.b64encode(content).decode('utf-8')
        
        artifact = Artifact(
            activity_id=activity_id,
            child_id=child_id,
            filename=file.filename,
            content_type=file.content_type,
            file_data=file_data
        )
        
        doc = artifact.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.artifacts.insert_one(doc)
        
        return {"message": "Artifact uploaded successfully", "id": artifact.id}
        
    except Exception as e:
        logger.error(f"Error uploading artifact: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/artifacts/{activity_id}", response_model=List[ArtifactResponse])
async def get_artifacts(activity_id: str):
    try:
        artifacts = await db.artifacts.find({"activity_id": activity_id}, {"_id": 0}).to_list(100)
        return [ArtifactResponse(**artifact) for artifact in artifacts]
        
    except Exception as e:
        logger.error(f"Error fetching artifacts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ Exposure Report Route ============
@api_router.get("/children/{child_id}/exposure-report", response_model=ExposureReport)
async def get_exposure_report(child_id: str, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        child = await db.children.find_one({"id": child_id, "user_id": current_user["id"]}, {"_id": 0})
        if not child:
            raise HTTPException(status_code=404, detail="Child profile not found")
        
        activities = await db.activities.find({"child_id": child_id}, {"_id": 0}).to_list(1000)
        feedbacks = await db.feedbacks.find({"child_id": child_id}, {"_id": 0}).to_list(1000)
        
        intelligence_counts = {}
        subject_counts = {}
        all_skills = []
        total_rating = 0
        
        for activity in activities:
            for intel in activity.get("intelligences", []):
                intelligence_counts[intel] = intelligence_counts.get(intel, 0) + 1
            for subject in activity.get("subjects", []):
                subject_counts[subject] = subject_counts.get(subject, 0) + 1
            all_skills.extend(activity.get("skills", []))
        
        for feedback in feedbacks:
            total_rating += feedback.get("rating", 0)
        
        avg_rating = total_rating / len(feedbacks) if feedbacks else 0
        unique_skills = list(set(all_skills))
        
        sorted_intelligences = sorted(intelligence_counts.items(), key=lambda x: x[1], reverse=True)
        strengths = [intel for intel, _ in sorted_intelligences[:3]] if sorted_intelligences else []
        
        under_exposed = [intel for intel, count in intelligence_counts.items() if count < 2]
        recommendations = []
        if under_exposed:
            recommendations.append(f"Explore more activities in: {', '.join(under_exposed[:3])}")
        if avg_rating >= 4:
            recommendations.append("Child is responding well! Consider more challenging activities.")
        recommendations.append("Continue diverse intelligence exposure for holistic development.")
        
        return ExposureReport(
            child_id=child_id,
            child_name=child["name"],
            total_activities=len(activities),
            intelligence_exposure=intelligence_counts,
            subject_exposure=subject_counts,
            skills_developed=unique_skills,
            average_rating=round(avg_rating, 2),
            strengths=strengths,
            recommendations=recommendations,
            generated_at=datetime.now(timezone.utc).isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating exposure report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
