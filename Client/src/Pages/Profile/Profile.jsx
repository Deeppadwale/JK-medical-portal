import { useState, useRef } from "react";
import { ChevronDown, User, LogOut, UserCircle, Lock } from "lucide-react";
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

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (isLoading) return null;

  return (
    <>
      <div className="fixed top-4 right-4 z-50" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 bg-[#F5EBEB] hover:bg-[#F5EBEB] rounded-full px-3 py-1 md:px-4 md:py-2 transition-colors duration-200"
          >
            <UserCircle size={24} className="text-[#D92300]" />
            <span className="text-[#D92300] font-medium hidden sm:inline-block">
              {user?.User_Name || "User"}
            </span>
            <ChevronDown
              size={18}
              className={`text-[#D92300] transition-transform hidden sm:block ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-[#F5EBEB] py-1 z-50">
              <button
                onClick={() => {
                  setShowEditProfile(true);
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-[#D92300] hover:bg-[#F5EBEB]"
              >
                <User size={16} className="mr-2" />
                Edit Profile
              </button>
              <button
                onClick={() => {
                  setShowChangePassword(true);
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-[#D92300] hover:bg-[#F5EBEB]"
              >
                <Lock size={16} className="mr-2" />
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-[#D92300] hover:bg-[#F5EBEB]"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <EditProfileModal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} />
      <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </>
  );
};

export default ProfileDropdown;
