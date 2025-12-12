from aiohttp_retry import Any, List
from pyparsing import Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.Models.memberReport_model import MemberReport
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from typing import List, Dict, Any, Optional

from app.Models.memberMaster_model import MemberMaster
from app.Models.reposrMaster_model import ReportMaster

async def get_max_doc_no(db: AsyncSession) -> int:
    result = await db.execute(select(func.max(MemberReport.doc_No)))
    max_doc = result.scalar()
    return max_doc or 0


async def create_member_report(db: AsyncSession, data: dict):
    next_doc_no = await get_max_doc_no(db) + 1
    new_report = MemberReport(doc_No=next_doc_no, **data)
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    return new_report


async def get_member_report_by_id(db: AsyncSession, report_id: int):
    result = await db.execute(
        select(MemberReport).filter(MemberReport.MemberReport_id == report_id)
    )
    return result.scalar_one_or_none()


async def get_all_member_reports(
    db: AsyncSession, 
    skip: int = 0, 
    limit: int = 100
) -> List[Dict[str, Any]]:
    """
    Get all member reports with pagination and joins
    """
    try:
        # Query with joins to MemberMaster and ReportMaster
        query = (
            select(
                MemberReport.MemberReport_id,
                MemberReport.doc_No,
                MemberReport.Member_id,
                MemberReport.Report_id,
                MemberReport.purpose,
                MemberReport.remarks,
                MemberReport.uploaded_file_report_first,
                MemberReport.uploaded_file_report_second,
                MemberReport.uploaded_file_report_third,
                MemberReport.Created_by,
                MemberReport.Modified_by,
                MemberReport.Created_at,
                MemberMaster.Member_name,
                ReportMaster.report_name
            )
            .select_from(
                MemberReport.__table__
                .join(MemberMaster, MemberReport.Member_id == MemberMaster.Member_id)
                .join(ReportMaster, MemberReport.Report_id == ReportMaster.Report_id)
            )
            .offset(skip)
            .limit(limit)
            .order_by(MemberReport.MemberReport_id.desc())
        )
        
        result = await db.execute(query)
        rows = result.fetchall()
        
        # Convert to list of dictionaries
        reports_list = []
        for row in rows:
            report_dict = {
                "MemberReport_id": row.MemberReport_id,
                "doc_No": row.doc_No,
                "Member_id": row.Member_id,
                "Report_id": row.Report_id,
                "purpose": row.purpose,
                "remarks": row.remarks,
                "uploaded_file_report_first": row.uploaded_file_report_first,
                "uploaded_file_report_second": row.uploaded_file_report_second,
                "uploaded_file_report_third": row.uploaded_file_report_third,
                "Created_by": row.Created_by,
                "Modified_by": row.Modified_by,
                "Created_at": row.Created_at,
                "member_name": row.Member_name,  # Added from join
                "report_name": row.report_name   # Added from join
            }
            reports_list.append(report_dict)
        
        return reports_list
        
    except Exception as e:
        raise e


async def update_member_report(db: AsyncSession, report_id: int, update_data: dict):
    report = await get_member_report_by_id(db, report_id)
    if not report:
        return None
    for key, value in update_data.items():
        if value is not None:
            setattr(report, key, value)
    await db.commit()
    await db.refresh(report)
    return report


async def delete_member_report(db: AsyncSession, report_id: int):
    report = await get_member_report_by_id(db, report_id)
    if not report:
        return False
    await db.delete(report)
    await db.commit()
    return True
