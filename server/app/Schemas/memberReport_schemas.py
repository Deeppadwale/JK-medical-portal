# from pydantic import BaseModel
# from typing import Optional


# class MemberReportBase(BaseModel):
#     Member_id: Optional[int] = None
#     Report_id: Optional[int] = None
#     purpose: Optional[str] = None
#     remarks: Optional[str] = None
#     Created_by: Optional[str] = None
#     Modified_by: Optional[str] = None
#     uploaded_file_report_first: Optional[str] = None
#     uploaded_file_report_second: Optional[str] = None
#     uploaded_file_report_third: Optional[str] = None


# class MemberReportResponse(MemberReportBase):
#     MemberReport_id: int
#     doc_No: int

#     class Config:
#         orm_mode = True



from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class MemberReportDetailBase(BaseModel):
    report_date: date
    Report_id: int
    Doctor_and_Hospital_name: Optional[str] = None
    uploaded_file_report: Optional[str] = None


class MemberReportDetailResponse(MemberReportDetailBase):
    detail_id: int
    MemberReport_id: int

    class Config:
        orm_mode = True


class MemberReportBase(BaseModel):
    Member_id: int
    Family_id: int 
    purpose: str
    remarks: Optional[str] = None
    Created_by: str
    Modified_by: Optional[str] = None


class MemberReportCreate(MemberReportBase):
    details: List[MemberReportDetailBase] = []


class MemberReportResponse(MemberReportBase):
    MemberReport_id: int
    Family_id: int
    doc_No: int
    Created_at: date
    details: List[MemberReportDetailResponse] = []

    class Config:
        orm_mode = True