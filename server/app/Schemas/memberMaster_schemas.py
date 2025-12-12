from pydantic import BaseModel
from typing import Optional
from datetime import date


class MemberBase(BaseModel):
    Member_name: Optional[str] = None
    Member_address: Optional[str] = None
    Mobile_no:Optional[str] = None
    other_details: Optional[str] = None
    Created_by: Optional[str] = None
    Modified_by: Optional[str] = None
    


class MemberCreate(MemberBase):
    """Schema for creating a new member."""
    pass


class MemberUpdate(BaseModel):
    """Schema for updating member details."""
    Member_name: Optional[str] = None
    Member_address: Optional[str] = None
    Mobile_no: Optional[str] = None
    other_details: Optional[str] = None
    Modified_by: Optional[str] = None


class MemberResponse(MemberBase):
    """Schema returned after reading a member."""
    Member_id: int
    doc_No: int

    class Config:
        orm_mode = True
