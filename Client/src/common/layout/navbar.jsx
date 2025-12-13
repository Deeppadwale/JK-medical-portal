import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Users, FileText, Activity, Search } from "lucide-react";
import ProfileDropdown from "../../Pages/Profile/Profile";
import logo from "../../assets/jkIndia.png"; 
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Member Master", path: "/app/memberMaster", icon: Users },
    { label: "Report Master", path: "/app/reportMaster", icon: FileText },
    { label: "Member Reports", path: "/app/MemberReport", icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50">
   <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500"></div>


      <div className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            <div className="flex items-center space-x-20">
       
              <Link to="/app/memberMaster" className="flex items-center space-x-3">
                <img
                  src={logo} 
                  alt="JK India Logo"
                  className="w-15 h-20 object-contain rounded-xl shadow-lg"
                />
                
              </Link>

              <nav className="hidden lg:flex items-center space-x-5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        group relative flex items-center space-x-2 px-4 py-2.5 rounded-xl
                        transition-all duration-300
                        ${isActive 
                          ? "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 shadow-sm" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}
                      `}
                    >
                      <div className=""></div>

                      <Icon
                        size={18}
                        className={`relative z-10 ${isActive ? "text-red-500" : "group-hover:text-red-500"} transition-colors`}
                      />
                      <span className="relative z-10 font-medium">{item.label}</span>

                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center space-x-8">
           
              <div className="hidden md:block">
                <ProfileDropdown />
              </div>

       
              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
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

        {open && (
          <div className="lg:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl animate-slideDown">
            <div className="px-4 py-3">
       
              <nav className="space-y-1">
                <Link
                  to="/app/dashboard"
                  onClick={() => setOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                    location.pathname === "/app/dashboard"
                      ? "bg-gradient-to-r from-red-50 to-red-100 text-red-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
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
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors duration-200 group ${
                        isActive
                          ? "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon 
                        size={20} 
                        className={`${isActive ? "text-red-500" : "text-gray-500"} group-hover:text-red-500 transition-colors`} 
                      />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </Link>
                  );
                })}

                <div className="pt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="px-2">
                    <ProfileDropdown onClose={() => setOpen(false)} />
                  </div>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}