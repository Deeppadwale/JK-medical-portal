from sqlalchemy import Column, Integer, ForeignKey, Date, String
from sqlalchemy.orm import relationship
from datetime import date
from app.Models.database import Base

class MemberReport(Base):
    __tablename__ = "member_report"
    MemberReport_id = Column(Integer, primary_key=True)
    doc_No = Column(Integer, nullable=False)
    Member_id = Column(Integer, ForeignKey("MemberMaster.Member_id"), nullable=False)
    Family_id = Column(Integer, nullable=False)
    purpose = Column(String(200), nullable=False)
    remarks = Column(String(500))
    Created_by = Column(String(50), nullable=False)
    Modified_by = Column(String(50))
    Created_at = Column(Date, default=date.today)
    details = relationship(
        "MemberReportDetail",
        back_populates="report",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
class MemberReportDetail(Base):
    __tablename__ = "member_report_detail"
    detail_id = Column(Integer, primary_key=True)
    MemberReport_id = Column(Integer, ForeignKey("member_report.MemberReport_id"))
    report_date = Column(Date, nullable=False)
    Report_id = Column(Integer, ForeignKey("ReportMaster.Report_id"), nullable=False)
    Doctor_and_Hospital_name = Column(String(500))
    uploaded_file_report = Column(String(200))
    report = relationship("MemberReport", back_populates="details")
