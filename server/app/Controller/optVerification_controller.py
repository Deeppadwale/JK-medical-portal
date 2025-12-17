
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.Models.database import get_db
from app.Schemas.otpVerification_shemas import OTPCreateRequest, OTPVerifyRequest
from app.Services.otpVerification import send_otp_service, verify_otp_service

router = APIRouter(prefix="/otp", tags=["OTP Verification"])

@router.post("/send")
async def send_otp(request: OTPCreateRequest, db: AsyncSession = Depends(get_db)):
    success = await send_otp_service(db, request.mobile)
    if not success:
        raise HTTPException(status_code=404, detail="Mobile not registered")
    return {"message": "OTP sent via WhatsApp"}

@router.post("/verify")
async def verify_otp(request: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    verified, family_id = await verify_otp_service(db, request.mobile, request.otp_code)
    if not verified:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    return {"message": "OTP verified successfully", "Family_id": family_id}
