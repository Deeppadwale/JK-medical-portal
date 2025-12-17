// src/components/routesConfig.js

import OtpLoginPage from "../Pages/Login/otpLogin";
import MemberMasterList from "../components/MemberMasterList";
import MemberMaster from "../components/Master/MemberMaster";
import Dashboard from "../Pages/Dashboard.jsx"
import ReportMaster from "../components/Master/ReportMaster";
import MemberReport from "../components/MemberReport";
import FamilyMasterMain from "./familyMaster.jsx"

const routes = [
  // ===== PUBLIC =====
  {
    path: "/",
    element: OtpLoginPage,
    hideNavbar: true,
  },

  // ===== APP =====
  {
    path: "/app/member-list",
    element: MemberMasterList,
    hideNavbar: true,
  },
  {
    path: "/app/member-master",
    element: MemberMaster,

  },

  

{
  path: "/app/dashboard",
  element: Dashboard,
  hideNavbar: false,
},

{
  path: "/app/reportMaster",
  element: ReportMaster,
  hideNavbar: false,
},


{
  path: "/app/MemberReport",
  element: MemberReport,
  hideNavbar: false,
},

{
  path: "/app/familyMaster",
  element: FamilyMasterMain,
  hideNavbar: false,
},





];

export default routes;
