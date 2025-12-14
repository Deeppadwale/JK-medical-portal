# from aiohttp_retry import Any, List
# from pyparsing import Dict
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import select, func
# import urllib
# from app.Models.memberReport_model import MemberReport
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import select
# from typing import List, Dict, Any, Optional
# from app.Models.memberMaster_model import MemberMaster
# from app.Models.reposrMaster_model import ReportMaster
# import os


# async def get_max_doc_no(db: AsyncSession) -> int:
#     result = await db.execute(select(func.max(MemberReport.doc_No)))
#     max_doc = result.scalar()
#     return max_doc or 0


# async def create_member_report(db: AsyncSession, data: dict):
#     next_doc_no = await get_max_doc_no(db) + 1
#     new_report = MemberReport(doc_No=next_doc_no, **data)
#     db.add(new_report)
#     await db.commit()
#     await db.refresh(new_report)
#     return new_report


# async def get_member_report_by_id(db: AsyncSession, report_id: int):
#     result = await db.execute(
#         select(MemberReport).filter(MemberReport.MemberReport_id == report_id)
#     )
#     return result.scalar_one_or_none()


# async def get_all_member_reports(
#     db: AsyncSession, 
#     skip: int = 0, 
#     limit: int = 100
# ) -> List[Dict[str, Any]]:
#     """
#     Get all member reports with pagination and joins
#     """
#     try:
#         query = (
#             select(
#                 MemberReport.MemberReport_id,
#                 MemberReport.doc_No,
#                 MemberReport.Member_id,
#                 MemberReport.Report_id,
#                 MemberReport.purpose,
#                 MemberReport.remarks,
#                 MemberReport.uploaded_file_report_first,
#                 MemberReport.uploaded_file_report_second,
#                 MemberReport.uploaded_file_report_third,
#                 MemberReport.Created_by,
#                 MemberReport.Modified_by,
#                 MemberReport.Created_at,
#                 MemberMaster.Member_name,
#                 ReportMaster.report_name
#             )
#             .select_from(
#                 MemberReport.__table__
#                 .join(MemberMaster, MemberReport.Member_id == MemberMaster.Member_id)
#                 .join(ReportMaster, MemberReport.Report_id == ReportMaster.Report_id)
#             )
#             .offset(skip)
#             .limit(limit)
#             .order_by(MemberReport.MemberReport_id.desc())
#         )
        
#         result = await db.execute(query)
#         rows = result.fetchall()

#         reports_list = []
#         for row in rows:
#             report_dict = {
#                 "MemberReport_id": row.MemberReport_id,
#                 "doc_No": row.doc_No,
#                 "Member_id": row.Member_id,
#                 "Report_id": row.Report_id,
#                 "purpose": row.purpose,
#                 "remarks": row.remarks,
#                 "uploaded_file_report_first": row.uploaded_file_report_first,
#                 "uploaded_file_report_second": row.uploaded_file_report_second,
#                 "uploaded_file_report_third": row.uploaded_file_report_third,
#                 "Created_by": row.Created_by,
#                 "Modified_by": row.Modified_by,
#                 "Created_at": row.Created_at,
#                 "member_name": row.Member_name,  
#                 "report_name": row.report_name   
#             }
#             reports_list.append(report_dict)
        
#         return reports_list
        
#     except Exception as e:
#         raise e


# # async def update_member_report(db: AsyncSession, report_id: int, update_data: dict):
# #     report = await get_member_report_by_id(db, report_id)
# #     if not report:
# #         return None
# #     for key, value in update_data.items():
# #         if value is not None:
# #             setattr(report, key, value)
# #     await db.commit()
# #     await db.refresh(report)
# #     return report


# async def update_member_report(db: AsyncSession, report_id: int, update_data: dict):
#     """
#     Update member report and handle file field updates.
#     When file fields are updated, old files should be deleted from filesystem.
#     """
#     report = await get_member_report_by_id(db, report_id)
#     if not report:
#         return None

#     old_filenames = {
#         'uploaded_file_report_first': getattr(report, 'uploaded_file_report_first', None),
#         'uploaded_file_report_second': getattr(report, 'uploaded_file_report_second', None),
#         'uploaded_file_report_third': getattr(report, 'uploaded_file_report_third', None)
#     }

#     for key, value in update_data.items():
#         if value is not None:
#             setattr(report, key, value)
    
#     await db.commit()
#     await db.refresh(report)
    

#     file_fields = ['uploaded_file_report_first', 'uploaded_file_report_second', 'uploaded_file_report_third']
#     for field in file_fields:
#         old_filename = old_filenames.get(field)
#         new_filename = getattr(report, field, None)
        
#         if old_filename and old_filename != new_filename:
#             try:
#                 file_path = os.path.join("upload/medical_report", old_filename)
#                 if os.path.exists(file_path):
#                     os.remove(file_path)
#                     print(f"Deleted old file: {old_filename}")
#             except Exception as e:
#                 print(f"Error deleting old file {old_filename}: {str(e)}")
    
#     return report

# async def delete_member_report(db: AsyncSession, report_id: int):

#     report = await get_member_report_by_id(db, report_id)
#     if not report:
#         return False
    
#     file_fields = ['uploaded_file_report_first', 'uploaded_file_report_second', 'uploaded_file_report_third']
    
#     for field in file_fields:
#         filename = getattr(report, field, None)
#         if filename:
#             try:
#                 file_path = os.path.join("upload/medical_report", filename)
#                 if os.path.exists(file_path):
#                     os.remove(file_path)
#                     print(f"Deleted file: {filename}")
#             except Exception as e:
#                 print(f"Error deleting file {filename}: {str(e)}")

#     await db.delete(report)
#     await db.commit()
#     return True


from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from app.Models.memberReport_model import MemberReport, MemberReportDetail
from app.Models.memberMaster_model import MemberMaster
from app.Models.reposrMaster_model import ReportMaster
import os
from typing import List, Dict, Any
from datetime import date


async def get_max_doc_no(db: AsyncSession) -> int:
    result = await db.execute(select(func.max(MemberReport.doc_No)))
    max_doc = result.scalar()
    return max_doc or 0


async def create_member_report_with_details(db: AsyncSession, report_data: dict, details_data: List[dict]):
    """Create header with multiple details"""
    try:
        # Create header
        next_doc_no = await get_max_doc_no(db) + 1
        report_data["doc_No"] = next_doc_no
        
        new_report = MemberReport(**report_data)
        db.add(new_report)
        await db.flush()  # Get the ID
        
        # Create details
        for detail_data in details_data:
            detail_data["MemberReport_id"] = new_report.MemberReport_id
            new_detail = MemberReportDetail(**detail_data)
            db.add(new_detail)
        
        await db.commit()
        await db.refresh(new_report)
        
        # Get all details for response
        await db.refresh(new_report, attribute_names=['details'])
        
        return new_report
    except Exception as e:
        await db.rollback()
        raise e


async def get_member_report_by_id(db: AsyncSession, report_id: int):
    """Get report with all details"""
    result = await db.execute(
        select(MemberReport)
        .filter(MemberReport.MemberReport_id == report_id)
    )
    report = result.scalar_one_or_none()
    
    if report:
        # Get details
        details_result = await db.execute(
            select(MemberReportDetail)
            .filter(MemberReportDetail.MemberReport_id == report_id)
            .order_by(MemberReportDetail.report_date)
        )
        report.details = details_result.scalars().all()
    
    return report


async def get_all_member_reports(
    db: AsyncSession, 
    skip: int = 0, 
    limit: int = 100
) -> List[Dict[str, Any]]:
    """Get all reports with details and member/report names"""
    try:
        # First get all reports
        reports_query = (
            select(MemberReport)
            .offset(skip)
            .limit(limit)
            .order_by(MemberReport.MemberReport_id.desc())
        )
        reports_result = await db.execute(reports_query)
        reports = reports_result.scalars().all()
        
        reports_list = []
        
        # For each report, get details and related data
        for report in reports:
            # Get member name
            member_result = await db.execute(
                select(MemberMaster.Member_name)
                .filter(MemberMaster.Member_id == report.Member_id)
            )
            member_name = member_result.scalar_one_or_none()
            
            # Get details with report names
            details_result = await db.execute(
                select(
                    MemberReportDetail,
                    ReportMaster.report_name
                )
                .join(ReportMaster, MemberReportDetail.Report_id == ReportMaster.Report_id)
                .filter(MemberReportDetail.MemberReport_id == report.MemberReport_id)
                .order_by(MemberReportDetail.report_date)
            )
            
            details_with_names = details_result.all()
            
            # Format report details
            formatted_details = []
            for detail, report_name in details_with_names:
                detail_dict = {
                    "detail_id": detail.detail_id,
                    "report_date": detail.report_date,
                    "uploaded_file_report": detail.uploaded_file_report,
                    "Report_id": detail.Report_id,
                    "report_name": report_name,
                    "Doctor_and_Hospital_name": detail.Doctor_and_Hospital_name
                }
                formatted_details.append(detail_dict)
            
            # Format report
            report_dict = {
                "MemberReport_id": report.MemberReport_id,
                "doc_No": report.doc_No,
                "Member_id": report.Member_id,
                "purpose": report.purpose,
                "remarks": report.remarks,
                "Created_by": report.Created_by,
                "Modified_by": report.Modified_by,
                "Created_at": report.Created_at,
                "member_name": member_name,
                "details": formatted_details,
                "details_count": len(formatted_details)
            }
            reports_list.append(report_dict)
        
        return reports_list
        
    except Exception as e:
        raise e


async def update_member_report(
    db: AsyncSession, 
    report_id: int, 
    update_data: dict,
    details_update: List[dict] = None
):
    """
    Update member report header and optionally update details
    """
    try:
        # Get existing report
        report = await get_member_report_by_id(db, report_id)
        if not report:
            return None
        
        # Update header fields
        for key, value in update_data.items():
            if value is not None:
                setattr(report, key, value)
        
        # Handle details update if provided
        if details_update is not None:
            # Get existing details
            existing_details_result = await db.execute(
                select(MemberReportDetail)
                .filter(MemberReportDetail.MemberReport_id == report_id)
            )
            existing_details = {d.detail_id: d for d in existing_details_result.scalars().all()}
            
            # Process detail updates
            for detail_data in details_update:
                if 'detail_id' in detail_data and detail_data['detail_id'] in existing_details:
                    # Update existing detail
                    detail = existing_details[detail_data['detail_id']]
                    for key, value in detail_data.items():
                        if key != 'detail_id' and value is not None:
                            setattr(detail, key, value)
                else:
                    # Add new detail
                    detail_data['MemberReport_id'] = report_id
                    new_detail = MemberReportDetail(**detail_data)
                    db.add(new_detail)
            
            # Commit changes
            await db.commit()
            await db.refresh(report)
            
            # Get updated details
            await db.refresh(report, attribute_names=['details'])
        
        return report
        
    except Exception as e:
        await db.rollback()
        raise e


async def delete_detail_file(db: AsyncSession, detail_id: int):
    """Delete file associated with a detail"""
    try:
        result = await db.execute(
            select(MemberReportDetail.uploaded_file_report)
            .filter(MemberReportDetail.detail_id == detail_id)
        )
        filename = result.scalar_one_or_none()
        
        if filename:
            file_path = os.path.join("upload/medical_report", filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
        return False
    except Exception as e:
        print(f"Error deleting file: {str(e)}")
        return False


async def delete_member_report_detail(db: AsyncSession, detail_id: int):
    """Delete a single detail record"""
    try:
        # First delete associated file
        await delete_detail_file(db, detail_id)
        
        # Then delete the detail record
        await db.execute(
            delete(MemberReportDetail)
            .where(MemberReportDetail.detail_id == detail_id)
        )
        await db.commit()
        return True
    except Exception as e:
        await db.rollback()
        print(f"Error deleting detail: {str(e)}")
        return False


async def delete_member_report(db: AsyncSession, report_id: int):
    """
    Delete member report and all its details with file cleanup
    """
    try:
        # Get all details first
        details_result = await db.execute(
            select(MemberReportDetail)
            .filter(MemberReportDetail.MemberReport_id == report_id)
        )
        details = details_result.scalars().all()
        
        # Delete all files associated with details
        for detail in details:
            if detail.uploaded_file_report:
                try:
                    file_path = os.path.join("upload/medical_report", detail.uploaded_file_report)
                    if os.path.exists(file_path):
                        os.remove(file_path)
                except Exception as e:
                    print(f"Error deleting file {detail.uploaded_file_report}: {str(e)}")
        
        # Delete all detail records
        await db.execute(
            delete(MemberReportDetail)
            .where(MemberReportDetail.MemberReport_id == report_id)
        )
        
        # Delete the header record
        report = await get_member_report_by_id(db, report_id)
        if report:
            await db.delete(report)
        
        await db.commit()
        return True
        
    except Exception as e:
        await db.rollback()
        print(f"Error deleting report: {str(e)}")
        return False
