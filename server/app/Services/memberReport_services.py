import os, shutil
from datetime import date
from typing import Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.Models.memberReport_model import Med_MemberReport, Med_MemberReportDetail
from app.Schemas.memberReport_schemas import MemberReportDetailResponse, MemberReportResponse
from sqlalchemy import text 
from sqlalchemy import text

from sqlalchemy.ext.asyncio import AsyncSession
UPLOAD_DIR = "upload/medical_report"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_file(file):
    if not file:
        return None
    filename = file.filename
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return filename

def delete_file(filename: str):
    if not filename:
        return 
    path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(path):
        os.remove(path)

async def create_report(
    db: AsyncSession,
    payload: dict,
    files: Dict[str, object]
):
    result = await db.execute(
        select(func.coalesce(func.max(Med_MemberReport.doc_No), 0))
    )
    doc_no = result.scalar() + 1

    report = Med_MemberReport(
        doc_No=doc_no,
        Member_id=payload["Member_id"],
        Family_id=payload["Family_id"],
        purpose=payload["purpose"],
        remarks=payload.get("remarks"),
        Created_by=payload["Created_by"],
        Created_at=date.today()
    )

    for d in payload.get("details", []):
        if d["row_action"] == "add":
            filename = save_file(files.get(d.get("file_key")))
            report.details.append(
                Med_MemberReportDetail(
                    report_date=d["report_date"],
                    Report_id=d["Report_id"],
                    Doctor_and_Hospital_name=d.get("Doctor_and_Hospital_name"),
                    uploaded_file_report=filename
                )
            )

    db.add(report)
    await db.commit()


    result = await db.execute(
        select(Med_MemberReport)
        .options(selectinload(Med_MemberReport.details))
        .where(Med_MemberReport.MemberReport_id == report.MemberReport_id)
    )
    return result.scalars().first()


# async def create_report(db: AsyncSession, payload: dict, files: dict):
#     result = await db.execute(
#         select(func.coalesce(func.max(Med_MemberReport.doc_No), 0))
#     )
#     doc_no = result.scalar() + 1

#     report = Med_MemberReport(
#         doc_No=doc_no,
#         Member_id=payload["Member_id"],
#         Family_id=payload["Family_id"],
#         purpose=payload["purpose"],
#         remarks=payload.get("remarks"),
#         Created_by=payload["Created_by"],
#         Created_at=date.today()
#     )

#     for d in payload.get("details", []):
#         if d.get("row_action") == "add":
#             filename = save_file(files.get(d.get("file_key")))
#             report.details.append(
#                 Med_MemberReportDetail(
#                     report_date=d["report_date"],
#                     Report_id=d["Report_id"],
#                     Doctor_and_Hospital_name=d.get("Doctor_and_Hospital_name"),
#                     uploaded_file_report=filename
#                 )
#             )

#     db.add(report)
#     await db.commit()
#     await db.refresh(report)

#     return report




async def update_report(db: AsyncSession, report_id: int, payload: dict, files: dict):
    result = await db.execute(
        select(Med_MemberReport)
        .options(selectinload(Med_MemberReport.details))
        .where(Med_MemberReport.MemberReport_id == report_id)
    )
    report = result.scalars().first()
    if not report:
        return None

    for field in ["purpose", "remarks", "Modified_by"]:
        if field in payload:
            setattr(report, field, payload[field])

    for d in payload.get("details", []):
        action = d.get("row_action")

        if action == "add":
            filename = save_file(files.get(d.get("file_key")))
            report.details.append(
                Med_MemberReportDetail(
                    report_date=d["report_date"],
                    Report_id=d["Report_id"],
                    Doctor_and_Hospital_name=d.get("Doctor_and_Hospital_name"),
                    uploaded_file_report=filename
                )
            )

        elif action == "update":
            detail = next(
                (x for x in report.details if x.detail_id == d["detail_id"]),
                None
            )
            if not detail:
                continue

            detail.report_date = d.get("report_date", detail.report_date)
            detail.Report_id = d.get("Report_id", detail.Report_id)
            detail.Doctor_and_Hospital_name = d.get(
                "Doctor_and_Hospital_name",
                detail.Doctor_and_Hospital_name
            )

            if d.get("file_key"):
                new_file = save_file(files.get(d["file_key"]))
                if new_file:
                    delete_file(detail.uploaded_file_report)
                    detail.uploaded_file_report = new_file

        elif action == "delete":
            detail = next(
                (x for x in report.details if x.detail_id == d["detail_id"]),
                None
            )
            if detail:
                delete_file(detail.uploaded_file_report)
                await db.delete(detail)

    await db.commit()
    await db.refresh(report)
    return report



async def delete_report(db: AsyncSession, report_id: int):
    result = await db.execute(
        select(Med_MemberReport)
        .options(selectinload(Med_MemberReport.details))
        .where(Med_MemberReport.MemberReport_id == report_id)
    )
    report = result.scalars().first()
    if not report:
        return False


    for detail in report.details:
        delete_file(detail.uploaded_file_report)


    await db.delete(report)
    await db.commit()

    return True



# async def get_all_reports(db: AsyncSession):
#     result = await db.execute(
#         select(MemberReport).options(selectinload(MemberReport.details))
#     )
#     return result.scalars().all()


async def get_all_reports(db: AsyncSession):
    result = await db.execute(
        select(Med_MemberReport)
        .options(selectinload(Med_MemberReport.details))
        .order_by(Med_MemberReport.MemberReport_id.desc())
    )
    
    reports = result.scalars().all()
    
    for report in reports:
        report.details.sort(key=lambda d: d.detail_id, reverse=True)
    
    return reports


async def get_report_by_id(db: AsyncSession, report_id: int):
    
    result = await db.execute(
        select(Med_MemberReport)
        .options(selectinload(Med_MemberReport.details))
        .where(Med_MemberReport.MemberReport_id == report_id)
    )
    return result.scalars().first()



async def get_reports_by_family(db: AsyncSession, family_id: int):
    query = text("""
        SELECT
            mm.Member_name,
            rm.report_name,
            mr.MemberReport_id,
            mr.doc_No,
            mr.Member_id,
            mr.Family_id,
            mr.purpose,
            mr.remarks,
            mr.Created_by,
            mr.Modified_by,
            mr.Created_at,

            mrd.detail_id,
            mrd.Report_id,
            mrd.report_date,
            mrd.Doctor_and_Hospital_name,
            mrd.uploaded_file_report,

            fm.Family_Name
        FROM Med_MemberReport mr
        INNER JOIN Med_FamilyMaster fm
            ON mr.Family_id = fm.Family_id
        LEFT JOIN Med_MemberMaster mm
            ON mr.Member_id = mm.Member_id
        LEFT JOIN Med_MemberReportdetail mrd
            ON mr.MemberReport_id = mrd.MemberReport_id
        LEFT JOIN Med_ReportMaster rm
            ON mrd.Report_id = rm.Report_id
        WHERE mr.Family_id = :family_id
        ORDER BY mr.MemberReport_id DESC, mrd.detail_id DESC
    """)

    result = await db.execute(query, {"family_id": family_id})
    rows = result.mappings().all()

    reports: dict[int, MemberReportResponse] = {}

    for row in rows:
        mr_id = row["MemberReport_id"]

        if mr_id not in reports:
            reports[mr_id] = MemberReportResponse(
                MemberReport_id=row["MemberReport_id"],
                doc_No=row["doc_No"],
                Member_id=row["Member_id"],
                Family_id=row["Family_id"],
                purpose=row["purpose"],
                remarks=row["remarks"],
                Created_by=row["Created_by"],
                Modified_by=row["Modified_by"],
                Created_at=row["Created_at"],
                Family_Name=row["Family_Name"],
                Member_name=row["Member_name"],
                report_name=row["report_name"],
                details=[]
            )

        # ✅ Add details only if they exist (LEFT JOIN safe)
        if row["detail_id"] is not None:
            reports[mr_id].details.append(
                MemberReportDetailResponse(
                    detail_id=row["detail_id"],
                    MemberReport_id=row["MemberReport_id"],
                    report_date=row["report_date"],
                    Report_id=row["Report_id"],
                    Doctor_and_Hospital_name=row["Doctor_and_Hospital_name"],
                    uploaded_file_report=row["uploaded_file_report"],
                )
            )

    return list(reports.values())

