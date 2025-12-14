# from select import select
# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy import func,select
# from sqlalchemy.ext.asyncio import AsyncSession
# from typing import List
# from app.Models.database import get_db
# from app.Services.memberMaster_Services import (
#     get_all_members,
#     get_member_by_id,
#     get_member_by_mobile,
#     create_member,
#     update_member,
#     delete_member
# )
# from app.Schemas.memberMaster_schemas import (
#     MemberCreate,
#     MemberUpdate,
#     MemberResponse
# )
# from app.Models.memberMaster_model import MemberMaster


# router = APIRouter(
#     prefix="/members",
#     tags=["Members"]
# )



# @router.get("/", response_model=List[MemberResponse])
# async def list_members(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
#     members = await get_all_members(db, skip, limit)
#     return members



# @router.get("/max-doc-no")
# async def get_max_doc_no(db: AsyncSession = Depends(get_db)):
#     result = await db.execute(
#         select(func.max(MemberMaster.doc_No),)   # <-- FIXED
#     )
#     max_doc_no = result.scalar()

#     return max_doc_no 


# @router.get("/{member_id}", response_model=MemberResponse)
# async def fetch_member(member_id: int, db: AsyncSession = Depends(get_db)):
#     member = await get_member_by_id(db, member_id)
#     if not member:
#         raise HTTPException(status_code=404, detail="Member not found")
#     return member


# @router.get("/mobile/{mobile_no}", response_model=MemberResponse)
# async def fetch_by_mobile(mobile_no: str, db: AsyncSession = Depends(get_db)):
#     member = await get_member_by_mobile(db, mobile_no)
#     if not member:
#         raise HTTPException(status_code=404, detail="Mobile number not found")
#     return member



# @router.post("/", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
# async def create_new_member(data: MemberCreate, db: AsyncSession = Depends(get_db)):
#     member = await create_member(db, data)
#     return member


# @router.put("/{member_id}", response_model=MemberResponse)
# async def update_member_by_id(member_id: int, data: MemberUpdate, db: AsyncSession = Depends(get_db)):
#     db_member = await get_member_by_id(db, member_id)
#     if not db_member:
#         raise HTTPException(status_code=404, detail="Member not found")

#     updated_member = await update_member(db, db_member, data)
#     return updated_member


# @router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
# async def remove_member(member_id: int, db: AsyncSession = Depends(get_db)):
#     member = await delete_member(db, member_id)
#     if not member:
#         raise HTTPException(status_code=404, detail="Member not found")
#     return {"detail": "Member deleted successfully"}


from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import os
from datetime import date
from app.Models.database import get_db
from app.Services.memberMaster_Services import (
    get_all_members,
    get_member_by_id,
    get_member_by_mobile,
    create_member,
    update_member,
    delete_member
)
from app.Schemas.memberMaster_schemas import MemberCreate, MemberUpdate, MemberResponse

router = APIRouter(
    prefix="/members",
    tags=["Members"]
)

# -----------------------
# Upload directories
# -----------------------
UPLOAD_ROOT = "upload"
PAN_FOLDER = os.path.join(UPLOAD_ROOT, "pancard")
ADHAR_FOLDER = os.path.join(UPLOAD_ROOT, "adharcard")
INSURANCE_FOLDER = os.path.join(UPLOAD_ROOT, "insurance")
for folder in [PAN_FOLDER, ADHAR_FOLDER, INSURANCE_FOLDER]:
    os.makedirs(folder, exist_ok=True)

# @router.get("/", response_model=List[MemberResponse])
# async def list_all_members(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
#     """
#     Get all members (paginated with skip & limit)
#     """
#     members = await get_all_members(db, skip=skip, limit=limit)
#     return members


@router.get("/", response_model=List[MemberResponse])
async def list_all_members(
    skip: int = 0,
    limit: int = 100,
    family_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Get all members (optionally filtered by family_id)
    """
    members = await get_all_members(
        db,
        skip=skip,
        limit=limit,
        family_id=family_id
    )
    return members

@router.get("/family/{family_id}", response_model=List[MemberResponse])
async def get_members_by_family(
    family_id: int,
    db: AsyncSession = Depends(get_db),
):
    return await get_all_members(db=db, family_id=family_id)

# -----------------------
# Get member by Member_id
# -----------------------
@router.get("/{member_id}", response_model=MemberResponse)
async def get_member(member_id: int, db: AsyncSession = Depends(get_db)):
    member = await get_member_by_id(db, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member


# -----------------------
# Get all members by Family_id
# -----------------------
@router.get("/family/{family_id}", response_model=List[MemberResponse])
async def get_members_by_family(family_id: int, skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """
    Get all members for a specific Family_id
    """
    members = await get_all_members(db, skip=skip, limit=limit, family_id=family_id)
    return members
# -----------------------
# Create member (with files)
# -----------------------
@router.post("/", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
async def create_new_member(
    Family_id: int = Form(...),
    Member_name: str = Form(...),
    Member_address: str = Form(...),
    Mobile_no: str = Form(...),
    Created_by: str = Form(...),
    other_details: Optional[str] = Form(None),
    blood_group: Optional[str] = Form(None),
    date_of_birth: Optional[date] = Form(None),
    pan_file: Optional[UploadFile] = File(None),
    adhar_file: Optional[UploadFile] = File(None),
    insurance_file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    # Save files
    pan_path = os.path.join(PAN_FOLDER, pan_file.filename) if pan_file else None
    adhar_path = os.path.join(ADHAR_FOLDER, adhar_file.filename) if adhar_file else None
    insurance_path = os.path.join(INSURANCE_FOLDER, insurance_file.filename) if insurance_file else None

    if pan_file:
        with open(pan_path, "wb") as f:
            f.write(await pan_file.read())
    if adhar_file:
        with open(adhar_path, "wb") as f:
            f.write(await adhar_file.read())
    if insurance_file:
        with open(insurance_path, "wb") as f:
            f.write(await insurance_file.read())

    member_data = MemberCreate(
        Family_id=Family_id,
        Member_name=Member_name,
        Member_address=Member_address,
        Mobile_no=Mobile_no,
        Created_by=Created_by,
        other_details=other_details,
        blood_group=blood_group,
        date_of_birth=date_of_birth,
        pan_no=pan_path,
        adhar_card=adhar_path,
        insurance=insurance_path
    )
    return await create_member(db, member_data)


# -----------------------
# Update member with file replacement
# -----------------------
@router.put("/{member_id}", response_model=MemberResponse)
async def update_member_by_id(
    member_id: int,
    Member_name: Optional[str] = Form(None),
    Member_address: Optional[str] = Form(None),
    Mobile_no: Optional[str] = Form(None),
    other_details: Optional[str] = Form(None),
    blood_group: Optional[str] = Form(None),
    date_of_birth: Optional[date] = Form(None),
    Modified_by: Optional[str] = Form(None),
    pan_file: Optional[UploadFile] = File(None),
    adhar_file: Optional[UploadFile] = File(None),
    insurance_file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    db_member = await get_member_by_id(db, member_id)
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")

    # Save new files if provided
    pan_path = os.path.join(PAN_FOLDER, pan_file.filename) if pan_file else None
    adhar_path = os.path.join(ADHAR_FOLDER, adhar_file.filename) if adhar_file else None
    insurance_path = os.path.join(INSURANCE_FOLDER, insurance_file.filename) if insurance_file else None

    if pan_file:
        with open(pan_path, "wb") as f:
            f.write(await pan_file.read())
    if adhar_file:
        with open(adhar_path, "wb") as f:
            f.write(await adhar_file.read())
    if insurance_file:
        with open(insurance_path, "wb") as f:
            f.write(await insurance_file.read())

    update_data = MemberUpdate(
        Member_name=Member_name,
        Member_address=Member_address,
        Mobile_no=Mobile_no,
        other_details=other_details,
        blood_group=blood_group,
        date_of_birth=date_of_birth,
        Modified_by=Modified_by
    )
    return await update_member(db, db_member, update_data, pan_path, adhar_path, insurance_path)


# -----------------------
# Delete member and files
# -----------------------
@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(member_id: int, db: AsyncSession = Depends(get_db)):
    member = await delete_member(db, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"detail": "Member and uploaded files deleted successfully"}
