# from pydantic import BaseModel
# from typing import Optional
# from datetime import date


# class MemberBase(BaseModel):
#     Member_name: Optional[str] = None
#     Member_address: Optional[str] = None
#     Mobile_no:Optional[str] = None
#     other_details: Optional[str] = None
#     Created_by: Optional[str] = None
#     Modified_by: Optional[str] = None
    


# class MemberCreate(MemberBase):
#     """Schema for creating a new member."""
#     pass


# class MemberUpdate(BaseModel):
#     """Schema for updating member details."""
#     Member_name: Optional[str] = None
#     Member_address: Optional[str] = None
#     Mobile_no: Optional[str] = None
#     other_details: Optional[str] = None
#     Modified_by: Optional[str] = None


# class MemberResponse(MemberBase):
#     """Schema returned after reading a member."""
#     Member_id: int
#     doc_No: int

#     class Config:
#         orm_mode = True


from pydantic import BaseModel
from typing import Optional
from datetime import date

# -------------------------------
# Base schema (shared fields)
# -------------------------------
class MemberBase(BaseModel):
    Member_name: Optional[str] = None
    Member_address: Optional[str] = None
    Mobile_no: Optional[str] = None
    other_details: Optional[str] = None
    pan_no: Optional[str] = None
    adhar_card: Optional[str] = None
    insurance: Optional[str] = None
    blood_group: Optional[str] = None
    date_of_birth: Optional[date] = None
    Created_by: Optional[str] = None
    Modified_by: Optional[str] = None

# -------------------------------
# Schema for creating a member
# -------------------------------
class MemberCreate(MemberBase):
    Family_id: int  # required
    Member_name: str
    Member_address: str
    Mobile_no: str
    Created_by: str

# -------------------------------
# Schema for updating a member
# -------------------------------
class MemberUpdate(BaseModel):
    Member_name: Optional[str] = None
    Member_address: Optional[str] = None
    Mobile_no: Optional[str] = None
    other_details: Optional[str] = None
    pan_no: Optional[str] = None
    adhar_card: Optional[str] = None
    insurance: Optional[str] = None
    blood_group: Optional[str] = None
    date_of_birth: Optional[date] = None
    Modified_by: Optional[str] = None

# -------------------------------
# Schema for response
# -------------------------------
class MemberResponse(MemberBase):
    Member_id: int
    doc_No: int
    Family_id: int
    Created_at: date

    class Config:
        orm_mode = True
