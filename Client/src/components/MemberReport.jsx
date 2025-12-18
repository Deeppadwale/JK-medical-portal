import { useState, useEffect } from 'react';
import TableUtility from "../common/TableUtility/TableUtility";
import Modal from '../common/Modal/Modal';
import CreateNewButton from "../common/Buttons/AddButton";
import { 
  PencilSquareIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  DocumentArrowDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Trash2, Plus, X, User, FileText, ChevronRight, Calendar } from 'lucide-react';
import {
    useGetReportsByFamilyQuery,
    useCreateReportMutation,
    useUpdateReportMutation,
    useDeleteReportMutation,
    useDownloadFileMutation
} from '../services/memberReportApi';

import {
    useGetReportMastersQuery
} from '../services/reportMasterApi';
import { useGetMemberMastersQuery } from "../services/medicalAppoinmentApi";

function MemberReport() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        Member_id: '',
        Family_id: sessionStorage.getItem('family_id') || '',
        purpose: '',
        remarks: '',
        Created_by: '',
        Modified_by:'',
        details: []
    });
    const [editId, setEditId] = useState(null);
    const [files, setFiles] = useState({});
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [deleteIdToConfirm, setDeleteIdToConfirm] = useState(null);
    const [selectedMemberName, setSelectedMemberName] = useState('');
    const [selectedReportName, setSelectedReportName] = useState({});
    const [deletedDetails, setDeletedDetails] = useState([]);
    const [userData, setUserData] = useState({
        Family_id: "",
        User_name: ""
    });
    
    // Fetch all data
    const familyId = sessionStorage.getItem('family_id');
    const { data: tableData = [], isLoading: isTableLoading, isError, refetch } = useGetReportsByFamilyQuery(familyId);
    const { data: memberData = [], isLoading: isMemberLoading } = useGetMemberMastersQuery(familyId);
    const { data: reportData = [], isLoading: isReportLoading } = useGetReportMastersQuery();
    
    // Mutations
    const [createReport] = useCreateReportMutation();
    const [updateReport] = useUpdateReportMutation();
    const [deleteReport] = useDeleteReportMutation();
    const [downloadFile] = useDownloadFileMutation();

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
    };

    // Find member name when Member_id changes
    useEffect(() => {
        if (formData.Member_id && memberData.length > 0) {
            const member = memberData.find(m => m.Member_id === parseInt(formData.Member_id));
            setSelectedMemberName(member ? `${member.Member_name} - ${member.Mobile_no}` : '');
        } else {
            setSelectedMemberName('');
        }
    }, [formData.Member_id, memberData]);

    // Find report names when details change
    useEffect(() => {
        if (formData.details.length > 0 && reportData.length > 0) {
            const newSelectedReportName = {};
            formData.details.forEach((detail, index) => {
                if (detail.Report_id && detail.row_action !== 'delete') {
                    const report = reportData.find(r => r.Report_id === parseInt(detail.Report_id));
                    newSelectedReportName[index] = report ? report.report_name : '';
                }
            });
            setSelectedReportName(newSelectedReportName);
        }
    }, [formData.details, reportData]);

   
    useEffect(() => {
        const fetchUserData = () => {
            try {
               
                const familyId = sessionStorage.getItem("family_id");
                const userName = sessionStorage.getItem("user_name");
                
                console.log("sessionStorage data:", {
                    Family_id: familyId,
                    User_name: userName
                });

                const userData = {
                    Family_id: familyId || "",
                    User_name: userName || "System"
                };

                setUserData(userData);
                
                if (userName && !formData.Created_by) {
                    setFormData(prev => ({
                        ...prev,
                        Created_by: userName
                    }));
                }

                return userData;
            } catch (error) {
                console.error("Error getting user data from sessionStorage:", error);
                return {
                    Family_id: "",
                    User_name: "System"
                };
            }
        };

        fetchUserData();
    }, [formData.Created_by]);

    const handleAddNew = () => {

        const userName = sessionStorage.getItem('user_name') || '';
        
        setFormData({
            Member_id: '',
            Family_id: sessionStorage.getItem('family_id') || '',
            purpose: '',
            remarks: '',
            Created_by: userName,
            Modified_by:userName,

            details: []
        });
        setEditId(null);
        setFiles({});
        setDeletedDetails([]);
        setIsModalOpen(true);
    };

    const handleEdit = (row) => {
 
        const userName = sessionStorage.getItem('user_name') || '';
        
        setFormData({
            Member_id: row.Member_id?.toString(),
            Family_id: sessionStorage.getItem('family_id') || row.Family_id?.toString() || '',
            purpose: row.purpose || '',
            remarks: row.remarks || '',
            Created_by: userName,
            Modified_by:userName,
            details: (row.details || []).map(d => ({
                detail_id: d.detail_id,
                report_date: d.report_date || '',
                Report_id: d.Report_id?.toString() || '',
                Doctor_and_Hospital_name: d.Doctor_and_Hospital_name || '',
                uploaded_file_name: d.uploaded_file_report || '',
                row_action: 'update'
            }))
        });
        setEditId(row.MemberReport_id);
        setFiles({});
        setDeletedDetails([]);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setDeleteIdToConfirm(id);
        setShowDeleteConfirmModal(true);
    };


    const handlePreview = (fileName) => {
        if (!fileName) {
            showNotification('No file to preview', 'error');
            return;
        }
        
        try {
            const previewUrl = `http://localhost:8000/member-report/preview/${encodeURIComponent(fileName)}`;
            window.open(previewUrl, '_blank');
        } catch (error) {
            console.error('Failed to preview file:', error);
            showNotification('Failed to preview file. It may be corrupted or missing.', 'error');
        }
    };


    const handleDownload = async (fileName) => {
        if (!fileName) {
            showNotification('No file to download', 'error');
            return;
        }

        try {
            setIsLoading(true);
            await downloadFile(fileName).unwrap();
            showNotification('File downloaded successfully!');
        } catch (error) {
            console.error('Download failed:', error);
            showNotification('Failed to download file', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await deleteReport(deleteIdToConfirm).unwrap();
            showNotification('Report deleted successfully!');
            refetch();
        } catch (error) {
            console.error('Failed to delete report:', error);
            showNotification('Failed to delete report!', 'error');
        } finally {
            setShowDeleteConfirmModal(false);
            setDeleteIdToConfirm(null);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDetailChange = (index, field, value) => {
        const newDetails = [...formData.details];
        newDetails[index][field] = value;
        setFormData(prev => ({ ...prev, details: newDetails }));
        
        if (field === 'Report_id' && reportData.length > 0) {
            const report = reportData.find(r => r.Report_id === parseInt(value));
            setSelectedReportName(prev => ({
                ...prev,
                [index]: report ? report.report_name : ''
            }));
        }
    };

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        setFiles(prev => ({ 
            ...prev, 
            [`file_${index}`]: file 
        }));

        handleDetailChange(index, 'file_key', `file_${index}`);
    };

    const handleAddDetailRow = () => {
        setFormData(prev => ({
            ...prev,
            details: [
                ...prev.details,
                {
                    report_date: new Date().toISOString().split("T")[0],
                    Report_id: '',
                    Doctor_and_Hospital_name: '',
                    file_key: '',
                    row_action: 'add',
                    uploaded_file_name: ''
                }
            ]
        }));
    };

    const handleRemoveDetailRow = (index) => {
        const detailToRemove = formData.details[index];
        
        if (detailToRemove.row_action === 'add') {
            const newDetails = [...formData.details];
            newDetails.splice(index, 1);
            setFormData(prev => ({ ...prev, details: newDetails }));
            
            if (detailToRemove.file_key) {
                setFiles(prev => {
                    const newFiles = { ...prev };
                    delete newFiles[detailToRemove.file_key];
                    return newFiles;
                });
            }
            
            const newReportNames = { ...selectedReportName };
            delete newReportNames[index];
            setSelectedReportName(newReportNames);
        } else if (detailToRemove.detail_id) {
            const newDetails = [...formData.details];
            newDetails[index].row_action = 'delete';
            setFormData(prev => ({ ...prev, details: newDetails }));
            
            setDeletedDetails(prev => [...prev, detailToRemove.detail_id]);
        }
    };

    const getActiveDetails = () => {
        return formData.details.filter(detail => detail.row_action !== 'delete');
    };

    const handleRestoreDetail = (detailId) => {
        const newDetails = [...formData.details];
        const detailIndex = newDetails.findIndex(d => d.detail_id === detailId);
        if (detailIndex !== -1) {
            newDetails[detailIndex].row_action = 'update';
            setFormData(prev => ({ ...prev, details: newDetails }));
            
            setDeletedDetails(prev => prev.filter(id => id !== detailId));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            
            const submitData = {
                Member_id: parseInt(formData.Member_id),
                Family_id: parseInt(formData.Family_id),
                purpose: formData.purpose,
                remarks: formData.remarks || '',
                Created_by: formData.Created_by,
                Modified_by: formData.Modified_by,
                details: formData.details.map(detail => {
                    const baseDetail = {
                        report_date: detail.report_date,
                        Report_id: parseInt(detail.Report_id),
                        Doctor_and_Hospital_name: detail.Doctor_and_Hospital_name || '',
                        row_action: detail.row_action || (detail.detail_id ? 'update' : 'add')
                    };
                    
                    if (detail.detail_id) {
                        baseDetail.detail_id = detail.detail_id;
                    }
                    
                    if (detail.file_key) {
                        baseDetail.file_key = detail.file_key;
                    }
                    
                    return baseDetail;
                })
            };

            if (editId) {
                await updateReport({ 
                    reportId: editId, 
                    payload: submitData, 
                    files 
                }).unwrap();
                showNotification('Report updated successfully!');
            } else {
                await createReport({ 
                    payload: submitData, 
                    files 
                }).unwrap();
                showNotification('Report created successfully!');
            }
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to save report:', error);
            const errorMessage = error?.data?.message || error?.data?.detail || 'Failed to save report!';
            showNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const activeDetails = getActiveDetails();

    const columns = [
        { 
            header: 'Doc No', 
            accessor: 'doc_No',
            cellRenderer: (row) => (
                <div className="font-mono font-semibold text-gray-800">
                    {row.doc_No || "N/A"}
                </div>
            )
        },
        { 
            header: 'Family ID', 
            accessor: 'Family_Name',
            cellRenderer: (row) => (
                <div className="text-gray-800">{row.Family_id || "N/A"}</div>
            )
        },
        { 
            header: 'Purpose', 
            accessor: 'purpose',
            cellRenderer: (row) => (
                <div className="max-w-xs truncate" title={row.purpose}>
                    {row.purpose || "N/A"}
                </div>
            )
        },
        { 
            header: 'Member Name', 
            accessor: 'Member_name',
            cellRenderer: (row) => (
                <div className="text-gray-800">{row.MemberReport_id || "N/A"}</div>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            isAction: true,
            className: 'text-center',
            actionRenderer: (row) => (
                <div className="flex justify-center space-x-2">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row);
                        }} 
                        title="Edit" 
                        className="p-2.5 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105 group"
                    >
                        <PencilSquareIcon className="h-5 w-5 text-blue-600 group-hover:text-blue-800" />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.MemberReport_id);
                        }} 
                        title="Delete" 
                        className="p-2.5 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105 group"
                    >
                        <Trash2 className="h-5 w-5 text-red-600 group-hover:text-red-800" />
                    </button>
                </div>
            )
        }
    ];

    if (isTableLoading) return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading reports...</p>
                <p className="text-sm text-gray-400 mt-1">Please wait while we fetch your data</p>
            </div>
        </div>
    );
    
    if (isError) return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-red-50">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100 max-w-md">
                <XCircleIcon className="h-16 w-16 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Reports</h3>
                <p className="text-gray-600 mb-6">There was a problem loading the reports. Please try again.</p>
                <button 
                    onClick={() => refetch()} 
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    Retry Loading
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            {notification.show && (
                <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg transition-all duration-300 animate-slide-in ${notification.type === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800' : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800'}`}>
                    <div className="flex items-center">
                        {notification.type === 'success' ? 
                            <CheckCircleIcon className="h-6 w-6 mr-3 text-green-600" /> : 
                            <XCircleIcon className="h-6 w-6 mr-3 text-red-600" />
                        }
                        <span className="font-medium">{notification.message}</span>
                    </div>
                </div>
            )}

            <div className="max-w-full">
                <TableUtility
                    title={
                        <div className="flex items-center space-x-3">
                            
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Member Reports</h1>
                            </div>
                        </div>
                    }
                    headerContent={
                        <div className="flex flex-wrap justify-between items-center gap-2">
                           
                            <CreateNewButton
                                onClick={handleAddNew}
                                label={
                                    <div className="flex items-center space-x-2">
                                        <Plus className="h-5 w-5" />
                                        <span>Add New Report</span>
                                    </div>
                                }
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                            />

                         
                        </div>
                    }
                    columns={columns}
                    data={Array.isArray(tableData) ? tableData : []}
                    pageSize={10}
                    searchable={true}
                    exportable={true}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                />
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${editId ? 'bg-yellow-100' : 'bg-green-100'}`}>
                            {editId ? (
                                <PencilSquareIcon className="h-6 w-6 text-yellow-600" />
                            ) : (
                                <Plus className="h-6 w-6 text-green-600" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {editId ? 'Edit Report' : 'Create New Report'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {editId ? 'Update existing report details' : 'Add a new medical report'}
                            </p>
                        </div>
                    </div>
                } 
                width={"2000px"}
            >
                <form onSubmit={handleSubmit} className="space-y-8">
                   
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          
                            <div className="w-full md:w-2/3">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <User className="h-4 w-4 mr-2 text-blue-500" />
                                    Family ID <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        name="Family_id" 
                                        value={formData.Family_id} 
                                        readOnly 
                                        disabled
                                        className="w-full px-4 py-3 border border-blue-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-not-allowed font-semibold text-blue-700"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ChevronRight className="h-5 w-5 text-blue-400" />
                                    </div>
                                </div>
                            </div>

                           
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <User className="h-4 w-4 mr-2 text-blue-500" />
                                    Select Member <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <select 
                                        name="Member_id" 
                                        value={formData.Member_id} 
                                        onChange={handleInputChange} 
                                        required 
                                        disabled={editId}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none pr-10 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-600"
                                    >
                                        <option value="" className="text-gray-400">Select a member</option>
                                        {isMemberLoading ? (
                                            <option value="" disabled>Loading members...</option>
                                        ) : (
                                            memberData.map((member) => (
                                                <option key={member.Member_id} value={member.Member_id} className="py-2">
                                                    {member.Member_name} - {member.Mobile_no}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                              
                            </div>
                                
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                        Purpose 
                                    </span>
                                </label>
                                <input 
                                    type="text" 
                                    name="purpose" 
                                    value={formData.purpose} 
                                    onChange={handleInputChange} 
                                    placeholder="e.g., Annual Checkup"
                                      className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                                    
                                />
                            </div>



                          
                            <div className="lg:col-span-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                        Remarks
                                    </span>
                                </label>
                                <textarea 
                                    name="remarks" 
                                    value={formData.remarks} 
                                    onChange={handleInputChange} 
                                    rows="2" 
                                    Remarks  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                                    placeholder="Additional notes, observations, or comments about this report..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            
                            <button 
                                type="button" 
                                onClick={handleAddDetailRow} 
                                className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <Plus className="h-5 w-5" /> 
                                <span>Add Report</span>
                            </button>
                        </div>

                    
                        {deletedDetails.length > 0 && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <Trash2 className="h-5 w-5 text-red-500 mr-3" />
                                        <div>
                                            <p className="font-medium text-red-700">
                                                {deletedDetails.length} detail{deletedDetails.length > 1 ? 's' : ''} marked for deletion
                                            </p>
                                            <p className="text-sm text-red-600 mt-1">
                                                These will be removed when you save changes
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const newDetails = [...formData.details];
                                            newDetails.forEach(detail => {
                                                if (detail.row_action === 'delete') {
                                                    detail.row_action = 'update';
                                                }
                                            });
                                            setFormData(prev => ({ ...prev, details: newDetails }));
                                            setDeletedDetails([]);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        Restore All
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeDetails.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                                <FileText className="h-14 w-14 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600 font-medium">No report details added yet</p>
                                <p className="text-sm text-gray-500 mt-1">Click "Add Detail" to start adding reports</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activeDetails.map((detail, index) => {
                                    const originalIndex = formData.details.findIndex(d => 
                                        detail.detail_id ? 
                                        d.detail_id === detail.detail_id : 
                                        d === detail
                                    );
                                    
                                    return (
                                        <div key={detail.detail_id || index} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-2 rounded-lg ${detail.detail_id ? 'bg-yellow-100' : 'bg-green-100'}`}>
                                                        {detail.detail_id ? (
                                                            <FileText className="h-5 w-5 text-yellow-600" />
                                                        ) : (
                                                            <Plus className="h-5 w-5 text-green-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-1">
                                                            <span className="font-semibold text-gray-800">Report Detail #{index + 1}</span>
                                                            {detail.detail_id ? (
                                                                <span className="px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                                                    Existing
                                                                </span>
                                                            ) : (
                                                                <span className="px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                                    New
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {selectedReportName[originalIndex] || 'Select report type'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {detail.uploaded_file_name && !files[`file_${originalIndex}`] && (
                                                        <>
                                                            <button 
                                                                type="button"
                                                                onClick={() => handlePreview(detail.uploaded_file_name)}
                                                                title="Preview File"
                                                                className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                                                            >
                                                                <EyeIcon className="h-4 w-4 text-blue-600 group-hover:text-blue-800" />
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleDownload(detail.uploaded_file_name)}
                                                                title="Download File"
                                                                className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
                                                            >
                                                                <DocumentArrowDownIcon className="h-4 w-4 text-green-600 group-hover:text-green-800" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveDetailRow(originalIndex)} 
                                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                                                    >
                                                        <X className="h-5 w-5 text-red-500 group-hover:text-red-700" />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                         
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                          
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                                        Report Date <span className="text-red-500 ml-1">*</span>
                                                    </label>
                                                    <input 
                                                        type="date" 
                                                        value={detail.report_date} 
                                                        onChange={(e) => handleDetailChange(originalIndex, 'report_date', e.target.value)} 
                                                        required 
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300" 
                                                    />
                                                </div>
                                                
                                         
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                                        Report Type <span className="text-red-500 ml-1">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <select 
                                                            value={detail.Report_id} 
                                                            onChange={(e) => handleDetailChange(originalIndex, 'Report_id', e.target.value)} 
                                                            required 
                                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none pr-10 hover:border-blue-300"
                                                        >
                                                            <option value="" className="text-gray-400">Select report type</option>
                                                            {isReportLoading ? (
                                                                <option value="" disabled>Loading report types...</option>
                                                            ) : (
                                                                reportData.map((report) => (
                                                                    <option key={report.Report_id} value={report.Report_id}>
                                                                        {report.report_name}
                                                                    </option>
                                                                ))
                                                            )}
                                                        </select>
                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    {selectedReportName[originalIndex] && (
                                                        <p className="mt-2 text-sm text-blue-600 font-medium truncate px-1">
                                                            {selectedReportName[originalIndex]}
                                                        </p>
                                                    )}
                                                </div>
                                                
                                             
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                        <DocumentArrowDownIcon className="h-4 w-4 mr-2 text-gray-500" />
                                                        Doctor/Hospital
                                                    </label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Doctor/Hospital name" 
                                                        value={detail.Doctor_and_Hospital_name} 
                                                        onChange={(e) => handleDetailChange(originalIndex, 'Doctor_and_Hospital_name', e.target.value)} 
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300" 
                                                    />
                                                </div>
                                                
                                           
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        <span className="flex items-center">
                                                            <DocumentArrowDownIcon className="h-4 w-4 mr-2 text-gray-500" />
                                                            Upload File
                                                        </span>
                                                    </label>
                                                    <div className="relative">
                                                        <input 
                                                            type="file" 
                                                            onChange={(e) => handleFileChange(e, originalIndex)} 
                                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                                        />
                                                    </div>
                                                    {detail.uploaded_file_name && !files[`file_${originalIndex}`] && (
                                                        <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                                            <p className="text-xs text-gray-600 truncate">
                                                                Current: <span className="font-medium">{detail.uploaded_file_name}</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                    {files[`file_${originalIndex}`] && (
                                                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                                            <p className="text-xs font-medium text-green-700">
                                                                New file: {files[`file_${originalIndex}`].name}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="px-8 py-3.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:shadow-md"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="h-5 w-5" />
                                    <span>{editId ? 'Update Report' : 'Create Report'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal 
                isOpen={showDeleteConfirmModal} 
                onClose={() => setShowDeleteConfirmModal(false)} 
                title={
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Confirm Deletion</h3>
                            <p className="text-sm text-gray-500">This action cannot be undone</p>
                        </div>
                    </div>
                } 
                size="md"
            >
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-50 to-pink-50 rounded-full mb-4">
                            <Trash2 className="h-10 w-10 text-red-500" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Delete Report?</h4>
                        <p className="text-gray-600">
                            Are you sure you want to delete this report? All associated files and details will be permanently removed.
                        </p>
                    </div>
                    <div className="flex justify-center space-x-4 pt-4">
                        <button 
                            onClick={() => setShowDeleteConfirmModal(false)} 
                            className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmDelete} 
                            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
                        >
                            <Trash2 className="h-5 w-5" />
                            <span>Delete Report</span>
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default MemberReport;