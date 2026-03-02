from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import get_settings
from backend.app.core.database import engine, Base
from backend.app.routers import auth, patient, doctor, staff, admin, appointment, pharmacy, events

# Initialize FastAPI app
app = FastAPI(title=get_settings().PROJECT_NAME)

# NOTE: This is a permissive CORS configuration for development.
# For production, you should restrict the origins to your frontend's domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth.router, prefix=get_settings().API_V1_STR, tags=["Authentication"])
app.include_router(patient.router, prefix=f"{get_settings().API_V1_STR}/patients", tags=["Patient"])
app.include_router(doctor.router, prefix=f"{get_settings().API_V1_STR}/doctors", tags=["Doctor"])
app.include_router(staff.router, prefix=f"{get_settings().API_V1_STR}/staff", tags=["Staff"])
app.include_router(admin.router, prefix=f"{get_settings().API_V1_STR}/admin", tags=["Admin"])
app.include_router(appointment.router, prefix=f"{get_settings().API_V1_STR}/appointments", tags=["Appointment"])
app.include_router(pharmacy.router, prefix=f"{get_settings().API_V1_STR}/pharmacy", tags=["Pharmacy"])
app.include_router(events.router, prefix=get_settings().API_V1_STR, tags=["Events"])

@app.get("/")
def read_root():
    return {"message": "Welcome to HMS-AI API"}
