import json
import mimetypes
import os
from typing import List
from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.Models.database import get_db
from app.Services.memberReport_services import (
    create_report,
    update_report,
    delete_report,
    get_all_reports,
    get_report_by_id,
    get_reports_by_family
)
from app.Schemas.memberReport_schemas import MemberReportResponse,CreateMemberResponse
from app.utility.file_handler_preview import get_file_path
from app.Services import memberReport_services

router = APIRouter(prefix="/member-report", tags=["Member Report"])


# ================= CREATE =================
@router.post("/", response_model=CreateMemberResponse)
async def create(
    payload: str = Form(...),
    file_0: UploadFile = File(None),
    file_1: UploadFile = File(None),
    file_2: UploadFile = File(None),
    file_3: UploadFile = File(None),
    file_4: UploadFile = File(None),
    db: AsyncSession = Depends(get_db)
):
    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    files = {
        "file_0": file_0,
        "file_1": file_1,
        "file_2": file_2,
        "file_3": file_3,
        "file_4": file_4,
    }

    return await create_report(db, data, files)


# ================= UPDATE =================
@router.put("/{report_id}", response_model=CreateMemberResponse)
async def update(
    report_id: int,
    payload: str = Form(...),
    file_0: UploadFile = File(None),
    file_1: UploadFile = File(None),
    file_2: UploadFile = File(None),
    file_3: UploadFile = File(None),
    file_4: UploadFile = File(None),
    db: AsyncSession = Depends(get_db)
):
    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    files = {
        "file_0": file_0,
        "file_1": file_1,
        "file_2": file_2,
        "file_3": file_3,
        "file_4": file_4,
    }

    report = await update_report(db, report_id, data, files)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


# ================= DELETE =================
@router.delete("/{report_id}")
async def delete(report_id: int, db: AsyncSession = Depends(get_db)):
    await delete_report(db, report_id)
    return {"success": True}


# ================= READ =================
@router.get("/", response_model=List[MemberReportResponse])
async def get_all(db: AsyncSession = Depends(get_db)):
    return await get_all_reports(db)


@router.get("/{report_id}", response_model=MemberReportResponse)
async def get_by_id(report_id: int, db: AsyncSession = Depends(get_db)):
    return await get_report_by_id(db, report_id)


@router.get("/family/{family_id}", response_model=List[MemberReportResponse])
async def get_by_family(family_id: int, db: AsyncSession = Depends(get_db)):
    reports = await memberReport_services.get_reports_by_family(db, family_id)
    return reports

@router.get("/preview/{filename}")
async def preview_file(filename: str):
    try:
        # prevent path traversal
        filename = os.path.basename(filename)
        file_path = get_file_path(filename)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")

    mime_type, _ = mimetypes.guess_type(file_path)
    mime_type = mime_type or "application/octet-stream"

    return FileResponse(
        path=file_path,
        media_type=mime_type,
        headers={
            "Content-Disposition": f'inline; filename="{filename}"'
        }
    )

@router.get("/download/{filename}")
async def download_file(filename: str):
    try:
        filename = os.path.basename(filename)
        file_path = get_file_path(filename)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path,
        media_type="application/octet-stream",
        filename=filename,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
