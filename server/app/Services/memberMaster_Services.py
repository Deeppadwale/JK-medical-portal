from http.client import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.Models.memberMaster_model import MemberMaster
from sqlalchemy import func
from datetime import date
from sqlalchemy import func
from sqlalchemy.future import select





async def get_all_members(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(MemberMaster)
        .order_by(MemberMaster.Member_id.desc())
        .offset(skip)
        .limit(limit)
    )
    members = result.scalars().all()
    return members or []


async def get_max_doc_no(db: AsyncSession) -> int:
    result = await db.execute(
        select(func.max(MemberMaster.doc_No))
    )
    max_doc_no = result.scalar()
    return max_doc_no or 0 

async def get_member_by_id(db: AsyncSession, member_id: int) -> MemberMaster:
    result = await db.execute(
        select(MemberMaster).filter(MemberMaster.Member_id == member_id)
    )
    member = result.scalars().first()
    return member


async def get_member_by_mobile(db: AsyncSession, mobile_no: str) -> MemberMaster:
    result = await db.execute(
        select(MemberMaster).filter(MemberMaster.Mobile_no == mobile_no)
    )
    return result.scalars().first()




async def create_member(db: AsyncSession, member_data):

    result = await db.execute(select(func.max(MemberMaster.doc_No)))
    max_doc_no = result.scalar()
    next_doc_no = (max_doc_no or 0) + 1

    data = member_data.dict()
    data["doc_No"] = next_doc_no
    data["Created_at"] = date.today()

    new_member = MemberMaster(**data)

    db.add(new_member)
    await db.commit()
    await db.refresh(new_member)

    return new_member


async def update_member(db: AsyncSession, db_member: MemberMaster, update_data):
    update_dict = update_data.dict(exclude_unset=True)

    for key, value in update_dict.items():
        setattr(db_member, key, value)

    db.add(db_member)
    await db.commit()
    await db.refresh(db_member)
    return db_member


async def delete_member(db: AsyncSession, member_id: int):
    result = await db.execute(
        select(MemberMaster).filter(MemberMaster.Member_id == member_id)
    )
    member = result.scalars().first()

    if member:
        await db.delete(member)
        await db.commit()

    return member
