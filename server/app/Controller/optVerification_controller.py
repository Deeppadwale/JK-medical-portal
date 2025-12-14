from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.Models.database import get_db
from app.Schemas.otpVerification_shemas import (
    OTPCreateRequest,
    OTPVerifyRequest,
    OTPResponse
)
from app.Services.otpVerification import (
    send_otp_service,
    verify_otp
)

router = APIRouter(
    prefix="/otp",
    tags=["OTP Verification"]
)

# =========================
# Send OTP
# =========================
@router.post("/send", response_model=OTPResponse)
async def send_otp(
    request: OTPCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    success = await send_otp_service(db, request.mobile)

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Mobile number not registered"
        )

    return {"message": "OTP sent successfully"}


# =========================
# Verify OTP
# =========================
# @router.post("/verify", response_model=OTPResponse)
# async def verify_otp(
#     request: OTPVerifyRequest,
#     db: AsyncSession = Depends(get_db)
# ):
#     verified = await verify_otp_service(
#         db,
#         request.mobile,
#         request.otp_code
#     )

#     if not verified:
#         raise HTTPException(
#             status_code=400,
#             detail="Invalid or expired OTP"
#         )

#     return {"message": "OTP verified successfully"}
# in verify_otp_endpoint




@router.post("/verify")
async def verify_otp_endpoint(request: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    verified, family_id = await verify_otp(db, request.mobile, request.otp_code)
    if not verified:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    return {"message": "OTP verified successfully", "Family_id": family_id}