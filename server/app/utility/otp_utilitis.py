import random
from datetime import datetime, timedelta
from passlib.context import CryptContext
import os

# Twilio Credentials
TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE = os.getenv("TWILIO_PHONE")

# Hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DEBUG = True  # Set True to print OTP instead of sending SMS

def generate_otp(length: int = 6) -> str:
    return str(random.randint(10**(length-1), 10**length - 1))

def build_otp_expiry(minutes: int = 1) -> datetime:
    return datetime.utcnow() + timedelta(minutes=minutes)

def hash_otp(otp: str) -> str:
    return pwd_context.hash(otp)

def verify_otp_hash(plain_otp: str, hashed_otp: str) -> bool:
    return pwd_context.verify(plain_otp, hashed_otp)

def send_otp_sms(mobile: str, otp: str):
    if DEBUG:
        print(f"[DEBUG] OTP for {mobile}: {otp}")
        return

    if not TWILIO_SID or not TWILIO_AUTH_TOKEN or not TWILIO_PHONE:
        print("[ERROR] Twilio credentials missing")
        return

    from twilio.rest import Client
    client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)
    client.messages.create(
        body=f"Your OTP is {otp}. It will expire in 1 minute.",
        from_=TWILIO_PHONE,
        to=mobile
    )


# Example test
# otp = generate_otp()
# hashed = hash_otp(otp)
# print("Generated OTP:", otp)
# print("Stored Hashed OTP:", hashed)
# print("Verify OTP:", verify_otp_hash(otp, hashed))
