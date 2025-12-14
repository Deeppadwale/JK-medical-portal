from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class OTPVerification(Base):
    __tablename__ = "Eve_otp_verification"

    id = Column(Integer, primary_key=True, autoincrement=True)
    Family_id = Column(Integer, ForeignKey("FamilyMaster.Family_id"), nullable=False)
    mobile = Column(String(20), nullable=False)
    otp_code = Column(String(255), nullable=False)
    expiry = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("FamilyMaster")
