import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Users,
  FileText,
  Activity,
  LogOut,
} from "lucide-react";

import logo from "../../assets/pulse.png"; 

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashbord", path: "/app/dashboard", icon: Users },
    { label: "Member Master", path: "/app/member-master", icon: Users },
    { label: "Report Master", path: "/app/reportMaster", icon: FileText },
    { label: "Member Reports", path: "/app/MemberReport", icon: Activity },
  ];

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />

      <div className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">

            {/* LEFT: Logo + Menu */}
            <div className="flex items-center space-x-14">
              {/* LOGO */}
              <Link to="/app/dashboard" className="flex items-center space-x-3">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-14 object-contain"
                />
              </Link>

              {/* DESKTOP MENU */}
              <nav className="hidden lg:flex items-center space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all
                        ${
                          isActive
                            ? "bg-gray-100 text-gray-900 shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                      <Icon
                        size={18}
                        className={isActive ? "text-red-500" : "text-gray-500"}
                      />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* RIGHT */}
            <div className="flex items-center space-x-6">
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="hidden lg:flex items-center space-x-2 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 transition"
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>

              {/* Mobile Toggle */}
              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {open ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="lg:hidden border-t bg-white animate-slideDown">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl
                      ${
                        isActive
                          ? "bg-red-50 text-red-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
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
