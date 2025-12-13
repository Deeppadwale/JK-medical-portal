// import { useState, useRef } from "react";
// import { ChevronDown, User, LogOut, UserCircle, Lock } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useGetCurrentUserQuery, useLogoutMutation } from "../../services/userMasterApi";
// import EditProfileModal from "./EditProfileModal";
// import ChangePasswordModal from "./ChangePasswordModal";

// const ProfileDropdown = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [showEditProfile, setShowEditProfile] = useState(false);
//   const [showChangePassword, setShowChangePassword] = useState(false);
//   const dropdownRef = useRef(null);
//   const navigate = useNavigate();

//  // ✅ Get user info securely from backend cookie
//   const { data: user, isLoading } = useGetCurrentUserQuery();
//   const [logout] = useLogoutMutation();

//   const handleLogout = async () => {
//     await logout();
//     navigate("/");
//   };

//   if (isLoading) return null;

//   return (
//     <>
//       <div className="fixed top-4 right-4 z-50" ref={dropdownRef}>
//         <div className="relative">
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className="flex items-center space-x-2 bg-[#F5EBEB] hover:bg-[#F5EBEB] rounded-full px-3 py-1 md:px-4 md:py-2 transition-colors duration-200"
//           >
//             <UserCircle size={24} className="text-[#D92300]" />
//             <span className="text-[#D92300] font-medium hidden sm:inline-block">
//               {user?.User_Name || "User"}
//             </span>
//             <ChevronDown
//               size={18}
//               className={`text-[#D92300] transition-transform hidden sm:block ${isOpen ? "rotate-180" : ""}`}
//             />
//           </button>

//           {isOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-[#F5EBEB] py-1 z-50">
//               <button
//                 onClick={() => {
//                   setShowEditProfile(true);
//                   setIsOpen(false);
//                 }}
//                 className="flex items-center w-full px-4 py-2 text-sm text-[#D92300] hover:bg-[#F5EBEB]"
//               >
//                 <User size={16} className="mr-2" />
//                 Edit Profile
//               </button>
//               <button
//                 onClick={() => {
//                   setShowChangePassword(true);
//                   setIsOpen(false);
//                 }}
//                 className="flex items-center w-full px-4 py-2 text-sm text-[#D92300] hover:bg-[#F5EBEB]"
//               >
//                 <Lock size={16} className="mr-2" />
//                 Change Password
//               </button>
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center w-full px-4 py-2 text-sm text-[#D92300] hover:bg-[#F5EBEB]"
//               >
//                 <LogOut size={16} className="mr-2" />
//                 Sign Out
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       <EditProfileModal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} />
//       <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
//     </>
//   );
// };

// export default ProfileDropdown;
import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LogOut, UserCircle, Lock, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetCurrentUserQuery, useLogoutMutation } from "../../services/userMasterApi";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Get user info securely from backend cookie
  const { data: user, isLoading } = useGetCurrentUserQuery();
  const [logout] = useLogoutMutation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 animate-pulse">
          <div className="h-8 w-8 rounded-full bg-gray-300"></div>
          <div className="h-4 w-20 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50" ref={dropdownRef}>
        <div className="relative">
          {/* Profile Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#F5EBEB] to-[#FFE8E8] hover:from-[#FFE8E8] hover:to-[#FFE0E0] rounded-full px-4 py-2 transition-all duration-300 shadow-md hover:shadow-lg border border-[#FFD6D6]"
          >
            <div className="relative">
              <UserCircle size={28} className="text-[#D92300]" />
              {user?.role && (
                <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
              )}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[#D92300] font-semibold text-sm sm:text-base">
                {user?.User_Name || user?.username || "User"}
              </span>
              {user?.designation && (
                <span className="text-xs text-gray-600 truncate max-w-[120px]">
                  {user.designation}
                </span>
              )}
            </div>
            <ChevronDown
              size={18}
              className={`text-[#D92300] transition-transform duration-300 hidden sm:block ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-fade-in">
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-[#FFF5F5] to-[#FFE8E8] rounded-full">
                    <UserCircle size={32} className="text-[#D92300]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {user?.User_Name || user?.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || user?.Email_Id || "No email"}
                    </p>
                    {user?.role && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-[#F5EBEB] to-[#FFE8E8] text-[#D92300] rounded-full">
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {/* <button
                  onClick={() => {
                    setShowEditProfile(true);
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#F5EBEB] hover:to-[#FFE8E8] transition-all duration-200 group"
                >
                  <div className="p-1.5 bg-[#F5EBEB] rounded-lg group-hover:bg-[#FFE8E8] transition-colors mr-3">
                    <User size={16} className="text-[#D92300]" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium">Edit Profile</span>
                    <p className="text-xs text-gray-500">Update your personal information</p>
                  </div>
                </button> */}

                {/* <button
                  onClick={() => {
                    setShowChangePassword(true);
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#F5EBEB] hover:to-[#FFE8E8] transition-all duration-200 group"
                >
                  <div className="p-1.5 bg-[#F5EBEB] rounded-lg group-hover:bg-[#FFE8E8] transition-colors mr-3">
                    <Lock size={16} className="text-[#D92300]" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium">Change Password</span>
                    <p className="text-xs text-gray-500">Update your login credentials</p>
                  </div>
                </button> */}

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200 group mt-2 border-t border-gray-100"
                >
                  <div className="p-1.5 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors mr-3">
                    <LogOut size={16} className="text-red-600" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-red-600">Sign Out</span>
                    <p className="text-xs text-gray-500">Logout from your account</p>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <p className="text-xs text-gray-500 text-center">
                  v{import.meta.env.VITE_APP_VERSION || "1.0.0"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} />
      <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />

      {/* Global Styles for Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default ProfileDropdown;