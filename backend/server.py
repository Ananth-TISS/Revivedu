from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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

# Define Models
class ActivityInput(BaseModel):
    age: int
    subjects: List[str]
    intelligences: List[str]
    tools: List[str]

class Activity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    age: int
    subjects: List[str]
    intelligences: List[str]
    tools: List[str]
    title: str
    description: str
    instructions: List[str]
    learning_outcomes: List[str]
    skills: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ActivityResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    age: int
    subjects: List[str]
    intelligences: List[str]
    tools: List[str]
    title: str
    description: str
    instructions: List[str]
    learning_outcomes: List[str]
    skills: List[str]
    created_at: str

class FeedbackInput(BaseModel):
    activity_id: str
    rating: int  # 1-5
    experience: str
    outcomes: str
    suggestions: Optional[str] = None

class Feedback(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    activity_id: str
    rating: int
    experience: str
    outcomes: str
    suggestions: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Artifact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    activity_id: str
    filename: str
    content_type: str
    file_data: str  # base64 encoded
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ArtifactResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    activity_id: str
    filename: str
    content_type: str
    file_data: str
    created_at: str

# Helper function to generate activity using AI
async def generate_activity_with_ai(input_data: ActivityInput) -> dict:
    try:
        emergent_key = os.environ.get('EMERGENT_LLM_KEY')
        
        # Create prompt for AI
        subjects_str = ", ".join(input_data.subjects)
        intelligences_str = ", ".join(input_data.intelligences)
        tools_str = ", ".join(input_data.tools)
        
        prompt = f"""Create a comprehensive educational activity for a {input_data.age}-year-old child.

Subjects to cover: {subjects_str}
Multiple Intelligences to engage: {intelligences_str}
Available tools: {tools_str}

Generate an activity that:
1. Promotes the specified Multiple Intelligences
2. Develops 21st Century Skills (critical thinking, collaboration, creativity, communication)
3. Supports Social and Emotional Learning (SEL)
4. Is age-appropriate and engaging
5. Can be done with the available tools

Respond in the following JSON format:
{{
  "title": "Activity Title",
  "description": "Brief overview of the activity (2-3 sentences)",
  "instructions": ["Step 1", "Step 2", "Step 3", ...],
  "learning_outcomes": ["Outcome 1", "Outcome 2", ...],
  "skills": ["Skill 1", "Skill 2", ...]
}}

Make it creative, fun, and educational!"""
        
        # Initialize LLM chat
        chat = LlmChat(
            api_key=emergent_key,
            session_id=f"activity_{uuid.uuid4()}",
            system_message="You are an expert educational activity designer specializing in homeschooling and gifted education. You create engaging, age-appropriate activities that promote multiple intelligences, 21st century skills, and SEL. Always respond with valid JSON only."
        )
        chat.with_model("openai", "gpt-5.1")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse the response
        import json
        # Extract JSON from response (remove markdown code blocks if present)
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

# Routes
@api_router.get("/")
async def root():
    return {"message": "Homeschool Learning Portal API"}

@api_router.post("/activities/generate", response_model=ActivityResponse)
async def create_activity(input_data: ActivityInput):
    try:
        # Generate activity using AI
        ai_response = await generate_activity_with_ai(input_data)
        
        # Create activity object
        activity = Activity(
            age=input_data.age,
            subjects=input_data.subjects,
            intelligences=input_data.intelligences,
            tools=input_data.tools,
            title=ai_response["title"],
            description=ai_response["description"],
            instructions=ai_response["instructions"],
            learning_outcomes=ai_response["learning_outcomes"],
            skills=ai_response["skills"]
        )
        
        # Save to database
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
    age: Optional[int] = None
):
    try:
        query = {}
        if subject:
            query['subjects'] = subject
        if intelligence:
            query['intelligences'] = intelligence
        if age:
            query['age'] = age
        
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
    file: UploadFile = File(...)
):
    try:
        # Read file content
        content = await file.read()
        file_data = base64.b64encode(content).decode('utf-8')
        
        artifact = Artifact(
            activity_id=activity_id,
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