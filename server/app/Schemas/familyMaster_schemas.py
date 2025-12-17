# from pydantic import BaseModel
# from typing import Optional

# # =========================
# # Create Family
# # =========================
# class FamilyCreateSchema(BaseModel):
#     Family_Name: str
#     Family_Address: Optional[str] = None
#     Email_Id: Optional[str] = None
#     Email_Password: Optional[str] = None
#     Mobile: Optional[str] = None 
#     User_Name: str
#     User_Password: str
#     User_Type: str 


# # =========================
# # Response Schema
# # =========================
# class FamilyResponseSchema(BaseModel):
#     Family_id: int
#     Family_Name: str
#     Family_Address: Optional[str] = None
#     Email_Id: Optional[str] = None
#     Mobile: Optional[str] = None 
#     User_Name: str
#     User_Type: str 

#     class Config:
#         from_attributes = True 