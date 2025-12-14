from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime

from app.Models.otpVerification_model import OTPVerification
from app.Models.familyMaster_model import FamilyMaster
from app.utility.otp_utilitis import (
    generate_otp,
    build_otp_expiry,
    send_otp_sms,
    hash_otp,
    verify_otp_hash
)


def normalize_mobile(mobile: str) -> str:
    """Keep last 10 digits"""
    return mobile[-10:]


# =========================
# Send OTP
# =========================
async def send_otp_service(db: AsyncSession, mobile: str) -> bool:
    mobile_norm = normalize_mobile(mobile)

    # Check if mobile exists
    result = await db.execute(
        select(FamilyMaster)
        .filter(FamilyMaster.Mobile.like(f"%{mobile_norm}"))
    )
    user = result.scalars().first()

    if not user:
        return False

    # Generate OTP
    otp = generate_otp()
    expiry = build_otp_expiry(1)

    # Save OTP
    otp_entry = OTPVerification(
        Family_id=user.Family_id,
        mobile=mobile_norm,
        otp_code=hash_otp(otp),
        expiry=expiry
    )

    db.add(otp_entry)
    await db.commit()

    # Send OTP
    send_otp_sms(mobile_norm, otp)
    return True


# =========================
# Verify OTP
# =========================
async def verify_otp(db: AsyncSession, mobile: str, otp_code: str) -> int:
    result = await db.execute(
        select(OTPVerification)
        .filter(OTPVerification.mobile == mobile, OTPVerification.is_verified == False)
        .order_by(OTPVerification.created_at.desc())
    )
    otp_entry = result.scalars().first()
    if not otp_entry:
        return False, None

    # Expiry & attempts check
    if datetime.utcnow() > otp_entry.expiry or otp_entry.attempts >= 5:
        return False, None

    if not verify_otp_hash(otp_code, otp_entry.otp_code):
        otp_entry.attempts += 1
        await db.commit()
        return False, None

    otp_entry.is_verified = True
    await db.commit()
    return True, otp_entry.Family_id

