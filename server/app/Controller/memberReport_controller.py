# import os
# from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
# from sqlalchemy.ext.asyncio import AsyncSession
# from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
# from typing import Optional
# import urllib.parse
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
#     name, ext = os.path.splitext(filename)
#     name = ' '.join(name.split())
#     safe_chars = []
#     for char in name:
#         if char.isalnum() or char in ('-', '_', ' ', '.', '(', ')'):
#             safe_chars.append(char)
#         elif char == ' ':
#             safe_chars.append('_')  
#     safe_name = ''.join(safe_chars)
#     safe_name = safe_name.strip('_. ')
#     return f"{safe_name}{ext}" if safe_name else f"file{ext}"


# def format_file_size(size_bytes: int) -> str:
#     """Format file size in human readable format"""
#     if size_bytes < 1024:
#         return f"{size_bytes} B"
#     elif size_bytes < 1024 * 1024:
#         return f"{size_bytes / 1024:.1f} KB"
#     elif size_bytes < 1024 * 1024 * 1024:
#         return f"{size_bytes / (1024 * 1024):.1f} MB"
#     else:
#         return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"


# async def save_file(upload: UploadFile, prefix: str, report_id: Optional[int] = None):
#     if upload and upload.filename:
#         safe_filename = sanitize_filename(upload.filename)
        
#         if report_id:
#             file_ext = get_file_extension(safe_filename)
#             base_name = os.path.splitext(safe_filename)[0]
#             filename = f"{report_id}_{prefix}_{base_name}{file_ext}"
#         else:
#             filename = safe_filename
        
#         save_path = os.path.join(UPLOAD_FOLDER, filename)
        
#         counter = 1
#         original_save_path = save_path
#         while os.path.exists(save_path):
#             name, ext = os.path.splitext(original_save_path)
#             save_path = f"{name}_{counter}{ext}"
#             counter += 1
        
#         filename = os.path.basename(save_path)
        

#         with open(save_path, "wb") as buffer:
#             content = await upload.read()
#             buffer.write(content)
        
#         return filename 
#     return None


# def get_file_preview_info(filename: str):
#     """Get preview information for a file"""
#     if not filename:
#         return None
    
#     try:
#         filename = urllib.parse.unquote(filename)
#     except:
#         pass
    
#     file_path = os.path.join(UPLOAD_FOLDER, filename)
#     if not os.path.exists(file_path):
#         return None
    
#     file_stats = os.stat(file_path)
    
#     _, ext = os.path.splitext(filename)
#     ext = ext.lower()
    
#     file_type = "other"
#     previewable = False
#     viewable_in_browser = False
    
#     # Define file categories
#     image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
#     pdf_extensions = ['.pdf']
#     text_extensions = ['.txt', '.csv', '.json', '.xml', '.html', '.htm', '.css', '.js', '.md']
#     office_extensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx']
#     archive_extensions = ['.zip', '.rar', '.7z', '.tar', '.gz']
    
#     if ext in image_extensions:
#         file_type = "image"
#         previewable = True
#         viewable_in_browser = True
#     elif ext in pdf_extensions:
#         file_type = "pdf"
#         previewable = True
#         viewable_in_browser = True
#     elif ext in text_extensions:
#         file_type = "text"
#         previewable = True
#         viewable_in_browser = True
#     elif ext in office_extensions:
#         file_type = "document"
#         previewable = False
#         viewable_in_browser = False
#     elif ext in archive_extensions:
#         file_type = "archive"
#         previewable = False
#         viewable_in_browser = False
    
#     return {
#         "filename": filename,
#         "download_url": f"/memberreport/download/{urllib.parse.quote(filename)}",
#         "view_url": f"/memberreport/view/{urllib.parse.quote(filename)}",
#         "preview_url": f"/memberreport/preview/{urllib.parse.quote(filename)}",
#         "type": file_type,
#         "size": file_stats.st_size,
#         "size_formatted": format_file_size(file_stats.st_size),
#         "created": file_stats.st_ctime,
#         "modified": file_stats.st_mtime,
#         "previewable": previewable,
#         "viewable_in_browser": viewable_in_browser,
#         "extension": ext.replace('.', '') if ext else '',
#         "mime_type": get_mime_type(ext)
#     }

# def get_mime_type(extension: str) -> str:
#     """Get MIME type for file extension"""
#     mime_types = {
#         '.pdf': 'application/pdf',
#         '.jpg': 'image/jpeg',
#         '.jpeg': 'image/jpeg',
#         '.png': 'image/png',
#         '.gif': 'image/gif',
#         '.bmp': 'image/bmp',
#         '.webp': 'image/webp',
#         '.svg': 'image/svg+xml',
#         '.txt': 'text/plain',
#         '.csv': 'text/csv',
#         '.json': 'application/json',
#         '.xml': 'application/xml',
#         '.html': 'text/html',
#         '.htm': 'text/html',
#         '.css': 'text/css',
#         '.js': 'application/javascript',
#         '.doc': 'application/msword',
#         '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
#         '.xls': 'application/vnd.ms-excel',
#         '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
#         '.ppt': 'application/vnd.ms-powerpoint',
#         '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
#         '.zip': 'application/zip',
#         '.rar': 'application/vnd.rar',
#     }
#     return mime_types.get(extension.lower(), 'application/octet-stream')

# def delete_old_file(filename: str):
#     if filename:
#         full_path = os.path.join(UPLOAD_FOLDER, filename)
#         if os.path.exists(full_path):
#             os.remove(full_path)

# def get_file_preview_info(filename: str):
#     """Get preview information for a file"""
#     if not filename:
#         return None
    
#     try:
#         filename = urllib.parse.unquote(filename)
#     except:
#         pass
    
#     file_path = os.path.join(UPLOAD_FOLDER, filename)
#     if not os.path.exists(file_path):
#         return None
    
#     file_stats = os.stat(file_path)
    

#     _, ext = os.path.splitext(filename)
#     ext = ext.lower()
    
#     file_type = "other"
#     previewable = False
    
#     image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']

#     pdf_extensions = ['.pdf']

#     text_extensions = ['.txt', '.csv']

#     office_extensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx']
    
#     if ext in image_extensions:
#         file_type = "image"
#         previewable = True
#     elif ext in pdf_extensions:
#         file_type = "pdf"
#         previewable = True
#     elif ext in text_extensions:
#         file_type = "text"
#         previewable = True
#     elif ext in office_extensions:
#         file_type = "document"
#         previewable = False
    
#     return {
#         "filename": filename,
#         "download_url": f"/memberreport/download/{urllib.parse.quote(filename)}",
#         "type": file_type,
#         "size": file_stats.st_size,
#         "size_formatted": format_file_size(file_stats.st_size),
#         "created": file_stats.st_ctime,
#         "modified": file_stats.st_mtime,
#         "previewable": previewable,
#         "extension": ext.replace('.', '') if ext else ''
#     }


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
    
#     report = await create_member_report(db, data)
    
#     report_id = report.MemberReport_id  
    
#     if not report_id:
#         raise HTTPException(500, "Failed to create report")
    

#     file1 = await save_file(uploaded_file_report_first, "rpt1", report_id)
#     file2 = await save_file(uploaded_file_report_second, "rpt2", report_id)
#     file3 = await save_file(uploaded_file_report_third, "rpt3", report_id)

#     update_data = {
#         "uploaded_file_report_first": file1,
#         "uploaded_file_report_second": file2,
#         "uploaded_file_report_third": file3
#     }
    
#     updated_report = await update_member_report(db, report_id, update_data)
#     return {"status": True, "message": "Member report created successfully", "data": updated_report}


# @router.get("/max-doc-no")
# async def get_max_doc(db: AsyncSession = Depends(get_db)):
#     max_doc = await get_max_doc_no(db)
#     return {"max_doc_no": max_doc or 0}


# @router.get("/")
# async def get_reports(
#     skip: int = Query(0, ge=0),
#     limit: int = Query(100, ge=1, le=1000),
#     db: AsyncSession = Depends(get_db)
# ):
#     reports = await get_all_member_reports(db, skip=skip, limit=limit)
    
#     result = []
#     for report in reports:
#         if hasattr(report, '__dict__'):
#             report_dict = report.__dict__.copy()
#             report_dict.pop('_sa_instance_state', None)
#             result.append(report_dict)
#         else:
#             result.append(dict(report))
    
#     return result

# @router.get("/{report_id}")
# async def get_report(report_id: int, include_preview: bool = Query(False), db: AsyncSession = Depends(get_db)):
#     report = await get_member_report_by_id(db, report_id)
#     if not report:
#         raise HTTPException(status_code=404, detail="Report not found")
    
#     if hasattr(report, '__dict__'):
#         report_dict = report.__dict__.copy()
#         report_dict.pop('_sa_instance_state', None)
#     else:
#         report_dict = dict(report)
    
#     if include_preview:
#         file_fields = ['uploaded_file_report_first', 'uploaded_file_report_second', 'uploaded_file_report_third']
#         for field in file_fields:
#             filename = report_dict.get(field)
#             if filename:
#                 preview_info = get_file_preview_info(filename)
#                 if preview_info:
#                     # Add preview URLs
#                     report_dict[f"{field}_preview"] = preview_info
#                     # Also add direct URLs for easy access
#                     report_dict[f"{field}_url"] = f"/memberreport/download/{urllib.parse.quote(filename)}"
#                     report_dict[f"{field}_view_url"] = f"/memberreport/view/{urllib.parse.quote(filename)}"
    
#     return report_dict


# @router.put("/update/{report_id}")
# async def update_member_report_api(
#     report_id: int,
#     purpose: str = Form(None),
#     remarks: str = Form(None),
#     Modified_by: str = Form(None),
#     file_actions: str = Form("{}"),  # JSON string
#     uploaded_file_report_first: UploadFile = File(None),
#     uploaded_file_report_second: UploadFile = File(None),
#     uploaded_file_report_third: UploadFile = File(None),
#     db: AsyncSession = Depends(get_db)
# ):
#     import json
    
#     old_report = await get_member_report_by_id(db, report_id)
#     if not old_report:
#         raise HTTPException(status_code=404, detail="Report not found")
    
#     # Parse file actions JSON
#     try:
#         actions = json.loads(file_actions)
#     except:
#         actions = {}
    
#     # Get current filenames
#     old_filenames = {
#         'uploaded_file_report_first': getattr(old_report, 'uploaded_file_report_first', None),
#         'uploaded_file_report_second': getattr(old_report, 'uploaded_file_report_second', None),
#         'uploaded_file_report_third': getattr(old_report, 'uploaded_file_report_third', None)
#     }
    
#     update_data = {}
    
#     # Add text fields
#     if purpose is not None:
#         update_data["purpose"] = purpose
#     if remarks is not None:
#         update_data["remarks"] = remarks
#     if Modified_by is not None:
#         update_data["Modified_by"] = Modified_by
    
#     # Handle file updates based on actions
#     file_mapping = [
#         ('uploaded_file_report_first', uploaded_file_report_first, "rpt1"),
#         ('uploaded_file_report_second', uploaded_file_report_second, "rpt2"),
#         ('uploaded_file_report_third', uploaded_file_report_third, "rpt3")
#     ]
    
#     for field_name, upload_file, prefix in file_mapping:
#         old_filename = old_filenames.get(field_name)
#         action = actions.get(field_name, 'keep')  # Default: keep
        
#         if action == 'delete':
#             # Delete file
#             if old_filename:
#                 delete_old_file(old_filename)
#             update_data[field_name] = None
            
#         elif upload_file and upload_file.filename:
#             # New file uploaded
#             new_filename = await save_file(upload_file, prefix, report_id)
#             update_data[field_name] = new_filename
            
#             # Delete old file if exists
#             if old_filename and old_filename != new_filename:
#                 delete_old_file(old_filename)
        
#         # If action is 'keep', do nothing
    
#     # Update database
#     if update_data:
#         updated = await update_member_report(db, report_id, update_data)
#     else:
#         updated = old_report
    
#     return {
#         "status": True, 
#         "message": "Member report updated successfully", 
#         "data": updated
#     }

# # @router.put("/update/{report_id}")
# # async def update_member_report_api(
# #     report_id: int,
# #     purpose: str = Form(None),
# #     remarks: str = Form(None),
# #     Modified_by: str = Form(None),
# #     # Remove default None to handle empty files properly
# #     uploaded_file_report_first: UploadFile = File(...),
# #     uploaded_file_report_second: UploadFile = File(...),
# #     uploaded_file_report_third: UploadFile = File(...),
# #     db: AsyncSession = Depends(get_db)
# # ):
# #     old_report = await get_member_report_by_id(db, report_id)
# #     if not old_report:
# #         raise HTTPException(status_code=404, detail="Report not found")
    
# #     # Get current filenames
# #     old_filename1 = getattr(old_report, 'uploaded_file_report_first', None)
# #     old_filename2 = getattr(old_report, 'uploaded_file_report_second', None)
# #     old_filename3 = getattr(old_report, 'uploaded_file_report_third', None)
    
# #     update_data = {}
    
# #     # Add text fields if provided
# #     if purpose is not None:
# #         update_data["purpose"] = purpose
# #     if remarks is not None:
# #         update_data["remarks"] = remarks
# #     if Modified_by is not None:
# #         update_data["Modified_by"] = Modified_by
    
# #     # Handle file updates - FIXED VERSION
# #     file_handlers = [
# #         ('uploaded_file_report_first', uploaded_file_report_first, "rpt1"),
# #         ('uploaded_file_report_second', uploaded_file_report_second, "rpt2"),
# #         ('uploaded_file_report_third', uploaded_file_report_third, "rpt3")
# #     ]
    
# #     for field_name, upload_file, prefix in file_handlers:
# #         # Get the old filename using the appropriate variable
# #         old_filename = None
# #         if field_name == 'uploaded_file_report_first':
# #             old_filename = old_filename1
# #         elif field_name == 'uploaded_file_report_second':
# #             old_filename = old_filename2
# #         elif field_name == 'uploaded_file_report_third':
# #             old_filename = old_filename3
        
# #         # Check if file was uploaded
# #         if upload_file and upload_file.filename:
# #             # New file uploaded - delete old if exists
# #             new_filename = await save_file(upload_file, prefix, report_id)
# #             update_data[field_name] = new_filename
            
# #             # Delete old file if it exists and is different
# #             if old_filename and old_filename != new_filename:
# #                 delete_old_file(old_filename)
# #         elif upload_file and not upload_file.filename:
# #             # Empty file uploaded - means delete the existing file
# #             if old_filename:
# #                 delete_old_file(old_filename)
# #             update_data[field_name] = None
# #         # If no file provided at all, keep existing file (don't update)
    
# #     # Update database
# #     if update_data:
# #         updated = await update_member_report(db, report_id, update_data)
# #     else:
# #         updated = old_report
    
# #     return {
# #         "status": True, 
# #         "message": "Member report updated successfully", 
# #         "data": updated
# #     }

# @router.delete("/{report_id}")
# async def remove_report(report_id: int, db: AsyncSession = Depends(get_db)):

#     report = await get_member_report_by_id(db, report_id)
#     if not report:
#         raise HTTPException(status_code=404, detail="Report not found")
    
    
#     if hasattr(report, '__dict__'):
#         report_dict = report.__dict__.copy()
#         report_dict.pop('_sa_instance_state', None)
#     else:
#         report_dict = dict(report)
    
  
#     file_fields = ['uploaded_file_report_first', 'uploaded_file_report_second', 'uploaded_file_report_third']
#     for field in file_fields:
#         filename = report_dict.get(field)
#         if filename:
#             delete_old_file(filename)
    
 
#     deleted = await delete_member_report(db, report_id)
#     if not deleted:
#         raise HTTPException(status_code=404, detail="Report not found")
    
#     return {
#         "status": True, 
#         "message": "Deleted successfully"
#     }


# @router.get("/preview/{filename}")
# async def preview_file(filename: str):
#     """Get file preview information"""

#     # Decode URL-encoded filename (%20, %28, %29, etc.)
#     try:
#         decoded_filename = urllib.parse.unquote(filename)
#     except:
#         decoded_filename = filename

#     # Debug log (optional)
#     print("RAW filename:", filename)
#     print("DECODED filename:", decoded_filename)

#     file_preview = get_file_preview_info(decoded_filename)

#     if not file_preview:
#         raise HTTPException(
#             status_code=404,
#             detail=f"File not found: {decoded_filename}"
#         )

#     return JSONResponse(content={
#         "status": True,
#         "file": file_preview
#     })



# @router.get("/download/{filename}")
# async def download_report_file(filename: str):
#     """Download a file"""
#     try:
#         filename = urllib.parse.unquote(filename)
#     except:
#         pass
    
#     file_path = os.path.join(UPLOAD_FOLDER, filename)
    
#     if not os.path.exists(file_path):
#         raise HTTPException(status_code=404, detail="File not found")

#     file_size = os.path.getsize(file_path)

#     _, ext = os.path.splitext(filename)
#     ext = ext.lower()

#     content_types = {
#         '.pdf': 'application/pdf',
#         '.jpg': 'image/jpeg',
#         '.jpeg': 'image/jpeg',
#         '.png': 'image/png',
#         '.gif': 'image/gif',
#         '.txt': 'text/plain',
#         '.csv': 'text/csv',
#         '.doc': 'application/msword',
#         '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
#         '.xls': 'application/vnd.ms-excel',
#         '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
#     }
    
#     media_type = content_types.get(ext, 'application/octet-stream')

#     return FileResponse(
#         path=file_path,
#         filename=filename,
#         media_type=media_type,
#         headers={
#             'Content-Length': str(file_size),
#             'Content-Disposition': f'attachment; filename="{urllib.parse.quote(filename)}"'
#         }
#     )

# @router.get("/health/check")
# async def health_check():
#     """Health check endpoint"""
#     return {
#         "status": "ok",
#         "upload_folder": UPLOAD_FOLDER,
#         "folder_exists": os.path.exists(UPLOAD_FOLDER),
#         "files_count": len(os.listdir(UPLOAD_FOLDER)) if os.path.exists(UPLOAD_FOLDER) else 0
#     }


# @router.get("/files/list")
# async def list_all_files():
#     """List all files in upload directory"""
#     if not os.path.exists(UPLOAD_FOLDER):
#         return []
    
#     files = []
#     for filename in os.listdir(UPLOAD_FOLDER):
#         file_path = os.path.join(UPLOAD_FOLDER, filename)
#         if os.path.isfile(file_path):
#             file_info = {
#                 "filename": filename,
#                 "size": os.path.getsize(file_path),
#                 "size_formatted": format_file_size(os.path.getsize(file_path)),
#                 "created": os.path.getctime(file_path),
#                 "modified": os.path.getmtime(file_path)
#             }
#             files.append(file_info)
    
#     return files



# @router.get("/preview/{filename}")
# async def preview_file(filename: str, download: bool = Query(False)):
#     """Preview or download a file"""
#     try:
#         filename = urllib.parse.unquote(filename)
#     except:
#         pass
    
#     file_path = os.path.join(UPLOAD_FOLDER, filename)
    
#     if not os.path.exists(file_path):
#         raise HTTPException(
#             status_code=404,
#             detail=f"File not found: {filename}"
#         )
    
#     # Get file info first
#     file_preview = get_file_preview_info(filename)
    
#     # If download flag is true or file is not previewable, trigger download
#     if download or not file_preview.get("previewable", False):
#         return FileResponse(
#             path=file_path,
#             filename=filename,
#             media_type="application/octet-stream",
#             headers={
#                 'Content-Disposition': f'attachment; filename="{urllib.parse.quote(filename)}"'
#             }
#         )
    
#     # Determine content type for preview
#     _, ext = os.path.splitext(filename)
#     ext = ext.lower()
    
#     content_types = {
#         '.pdf': 'application/pdf',
#         '.jpg': 'image/jpeg',
#         '.jpeg': 'image/jpeg',
#         '.png': 'image/png',
#         '.gif': 'image/gif',
#         '.bmp': 'image/bmp',
#         '.webp': 'image/webp',
#         '.txt': 'text/plain',
#         '.csv': 'text/csv',
#         '.md': 'text/markdown',
#     }
    
#     media_type = content_types.get(ext, 'application/octet-stream')
    
#     # For text files, we can return the content directly
#     if ext in ['.txt', '.csv', '.md']:
#         with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
#             content = f.read()
        
#         return JSONResponse(content={
#             "status": True,
#             "type": "text",
#             "filename": filename,
#             "content": content,
#             "size": file_preview["size"],
#             "size_formatted": file_preview["size_formatted"]
#         })
    
#     # For images and PDFs, serve the file with inline disposition
#     if ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.pdf']:
#         return FileResponse(
#             path=file_path,
#             filename=filename,
#             media_type=media_type,
#             headers={
#                 'Content-Disposition': f'inline; filename="{urllib.parse.quote(filename)}"'
#             }
#         )
    
#     # For other file types, return the preview info
#     return JSONResponse(content={
#         "status": True,
#         "file": file_preview,
#         "message": "File cannot be previewed in browser"
#     })


# import os
# import urllib.parse
# from pathlib import Path

# @router.get("/view/{filename:path}")
# async def view_file_in_browser(filename: str):
#     """View file directly in browser with inline disposition"""
#     try:
#         # Decode URL-encoded filename
#         decoded_filename = urllib.parse.unquote(filename)
#     except:
#         decoded_filename = filename
    
#     # Try multiple approaches to find the file
#     file_path = None
    
#     # Approach 1: Try with the decoded filename
#     potential_path = os.path.join(UPLOAD_FOLDER, decoded_filename)
#     if os.path.exists(potential_path):
#         file_path = potential_path
#     else:
#         # Approach 2: Try to find the file by scanning directory
#         # This handles cases where the filename might have different encoding
#         if os.path.exists(UPLOAD_FOLDER):
#             for file in os.listdir(UPLOAD_FOLDER):
#                 # Compare decoded versions
#                 try:
#                     decoded_file = urllib.parse.unquote(file)
#                     if decoded_file == decoded_filename:
#                         file_path = os.path.join(UPLOAD_FOLDER, file)
#                         break
#                 except:
#                     pass
    
#     if not file_path or not os.path.exists(file_path):
#         # Try one more approach: find any file that contains the base name
#         if os.path.exists(UPLOAD_FOLDER):
#             base_name = os.path.splitext(decoded_filename)[0]
#             for file in os.listdir(UPLOAD_FOLDER):
#                 if base_name in file:
#                     file_path = os.path.join(UPLOAD_FOLDER, file)
#                     break
    
#     if not file_path or not os.path.exists(file_path):
#         raise HTTPException(
#             status_code=404, 
#             detail=f"File not found. Searched for: {decoded_filename}"
#         )
    
#     # Get the actual filename from the path
#     actual_filename = os.path.basename(file_path)
    
#     # Get file extension
#     _, ext = os.path.splitext(actual_filename)
#     ext = ext.lower()
    
#     # Define content types
#     content_types = {
#         '.pdf': 'application/pdf',
#         '.jpg': 'image/jpeg',
#         '.jpeg': 'image/jpeg',
#         '.png': 'image/png',
#         '.gif': 'image/gif',
#         '.bmp': 'image/bmp',
#         '.webp': 'image/webp',
#         '.txt': 'text/plain',
#         '.html': 'text/html',
#         '.htm': 'text/html',
#         '.css': 'text/css',
#         '.js': 'application/javascript',
#         '.json': 'application/json',
#         '.xml': 'application/xml',
#         '.csv': 'text/csv',
#         '.svg': 'image/svg+xml',
#     }
    
#     media_type = content_types.get(ext, 'application/octet-stream')
    
#     # Always set Content-Disposition to inline for browser viewing
#     headers = {
#         'Content-Disposition': f'inline; filename="{urllib.parse.quote(actual_filename)}"'
#     }
    
#     return FileResponse(
#         path=file_path,
#         filename=actual_filename,
#         media_type=media_type,
#         headers=headers
#     )







import os
import json
import urllib.parse
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import FileResponse, JSONResponse
from typing import Optional, List
from datetime import date
from app.Models.database import get_db
from app.Models.memberReport_model import MemberReport, MemberReportDetail
from app.Services.memberReport_services import (
    create_member_report_with_details,
    get_all_member_reports,
    get_member_report_by_id,
    update_member_report,
    delete_member_report,
    delete_member_report_detail,
    get_max_doc_no
)

router = APIRouter(prefix="/memberreport", tags=["MemberReport"])

UPLOAD_FOLDER = "upload/medical_report"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to remove special characters"""
    if not filename:
        return ""
    name, ext = os.path.splitext(filename)
    name = ' '.join(name.split())
    safe_chars = []
    for char in name:
        if char.isalnum() or char in ('-', '_', ' ', '.', '(', ')'):
            safe_chars.append(char)
        elif char == ' ':
            safe_chars.append('_')  
    safe_name = ''.join(safe_chars)
    safe_name = safe_name.strip('_. ')
    return f"{safe_name}{ext}" if safe_name else f"file{ext}"


async def save_detail_file(upload: UploadFile, report_id: int, detail_index: int):
    """Save file for a detail record"""
    if upload and upload.filename:
        safe_filename = sanitize_filename(upload.filename)
        name, ext = os.path.splitext(safe_filename)
        filename = f"{report_id}_detail_{detail_index}_{name}{ext}"
        
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        
        counter = 1
        original_save_path = save_path
        while os.path.exists(save_path):
            name, ext = os.path.splitext(original_save_path)
            save_path = f"{name}_{counter}{ext}"
            counter += 1
        
        filename = os.path.basename(save_path)
        
        with open(save_path, "wb") as buffer:
            content = await upload.read()
            buffer.write(content)
        
        return filename 
    return None


def delete_old_file(filename: str):
    """Delete file from filesystem"""
    if filename:
        full_path = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(full_path):
            os.remove(full_path)


def get_file_preview_info(filename: str):
    """Get preview information for a file"""
    if not filename:
        return None
    
    try:
        filename = urllib.parse.unquote(filename)
    except:
        pass
    
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        return None
    
    file_stats = os.stat(file_path)
    
    _, ext = os.path.splitext(filename)
    ext = ext.lower()
    
    file_type = "other"
    previewable = False
    viewable_in_browser = False
    
    # Define file categories
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
    pdf_extensions = ['.pdf']
    text_extensions = ['.txt', '.csv', '.json', '.xml', '.html', '.htm', '.css', '.js', '.md']
    office_extensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx']
    archive_extensions = ['.zip', '.rar', '.7z', '.tar', '.gz']
    
    if ext in image_extensions:
        file_type = "image"
        previewable = True
        viewable_in_browser = True
    elif ext in pdf_extensions:
        file_type = "pdf"
        previewable = True
        viewable_in_browser = True
    elif ext in text_extensions:
        file_type = "text"
        previewable = True
        viewable_in_browser = True
    elif ext in office_extensions:
        file_type = "document"
        previewable = False
        viewable_in_browser = False
    elif ext in archive_extensions:
        file_type = "archive"
        previewable = False
        viewable_in_browser = False
    
    return {
        "filename": filename,
        "download_url": f"/memberreport/download/{urllib.parse.quote(filename)}",
        "view_url": f"/memberreport/view/{urllib.parse.quote(filename)}",
        "preview_url": f"/memberreport/preview/{urllib.parse.quote(filename)}",
        "type": file_type,
        "size": file_stats.st_size,
        "size_formatted": format_file_size(file_stats.st_size),
        "created": file_stats.st_ctime,
        "modified": file_stats.st_mtime,
        "previewable": previewable,
        "viewable_in_browser": viewable_in_browser,
        "extension": ext.replace('.', '') if ext else '',
        "mime_type": get_mime_type(ext)
    }


def get_mime_type(extension: str) -> str:
    """Get MIME type for file extension"""
    mime_types = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.json': 'application/json',
        '.xml': 'application/xml',
        '.html': 'text/html',
        '.htm': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.zip': 'application/zip',
        '.rar': 'application/vnd.rar',
    }
    return mime_types.get(extension.lower(), 'application/octet-stream')


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


# =============== API ENDPOINTS ===============

@router.get("/max-doc-no")
async def get_max_doc(db: AsyncSession = Depends(get_db)):
    max_doc = await get_max_doc_no(db)
    return {"max_doc_no": max_doc or 0}


@router.post("/upload")
async def upload_member_report(
    Member_id: int = Form(...),
    Family_id: int = Form(...),
    purpose: str = Form(...),
    remarks: str = Form(None),
    Created_by: str = Form(...),
    details_json: str = Form(...),  # JSON string containing details
    db: AsyncSession = Depends(get_db)
):
    """Create a member report with multiple details"""
    try:
        # Parse details JSON
        details_data = json.loads(details_json)
        
        # Prepare report data
        report_data = {
            "Member_id": Member_id,
            "Family_id": Family_id,
            "purpose": purpose,
            "remarks": remarks,
            "Created_by": Created_by
        }
        
        # Create report (without files first to get ID)
        report = await create_member_report_with_details(db, report_data, details_data)
        
        return {
            "status": True, 
            "message": "Member report created successfully", 
            "data": {
                "MemberReport_id": report.MemberReport_id,
                "doc_No": report.doc_No,
                "details_count": len(report.details)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/upload-with-files")
async def upload_member_report_with_files(
    Member_id: int = Form(...),
    Family_id: int = Form(...),
    purpose: str = Form(...),
    remarks: str = Form(None),
    Created_by: str = Form(...),
    details_json: str = Form(...),
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Create report with files uploaded at the same time"""
    try:
        # Parse details
        details_data = json.loads(details_json)
        
        # Prepare report data
        report_data = {
            "Member_id": Member_id,
            "Family_id": Family_id,
            "purpose": purpose,
            "remarks": remarks,
            "Created_by": Created_by
        }
        
        # Create report first
        next_doc_no = await get_max_doc_no(db) + 1
        report_data["doc_No"] = next_doc_no
        
        new_report = MemberReport(**report_data)
        db.add(new_report)
        await db.flush()  # Get the ID
        
        report_id = new_report.MemberReport_id
        
        # Process details and files
        file_index = 0
        for i, detail_data in enumerate(details_data):
            # Save file if available
            if file_index < len(files) and files[file_index].filename:
                filename = await save_detail_file(files[file_index], report_id, i)
                detail_data["uploaded_file_report"] = filename
                file_index += 1
            
            # Create detail
            detail_data["MemberReport_id"] = report_id
            new_detail = MemberReportDetail(**detail_data)
            db.add(new_detail)
        
        await db.commit()
        await db.refresh(new_report)
        
        return {
            "status": True,
            "message": "Report created successfully",
            "data": {
                "MemberReport_id": report_id,
                "doc_No": new_report.doc_No
            }
        }
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
async def get_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """Get all reports with details"""
    reports = await get_all_member_reports(db, skip=skip, limit=limit)
    return reports


@router.get("/{report_id}")
async def get_report(
    report_id: int, 
    include_preview: bool = Query(False), 
    db: AsyncSession = Depends(get_db)
):
    """Get a single report with all details"""
    report = await get_member_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Convert to dict
    report_dict = {
        "MemberReport_id": report.MemberReport_id,
        "doc_No": report.doc_No,
        "Member_id": report.Member_id,
        "Family_id": report.Family_id,
        "purpose": report.purpose,
        "remarks": report.remarks,
        "Created_by": report.Created_by,
        "Modified_by": report.Modified_by,
        "Created_at": report.Created_at,
        "details": []
    }
    
    # Get member name
    from app.Models.memberMaster_model import MemberMaster
    from sqlalchemy import select
    member_result = await db.execute(
        select(MemberMaster.Member_name)
        .filter(MemberMaster.Member_id == report.Member_id)
    )
    report_dict["member_name"] = member_result.scalar_one_or_none()
    
    # Process details
    if hasattr(report, 'details'):
        for detail in report.details:
            detail_dict = {
                "detail_id": detail.detail_id,
                "report_date": detail.report_date,
                "Report_id": detail.Report_id,
                "Doctor_and_Hospital_name": detail.Doctor_and_Hospital_name,
                "uploaded_file_report": detail.uploaded_file_report
            }
            
            # Get report name
            from app.Models.reposrMaster_model import ReportMaster
            report_name_result = await db.execute(
                select(ReportMaster.report_name)
                .filter(ReportMaster.Report_id == detail.Report_id)
            )
            detail_dict["report_name"] = report_name_result.scalar_one_or_none()
            
            # Add preview info if requested
            if include_preview and detail.uploaded_file_report:
                preview_info = get_file_preview_info(detail.uploaded_file_report)
                if preview_info:
                    detail_dict["file_preview"] = preview_info
            
            report_dict["details"].append(detail_dict)
    
    return report_dict


@router.put("/{report_id}")
async def update_report(
    report_id: int,
    purpose: str = Form(None),
    remarks: str = Form(None),
    Modified_by: str = Form(None),
    details_json: str = Form("[]"),
    db: AsyncSession = Depends(get_db)
):
    """Update report header and details"""
    try:
        # Parse details updates
        details_update = json.loads(details_json)
        
        # Prepare update data
        update_data = {}
        if purpose is not None:
            update_data["purpose"] = purpose
        if remarks is not None:
            update_data["remarks"] = remarks
        if Modified_by is not None:
            update_data["Modified_by"] = Modified_by
        
        # Update report
        updated_report = await update_member_report(
            db, 
            report_id, 
            update_data, 
            details_update
        )
        
        if not updated_report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return {
            "status": True,
            "message": "Report updated successfully",
            "data": {
                "MemberReport_id": updated_report.MemberReport_id
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/detail/{detail_id}/file")
async def update_detail_file(
    detail_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Update file for a specific detail"""
    try:
        # Get the detail
        from sqlalchemy import select
        result = await db.execute(
            select(MemberReportDetail)
            .filter(MemberReportDetail.detail_id == detail_id)
        )
        detail = result.scalar_one_or_none()
        
        if not detail:
            raise HTTPException(status_code=404, detail="Detail not found")
        
        # Delete old file if exists
        if detail.uploaded_file_report:
            delete_old_file(detail.uploaded_file_report)
        
        # Save new file
        if file and file.filename:
            filename = await save_detail_file(file, detail.MemberReport_id, detail.detail_id)
            detail.uploaded_file_report = filename
            await db.commit()
            await db.refresh(detail)
            
            return {
                "status": True,
                "message": "File updated successfully",
                "filename": filename
            }
        else:
            raise HTTPException(status_code=400, detail="No file provided")
            
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{report_id}")
async def remove_report(report_id: int, db: AsyncSession = Depends(get_db)):
    """Delete report and all its details"""
    deleted = await delete_member_report(db, report_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {
        "status": True, 
        "message": "Report deleted successfully"
    }


@router.delete("/detail/{detail_id}")
async def remove_detail(detail_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a single detail"""
    deleted = await delete_member_report_detail(db, detail_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Detail not found")
    
    return {
        "status": True, 
        "message": "Detail deleted successfully"
    }


# =============== FILE PREVIEW & VIEW APIs ===============

@router.get("/preview/{filename}")
async def preview_file(filename: str, download: bool = Query(False)):
    """Preview or download a file"""
    try:
        # Decode URL-encoded filename
        decoded_filename = urllib.parse.unquote(filename)
    except:
        decoded_filename = filename
    
    file_path = os.path.join(UPLOAD_FOLDER, decoded_filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail=f"File not found: {decoded_filename}"
        )
    
    # Get file info first
    file_preview = get_file_preview_info(decoded_filename)
    
    # If download flag is true, trigger download
    if download:
        return FileResponse(
            path=file_path,
            filename=decoded_filename,
            media_type="application/octet-stream",
            headers={
                'Content-Disposition': f'attachment; filename="{urllib.parse.quote(decoded_filename)}"'
            }
        )
    
    # For preview, return file info
    return JSONResponse(content={
        "status": True,
        "file": file_preview
    })


@router.get("/view/{filename:path}")
async def view_file_in_browser(filename: str):
    """View file directly in browser with inline disposition"""
    try:
        # Decode URL-encoded filename
        decoded_filename = urllib.parse.unquote(filename)
    except:
        decoded_filename = filename
    
    # Try multiple approaches to find the file
    file_path = None
    
    # Approach 1: Try with the decoded filename
    potential_path = os.path.join(UPLOAD_FOLDER, decoded_filename)
    if os.path.exists(potential_path):
        file_path = potential_path
    else:
        # Approach 2: Try to find the file by scanning directory
        if os.path.exists(UPLOAD_FOLDER):
            for file in os.listdir(UPLOAD_FOLDER):
                try:
                    decoded_file = urllib.parse.unquote(file)
                    if decoded_file == decoded_filename:
                        file_path = os.path.join(UPLOAD_FOLDER, file)
                        break
                except:
                    pass
    
    if not file_path or not os.path.exists(file_path):
        # Try one more approach: find any file that contains the base name
        if os.path.exists(UPLOAD_FOLDER):
            base_name = os.path.splitext(decoded_filename)[0]
            for file in os.listdir(UPLOAD_FOLDER):
                if base_name in file:
                    file_path = os.path.join(UPLOAD_FOLDER, file)
                    break
    
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=404, 
            detail=f"File not found. Searched for: {decoded_filename}"
        )
    
    # Get the actual filename from the path
    actual_filename = os.path.basename(file_path)
    
    # Get file extension
    _, ext = os.path.splitext(actual_filename)
    ext = ext.lower()
    
    # Define content types
    content_types = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.webp': 'image/webp',
        '.txt': 'text/plain',
        '.html': 'text/html',
        '.htm': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.xml': 'application/xml',
        '.csv': 'text/csv',
        '.svg': 'image/svg+xml',
    }
    
    media_type = content_types.get(ext, 'application/octet-stream')
    
    # Always set Content-Disposition to inline for browser viewing
    headers = {
        'Content-Disposition': f'inline; filename="{urllib.parse.quote(actual_filename)}"'
    }
    
    return FileResponse(
        path=file_path,
        filename=actual_filename,
        media_type=media_type,
        headers=headers
    )


@router.get("/download/{filename}")
async def download_file(filename: str):
    """Download a file"""
    try:
        # Decode URL-encoded filename
        decoded_filename = urllib.parse.unquote(filename)
    except:
        decoded_filename = filename
    
    file_path = os.path.join(UPLOAD_FOLDER, decoded_filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    # Get MIME type for proper download
    _, ext = os.path.splitext(decoded_filename)
    ext = ext.lower()
    media_type = get_mime_type(ext)
    
    return FileResponse(
        path=file_path,
        filename=decoded_filename,
        media_type=media_type,
        headers={
            'Content-Disposition': f'attachment; filename="{urllib.parse.quote(decoded_filename)}"'
        }
    )


# =============== UTILITY ENDPOINTS ===============

@router.get("/health/check")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "upload_folder": UPLOAD_FOLDER,
        "folder_exists": os.path.exists(UPLOAD_FOLDER),
        "files_count": len(os.listdir(UPLOAD_FOLDER)) if os.path.exists(UPLOAD_FOLDER) else 0
    }


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


# =============== BULK OPERATIONS ===============

@router.post("/batch-upload")
async def batch_upload_reports(
    reports_json: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload multiple reports in batch"""
    try:
        reports_data = json.loads(reports_json)
        results = []
        
        for report_data in reports_data:
            try:
                # Extract details
                details_data = report_data.pop("details", [])
                
                # Create report
                report = await create_member_report_with_details(db, report_data, details_data)
                
                results.append({
                    "status": "success",
                    "MemberReport_id": report.MemberReport_id,
                    "doc_No": report.doc_No
                })
                
            except Exception as e:
                results.append({
                    "status": "error",
                    "error": str(e),
                    "data": report_data
                })
        
        return {
            "status": True,
            "message": "Batch upload completed",
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))