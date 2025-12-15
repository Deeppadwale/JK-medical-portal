// import React, { useState, useEffect } from 'react';
// import { useSendOtpMutation, useVerifyOtpMutation } from '../services/otp_verificationApi';
// import { useNavigate } from 'react-router-dom';

// const OtpVerification = () => {
//   const navigate = useNavigate();

//   const [mobile, setMobile] = useState('');
//   const [otp, setOtp] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [timer, setTimer] = useState(0);

//   const [sendOtp, { isLoading: sending }] = useSendOtpMutation();
//   const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();

//   // Countdown
//   useEffect(() => {
//     if (timer <= 0) return;
//     const interval = setInterval(() => setTimer(t => t - 1), 1000);
//     return () => clearInterval(interval);
//   }, [timer]);

//   // Accept 10-digit or +91XXXXXXXXXX
//   const normalizeMobile = (num) => num.replace(/\D/g, '').slice(-10);

//   const isValidMobile = (num) => normalizeMobile(num).length === 10;

//   // =========================
//   // Send OTP
//   // =========================
//   const handleSendOtp = async () => {
//     if (!isValidMobile(mobile)) {
//       return alert("Enter a valid 10-digit mobile number");
//     }

//     try {
//       await sendOtp({
//         mobile: normalizeMobile(mobile),
//       }).unwrap();

//       setOtpSent(true);
//       setTimer(60);
//       alert("OTP sent successfully");
//     } catch (err) {
//       console.error(err);
//       alert(err?.data?.detail || "Failed to send OTP");
//     }
//   };

//   // =========================
//   // Verify OTP
//   // =========================
//   const handleVerifyOtp = async () => {
//     if (!otp) return alert("Enter OTP");

//     try {
//       const res = await verifyOtp({
//         mobile: normalizeMobile(mobile),
//         otp_code: otp,
//       }).unwrap();

//       alert(res.message);
//       navigate('/dashboard');
//     } catch (err) {
//       console.error(err);
//       alert(err?.data?.detail || "OTP verification failed");
//     }
//   };

//   return (
//     <div style={{
//       maxWidth: '420px',
//       margin: '150px auto',
//       padding: '30px',
//       borderRadius: '12px',
//       boxShadow: '0 8px 25px rgba(230, 28, 28, 1)',
//       background: '#fff'
//     }}>
//       <h2 style={{ textAlign: 'center', marginBottom: '25px' }}>
//         OTP Verification
//       </h2>

//       <input
//         type="text"
//         value={mobile}
//         onChange={e => setMobile(e.target.value)}
//         placeholder="Enter mobile number"
//         style={{
//           width: '100%',
//           padding: '12px',
//           borderRadius: '8px',
//           marginBottom: '20px',
//           border: '1px solid #ccc'
//         }}
//       />

//       <button
//         onClick={handleSendOtp}
//         disabled={sending}
//         style={{
//           width: '100%',
//           padding: '12px',
//           borderRadius: '8px',
//           background: '#007BFF',
//           color: '#fff',
//           border: 'none',
//           marginBottom: '20px'
//         }}
//       >
//         {sending ? "Sending..." : "Send OTP"}
//       </button>

//       {otpSent && (
//         <>
//           <input
//             type="text"
//             value={otp}
//             onChange={e => setOtp(e.target.value)}
//             placeholder="Enter OTP"
//             style={{
//               width: '100%',
//               padding: '12px',
//               borderRadius: '8px',
//               marginBottom: '20px',
//               border: '1px solid #ccc'
//             }}
//           />

//           <button
//             onClick={handleVerifyOtp}
//             disabled={verifying}
//             style={{
//               width: '100%',
//               padding: '12px',
//               borderRadius: '8px',
//               background: '#28a745',
//               color: '#fff',
//               border: 'none',
//               marginBottom: '15px'
//             }}
//           >
//             {verifying ? "Verifying..." : "Verify OTP"}
//           </button>

//           <div style={{ textAlign: 'center' }}>
//             {timer > 0 ? (
//               <span>OTP expires in <strong>{timer}s</strong></span>
//             ) : (
//               <button
//                 onClick={handleSendOtp}
//                 style={{
//                   background: 'transparent',
//                   color: '#dc3545',
//                   border: '1px solid #dc3545',
//                   padding: '6px 14px',
//                   borderRadius: '6px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 Resend OTP
//               </button>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default OtpVerification;
