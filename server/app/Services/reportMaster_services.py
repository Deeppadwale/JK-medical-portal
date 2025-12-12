from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import date

from app.Models.reposrMaster_model import ReportMaster
from app.Schemas.reportMaster_schemas import ReportCreate, ReportUpdate


# Get max doc_No
async def get_max_doc_no(db: AsyncSession) -> int:
    result = await db.execute(select(func.max(ReportMaster.doc_No)))
    max_doc = result.scalar()
    return max_doc or 0


# Create new report (auto doc_No, auto Created_at)
async def create_report(db: AsyncSession, report_data: ReportCreate):
    next_doc_no = (await get_max_doc_no(db)) + 1

    new_report = ReportMaster(
        doc_No=next_doc_no,
        Created_at=date.today(),
        **report_data.dict()
    )

    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)

    return new_report


# Get all reports
async def get_all_reports(db: AsyncSession):
    result = await db.execute(
        select(ReportMaster).order_by(ReportMaster.Report_id.desc())
    )
    return result.scalars().all()



# Get report by ID
async def get_report_by_id(db: AsyncSession, report_id: int):
    result = await db.execute(
        select(ReportMaster).filter(ReportMaster.Report_id == report_id)
    )
    return result.scalar_one_or_none()


# Update report
async def update_report(db: AsyncSession, report_id: int, update_data: ReportUpdate):
    report = await get_report_by_id(db, report_id)
    if not report:
        return None

    for key, value in update_data.dict(exclude_unset=True).items():
        setattr(report, key, value)

    await db.commit()
    await db.refresh(report)
    return report


# Delete report
async def delete_report(db: AsyncSession, report_id: int):
    report = await get_report_by_id(db, report_id)
    if not report:
        return False

    await db.delete(report)
    await db.commit()
    return True
