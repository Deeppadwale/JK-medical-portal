from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.Models.familyMaster_model import FamilyMaster
from app.Schemas.familyMaster_schemas import FamilyCreateSchema

# =========================
# Create
# =========================
async def create_family(db: AsyncSession, data: FamilyCreateSchema):
    family = FamilyMaster(**data.dict())
    db.add(family)
    await db.commit()
    await db.refresh(family)
    return family


# =========================
# Get All
# =========================
async def get_all_families(db: AsyncSession):
    result = await db.execute(select(FamilyMaster))
    return result.scalars().all()


# =========================
# Get By ID
# =========================
async def get_family_by_id(db: AsyncSession, family_id: int):
    result = await db.execute(
        select(FamilyMaster).where(FamilyMaster.Family_id == family_id)
    )
    return result.scalars().first()


# =========================
# Update
# =========================
async def update_family(db: AsyncSession, family_id: int, data: FamilyCreateSchema):
    family = await get_family_by_id(db, family_id)
    if not family:
        return None

    for key, value in data.dict().items():
        setattr(family, key, value)

    await db.commit()
    await db.refresh(family)
    return family


# =========================
# Delete
# =========================
async def delete_family(db: AsyncSession, family_id: int):
    family = await get_family_by_id(db, family_id)
    if not family:
        return False

    await db.delete(family)
    await db.commit()
    return True
