// import React, { useState, useEffect } from 'react';
// import { motion, useAnimation } from 'framer-motion';
// import logo from '../../assets/user.png';
// import { useNavigate } from "react-router-dom";
// import { useLoginMutation } from '../../services/userMasterApi';
// import CryptoJS from 'crypto-js';

// const ENCRYPTION_KEY = import.meta.env.VITE_REACT_APP_API_ENCRYPTION_KEY;

// const encryptData = (data) => {
//   const jsonString = JSON.stringify(data);
//   const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
//   return encrypted;
// };

// function LoginPage() {
//   const navigate = useNavigate();
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false); // 👁️ Toggle state
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [login] = useLoginMutation();
//   const controls = useAnimation();

//   useEffect(() => {
//     controls.start({
//       backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
//       transition: { duration: 15, repeat: Infinity, ease: 'linear' },
//     });
//   }, [controls]);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     try {
//       const response = await login({
//         User_Name: username.trim(),
//         User_Password: password.trim(),
//       }).unwrap();

//       const userData = {
//         user_type: response.user_type,
//         user_name: response.user_name,
//         uid: response.uid,
//         user_id: response.user_id,
//       };

//       const encryptedData = encryptData(userData);
//       sessionStorage.setItem('user_data', encryptedData);
//       sessionStorage.setItem('access_token', encryptData(response.access_token));
//       sessionStorage.setItem('user_id', response.user_id);

//       navigate('/app/dashboard');
//     } catch (err) {
//       console.error('Login failed:', err);
//       setError(err.data?.detail || 'Login failed. Please check your credentials.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <motion.div
//       className="relative flex items-center justify-center min-h-screen overflow-hidden"
//       animate={controls}
//       style={{
//         background: 'linear-gradient(-45deg, #000000, #020d2b, #001F3F, #0b0033)',
//         backgroundSize: '400% 400%',
//       }}
//     >
//       {/* Glowing Orbs Background */}
//       {[...Array(6)].map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute rounded-full blur-3xl opacity-40"
//           style={{
//             background: i % 2 === 0 ? '#00FFFF' : '#7B2FF7',
//             width: Math.random() * 150 + 100,
//             height: Math.random() * 150 + 100,
//             top: `${Math.random() * 100}%`,
//             left: `${Math.random() * 100}%`,
//           }}
//           animate={{
//             x: [0, 50 * (i % 2 === 0 ? 1 : -1), 0],
//             y: [0, 30 * (i % 2 === 0 ? -1 : 1), 0],
//           }}
//           transition={{
//             duration: 8 + i,
//             repeat: Infinity,
//             ease: 'easeInOut',
//           }}
//         />
//       ))}

//       {/* Glass Card */}
//       <motion.div
//         className="relative z-10 w-full max-w-md p-8 rounded-3xl shadow-[0_0_25px_rgba(0,255,255,0.3)] backdrop-blur-xl border border-cyan-400/30"
//         initial={{ y: 60, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 1 }}
//         style={{
//           background: 'linear-gradient(135deg, rgba(20,20,30,0.7), rgba(0,0,40,0.4))',
//         }}
//       >
//         {/* Logo */}
//         <motion.div
//           className="flex justify-center mb-6"
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           transition={{ type: 'spring', stiffness: 100 }}
//         >
//           <motion.img
//             src={logo}
//             alt="Logo"
//             className="w-24 h-24 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.4)]"
//             whileHover={{ rotate: 10, scale: 1.1 }}
//           />
//         </motion.div>

//         <h2 className="text-3xl font-bold text-center text-cyan-300 mb-2">
//           System Access
//         </h2>
//         <p className="text-center text-gray-400 mb-6">
//           Enter credentials to continue
//         </p>

//         {/* Error message */}
//         {error && (
//           <motion.div
//             className="mb-4 p-3 bg-red-900/40 text-red-400 border border-red-600 rounded-md text-sm text-center"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//           >
//             {error}
//           </motion.div>
//         )}

//         {/* Login Form */}
//         <form onSubmit={handleLogin} className="space-y-5">
//           {/* Username */}
//           <motion.div whileHover={{ scale: 1.02 }}>
//             <label
//               htmlFor="username"
//               className="block text-sm text-gray-300 font-medium mb-1"
//             >
//               Username
//             </label>
//             <input
//               type="text"
//               id="username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="w-full bg-transparent text-cyan-100 px-4 py-2 border border-cyan-500/40 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-500"
//               placeholder="Enter username"
//               required
//             />
//           </motion.div>

//           {/* Password + Eye Toggle */}
//           <motion.div whileHover={{ scale: 1.02 }} className="relative">
//             <label
//               htmlFor="password"
//               className="block text-sm text-gray-300 font-medium mb-1"
//             >
//               Password
//             </label>

//             <input
//               type={showPassword ? 'text' : 'password'}
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full bg-transparent text-cyan-100 px-4 py-2 pr-12 border border-cyan-500/40 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-500"
//               placeholder="••••••••"
//               required
//             />

//             {/* Eye Button */}
//             <motion.button
//               type="button"
//               onClick={() => setShowPassword((prev) => !prev)}
//               whileTap={{ scale: 0.9 }}
//               className="absolute inset-y-0 right-3 flex items-center justify-center text-cyan-400 hover:text-cyan-200"
//               aria-label={showPassword ? 'Hide password' : 'Show password'}
//             >
//               {showPassword ? (
//                 // Eye-off icon
//                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
//                   strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58a3 3 0 104.24 4.24M9.88 9.88C8.59 11.17 7.75 12.92 7.75 15c0 3.5 3.13 6.5 4.75 7.5C14.87 21.5 18 18.5 18 15c0-1.96-.65-3.72-1.73-5.12" />
//                 </svg>
//               ) : (
//                 // Eye icon
//                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
//                   strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                   <circle cx="12" cy="12" r="3" />
//                 </svg>
//               )}
//             </motion.button>
//           </motion.div>

//           {/* Login Button */}
//           <motion.button
//             type="submit"
//             disabled={isLoading}
//             whileHover={{ scale: 1.05, boxShadow: '0px 0px 20px rgba(0,255,255,0.5)' }}
//             whileTap={{ scale: 0.95 }}
//             className="w-full py-3 text-lg font-semibold text-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 rounded-md hover:from-cyan-300 hover:to-purple-400 transition-all"
//           >
//             {isLoading ? (
//               <div className="flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
//                 Logging in...
//               </div>
//             ) : (
//               'Access System'
//             )}
//           </motion.button>
//         </form>

//         <p className="text-center text-sm text-gray-500 mt-6">
//           © 2025 | Secure Access Portal
//         </p>
//       </motion.div>
//     </motion.div>
//   );
// }

// export default LoginPage;


// // 

// import React, { useState, useEffect } from "react";
// import { motion, useAnimation } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { useLoginMutation } from "../../services/userMasterApi";
// import logo from "../../assets/jklogo.png";

// function LoginPage() {
//   const navigate = useNavigate();
//   const [login] = useLoginMutation();
//   const controls = useAnimation();

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   // 🌈 Background animation
//   useEffect(() => {
//     controls.start({
//       backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
//       transition: { duration: 18, repeat: Infinity, ease: "linear" },
//     });
//   }, [controls]);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setIsLoading(true);

//     try {
//       await login({
//         User_Name: username.trim(),
//         User_Password: password.trim(),
//       }).unwrap();

//       // ✅ Redirect on success
//       navigate("/app/memberMaster");
//     } catch (err) {
//       console.error("Login failed:", err);
//       setError(err.data?.detail || "Login failed. Please check credentials.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <motion.div
//       className="relative flex items-center justify-center min-h-screen overflow-hidden"
//       animate={controls}
//       style={{
//         background:
//           "linear-gradient(-45deg, #000000, #020d2b, #c8d1daff, #bab8c0ff)",
//         backgroundSize: "400% 400%",
//       }}
//     >
//       {/* 🌌 Floating Neon Orbs */}
//       {[...Array(6)].map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute rounded-full blur-3xl opacity-30"
//           style={{
//             background: i % 2 === 0 ? "#00FFFF" : "#8B5CF6",
//             width: Math.random() * 150 + 100,
//             height: Math.random() * 150 + 100,
//             top: `${Math.random() * 100}%`,
//             left: `${Math.random() * 100}%`,
//           }}
//           animate={{
//             x: [0, 50 * (i % 2 === 0 ? 1 : -1), 0],
//             y: [0, 40 * (i % 2 === 0 ? -1 : 1), 0],
//           }}
//           transition={{
//             duration: 9 + i,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />
//       ))}

//       {/* 💎 Glass Card */}
//       <motion.div
//         className="relative z-10 w-full max-w-md p-8 rounded-3xl shadow-[0_0_25px_rgba(0,255,255,0.3)] backdrop-blur-xl border border-cyan-400/30"
//         initial={{ y: 60, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 1 }}
//         style={{
//           background:
//             "linear-gradient(135deg, rgba(20,20,30,0.75), rgba(0,0,40,0.5))",
//         }}
//       >
//         {/* 🧑‍💼 Logo */}
//         <motion.div
//           className="flex justify-center mb-6"
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           transition={{ type: "spring", stiffness: 100 }}
//         >
//           <motion.img
//             src={logo}
//             alt="Logo"
//             className="w-24 h-24 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.4)]"
//             whileHover={{ rotate: 10, scale: 1.1 }}
//           />
//         </motion.div>

     
//         <p className="text-center text-gray-400 mb-6">
//           Please enter your credentials
//         </p>

//         {/* 🔔 Error Message */}
//         {error && (
//           <motion.div
//             className="mb-4 p-3 bg-red-900/40 text-red-400 border border-red-600 rounded-md text-sm text-center"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//           >
//             {error}
//           </motion.div>
//         )}

//         {/* 🔐 Login Form */}
//         <form onSubmit={handleLogin} className="space-y-5">
//           {/* Username */}
//           <motion.div whileHover={{ scale: 1.02 }}>
//             <label
//               htmlFor="username"
//               className="block text-sm text-gray-300 font-medium mb-1"
//             >
//               Username
//             </label>
//             <input
//               type="text"
//               id="username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="w-full bg-transparent text-cyan-100 px-4 py-2 border border-cyan-500/40 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-500"
//               placeholder="Enter username"
//               required
//             />
//           </motion.div>

//           {/* Password */}
//           <motion.div whileHover={{ scale: 1.02 }} className="relative">
//             <label
//               htmlFor="password"
//               className="block text-sm text-gray-300 font-medium mb-1"
//             >
//               Password
//             </label>
//             <input
//               type={showPassword ? "text" : "password"}
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full bg-transparent text-cyan-100 px-4 py-2 pr-12 border border-cyan-500/40 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-500"
//               placeholder="••••••••"
//               required
//             />
//             <motion.button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               whileTap={{ scale: 0.9 }}
//               className="absolute inset-y-0 right-3 flex items-center justify-center text-cyan-400 hover:text-cyan-200"
//             >
//               {showPassword ? "🙈" : "👁️"}
//             </motion.button>
//           </motion.div>

//           {/* Login Button */}
//           <motion.button
//             type="submit"
//             disabled={isLoading}
//             whileHover={{
//               scale: 1.05,
//               boxShadow: "0px 0px 20px rgba(0,255,255,0.5)",
//             }}
//             whileTap={{ scale: 0.95 }}
//             className="w-full py-3 text-lg font-semibold text-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 rounded-md hover:from-cyan-300 hover:to-purple-400 transition-all"
//           >
//             {isLoading ? (
//               <div className="flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
//                 Logging in...
//               </div>
//             ) : (
//               "Access System"
//             )}
//           </motion.button>
//         </form>

//         <p className="text-center text-sm text-gray-500 mt-6">
//           © 2025 | Secure Access Portal
//         </p>
//       </motion.div>
//     </motion.div>
//   );
// }

// export default LoginPage;


import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  useSendOtpMutation,
  useVerifyOtpMutation
} from "../../services/otpVerification";
import logo from "../../assets/pulse.png";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

function OtpLoginPage() {
  const navigate = useNavigate();
  const controls = useAnimation();

  // ---------------- STATE ----------------
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showBackToOtp, setShowBackToOtp] = useState(false);

  const inputRefs = useRef([]);

  // API hooks
  const [sendOtp, { isLoading: sending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();

  // ---------------- BACKGROUND ANIMATION ----------------
  useEffect(() => {
    controls.start({
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      transition: { duration: 15, repeat: Infinity, ease: "linear" }
    });
  }, [controls]);

  // ---------------- TIMER ----------------
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // ---------------- HELPERS ----------------
  const normalizeMobile = num => num.replace(/\D/g, "").slice(-10);
  const isValidMobile = num => normalizeMobile(num).length === 10;

  // ---------------- SEND OTP ----------------
  const handleSendOtp = async () => {
    if (!isValidMobile(mobile)) {
      alert("Enter valid 10 digit mobile number");
      return;
    }

    try {
      await sendOtp({ mobile: normalizeMobile(mobile) }).unwrap();
      setOtpSent(true);
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      setShowBackToOtp(true); // Show "Back to OTP" button

      // Focus first OTP input
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    } catch (err) {
      alert(err?.data?.detail || "OTP send failed");
    }
  };

  // ---------------- VERIFY OTP ----------------
 const handleVerifyOtp = async () => {
  const otpValue = otp.join("");

  // silently return if not 6 digits
  if (otpValue.length !== 6) return;

  try {
    const res = await verifyOtp({
      mobile: normalizeMobile(mobile),
      otp_code: otpValue
    }).unwrap();

    sessionStorage.setItem("family_id", res.Family_id || "");
    sessionStorage.setItem("User_Name", res.User_Name || "User");
    sessionStorage.setItem("mobile", normalizeMobile(mobile));

    navigate("/app/member-list");
  } catch (error) {
    alert(error?.data?.detail || "Invalid OTP");
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  }
};


  // ---------------- OTP INPUT HANDLERS ----------------
  const handleOtpChange = (index, value) => {
    // Allow only single digit
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input if value entered
    if (value && index < 5) {
      setTimeout(() => {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
        }
      }, 10);
    }

    // Auto-submit if all digits filled
    if (index === 5 && value) {
      const fullOtp = [...newOtp];
      if (fullOtp.every(digit => digit !== "")) {
        setTimeout(() => {
          handleVerifyOtp();
        }, 100);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        e.preventDefault();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        
        setTimeout(() => {
          if (inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
          }
        }, 10);
      } else if (otp[index]) {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    } else if (e.key === "Enter") {
      handleVerifyOtp();
    }
  };

  const handleOtpPaste = e => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    const digits = pasted.replace(/\D/g, "").slice(0, 6);
    
    if (digits.length === 6) {
      setOtp(digits.split(""));
      
      setTimeout(() => {
        if (inputRefs.current[5]) {
          inputRefs.current[5].focus();
        }
      }, 10);
    }
  };

  // Handle resend OTP
  const handleResendOtp = () => {
    if (timer > 0) return;
    handleSendOtp();
  };

  // Go back to mobile input
  const handleBackToMobile = () => {
    setOtpSent(false);
    setShowBackToOtp(false);
    setMobile("");
    setOtp(["", "", "", "", "", ""]);
  };

  // Navigate back to login page
  const handleBackToLogin = () => {
    navigate("/familyMasterLogin");
  };

  return (
  <motion.div
  className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 overflow-hidden"
  animate={controls}
>

      <div className="relative bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        {/* LOGO & HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
            <img src={logo} className="w-12 h-12" alt="logo" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {otpSent ? "Enter OTP" : "Welcome Back"}
          </h2>
          <p className="text-gray-500">
            {otpSent 
              ? "Enter the 6-digit code sent to your mobile" 
              : "Enter your mobile number to continue"}
          </p>
        </div>

        {/* "Back to OTP" button - shown only after OTP is sent */}
        {showBackToOtp && !otpSent && (
          <div className="mb-6">
            <button
              onClick={() => {
                setShowBackToOtp(false);
                setOtpSent(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-all duration-300 font-medium"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to OTP Verification
            </button>
          </div>
        )}

        {/* MOBILE INPUT SECTION */}
        {!otpSent ? (
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-medium">+91</span>
                </div>
                <input
                  className="w-full border border-gray-300 p-3 pl-14 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                  placeholder="9876543210"
                  inputMode="numeric"
                  maxLength={10}
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Enter 10-digit mobile number without country code
              </p>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={sending || !isValidMobile(mobile)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {sending ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending OTP...
                </div>
              ) : (
                "Send OTP"
              )}
            </button>

            {/* Link to go back to main login page */}
            <div className="text-center">
              <button
                onClick={handleBackToLogin}
                className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors"
              >
                ← Back to Login Options
              </button>
            </div>
          </div>
        ) : (
          /* OTP INPUT SECTION */
          <div className="space-y-6">
            {/* Back button */}
            <button
              onClick={handleBackToMobile}
              className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
            >
              <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </button>

            {/* Mobile display */}
            <div className="text-center mb-2">
              <p className="text-gray-600">
                OTP sent to <span className="font-semibold">+91 {normalizeMobile(mobile)}</span>
              </p>
            </div>

            {/* OTP Inputs */}
            <div>
              <label className="block mb-3 text-gray-700 font-medium text-center">
                6-Digit Verification Code
              </label>
              <div
                className="flex justify-center gap-3 mb-6"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onFocus={(e) => e.target.select()}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    autoComplete="off"
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyOtp}
              disabled={verifying || otp.join("").length !== 6}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {verifying ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                "Verify OTP"
              )}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                {timer > 0 ? (
                  <span>Resend OTP in <span className="font-semibold">{timer}s</span></span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                  >
                    Resend OTP
                  </button>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                OTP is valid for 10 minutes
              </p>
            </div>

            {/* Change mobile number */}
            <div className="text-center">
              <button
                onClick={handleBackToMobile}
                className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors"
              >
                Wrong number? Change mobile
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        
      </div>
    </motion.div>
  );
}

export default OtpLoginPage;