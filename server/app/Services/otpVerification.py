

# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.future import select
# from datetime import datetime

# from app.Models.otpVerification_model import OTPVerification
# from app.Models.familyMaster_model import FamilyMaster
# from app.utility.otp_utilitis_twilio import (
#     generate_otp,
#     build_otp_expiry,
#     hash_otp,
#     verify_otp_hash
# )
# from app.utility.otp_utility_waba import send_whatsapp_otp


# def normalize_mobile(mobile: str) -> str:
#     return mobile[-10:]


# def normalize_whatsapp_mobile(mobile: str) -> str:
#     if not mobile.startswith("+"):
#         return "+91" + mobile
#     return mobile


# # SEND OTP
# async def send_otp_service(db: AsyncSession, mobile: str) -> bool:
#     mobile_norm = normalize_mobile(mobile)

#     result = await db.execute(
#         select(FamilyMaster).filter(
#             FamilyMaster.Mobile.like(f"%{mobile_norm}")
#         )
#     )
#     user = result.scalars().first()
#     if not user:
#         return False

#     otp = generate_otp()
#     expiry = build_otp_expiry(1)

#     entry = OTPVerification(
#         Family_id=user.Family_id,
#         mobile=mobile_norm,
#         otp_code=hash_otp(otp),
#         expiry=expiry
#     )

#     db.add(entry)
#     await db.commit()

#     whatsapp_mobile = normalize_whatsapp_mobile(mobile_norm)
#     send_whatsapp_otp(whatsapp_mobile, otp)

#     return True


# # VERIFY OTP
# async def verify_otp_service(db: AsyncSession, mobile: str, otp_code: str):
#     mobile_norm = normalize_mobile(mobile)

#     result = await db.execute(
#         select(OTPVerification)
#         .filter(
#             OTPVerification.mobile == mobile_norm,
#             OTPVerification.is_verified == False
#         )
#         .order_by(OTPVerification.created_at.desc())
#     )

#     entry = result.scalars().first()
#     if not entry:
#         return False, None

#     if datetime.utcnow() > entry.expiry or entry.attempts >= 5:
#         return False, None

#     if not verify_otp_hash(otp_code, entry.otp_code):
#         entry.attempts += 1
#         await db.commit()
#         return False, None

#     entry.is_verified = True
#     await db.commit()

#     return True, entry.Family_id



from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from app.Models.otpVerification_model import OTPVerification
from app.Models.FamilyMasterMain_model import FamilyMasterMain
from app.utility.otp_utilitis_twilio import generate_otp, build_otp_expiry, hash_otp, verify_otp_hash
from app.utility.otp_utility_waba import send_whatsapp_otp

# ----------------------
# Helpers
# ----------------------
def normalize_mobile(mobile: str) -> str:
    return mobile[-10:]

def normalize_whatsapp_mobile(mobile: str) -> str:
    if not mobile.startswith("+"):
        return "+91" + mobile
    return mobile

def split_mobiles(mobile_str: str) -> list[str]:
    return [normalize_mobile(m.strip()) for m in mobile_str.split(",") if m.strip()]

# ----------------------
# Send OTP
# ----------------------
async def send_otp_service(db: AsyncSession, mobile: str) -> bool:
    mobile_norm = normalize_mobile(mobile)

    result = await db.execute(select(FamilyMasterMain))
    families = result.scalars().all()

    user = None
    for family in families:
        mobiles = split_mobiles(family.Mobile or "")
        if mobile_norm in mobiles:
            user = family
            break

    if not user:
        return False

    otp = generate_otp()
    expiry = build_otp_expiry(1)

    entry = OTPVerification(
        Family_id=user.Family_id,
        mobile=mobile_norm,
        otp_code=hash_otp(otp),
        expiry=expiry
    )

    db.add(entry)
    await db.commit()

    whatsapp_mobile = normalize_whatsapp_mobile(mobile_norm)
    send_whatsapp_otp(whatsapp_mobile, otp)

    return True

# ----------------------
# Verify OTP
# ----------------------
async def verify_otp_service(db: AsyncSession, mobile: str, otp_code: str):
    mobile_norm = normalize_mobile(mobile)

    result = await db.execute(
        select(OTPVerification)
        .filter(
            OTPVerification.mobile == mobile_norm,
            OTPVerification.is_verified == False
        )
        .order_by(OTPVerification.created_at.desc())
    )

    entry = result.scalars().first()
    if not entry:
        return False, None

    if datetime.utcnow() > entry.expiry or entry.attempts >= 5:
        return False, None

    if not verify_otp_hash(otp_code, entry.otp_code):
        entry.attempts += 1
        await db.commit()
        return False, None

    entry.is_verified = True
    await db.commit()

    return True, entry.Family_id
