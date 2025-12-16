import { useState, useCallback } from "react";
import Cookies from "js-cookie";

import TableUtility from "../common/TableUtility/TableUtility";
import Modal from "../common/Modal/Modal";
import CreateNewButton from "../common/Buttons/AddButton";

import {
  PencilSquareIcon,
  XCircleIcon,
  CheckCircleIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  HomeIcon,
  KeyIcon,
  ShieldCheckIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";

import { Trash2, Loader2, Save } from "lucide-react";
import { decryptData } from "../common/Functions/DecryptData";

import {
  useGetFamilyMastersQuery,
  useAddFamilyMasterMutation,
  useUpdateFamilyMasterMutation,
  useDeleteFamilyMasterMutation,
} from "../services/familyMasterApi";

/* ============================================================
   FAMILY MASTER
============================================================ */
function FamilyMaster() {
  /* ================= STATE ================= */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    Family_Name: "",
    Family_Address: "",
    Email_Id: "",
    MobileNumbers: [""],
    User_Name: "",
    User_Password: "",
  });

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteIdToConfirm, setDeleteIdToConfirm] = useState(null);

  /* ================= API ================= */
  const { data = [], isLoading, isError } = useGetFamilyMastersQuery();
  const [addFamily, { isLoading: isAdding }] = useAddFamilyMasterMutation();
  const [updateFamily, { isLoading: isUpdating }] = useUpdateFamilyMasterMutation();
  const [deleteFamily] = useDeleteFamilyMasterMutation();

  /* ================= UTIL ================= */
  const getUserNameFromCookie = useCallback(() => {
    try {
      const encrypted = Cookies.get("user_data");
      if (!encrypted) return "System";
      return decryptData(encrypted)?.User_Name || "System";
    } catch {
      return "System";
    }
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ ...notification, show: false }), 3000);
  };

  const resetForm = () => {
    setFormData({
      Family_Name: "",
      Family_Address: "",
      Email_Id: "",
      MobileNumbers: [""],
      User_Name: "",
      User_Password: "",
    });
    setEditId(null);
  };

  /* ================= HANDLERS ================= */
  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditId(row.Family_id);

    setFormData({
      Family_Name: row.Family_Name || "",
      Family_Address: row.Family_Address || "",
      Email_Id: row.Email_Id || "",
      MobileNumbers: row.Mobile
        ? row.Mobile.split(",").map((m) => m.trim())
        : [""],
      User_Name: row.User_Name || "",
      User_Password: "",
    });

    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteIdToConfirm(id);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    await deleteFamily(deleteIdToConfirm);
    showNotification("Family deleted successfully");
    setShowDeleteConfirmModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  /* ===== Mobile Numbers ===== */
  const handleMobileChange = (index, value) => {
    const updated = [...formData.MobileNumbers];
    updated[index] = value;
    setFormData((p) => ({ ...p, MobileNumbers: updated }));
  };

  const addMobileField = () => {
    setFormData((p) => ({
      ...p,
      MobileNumbers: [...p.MobileNumbers, ""],
    }));
  };

  const removeMobileField = (index) => {
    setFormData((p) => ({
      ...p,
      MobileNumbers: p.MobileNumbers.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      MobileNumbers: formData.MobileNumbers.filter(Boolean),
    };

    try {
      if (editId) {
        await updateFamily({ id: editId, ...payload }).unwrap();
        showNotification("Family updated successfully");
      } else {
        await addFamily(payload).unwrap();
        showNotification("Family added successfully");
      }
      setIsModalOpen(false);
      resetForm();
    } catch {
      showNotification("Operation failed", "error");
    }
  };

  /* ================= TABLE ================= */
  const columns = [
    { header: "ID", accessor: "Family_id" },
    { header: "Family Name", accessor: "Family_Name" },
    { header: "Mobile", accessor: "Mobile" },
    { header: "Email", accessor: "Email_Id" },
    {
      header: "Action",
      accessor: "action",
      isAction: true,
      actionRenderer: (row) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 bg-blue-50 rounded hover:bg-blue-100"
          >
            <PencilSquareIcon className="h-5 w-5 text-blue-600" />
          </button>
          <button
            onClick={() => handleDelete(row.Family_id)}
            className="p-2 bg-red-50 rounded hover:bg-red-100"
          >
            <Trash2 className="h-5 w-5 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  /* ================= RENDER ================= */
  if (isLoading)
    return <Loader2 className="h-10 w-10 animate-spin mx-auto mt-20" />;

  if (isError)
    return <div className="text-center text-red-600">Failed to load</div>;

  return (
    <>
      <TableUtility
        title="Family Master"
        columns={columns}
        data={data}
        headerContent={<CreateNewButton onClick={handleAddNew} />}
      />

      {/* ================= MODAL ================= */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} width="900px">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold">
            {editId ? "Edit Family" : "Add Family"}
          </h2>

          <input
            name="Family_Name"
            value={formData.Family_Name}
            onChange={handleInputChange}
            placeholder="Family Name"
            className="w-full border p-3 rounded"
            required
          />

          <textarea
            name="Family_Address"
            value={formData.Family_Address}
            onChange={handleInputChange}
            placeholder="Address"
            className="w-full border p-3 rounded"
          />

          {/* ===== Mobile Numbers ===== */}
          <div className="space-y-2">
            <label className="font-semibold flex items-center gap-2">
              <PhoneIcon className="h-5 w-5 text-green-600" />
              Mobile Numbers
            </label>

            {formData.MobileNumbers.map((mobile, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={mobile}
                  onChange={(e) => handleMobileChange(index, e.target.value)}
                  className="flex-1 border p-2 rounded"
                  placeholder="Mobile number"
                />
                {formData.MobileNumbers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMobileField(index)}
                    className="p-2 bg-red-100 rounded"
                  >
                    <MinusIcon className="h-4 w-4 text-red-600" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addMobileField}
              className="flex items-center gap-1 text-blue-600 text-sm"
            >
              <PlusIcon className="h-4 w-4" />
              Add Mobile
            </button>
          </div>

          <input
            name="Email_Id"
            value={formData.Email_Id}
            onChange={handleInputChange}
            placeholder="Email"
            className="w-full border p-3 rounded"
          />

          <input
            name="User_Name"
            value={formData.User_Name}
            onChange={handleInputChange}
            placeholder="Username"
            className="w-full border p-3 rounded"
          />

          <input
            name="User_Password"
            value={formData.User_Password}
            onChange={handleInputChange}
            placeholder="Password"
            type="password"
            className="w-full border p-3 rounded"
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {editId ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default FamilyMaster;
