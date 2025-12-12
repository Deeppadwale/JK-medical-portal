from select import select
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func,select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.Models.database import get_db
from app.Services.memberMaster_Services import (
    get_all_members,
    get_member_by_id,
    get_member_by_mobile,
    create_member,
    update_member,
    delete_member
)
from app.Schemas.memberMaster_schemas import (
    MemberCreate,
    MemberUpdate,
    MemberResponse
)
from app.Models.memberMaster_model import MemberMaster


router = APIRouter(
    prefix="/members",
    tags=["Members"]
)



@router.get("/", response_model=List[MemberResponse])
async def list_members(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    members = await get_all_members(db, skip, limit)
    return members



@router.get("/max-doc-no")
async def get_max_doc_no(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(func.max(MemberMaster.doc_No),)   # <-- FIXED
    )
    max_doc_no = result.scalar()

    return max_doc_no 


@router.get("/{member_id}", response_model=MemberResponse)
async def fetch_member(member_id: int, db: AsyncSession = Depends(get_db)):
    member = await get_member_by_id(db, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member


@router.get("/mobile/{mobile_no}", response_model=MemberResponse)
async def fetch_by_mobile(mobile_no: str, db: AsyncSession = Depends(get_db)):
    member = await get_member_by_mobile(db, mobile_no)
    if not member:
        raise HTTPException(status_code=404, detail="Mobile number not found")
    return member



@router.post("/", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
async def create_new_member(data: MemberCreate, db: AsyncSession = Depends(get_db)):
    member = await create_member(db, data)
    return member


@router.put("/{member_id}", response_model=MemberResponse)
async def update_member_by_id(member_id: int, data: MemberUpdate, db: AsyncSession = Depends(get_db)):
    db_member = await get_member_by_id(db, member_id)
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")

    updated_member = await update_member(db, db_member, data)
    return updated_member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(member_id: int, db: AsyncSession = Depends(get_db)):
    member = await delete_member(db, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"detail": "Member deleted successfully"}
