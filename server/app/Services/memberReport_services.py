from aiohttp_retry import Any, List
from pyparsing import Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import urllib
from app.Models.memberReport_model import MemberReport
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any, Optional
from app.Models.memberMaster_model import MemberMaster
from app.Models.reposrMaster_model import ReportMaster
import os


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
                "member_name": row.Member_name,  
                "report_name": row.report_name   
            }
            reports_list.append(report_dict)
        
        return reports_list
        
    except Exception as e:
        raise e


# async def update_member_report(db: AsyncSession, report_id: int, update_data: dict):
#     report = await get_member_report_by_id(db, report_id)
#     if not report:
#         return None
#     for key, value in update_data.items():
#         if value is not None:
#             setattr(report, key, value)
#     await db.commit()
#     await db.refresh(report)
#     return report


async def update_member_report(db: AsyncSession, report_id: int, update_data: dict):
    """
    Update member report and handle file field updates.
    When file fields are updated, old files should be deleted from filesystem.
    """
    report = await get_member_report_by_id(db, report_id)
    if not report:
        return None

    old_filenames = {
        'uploaded_file_report_first': getattr(report, 'uploaded_file_report_first', None),
        'uploaded_file_report_second': getattr(report, 'uploaded_file_report_second', None),
        'uploaded_file_report_third': getattr(report, 'uploaded_file_report_third', None)
    }

    for key, value in update_data.items():
        if value is not None:
            setattr(report, key, value)
    
    await db.commit()
    await db.refresh(report)
    

    file_fields = ['uploaded_file_report_first', 'uploaded_file_report_second', 'uploaded_file_report_third']
    for field in file_fields:
        old_filename = old_filenames.get(field)
        new_filename = getattr(report, field, None)
        
        if old_filename and old_filename != new_filename:
            try:
                file_path = os.path.join("upload/medical_report", old_filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
                    print(f"Deleted old file: {old_filename}")
            except Exception as e:
                print(f"Error deleting old file {old_filename}: {str(e)}")
    
    return report

async def delete_member_report(db: AsyncSession, report_id: int):

    report = await get_member_report_by_id(db, report_id)
    if not report:
        return False
    
    file_fields = ['uploaded_file_report_first', 'uploaded_file_report_second', 'uploaded_file_report_third']
    
    for field in file_fields:
        filename = getattr(report, field, None)
        if filename:
            try:
                file_path = os.path.join("upload/medical_report", filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
                    print(f"Deleted file: {filename}")
            except Exception as e:
                print(f"Error deleting file {filename}: {str(e)}")

    await db.delete(report)
    await db.commit()
    return True

