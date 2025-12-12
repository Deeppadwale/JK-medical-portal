from pydantic import BaseModel
from typing import Optional


class MemberReportBase(BaseModel):
    Member_id: Optional[int] = None
    Report_id: Optional[int] = None
    purpose: Optional[str] = None
    remarks: Optional[str] = None
    Created_by: Optional[str] = None
    Modified_by: Optional[str] = None
    uploaded_file_report_first: Optional[str] = None
    uploaded_file_report_second: Optional[str] = None
    uploaded_file_report_third: Optional[str] = None


class MemberReportResponse(MemberReportBase):
    MemberReport_id: int
    doc_No: int

    class Config:
        orm_mode = True
