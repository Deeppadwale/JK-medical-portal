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


import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSendOtpMutation, useVerifyOtpMutation } from "../../services/otpVerification";
import { 
  Phone, 
  Shield, 
  Clock, 
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Smartphone
} from "lucide-react";
import logo from "../../assets/pulse.png";

function OtpLoginPage() {
  const navigate = useNavigate();
  const controls = useAnimation();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const [activeInput, setActiveInput] = useState(0);

  const [sendOtp, { isLoading: sending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();

  // Standard colors
  const COLORS = {
    primary: "#2563eb",    // Blue-600
    primaryHover: "#1d4ed8", // Blue-700
    secondary: "#64748b",   // Slate-500
    success: "#059669",     // Emerald-600
    successHover: "#047857", // Emerald-700
    background: "#f8fafc",   // Slate-50
    cardBg: "rgba(255, 255, 255, 0.95)",
    textPrimary: "#1e293b",  // Slate-800
    textSecondary: "#475569", // Slate-600
    border: "#cbd5e1",       // Slate-300
    focusBorder: "#3b82f6",  // Blue-500
    shadow: "rgba(0, 0, 0, 0.1)"
  };

  // 🌈 Background animation
  useEffect(() => {
    controls.start({
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      transition: { duration: 15, repeat: Infinity, ease: "linear" },
    });
  }, [controls]);

  // OTP Countdown
  useEffect(() => {
    if (timer <= 0) {
      setIsResendEnabled(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const normalizeMobile = (num) => num.replace(/\D/g, "").slice(-10);
  const isValidMobile = (num) => normalizeMobile(num).length === 10;

  // Format mobile number as user types
  const formatMobileInput = (value) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0,3)}) ${numbers.slice(3)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0,3)}) ${numbers.slice(3,6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0,3)}) ${numbers.slice(3,6)}-${numbers.slice(6,10)}`;
  };

  // Handle mobile input
  const handleMobileChange = (e) => {
    const formatted = formatMobileInput(e.target.value);
    setMobile(formatted);
  };

  // =========================
  // Send OTP
  // =========================
  const handleSendOtp = async () => {
    if (!isValidMobile(mobile)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      await sendOtp({ mobile: normalizeMobile(mobile) }).unwrap();
      setOtpSent(true);
      setTimer(60);
      setIsResendEnabled(false);
    } catch (err) {
      console.error(err);
      alert(err?.data?.detail || "Failed to send OTP. Please try again.");
    }
  };

  // =========================
  // Verify OTP
  // =========================
  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      alert("Please enter the complete 6-digit OTP");
      return;
    }

    try {
      const res = await verifyOtp({
        mobile: normalizeMobile(mobile),
        otp_code: otpString,
      }).unwrap();

      // ✅ Save Family_id in sessionStorage
      if (res.Family_id) {
        sessionStorage.setItem("family_id", res.Family_id);
      }

      // Show success animation before redirect
      setTimeout(() => {
        navigate("/app/member-list");
      }, 1500);
    } catch (err) {
      console.error(err);
      alert(err?.data?.detail || "Invalid OTP. Please try again.");
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      setActiveInput(0);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      setActiveInput(index + 1);
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d{6}$/.test(pastedData)) return;
    
    const newOtp = pastedData.split('');
    setOtp(newOtp);
    setActiveInput(Math.min(5, pastedData.length - 1));
  };

  // Handle keyboard navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      setActiveInput(index - 1);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < 5) {
      setActiveInput(index + 1);
    }
  };

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="relative flex items-center justify-center min-h-screen overflow-hidden"
      animate={controls}
      style={{
        background: `linear-gradient(135deg, ${COLORS.background} 0%, #e2e8f0 50%, ${COLORS.background} 100%)`,
        backgroundSize: "400% 400%",
      }}
    >
      {/* Subtle floating dots */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            background: i % 3 === 0 ? COLORS.primary : i % 3 === 1 ? COLORS.success : COLORS.secondary,
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.2 + Math.random() * 0.3,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 20 - 10, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Main Card */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="p-8 pb-6 text-center border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full blur-lg opacity-30"></div>
                <img
                  src={logo}
                  alt="Company Logo"
                  className="relative w-20 h-20 rounded-full border-4 border-white shadow-lg"
                />
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-2xl font-bold text-gray-800 mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Welcome Back
            </motion.h1>
            <p className="text-gray-600 text-sm">
              Secure OTP verification for member access
            </p>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {/* Mobile Input Section */}
            {!otpSent ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-blue-500" />
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">+91</span>
                    </div>
                    <input
                      type="text"
                      value={mobile}
                      onChange={handleMobileChange}
                      placeholder="(123) 456-7890"
                      className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                      maxLength={14}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Enter your 10-digit mobile number
                  </p>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={sending || !isValidMobile(mobile)}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-md flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      Send Verification Code
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              /* OTP Verification Section */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* Mobile Info */}
                <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Smartphone className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Verification code sent to</p>
                        <p className="text-lg font-semibold text-gray-900">{mobile}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setOtpSent(false);
                        setOtp(["", "", "", "", "", ""]);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Change
                    </motion.button>
                  </div>
                </div>

                {/* OTP Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                    Enter the 6-digit verification code
                  </label>
                  <div 
                    className="flex justify-center gap-3 mb-6"
                    onPaste={handleOtpPaste}
                  >
                    {otp.map((digit, index) => (
                      <motion.input
                        key={index}
                        ref={input => index === activeInput && input?.focus()}
                        type="text"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onClick={() => setActiveInput(index)}
                        maxLength={1}
                        className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                        whileFocus={{ scale: 1.05 }}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      />
                    ))}
                  </div>
                  
                  {/* Timer */}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className={timer > 0 ? "font-medium" : "text-red-600 font-semibold"}>
                      {timer > 0 ? `Code expires in ${formatTime(timer)}` : "Code expired"}
                    </span>
                  </div>
                </div>

                {/* Verify Button */}
                <button
                  onClick={handleVerifyOtp}
                  disabled={verifying || otp.join("").length !== 6}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-md flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Verify & Continue
                    </>
                  )}
                </button>

                {/* Resend OTP */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    onClick={handleSendOtp}
                    disabled={!isResendEnabled}
                    className={`text-sm font-medium ${isResendEnabled ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 cursor-not-allowed'} flex items-center justify-center gap-1 mx-auto`}
                  >
                    <RefreshCw className="h-4 w-4" />
                    {isResendEnabled ? "Resend OTP" : `Wait ${timer}s to resend`}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Security Note */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-500">
                  Your information is protected with end-to-end encryption. 
                  We never share your mobile number with third parties.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>© 2025 Pulse Health</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Secure Connection</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Success Animation */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: verifying ? 0.3 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-white"></div>
      </motion.div>
    </motion.div>
  );
}

export default OtpLoginPage;