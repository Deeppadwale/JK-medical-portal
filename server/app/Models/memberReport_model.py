from sqlalchemy import Column, Integer, ForeignKey, Date
from sqlalchemy.dialects.mssql import NVARCHAR
from datetime import date
from app.Models.database import Base


class MemberReport(Base):
    __tablename__ = "MemberReport"

    MemberReport_id = Column(Integer, primary_key=True, autoincrement=True)
    doc_No = Column(Integer, nullable=False)
    Member_id = Column(Integer, ForeignKey("MemberMaster.Member_id"), nullable=False)
    Report_id = Column(Integer, ForeignKey("ReportMaster.Report_id"), nullable=False)
    purpose = Column(NVARCHAR(200), nullable=False)
    remarks = Column(NVARCHAR(500), nullable=True)
    Created_by = Column(NVARCHAR(50), nullable=False)
    Modified_by = Column(NVARCHAR(50), nullable=True)
    uploaded_file_report_first = Column(NVARCHAR(200), nullable=True)
    uploaded_file_report_second = Column(NVARCHAR(200), nullable=True)
    uploaded_file_report_third = Column(NVARCHAR(200), nullable=True)
    Created_at = Column(Date, nullable=False, default=date.today)
