// import { useEffect } from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { useGetMemberMastersQuery } from "../services/medicalAppoinmentApi";

// const MemberMasterList = () => {
//   const navigate = useNavigate();
//   const familyId = sessionStorage.getItem("family_id");

//   useEffect(() => {
//     if (!familyId) {
//       navigate("/"); // redirect to OTP login if not logged in
//     }
//   }, [familyId, navigate]);

//   const { data: members, isLoading, isError } = useGetMemberMastersQuery(Number(familyId));

//   useEffect(() => {
//     if (!isLoading && members && members.length === 0) {
//       navigate("/app/member-master"); // redirect to create member if none exist
//     }
//   }, [members, isLoading, navigate]);

//   if (isLoading)
//     return <div className="flex justify-center items-center min-h-screen">Loading members...</div>;

//   if (isError)
//     return <div className="text-red-500 text-center mt-6">Failed to load members</div>;

//   const handleClick = (member) => {
//     sessionStorage.setItem("selected_member", JSON.stringify(member));
//     navigate(`/app/member-master`); // or member detail page
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-6">
//       <motion.h1 className="text-3xl font-bold text-gray-800 mb-8">
//         Family Members
//       </motion.h1>

//       <div className="space-y-4 w-full max-w-lg">
//         {members.map((member, index) => (
//           <motion.div
//             key={member.Member_id}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.08, duration: 0.4 }}
//             whileHover={{ scale: 1.03 }}
//             whileTap={{ scale: 0.97 }}
//             onClick={() => handleClick(member)}
//             className="bg-white border rounded-xl shadow-md p-4 text-center cursor-pointer hover:shadow-xl transition"
//           >
//             <p className="text-xl font-semibold text-gray-800">{member.Member_name}</p>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MemberMasterList;


import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGetMemberMastersQuery } from "../services/medicalAppoinmentApi";

function MemberMasterList() {
  const navigate = useNavigate();

  const familyId = sessionStorage.getItem("family_id");

  const { data: members = [], isLoading, isError } =
    useGetMemberMastersQuery(familyId, {
      skip: !familyId,
    });

  // 🔁 If no members → redirect to create page
  useEffect(() => {
    if (!isLoading && members.length === 0) {
      navigate("/app/member-master");
    }
  }, [members, isLoading, navigate]);

  if (isLoading)
    return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (isError)
    return <div className="text-red-500 text-center mt-6">Failed to load members</div>;

  const handleClick = (member) => {
    // ✅ STORE IN SESSION
    sessionStorage.setItem("member_id", member.Member_id);
    sessionStorage.setItem("user_name", member.Member_name);

    navigate("/app/dashboard"); // or next page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8 text-gray-800"
      >
        Family Members
      </motion.h1>

      <div className="space-y-4 w-full max-w-md">
        {members.map((member, index) => (
          <motion.div
            key={member.Member_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleClick(member)}
            className="bg-white rounded-xl shadow-md p-4 text-center cursor-pointer hover:shadow-xl"
          >
            <p className="text-xl font-semibold text-gray-800">
              {member.Member_name}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default MemberMasterList;
