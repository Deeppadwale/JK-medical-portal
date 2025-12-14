import { motion } from "framer-motion";
import { Users, FileText, UserCircle, ChevronRight, Activity, Shield, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dashboardImg from "../assets/blood research-cuate.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const userName = sessionStorage.getItem("user_name") || "Welcome";

  const cards = [
    {
      title: "Family Members",
      desc: "View and manage family members",
      icon: Users,
      color: "from-blue-500 to-cyan-400",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      path: "/app/member-list",
      stat: "12 members",
    },
    {
      title: "Reports",
      desc: "Access all member reports",
      icon: FileText,
      color: "from-emerald-500 to-teal-400",
      bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
      path: "/app/member-report",
      stat: "45 reports",
    },
    {
      title: "Profile",
      desc: "View your profile information",
      icon: UserCircle,
      color: "from-violet-500 to-purple-400",
      bgColor: "bg-gradient-to-br from-violet-50 to-purple-50",
      path: "/app/profile",
      stat: "Complete profile",
    },
  ];

  const stats = [
    { label: "Active Members", value: "8", change: "+2", icon: Activity },
    { label: "Pending Reports", value: "3", change: "-1", icon: FileText },
    { label: "Security Score", value: "98%", change: "+5%", icon: Shield },
    { label: "Notifications", value: "5", change: "", icon: Bell },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50">

      {/* HEADER */}
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

      {/* MAIN CONTENT */}
      <div className="px-8 py-8">

        {/* HERO SECTION */}
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

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${index === 0 ? 'bg-blue-50' : index === 1 ? 'bg-emerald-50' : index === 2 ? 'bg-violet-50' : 'bg-amber-50'}`}>
                    <Icon className={index === 0 ? 'text-blue-500' : index === 1 ? 'text-emerald-500' : index === 2 ? 'text-violet-500' : 'text-amber-500'} />
                  </div>
                </div>
                {stat.change && (
                  <div className="mt-4 flex items-center">
                    <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-500' : 'text-rose-500'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">from last month</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ACTION CARDS */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(card.path)}
                  className={`cursor-pointer rounded-2xl p-6 ${card.bgColor} border border-gray-200 hover:shadow-xl transition-all duration-300 group`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color}`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <ChevronRight className="text-gray-400 group-hover:text-gray-700 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{card.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">{card.stat}</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-white/50 text-gray-700">
                      Click to access
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: "New report added", time: "2 hours ago", user: "John Doe" },
              { action: "Profile updated", time: "Yesterday", user: "You" },
              { action: "Member added", time: "2 days ago", user: "Sarah Smith" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-800">{item.action}</p>
                    <p className="text-sm text-gray-500">By {item.user}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-gray-100 px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-800 font-semibold">Family Management System</p>
            <p className="text-sm text-gray-500">Secure • Reliable • Easy to Use</p>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Support</a>
          </div>
          <p className="text-sm text-gray-400 mt-4 md:mt-0">© 2025 All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}