import { motion } from "framer-motion";
import { Users, FileText, UserCircle, ChevronRight, Activity, Shield, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dashboardImg from "../assets/blood research-cuate.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const userName = sessionStorage.getItem("user_name") || "Welcome";
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome to your management portal</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium text-gray-800">{userName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
      <div className="px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 mb-10"
        >
          <div className="absolute inset-0 bg-grid-white/5"></div>
          <div className="relative z-10 px-10 py-12 flex flex-col md:flex-row items-center justify-between">
            <div className="text-white mb-8 md:mb-0 md:w-1/2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-sm mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                System Online
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome back, <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">{userName}</span>
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mb-6">
                Manage your family health data, track reports, and ensure everyone's well-being in one unified platform.
              </p>
              <button className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300">
                Quick Start Guide
                <ChevronRight className="ml-2" size={18} />
              </button>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src={dashboardImg}
                alt="Dashboard"
                className="w-4/5 max-w-md transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </motion.div>
      </div>
   </div>
  );
}