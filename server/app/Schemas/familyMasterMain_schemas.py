from pydantic import BaseModel
from typing import Optional

# =========================
# Create Family Schema
# =========================
class FamilyCreateSchema(BaseModel):
    Family_Name: str
    Family_Address: Optional[str] = None
    Email_Id: Optional[str] = None
    Email_Password: Optional[str] = None
    Mobile: Optional[str] = None  # comma-separated numbers
    User_Name: str
    User_Password: str
    User_Type: str  # single character

# =========================
# Response Schema
# =========================
class FamilyResponseSchema(BaseModel):
    Family_id: int
    Family_Name: str
    Family_Address: Optional[str] = None
    Email_Id: Optional[str] = None
    Mobile: Optional[str] = None
    User_Name: str
    User_Type: str
    User_Password: str

    class Config:
        from_attributes = True  # Pydantic v2
