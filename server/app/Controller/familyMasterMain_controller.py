from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.Models.database import get_db
from app.Schemas.familyMasterMain_schemas import FamilyCreateSchema, FamilyResponseSchema
from app.Services.familyMasterMain_services import (
    create_family,
    get_all_families,
    get_family_by_id,
    update_family,
    delete_family
)

router = APIRouter(
    prefix="/familiesMain",
    tags=["Family Master Main"]
)

# =========================
# Create
# =========================
@router.post("/", response_model=FamilyResponseSchema)
async def create_family_api(
    data: FamilyCreateSchema,
    db: AsyncSession = Depends(get_db)
):
    return await create_family(db, data)

# =========================
# Get All
# =========================
@router.get("/", response_model=List[FamilyResponseSchema])
async def get_all_families_api(
    db: AsyncSession = Depends(get_db)
):
    return await get_all_families(db)

# =========================
# Get By ID
# =========================
@router.get("/{family_id}", response_model=FamilyResponseSchema)
async def get_family_by_id_api(
    family_id: int,
    db: AsyncSession = Depends(get_db)
):
    family = await get_family_by_id(db, family_id)
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    return family

# =========================
# Update
# =========================
@router.put("/{family_id}", response_model=FamilyResponseSchema)
async def update_family_api(
    family_id: int,
    data: FamilyCreateSchema,
    db: AsyncSession = Depends(get_db)
):
    family = await update_family(db, family_id, data)
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    return family

# =========================
# Delete
# =========================
@router.delete("/{family_id}")
async def delete_family_api(
    family_id: int,
    db: AsyncSession = Depends(get_db)
):
    success = await delete_family(db, family_id)
    if not success:
        raise HTTPException(status_code=404, detail="Family not found")
    return {"message": "Family deleted successfully"}
