import os
import shutil
from uuid import uuid4
from fastapi import UploadFile

UPLOAD_DIR = "upload/medical_report"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_file(file: UploadFile | None):
    if not file:
        return None

    ext = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, unique_name)

    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    return unique_name   # ✅ STORE UUID NAME ONLY

def get_file_path(filename: str) -> str:
    path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError
    return path
