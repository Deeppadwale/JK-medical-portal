import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Users, FileText, Activity, Shield, Bell, Search } from "lucide-react";
import ProfileDropdown from "../../Pages/Profile/Profile";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Member Master", path: "/app/memberMaster", icon: Users },
    { label: "Report Master", path: "/app/reportMaster", icon: FileText },
    { label: "Member Report", path: "/app/MemberReport", icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* Top Gradient Bar */}
      <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500"></div>
      
      {/* Main Navbar */}
      <div className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Section: Logo & Navigation */}
            <div className="flex items-center space-x-8">
              
              {/* Logo with gradient effect */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 rounded-xl blur-sm opacity-60"></div>
                  <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                    <Shield className="w-6 h-6 text-white" fill="white" fillOpacity="0.3" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                    MedicalPortal
                  </h1>
                  <p className="text-xs text-gray-500 -mt-1">Healthcare Management</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-1">
                {/* Dashboard Link */}
                <Link
                  to="/app/dashboard"
                  className={`
                    group flex items-center space-x-2 px-4 py-2.5 rounded-xl
                    transition-all duration-300 relative
                    ${location.pathname === "/app/dashboard" 
                      ? "bg-gradient-to-r from-red-50 to-red-100 text-red-600" 
                      : "text-gray-600 hover:text-red-600 hover:bg-gray-50"}
                  `}
                >
                  <Home size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Dashboard</span>
                  {location.pathname === "/app/dashboard" && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-red-100 border-t border-l border-red-200"></div>
                  )}
                </Link>

                {/* Divider */}
                <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-2"></div>

                {/* Main Navigation Items */}
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        group relative flex items-center space-x-2 px-4 py-2.5 rounded-xl
                        transition-all duration-300 overflow-hidden
                        ${isActive 
                          ? "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 shadow-sm" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}
                      `}
                    >
                      {/* Hover effect background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      
                      <Icon 
                        size={18} 
                        className={`relative z-10 ${isActive ? "text-red-500" : "group-hover:text-red-500"} transition-colors`} 
                      />
                      <span className="relative z-10 font-medium">{item.label}</span>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
                          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                        </>
                      )}
                      
                      {/* Notification badge (optional) */}
                      {item.label === "Member Report" && (
                        <span className="relative z-10 px-1.5 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                          3
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Section: Search, Notifications, Profile */}
            <div className="flex items-center space-x-4">
              
              {/* Search Bar (Desktop) */}
              <div className="hidden md:flex items-center relative">
                <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-56 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all text-sm"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group">
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="hidden md:block">
                <ProfileDropdown />
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {open ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="lg:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl">
            <div className="px-4 py-3">
              {/* Mobile Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 text-sm"
                  />
                </div>
              </div>

              {/* Mobile Navigation Items */}
              <nav className="space-y-1">
                {/* Dashboard */}
                <Link
                  to="/app/dashboard"
                  onClick={() => setOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl
                    transition-colors duration-200
                    ${location.pathname === "/app/dashboard" 
                      ? "bg-gradient-to-r from-red-50 to-red-100 text-red-600" 
                      : "text-gray-700 hover:bg-gray-50"}
                  `}
                >
                  <Home size={20} />
                  <span className="font-medium">Dashboard</span>
                </Link>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={`
                        flex items-center justify-between px-4 py-3 rounded-xl
                        transition-colors duration-200 group
                        ${isActive 
                          ? "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900" 
                          : "text-gray-700 hover:bg-gray-50"}
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={20} className={isActive ? "text-red-500" : "text-gray-500"} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </Link>
                  );
                })}

                {/* Mobile Profile Section */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="px-2">
                    <ProfileDropdown />
                  </div>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}