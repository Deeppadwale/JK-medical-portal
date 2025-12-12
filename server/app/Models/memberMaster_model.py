from sqlalchemy import Column, Integer, Date
from sqlalchemy.dialects.mssql import NVARCHAR
from app.Models.database import Base


class MemberMaster(Base):
    __tablename__ = "MemberMaster"

    Member_id = Column(Integer, primary_key=True, autoincrement=True)
    doc_No = Column(Integer, nullable=False)
    Member_name = Column(NVARCHAR(100), nullable=False)
    Member_address = Column(NVARCHAR(100), nullable=False)
    Mobile_no = Column(NVARCHAR(100), nullable=False)
    other_details = Column(NVARCHAR(500), nullable=True)
    Created_by = Column(NVARCHAR(50), nullable=False)
    Modified_by = Column(NVARCHAR(50), nullable=True)
    Created_at = Column(Date, nullable=False)
