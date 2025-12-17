import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import date
from typing import Optional
from app.Models.memberMaster_model import MemberMaster


async def get_all_members(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    family_id: Optional[int] = None
):
    query = (
        select(MemberMaster)
        .order_by(MemberMaster.Member_id.desc())
        .offset(skip)
        .limit(limit)
    )

    if family_id is not None:
        query = query.where(MemberMaster.Family_id == family_id)

    result = await db.execute(query)
    return result.scalars().all()

async def get_max_doc_no(db: AsyncSession) -> int:
    result = await db.execute(select(func.max(MemberMaster.doc_No)))
    max_doc_no = result.scalar()
    return max_doc_no or 0


async def get_member_by_id(db: AsyncSession, member_id: int) -> Optional[MemberMaster]:
    result = await db.execute(select(MemberMaster).filter(MemberMaster.Member_id == member_id))
    return result.scalars().first()


async def get_member_by_mobile(db: AsyncSession, mobile_no: str) -> Optional[MemberMaster]:
    result = await db.execute(select(MemberMaster).filter(MemberMaster.Mobile_no == mobile_no))
    return result.scalars().first()


async def create_member(db: AsyncSession, member_data):
    max_doc_no = await get_max_doc_no(db)
    next_doc_no = max_doc_no + 1

    data = member_data.dict()
    data["doc_No"] = next_doc_no
    data["Created_at"] = date.today()

    new_member = MemberMaster(**data)
    db.add(new_member)
    await db.commit()
    await db.refresh(new_member)
    return new_member


async def update_member(db: AsyncSession, db_member: MemberMaster, update_data, pan_file_path=None, adhar_file_path=None, insurance_file_path=None):
    update_dict = update_data.dict(exclude_unset=True)


    def replace_file(old_path, new_path):
        if new_path:
            if old_path and os.path.exists(old_path):
                os.remove(old_path)
            return new_path
        return old_path

    db_member.pan_no = replace_file(db_member.pan_no, pan_file_path)
    db_member.adhar_card = replace_file(db_member.adhar_card, adhar_file_path)
    db_member.insurance = replace_file(db_member.insurance, insurance_file_path)

    for key, value in update_dict.items():
        setattr(db_member, key, value)

    db.add(db_member)
    await db.commit()
    await db.refresh(db_member)
    return db_member


async def delete_member(db: AsyncSession, member_id: int):
    db_member = await get_member_by_id(db, member_id)
    if db_member:
   
        for file_path in [db_member.pan_no, db_member.adhar_card, db_member.insurance]:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
        await db.delete(db_member)
        await db.commit()
    return db_member
