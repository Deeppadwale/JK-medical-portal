import React, { useState, useEffect } from 'react';
import { useSendOtpMutation, useVerifyOtpMutation } from '../services/otp_verificationApi';
import { decryptData } from '../common/Functions/DecryptData';
import { useNavigate } from 'react-router-dom';

const OtpVerification = () => {
  const navigate = useNavigate();

  const userData = sessionStorage.getItem('user_data')
    ? decryptData(sessionStorage.getItem('user_data'))
    : null;

  const uid = userData?.uid ? Number(userData.uid) : null;
  const initialMobile = userData?.Mobile || "";

  const [mobile, setMobile] = useState(initialMobile);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  const [sendOtp, { isLoading: sending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();

  // Countdown effect
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const isValidMobile = (num) => /^\+\d{1,3}\d{6,14}$/.test(num);

  const handleSendOtp = async () => {
    if (!uid) return alert("User ID not found!");
    if (!isValidMobile(mobile)) return alert("Enter a valid mobile number with country code (e.g., +919876543210)");

    try {
      console.log("Payload to send OTP:", { uid, mobile });
      await sendOtp({ uid, mobile }).unwrap();
      setOtpSent(true);
      setTimer(60); 
      alert("OTP sent successfully!");
    } catch (err) {
      console.error("Send OTP error:", err);
      alert(err?.data?.detail || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return alert("Enter OTP!");
    try {
      console.log("Payload to verify OTP:", { uid, otp_code: otp });
      const res = await verifyOtp({ uid, otp_code: otp }).unwrap();
      alert(res.message);
      navigate("/dashboard"); 
    } catch (err) {
      console.error("Verify OTP error:", err);
      if (err?.data?.detail) {
        const messages = Array.isArray(err.data.detail)
          ? err.data.detail.map(d => d.msg || JSON.stringify(d)).join("\n")
          : err.data.detail;
        alert(messages);
      } else {
        alert("OTP verification failed");
      }
    }
  };

  const formatTime = (sec) => {
    return sec.toString().padStart(2, '0');
  };

  return (
    <div style={{
      maxWidth: '420px',
      margin: '200px auto',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      background: '#fff',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif'"
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>OTP Verification</h2>

      <input
        type="text"
        value={mobile}
        onChange={e => setMobile(e.target.value)}
        placeholder="+91XXXXXXXXXX"
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ccc',
          fontSize: '16px'
        }}
        readOnly={!!initialMobile}
      />

      <button
        onClick={handleSendOtp}
        disabled={sending || !mobile}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#007BFF',
          color: '#fff',
          marginBottom: '20px',
          cursor: 'pointer'
        }}
      >
        {sending ? "Sending..." : "Send OTP"}
      </button>

      {otpSent && (
        <>
          <input
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            placeholder="Enter OTP"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #ccc',
              fontSize: '16px'
            }}
          />

          <button
            onClick={handleVerifyOtp}
            disabled={verifying || !otp}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#28a745',
              color: '#fff',
              marginBottom: '15px',
              cursor: 'pointer'
            }}
          >
            {verifying ? "Verifying..." : "Verify OTP"}
          </button>

          <div style={{ textAlign: 'center', color: '#6660' }}>
            {timer > 0 ? (
              <span>OTP expires in: <strong>{formatTime(timer)}s</strong></span>
            ) : (
              <button
                onClick={handleSendOtp}

                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ff0000ff',
                  background: '#ffffffff',
                  color: '#ec0505ff',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Resend OTP ?
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OtpVerification;
