# # import os
# # from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
# # from sqlalchemy.ext.asyncio import AsyncSession
# # from fastapi.responses import FileResponse
# # from app.Models.database import get_db
# # from app.Services.memberReport_services import (
# #     create_member_report,
# #     get_all_member_reports,
# #     get_member_report_by_id,
# #     update_member_report,
# #     delete_member_report,
# #     get_max_doc_no
# # )

# # router = APIRouter(prefix="/memberreport", tags=["MemberReport"])

# # UPLOAD_FOLDER = "upload/medical_report"
# # os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# # # Save uploaded file
# # async def save_file(upload: UploadFile, prefix: str):
# #     if upload:
# #         filename = f"{prefix}_{os.path.basename(upload.filename)}"
# #         save_path = os.path.join(UPLOAD_FOLDER, filename)
# #         with open(save_path, "wb") as buffer:
# #             buffer.write(await upload.read())
# #         return save_path
# #     return None


# # # Delete old file
# # def delete_old_file(file_path: str):
# #     if file_path and os.path.exists(file_path):
# #         os.remove(file_path)


# # # ---------------- POST CREATE ----------------
# # @router.post("/upload")
# # async def upload_member_report(
# #     Member_id: int = Form(...),
# #     Report_id: int = Form(...),
# #     purpose: str = Form(...),
# #     remarks: str = Form(None),
# #     Created_by: str = Form(...),
# #     uploaded_file_report_first: UploadFile = File(None),
# #     uploaded_file_report_second: UploadFile = File(None),
# #     uploaded_file_report_third: UploadFile = File(None),
# #     db: AsyncSession = Depends(get_db)
# # ):
# #     file1 = await save_file(uploaded_file_report_first, "rpt1")
# #     file2 = await save_file(uploaded_file_report_second, "rpt2")
# #     file3 = await save_file(uploaded_file_report_third, "rpt3")

# #     data = {
# #         "Member_id": Member_id,
# #         "Report_id": Report_id,
# #         "purpose": purpose,
# #         "remarks": remarks,
# #         "Created_by": Created_by,
# #         "uploaded_file_report_first": file1,
# #         "uploaded_file_report_second": file2,
# #         "uploaded_file_report_third": file3
# #     }

# #     report = await create_member_report(db, data)
# #     return {"status": True, "message": "Member report created successfully", "data": report}


# # # ---------------- GET MAX DOC ----------------
# # @router.get("/max-doc-no")
# # async def get_max_doc(db: AsyncSession = Depends(get_db)):
# #     max_doc = await get_max_doc_no(db)
# #     return {"max_doc_no": max_doc}


# # # ---------------- GET ALL ----------------
# # @router.get("/")
# # async def get_reports(db: AsyncSession = Depends(get_db)):
# #     return await get_all_member_reports(db)


# # # ---------------- GET BY ID ----------------
# # @router.get("/{report_id}")
# # async def get_report(report_id: int, db: AsyncSession = Depends(get_db)):
# #     report = await get_member_report_by_id(db, report_id)
# #     if not report:
# #         raise HTTPException(404, "Report not found")
# #     return report


# # # ---------------- PUT UPDATE ----------------
# # @router.put("/update/{report_id}")
# # async def update_member_report_api(
# #     report_id: int,
# #     purpose: str = Form(None),
# #     remarks: str = Form(None),
# #     Modified_by: str = Form(None),
# #     uploaded_file_report_first: UploadFile = File(None),
# #     uploaded_file_report_second: UploadFile = File(None),
# #     uploaded_file_report_third: UploadFile = File(None),
# #     db: AsyncSession = Depends(get_db)
# # ):
# #     old_report = await get_member_report_by_id(db, report_id)
# #     if not old_report:
# #         raise HTTPException(404, "Report not found")

# #     new_file1 = await save_file(uploaded_file_report_first, "rpt1") or old_report.uploaded_file_report_first
# #     if uploaded_file_report_first: delete_old_file(old_report.uploaded_file_report_first)

# #     new_file2 = await save_file(uploaded_file_report_second, "rpt2") or old_report.uploaded_file_report_second
# #     if uploaded_file_report_second: delete_old_file(old_report.uploaded_file_report_second)

# #     new_file3 = await save_file(uploaded_file_report_third, "rpt3") or old_report.uploaded_file_report_third
# #     if uploaded_file_report_third: delete_old_file(old_report.uploaded_file_report_third)

# #     update_data = {
# #         "purpose": purpose,
# #         "remarks": remarks,
# #         "Modified_by": Modified_by,
# #         "uploaded_file_report_first": new_file1,
# #         "uploaded_file_report_second": new_file2,
# #         "uploaded_file_report_third": new_file3
# #     }

# #     updated = await update_member_report(db, report_id, update_data)
# #     return {"status": True, "message": "Member report updated successfully", "data": updated}


# # # ---------------- DELETE ----------------
# # @router.delete("/{report_id}")
# # async def remove_report(report_id: int, db: AsyncSession = Depends(get_db)):
# #     deleted = await delete_member_report(db, report_id)
# #     if not deleted:
# #         raise HTTPException(404, "Report not found")
# #     return {"status": True, "message": "Deleted successfully"}


# # # ---------------- DOWNLOAD FILE ----------------
# # @router.get("/download/{filename}")
# # async def download_report_file(filename: str):
# #     file_path = os.path.join(UPLOAD_FOLDER, filename)
# #     if not os.path.exists(file_path):
# #         raise HTTPException(404, "File not found")
# #     return FileResponse(path=file_path, filename=filename)






# import os
# from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
# from sqlalchemy.ext.asyncio import AsyncSession
# from fastapi.responses import FileResponse, JSONResponse
# from typing import Optional, List
# from app.Models.database import get_db
# from app.Services.memberReport_services import (
#     create_member_report,
#     get_all_member_reports,
#     get_member_report_by_id,
#     update_member_report,
#     delete_member_report,
#     get_max_doc_no
# )

# router = APIRouter(prefix="/memberreport", tags=["MemberReport"])

# UPLOAD_FOLDER = "upload/medical_report"
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# def get_file_extension(filename: str) -> str:
#     """Extract file extension from filename"""
#     if not filename:
#         return ""
#     return os.path.splitext(filename)[1] if '.' in filename else ""


# def sanitize_filename(filename: str) -> str:
#     """Sanitize filename to remove special characters"""
#     if not filename:
#         return ""
#     # Keep only alphanumeric, dots, hyphens, and underscores
#     name, ext = os.path.splitext(filename)
#     sanitized_name = ''.join(c for c in name if c.isalnum() or c in ('-', '_', ' '))
#     return f"{sanitized_name}{ext}"


# # Save uploaded file with ID prefix
# async def save_file(upload: UploadFile, prefix: str, file_id: Optional[int] = None):
#     if upload and upload.filename:
#         # Sanitize the filename
#         safe_filename = sanitize_filename(upload.filename)
        
#         # Create filename with ID if available
#         if file_id:
#             file_ext = get_file_extension(safe_filename)
#             filename = f"{file_id}_{prefix}_{safe_filename}" if prefix else f"{file_id}_{safe_filename}"
#         else:
#             filename = f"{prefix}_{safe_filename}" if prefix else safe_filename
        
#         save_path = os.path.join(UPLOAD_FOLDER, filename)
        
#         # Ensure unique filename
#         counter = 1
#         original_save_path = save_path
#         while os.path.exists(save_path):
#             name, ext = os.path.splitext(original_save_path)
#             save_path = f"{name}_{counter}{ext}"
#             counter += 1
        
#         # Save file
#         with open(save_path, "wb") as buffer:
#             content = await upload.read()
#             buffer.write(content)
        
#         # Return relative path for storage
#         return filename
#     return None


# # Delete old file
# def delete_old_file(file_path: str):
#     if file_path:
#         full_path = os.path.join(UPLOAD_FOLDER, file_path)
#         if os.path.exists(full_path):
#             os.remove(full_path)


# # Get file preview information
# def get_file_preview_info(filename: str):
#     """Get preview information for a file"""
#     if not filename:
#         return None
    
#     file_path = os.path.join(UPLOAD_FOLDER, filename)
#     if not os.path.exists(file_path):
#         return None
    
#     # Get file stats
#     file_stats = os.stat(file_path)
    
#     # Determine file type from extension
#     _, ext = os.path.splitext(filename)
#     ext = ext.lower()
    
#     file_type = "other"
#     previewable = False
    
#     # Image formats
#     image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
#     # Document formats
#     doc_extensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf']
#     # Spreadsheet formats
#     sheet_extensions = ['.xls', '.xlsx', '.csv']
    
#     if ext in image_extensions:
#         file_type = "image"
#         previewable = True
#     elif ext in doc_extensions:
#         file_type = "document"
#         previewable = True
#     elif ext in sheet_extensions:
#         file_type = "spreadsheet"
#         previewable = True
#     elif ext == '.pdf':
#         file_type = "pdf"
#         previewable = True
    
#     return {
#         "filename": filename,
#         "path": f"/memberreport/download/{filename}",
#         "preview_path": f"/memberreport/preview/{filename}" if previewable else None,
#         "type": file_type,
#         "size": file_stats.st_size,
#         "created": file_stats.st_ctime,
#         "modified": file_stats.st_mtime,
#         "previewable": previewable
#     }


# # ---------------- POST CREATE ----------------
# @router.post("/upload")
# async def upload_member_report(
#     Member_id: int = Form(...),
#     Report_id: int = Form(...),
#     purpose: str = Form(...),
#     remarks: str = Form(None),
#     Created_by: str = Form(...),
#     uploaded_file_report_first: UploadFile = File(None),
#     uploaded_file_report_second: UploadFile = File(None),
#     uploaded_file_report_third: UploadFile = File(None),
#     db: AsyncSession = Depends(get_db)
# ):
#     # First create the report to get an ID
#     data = {
#         "Member_id": Member_id,
#         "Report_id": Report_id,
#         "purpose": purpose,
#         "remarks": remarks,
#         "Created_by": Created_by,
#         "uploaded_file_report_first": None,
#         "uploaded_file_report_second": None,
#         "uploaded_file_report_third": None
#     }
    
#     # Create report without files first
#     report = await create_member_report(db, data)
    
#     # Get report_id from the object (not a dict)
#     report_id = report.MemberReport_id  # or whatever your ID field is called
    
#     if not report_id:
#         raise HTTPException(500, "Failed to create report")
    
#     # Now save files with report ID
#     file1 = await save_file(uploaded_file_report_first, "rpt1", report_id)
#     file2 = await save_file(uploaded_file_report_second, "rpt2", report_id)
#     file3 = await save_file(uploaded_file_report_third, "rpt3", report_id)
    
#     # Update the report with file paths
#     update_data = {
#         "uploaded_file_report_first": file1,
#         "uploaded_file_report_second": file2,
#         "uploaded_file_report_third": file3
#     }
    
#     updated_report = await update_member_report(db, report_id, update_data)
#     return {"status": True, "message": "Member report created successfully", "data": updated_report}


# # ---------------- GET MAX DOC ----------------
# @router.get("/max-doc-no")
# async def get_max_doc(db: AsyncSession = Depends(get_db)):
#     max_doc = await get_max_doc_no(db)
#     return {"max_doc_no": max_doc}


# # ---------------- GET ALL ----------------
# @router.get("/")
# async def get_reports(
#     skip: int = Query(0, ge=0),
#     limit: int = Query(100, ge=1, le=1000),
#     db: AsyncSession = Depends(get_db)
# ):
#     return await get_all_member_reports(db, skip=skip, limit=limit)


# # ---------------- GET BY ID ----------------
# @router.get("/{report_id}")
# async def get_report(report_id: int, include_preview: bool = Query(False), db: AsyncSession = Depends(get_db)):
#     report = await get_member_report_by_id(db, report_id)
#     if not report:
#         raise HTTPException(404, "Report not found")
    
#     # If preview info is requested, add file preview information
#     if include_preview:
#         # Convert report to dict if it's not already
#         if not isinstance(report, dict):
#             report_dict = {key: getattr(report, key) for key in dir(report) if not key.startswith('_')}
#         else:
#             report_dict = report
        
#         # Add preview info for each file
#         file_fields = ['uploaded_file_report_first', 'uploaded_file_report_second', 'uploaded_file_report_third']
#         for field in file_fields:
#             filename = report_dict.get(field)
#             if filename:
#                 report_dict[f"{field}_preview"] = get_file_preview_info(filename)
    
#     return report


# # ---------------- PUT UPDATE ----------------
# @router.put("/update/{report_id}")
# async def update_member_report_api(
#     report_id: int,
#     purpose: str = Form(None),
#     remarks: str = Form(None),
#     Modified_by: str = Form(None),
#     uploaded_file_report_first: UploadFile = File(None),
#     uploaded_file_report_second: UploadFile = File(None),
#     uploaded_file_report_third: UploadFile = File(None),
#     db: AsyncSession = Depends(get_db)
# ):
#     old_report = await get_member_report_by_id(db, report_id)
#     if not old_report:
#         raise HTTPException(404, "Report not found")
    
#     # Convert to dict if needed
#     if not isinstance(old_report, dict):
#         old_report_dict = {key: getattr(old_report, key) for key in dir(old_report) if not key.startswith('_')}
#     else:
#         old_report_dict = old_report
    
#     # Save new files with report ID
#     new_file1 = old_report_dict.get('uploaded_file_report_first')
#     if uploaded_file_report_first:
#         delete_old_file(old_report_dict.get('uploaded_file_report_first'))
#         new_file1 = await save_file(uploaded_file_report_first, "rpt1", report_id)
    
#     new_file2 = old_report_dict.get('uploaded_file_report_second')
#     if uploaded_file_report_second:
#         delete_old_file(old_report_dict.get('uploaded_file_report_second'))
#         new_file2 = await save_file(uploaded_file_report_second, "rpt2", report_id)
    
#     new_file3 = old_report_dict.get('uploaded_file_report_third')
#     if uploaded_file_report_third:
#         delete_old_file(old_report_dict.get('uploaded_file_report_third'))
#         new_file3 = await save_file(uploaded_file_report_third, "rpt3", report_id)
    
#     update_data = {
#         "purpose": purpose,
#         "remarks": remarks,
#         "Modified_by": Modified_by,
#         "uploaded_file_report_first": new_file1,
#         "uploaded_file_report_second": new_file2,
#         "uploaded_file_report_third": new_file3
#     }
    
#     # Remove None values
#     update_data = {k: v for k, v in update_data.items() if v is not None}
    
#     updated = await update_member_report(db, report_id, update_data)
#     return {"status": True, "message": "Member report updated successfully", "data": updated}


# # ---------------- DELETE ----------------
# @router.delete("/{report_id}")
# async def remove_report(report_id: int, db: AsyncSession = Depends(get_db)):
#     # Get report first to delete associated files
#     report = await get_member_report_by_id(db, report_id)
#     if not report:
#         raise HTTPException(404, "Report not found")
    
#     # Convert to dict if needed
#     if not isinstance(report, dict):
#         report_dict = {key: getattr(report, key) for key in dir(report) if not key.startswith('_')}
#     else:
#         report_dict = report
    
#     # Delete associated files
#     file_fields = ['uploaded_file_report_first', 'uploaded_file_report_second', 'uploaded_file_report_third']
#     for field in file_fields:
#         filename = report_dict.get(field)
#         if filename:
#             delete_old_file(filename)
    
#     # Delete the report from database
#     deleted = await delete_member_report(db, report_id)
#     if not deleted:
#         raise HTTPException(404, "Report not found")
#     return {"status": True, "message": "Deleted successfully"}


# # ---------------- GET ALL FILES PREVIEW ----------------
# @router.get("/files/preview")
# async def get_all_files_preview(
#     file_type: Optional[str] = Query(None, description="Filter by file type: image, document, pdf, spreadsheet, other"),
#     skip: int = Query(0, ge=0),
#     limit: int = Query(100, ge=1, le=1000)
# ):
#     """Get preview information for all files in upload directory"""
#     try:
#         all_files = []
#         for filename in os.listdir(UPLOAD_FOLDER):
#             file_path = os.path.join(UPLOAD_FOLDER, filename)
#             if os.path.isfile(file_path):
#                 preview_info = get_file_preview_info(filename)
#                 if preview_info:
#                     all_files.append(preview_info)
        
#         # Filter by file type if specified
#         if file_type:
#             all_files = [f for f in all_files if f.get("type") == file_type.lower()]
        
#         # Apply pagination
#         total = len(all_files)
#         paginated_files = all_files[skip:skip + limit]
        
#         return {
#             "status": True,
#             "total_files": total,
#             "skip": skip,
#             "limit": limit,
#             "files": paginated_files
#         }
#     except Exception as e:
#         raise HTTPException(500, f"Error reading files: {str(e)}")


# # ---------------- GET FILE PREVIEW BY REPORT ID ----------------
# @router.get("/{report_id}/files/preview")
# async def get_report_files_preview(report_id: int, db: AsyncSession = Depends(get_db)):
#     """Get preview information for all files associated with a report"""
#     report = await get_member_report_by_id(db, report_id)
#     if not report:
#         raise HTTPException(404, "Report not found")
    
#     # Convert to dict if needed
#     if not isinstance(report, dict):
#         report_dict = {key: getattr(report, key) for key in dir(report) if not key.startswith('_')}
#     else:
#         report_dict = report
    
#     file_previews = []
#     file_fields = [
#         ('uploaded_file_report_first', 'Report File 1'),
#         ('uploaded_file_report_second', 'Report File 2'),
#         ('uploaded_file_report_third', 'Report File 3')
#     ]
    
#     for field, description in file_fields:
#         filename = report_dict.get(field)
#         if filename:
#             preview_info = get_file_preview_info(filename)
#             if preview_info:
#                 preview_info["description"] = description
#                 preview_info["field"] = field
#                 file_previews.append(preview_info)
    
#     return {
#         "status": True,
#         "report_id": report_id,
#         "total_files": len(file_previews),
#         "files": file_previews
#     }


# # ---------------- GET FILE PREVIEW BY FILENAME ----------------
# @router.get("/preview/{filename}")
# async def preview_file(filename: str):
#     """Preview a file (returns file metadata and preview URL)"""
#     file_preview = get_file_preview_info(filename)
#     if not file_preview:
#         raise HTTPException(404, "File not found")
    
#     return JSONResponse(content={
#         "status": True,
#         "file": file_preview
#     })


# # ---------------- DOWNLOAD FILE ----------------
# @router.get("/download/{filename}")
# async def download_report_file(filename: str):
#     file_path = os.path.join(UPLOAD_FOLDER, filename)
#     if not os.path.exists(file_path):
#         raise HTTPException(404, "File not found")
    
#     # Set appropriate media type based on file extension
#     _, ext = os.path.splitext(filename)
#     media_type = None
#     if ext.lower() in ['.jpg', '.jpeg']:
#         media_type = 'image/jpeg'
#     elif ext.lower() == '.png':
#         media_type = 'image/png'
#     elif ext.lower() == '.pdf':
#         media_type = 'application/pdf'
#     elif ext.lower() in ['.doc', '.docx']:
#         media_type = 'application/msword'
#     elif ext.lower() in ['.xls', '.xlsx']:
#         media_type = 'application/vnd.ms-excel'
    
#     return FileResponse(
#         path=file_path,
#         filename=filename,
#         media_type=media_type
#     )


# # ---------------- GET ALL REPORTS WITH PREVIEWS ----------------
# @router.get("/with-previews/all")
# async def get_all_reports_with_previews(
#     skip: int = Query(0, ge=0),
#     limit: int = Query(100, ge=1, le=1000),
#     db: AsyncSession = Depends(get_db)
# ):
#     """Get all reports with file preview information"""
#     reports = await get_all_member_reports(db, skip=skip, limit=limit)
    
#     if not isinstance(reports, list):
#         reports = [reports]
    
#     reports_with_previews = []
#     for report in reports:
#         # Convert to dict if needed
#         if not isinstance(report, dict):
#             report_dict = {key: getattr(report, key) for key in dir(report) if not key.startswith('_')}
#         else:
#             report_dict = report
        
#         # Add preview info for each file
#         file_fields = ['uploaded_file_report_first', 'uploaded_file_report_second', 'uploaded_file_report_third']
#         for field in file_fields:
#             filename = report_dict.get(field)
#             if filename:
#                 report_dict[f"{field}_preview"] = get_file_preview_info(filename)
        
#         reports_with_previews.append(report_dict)
    
#     return {
#         "status": True,
#         "total": len(reports_with_previews),
#         "reports": reports_with_previews
#     }
import os
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from typing import Optional
import urllib.parse
from app.Models.database import get_db
from app.Services.memberReport_services import (
    create_member_report,
    get_all_member_reports,
    get_member_report_by_id,
    update_member_report,
    delete_member_report,
    get_max_doc_no
)

router = APIRouter(prefix="/memberreport", tags=["MemberReport"])

UPLOAD_FOLDER = "upload/medical_report"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def get_file_extension(filename: str) -> str:
    """Extract file extension from filename"""
    if not filename:
        return ""
    return os.path.splitext(filename)[1] if '.' in filename else ""


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to remove special characters"""
    if not filename:
        return ""
    # Keep only alphanumeric, dots, hyphens, underscores, and spaces
    name, ext = os.path.splitext(filename)
    # Replace multiple spaces with single space
    name = ' '.join(name.split())
    # Remove or replace special characters
    safe_chars = []
    for char in name:
        if char.isalnum() or char in ('-', '_', ' ', '.', '(', ')'):
            safe_chars.append(char)
        elif char == ' ':
            safe_chars.append('_')  # Replace spaces with underscores
    safe_name = ''.join(safe_chars)
    # Remove leading/trailing underscores and dots
    safe_name = safe_name.strip('_. ')
    return f"{safe_name}{ext}" if safe_name else f"file{ext}"


def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format"""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    else:
        return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"


# Save uploaded file
async def save_file(upload: UploadFile, prefix: str, report_id: Optional[int] = None):
    if upload and upload.filename:
        # Sanitize the filename
        safe_filename = sanitize_filename(upload.filename)
        
        # Create filename with report ID if available
        if report_id:
            file_ext = get_file_extension(safe_filename)
            base_name = os.path.splitext(safe_filename)[0]
            filename = f"{report_id}_{prefix}_{base_name}{file_ext}"
        else:
            filename = safe_filename
        
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        
        # Ensure unique filename
        counter = 1
        original_save_path = save_path
        while os.path.exists(save_path):
            name, ext = os.path.splitext(original_save_path)
            save_path = f"{name}_{counter}{ext}"
            counter += 1
        
        # Get just the filename from the path
        filename = os.path.basename(save_path)
        
        # Save file
        with open(save_path, "wb") as buffer:
            content = await upload.read()
            buffer.write(content)
        
        return filename  # Return only filename
    return None


# Delete old file
def delete_old_file(filename: str):
    if filename:
        full_path = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(full_path):
            os.remove(full_path)


# Get file preview information
def get_file_preview_info(filename: str):
    """Get preview information for a file"""
    if not filename:
        return None
    
    # Decode URL encoded filename
    try:
        filename = urllib.parse.unquote(filename)
    except:
        pass
    
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        return None
    
    # Get file stats
    file_stats = os.stat(file_path)
    
    # Determine file type from extension
    _, ext = os.path.splitext(filename)
    ext = ext.lower()
    
    file_type = "other"
    previewable = False
    
    # Image formats
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
    # PDF format
    pdf_extensions = ['.pdf']
    # Document formats (text-based)
    text_extensions = ['.txt', '.csv']
    # Office documents
    office_extensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx']
    
    if ext in image_extensions:
        file_type = "image"
        previewable = True
    elif ext in pdf_extensions:
        file_type = "pdf"
        previewable = True
    elif ext in text_extensions:
        file_type = "text"
        previewable = True
    elif ext in office_extensions:
        file_type = "document"
        previewable = False
    
    return {
        "filename": filename,
        "download_url": f"/memberreport/download/{urllib.parse.quote(filename)}",
        "type": file_type,
        "size": file_stats.st_size,
        "size_formatted": format_file_size(file_stats.st_size),
        "created": file_stats.st_ctime,
        "modified": file_stats.st_mtime,
        "previewable": previewable,
        "extension": ext.replace('.', '') if ext else ''
    }


# ---------------- POST CREATE ----------------
@router.post("/upload")
async def upload_member_report(
    Member_id: int = Form(...),
    Report_id: int = Form(...),
    purpose: str = Form(...),
    remarks: str = Form(None),
    Created_by: str = Form(...),
    uploaded_file_report_first: UploadFile = File(None),
    uploaded_file_report_second: UploadFile = File(None),
    uploaded_file_report_third: UploadFile = File(None),
    db: AsyncSession = Depends(get_db)
):
    # First create the report to get an ID
    data = {
        "Member_id": Member_id,
        "Report_id": Report_id,
        "purpose": purpose,
        "remarks": remarks,
        "Created_by": Created_by,
        "uploaded_file_report_first": None,
        "uploaded_file_report_second": None,
        "uploaded_file_report_third": None
    }
    
    # Create report without files first
    report = await create_member_report(db, data)
    
    # Get report_id from the object (not a dict)
    report_id = report.MemberReport_id  # or whatever your ID field is called
    
    if not report_id:
        raise HTTPException(500, "Failed to create report")
    
    # Now save files with report ID
    file1 = await save_file(uploaded_file_report_first, "rpt1", report_id)
    file2 = await save_file(uploaded_file_report_second, "rpt2", report_id)
    file3 = await save_file(uploaded_file_report_third, "rpt3", report_id)
    
    # Update the report with file paths
    update_data = {
        "uploaded_file_report_first": file1,
        "uploaded_file_report_second": file2,
        "uploaded_file_report_third": file3
    }
    
    updated_report = await update_member_report(db, report_id, update_data)
    return {"status": True, "message": "Member report created successfully", "data": updated_report}


# ---------------- GET MAX DOC ----------------
@router.get("/max-doc-no")
async def get_max_doc(db: AsyncSession = Depends(get_db)):
    max_doc = await get_max_doc_no(db)
    return {"max_doc_no": max_doc or 0}


# ---------------- GET ALL ----------------
@router.get("/")
async def get_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    reports = await get_all_member_reports(db, skip=skip, limit=limit)
    
    # Convert reports to list of dictionaries
    result = []
    for report in reports:
        if hasattr(report, '__dict__'):
            report_dict = report.__dict__.copy()
            report_dict.pop('_sa_instance_state', None)
            result.append(report_dict)
        else:
            result.append(dict(report))
    
    return result


# ---------------- GET BY ID ----------------
@router.get("/{report_id}")
async def get_report(report_id: int, include_preview: bool = Query(False), db: AsyncSession = Depends(get_db)):
    report = await get_member_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Convert to dict
    if hasattr(report, '__dict__'):
        report_dict = report.__dict__.copy()
        report_dict.pop('_sa_instance_state', None)
    else:
        report_dict = dict(report)
    
    # If preview info is requested, add file preview information
    if include_preview:
        file_fields = ['uploaded_file_report_first', 'uploaded_file_report_second', 'uploaded_file_report_third']
        for field in file_fields:
            filename = report_dict.get(field)
            if filename:
                preview_info = get_file_preview_info(filename)
                if preview_info:
                    report_dict[f"{field}_preview"] = preview_info
    
    return report_dict


# ---------------- PUT UPDATE ----------------
@router.put("/update/{report_id}")
async def update_member_report_api(
    report_id: int,
    purpose: str = Form(None),
    remarks: str = Form(None),
    Modified_by: str = Form(None),
    uploaded_file_report_first: UploadFile = File(None),
    uploaded_file_report_second: UploadFile = File(None),
    uploaded_file_report_third: UploadFile = File(None),
    db: AsyncSession = Depends(get_db)
):
    old_report = await get_member_report_by_id(db, report_id)
    if not old_report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Convert to dict
    if hasattr(old_report, '__dict__'):
        old_report_dict = old_report.__dict__.copy()
        old_report_dict.pop('_sa_instance_state', None)
    else:
        old_report_dict = dict(old_report)
    
    update_data = {}
    
    # Add text fields if provided
    if purpose is not None:
        update_data["purpose"] = purpose
    if remarks is not None:
        update_data["remarks"] = remarks
    if Modified_by is not None:
        update_data["Modified_by"] = Modified_by
    
    # Handle file updates
    file_updates = [
        ('uploaded_file_report_first', uploaded_file_report_first, "rpt1"),
        ('uploaded_file_report_second', uploaded_file_report_second, "rpt2"),
        ('uploaded_file_report_third', uploaded_file_report_third, "rpt3")
    ]
    
    for field_name, upload_file, prefix in file_updates:
        old_filename = old_report_dict.get(field_name)
        
        if upload_file and upload_file.filename:
            # Delete old file if exists
            if old_filename:
                delete_old_file(old_filename)
            
            # Save new file
            new_filename = await save_file(upload_file, prefix, report_id)
            update_data[field_name] = new_filename
        elif upload_file is not None and upload_file.filename == "":
            # Empty file means remove the file
            if old_filename:
                delete_old_file(old_filename)
            update_data[field_name] = None
    
    # Update the report
    updated = await update_member_report(db, report_id, update_data)
    
    # Convert to dict for response
    if hasattr(updated, '__dict__'):
        updated_dict = updated.__dict__.copy()
        updated_dict.pop('_sa_instance_state', None)
    else:
        updated_dict = dict(updated)
    
    return {
        "status": True, 
        "message": "Member report updated successfully", 
        "data": updated_dict
    }


# ---------------- DELETE ----------------
@router.delete("/{report_id}")
async def remove_report(report_id: int, db: AsyncSession = Depends(get_db)):
    # Get report first to delete associated files
    report = await get_member_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Convert to dict
    if hasattr(report, '__dict__'):
        report_dict = report.__dict__.copy()
        report_dict.pop('_sa_instance_state', None)
    else:
        report_dict = dict(report)
    
    # Delete associated files
    file_fields = ['uploaded_file_report_first', 'uploaded_file_report_second', 'uploaded_file_report_third']
    for field in file_fields:
        filename = report_dict.get(field)
        if filename:
            delete_old_file(filename)
    
    # Delete the report from database
    deleted = await delete_member_report(db, report_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {
        "status": True, 
        "message": "Deleted successfully"
    }


# ---------------- GET FILE PREVIEW INFO ----------------
@router.get("/preview/{filename}")
async def preview_file(filename: str):
    """Get file preview information"""
    file_preview = get_file_preview_info(filename)
    if not file_preview:
        raise HTTPException(status_code=404, detail="File not found")
    
    return JSONResponse(content={
        "status": True,
        "file": file_preview
    })


# ---------------- DOWNLOAD FILE ----------------
@router.get("/download/{filename}")
async def download_report_file(filename: str):
    """Download a file"""
    # Decode URL encoded filename
    try:
        filename = urllib.parse.unquote(filename)
    except:
        pass
    
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    # Get file info
    file_size = os.path.getsize(file_path)
    
    # Determine content type based on file extension
    _, ext = os.path.splitext(filename)
    ext = ext.lower()
    
    # Common content types
    content_types = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
    
    media_type = content_types.get(ext, 'application/octet-stream')
    
    # Return file with appropriate headers
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=media_type,
        headers={
            'Content-Length': str(file_size),
            'Content-Disposition': f'attachment; filename="{urllib.parse.quote(filename)}"'
        }
    )


# ---------------- HEALTH CHECK ----------------
@router.get("/health/check")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "upload_folder": UPLOAD_FOLDER,
        "folder_exists": os.path.exists(UPLOAD_FOLDER),
        "files_count": len(os.listdir(UPLOAD_FOLDER)) if os.path.exists(UPLOAD_FOLDER) else 0
    }


# ---------------- LIST ALL FILES ----------------
@router.get("/files/list")
async def list_all_files():
    """List all files in upload directory"""
    if not os.path.exists(UPLOAD_FOLDER):
        return []
    
    files = []
    for filename in os.listdir(UPLOAD_FOLDER):
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.isfile(file_path):
            file_info = {
                "filename": filename,
                "size": os.path.getsize(file_path),
                "size_formatted": format_file_size(os.path.getsize(file_path)),
                "created": os.path.getctime(file_path),
                "modified": os.path.getmtime(file_path)
            }
            files.append(file_info)
    
    return files