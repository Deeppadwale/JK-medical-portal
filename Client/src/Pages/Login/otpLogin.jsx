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
import logo from "../../assets/jklogo.png";

function OtpLoginPage() {
  const navigate = useNavigate();
  const controls = useAnimation();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  const [sendOtp, { isLoading: sending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();

  // 🌈 Background animation
  useEffect(() => {
    controls.start({
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      transition: { duration: 18, repeat: Infinity, ease: "linear" },
    });
  }, [controls]);

  // OTP Countdown
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const normalizeMobile = (num) => num.replace(/\D/g, "").slice(-10);
  const isValidMobile = (num) => normalizeMobile(num).length === 10;

  // =========================
  // Send OTP
  // =========================
  const handleSendOtp = async () => {
    if (!isValidMobile(mobile)) return alert("Enter a valid 10-digit mobile number");

    try {
      await sendOtp({ mobile: normalizeMobile(mobile) }).unwrap();
      setOtpSent(true);
      setTimer(60);
      alert("OTP sent successfully!");
    } catch (err) {
      console.error(err);
      alert(err?.data?.detail || "Failed to send OTP");
    }
  };

  // =========================
  // Verify OTP
  // =========================
  // const handleVerifyOtp = async () => {
  //   if (!otp) return alert("Enter OTP");

  //   try {
  //     const res = await verifyOtp({ mobile: normalizeMobile(mobile), otp_code: otp }).unwrap();
  //     alert(res.message);
  //     navigate("/memberMaster"); // redirect after success
  //   } catch (err) {
  //     console.error(err);
  //     alert(err?.data?.detail || "OTP verification failed");
  //   }
  // };

const handleVerifyOtp = async () => {
  if (!otp) return alert("Enter OTP");

  try {
    const res = await verifyOtp({
      mobile: normalizeMobile(mobile),
      otp_code: otp,
    }).unwrap();

    // ✅ Save Family_id in sessionStorage
    if (res.Family_id) {
      sessionStorage.setItem("family_id", res.Family_id);
    }

    alert(res.message);
    navigate("/app/member-list");  // redirect after success
  } catch (err) {
    console.error(err);
    alert(err?.data?.detail || "OTP verification failed");
  }
};


  const formatTime = (sec) => sec.toString().padStart(2, "0");

  return (
    <motion.div
      className="relative flex items-center justify-center min-h-screen overflow-hidden"
      animate={controls}
      style={{
        background: "linear-gradient(-45deg, #000000, #020d2b, #c8d1daff, #bab8c0ff)",
        backgroundSize: "400% 400%",
      }}
    >
      {/* Floating Neon Orbs */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-30"
          style={{
            background: i % 2 === 0 ? "#00FFFF" : "#8B5CF6",
            width: Math.random() * 150 + 100,
            height: Math.random() * 150 + 100,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, 50 * (i % 2 === 0 ? 1 : -1), 0],
            y: [0, 40 * (i % 2 === 0 ? -1 : 1), 0],
          }}
          transition={{
            duration: 9 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Glass Card */}
      <motion.div
        className="relative z-10 w-full max-w-md p-8 rounded-3xl shadow-[0_0_25px_rgba(0,255,255,0.3)] backdrop-blur-xl border border-cyan-400/30"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          background: "linear-gradient(135deg, rgba(20,20,30,0.75), rgba(0,0,40,0.5))",
        }}
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <motion.img
            src={logo}
            alt="Logo"
            className="w-24 h-24 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.4)]"
            whileHover={{ rotate: 10, scale: 1.1 }}
          />
        </motion.div>

        <p className="text-center text-gray-400 mb-6">
          Enter your mobile number to login
        </p>

        {/* OTP Form */}
        <div className="space-y-5">
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Mobile number"
            className="w-full px-4 py-2 rounded-md border border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-transparent text-cyan-100"
          />

          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              disabled={sending || !mobile}
              className="w-full py-3 text-lg font-semibold text-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 rounded-md"
            >
              {sending ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full px-4 py-2 rounded-md border border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-transparent text-cyan-100"
              />
              <button
                onClick={handleVerifyOtp}
                disabled={verifying || !otp}
                className="w-full py-3 text-lg font-semibold text-black bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-md"
              >
                {verifying ? "Verifying..." : "Verify OTP"}
              </button>

              <div className="text-center mt-2">
                {timer > 0 ? (
                  <span>OTP expires in {formatTime(timer)}s</span>
                ) : (
                  <button
                    onClick={handleSendOtp}
                    className="text-red-500 font-semibold mt-2"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 | Secure Access Portal
        </p>
      </motion.div>
    </motion.div>
  );
}

export default OtpLoginPage;
