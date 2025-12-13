// import { useState, useEffect } from 'react';
// import { X, CheckCircle, XCircle } from 'lucide-react';
// import {
//     useUpdateUserProfileMutation,
//     useGetUserByIdQuery
// } from '../../services/userMasterApi';
// import { decryptData } from  "../../common/Functions/DecryptData"

// const Toast = ({ message, type, onClose }) => {
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             onClose();
//         }, 3000);

//         return () => clearTimeout(timer);
//     }, [onClose]);

//     return (
//         <div className="fixed top-4 right-4 z-50 animate-fade-in">
//             <div className={`flex items-center p-4 rounded-lg shadow-lg ${type === 'success'
//                 ? 'bg-green-100 border border-green-200 text-green-800'
//                 : 'bg-red-100 border border-red-200 text-red-800'
//                 }`}>
//                 {type === 'success' ? (
//                     <CheckCircle className="w-5 h-5 mr-2" />
//                 ) : (
//                     <XCircle className="w-5 h-5 mr-2" />
//                 )}
//                 <span className="font-medium">{message}</span>
//                 <button
//                     onClick={onClose}
//                     className="ml-4 text-gray-500 hover:text-gray-700"
//                 >
//                     <X className="w-4 h-4" />
//                 </button>
//             </div>
//         </div>
//     );
// };

// const EditProfileModal = ({ isOpen, onClose }) => {
//     const [formData, setFormData] = useState({
//         User_Name: '',
//         EmailId: '',
//         Mobile: '',
//         userfullname: ''
//     });

//     const [isLoading, setIsLoading] = useState(false);
//     const [uid, setUid] = useState(null);
//     const [toast, setToast] = useState({ show: false, message: '', type: '' });
//     const [updateUserProfile] = useUpdateUserProfileMutation();

//     useEffect(() => {
//         if (isOpen) {
//             const encryptedUserData = sessionStorage.getItem('user_data');
//             const userData = encryptedUserData ? decryptData(encryptedUserData) : null;
//             setUid(userData?.uid || null);
//         }
//     }, [isOpen]);

//     const { data: userData, isLoading: isFetching } = useGetUserByIdQuery(uid, {
//         skip: !uid || !isOpen
//     });

//     useEffect(() => {
//         if (userData) {
//             setFormData({
//                 User_Name: userData.User_Name || '',
//                 EmailId: userData.EmailId || '',
//                 Mobile: userData.Mobile || '',
//                 userfullname: userData.userfullname || ''
//             });
//         }
//     }, [userData]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const showToast = (message, type) => {
//         setToast({ show: true, message, type });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);

//         try {
//             await updateUserProfile({ uid, ...formData }).unwrap();
//             showToast('Profile updated successfully!', 'success');
//             setTimeout(() => onClose(),500);
//         } catch (error) {
//             console.error('Error updating profile:', error);
//             showToast(error.message || 'Failed to update profile.', 'error');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     if (!isOpen) return null;

//     const fields = [
//         { label: 'Full Name', name: 'userfullname', type: 'text' },
//         { label: 'Username', name: 'User_Name', type: 'text' },
//         { label: 'Email', name: 'EmailId', type: 'email' },
//         { label: 'Mobile', name: 'Mobile', type: 'number' }
//     ];

//     return (
//         <>
//             {toast.show && (
//                 <Toast
//                     message={toast.message}
//                     type={toast.type}
//                     onClose={() => setToast({ show: false, message: '', type: '' })}
//                 />
//             )}

//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
//                 <div className="bg-white rounded-lg w-full max-w-md">
//                     <div className="flex items-center justify-between p-4 border-b">
//                         <h2 className="text-lg font-semibold text-[#D92300]">Edit Profile</h2>
//                         <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
//                             <X size={20} />
//                         </button>
//                     </div>

//                     <form onSubmit={handleSubmit} className="p-4 space-y-4">
//                         {fields.map((field) => (
//                             <div key={field.name}>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     {field.label}
//                                 </label>
//                                 <input
//                                     type={field.type}
//                                     autoComplete="off"
//                                     name={field.name}
//                                     value={formData[field.name]}
//                                     onChange={handleChange}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D92300]"
//                                     required
//                                 />
//                             </div>
//                         ))}

//                         <div className="flex justify-end space-x-3 pt-4">
//                             <button
//                                 type="button"
//                                 onClick={onClose}
//                                 className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="submit"
//                                 disabled={isLoading || isFetching}
//                                 className="px-4 py-2 bg-[#D92300] text-white rounded-md text-sm font-medium hover:bg-[#C11B00] disabled:opacity-50"
//                             >
//                                 {isLoading ? 'Updating...' : 'Update Profile'}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>

//             <style>{`
//                 @keyframes fade-in {
//                     from { opacity: 0; transform: translateY(-10px); }
//                     to { opacity: 1; transform: translateY(0); }
//                 }
//                 .animate-fade-in {
//                     animation: fade-in 0.3s ease-out;
//                 }
//             `}</style>
//         </>
//     );
// };

// export default EditProfileModal;


import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, XCircle, User, Mail, Phone, UserCircle, Save } from 'lucide-react';
import {
    useUpdateUserProfileMutation,
    useGetUserByIdQuery
} from '../../services/userMasterApi';
import { decryptData } from  "../../common/Functions/DecryptData"

const Toast = ({ message, type, onClose }) => {
    const toastRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div 
            ref={toastRef}
            className={`fixed top-4 right-4 z-[60] animate-slide-in-right flex items-center p-4 rounded-xl shadow-xl ${
                type === 'success'
                    ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-800'
                    : 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800'
            }`}
        >
            <div className="flex items-center">
                {type === 'success' ? (
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                ) : (
                    <div className="p-2 bg-red-100 rounded-lg mr-3">
                        <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                )}
                <div>
                    <span className="font-semibold">{type === 'success' ? 'Success!' : 'Error!'}</span>
                    <p className="text-sm mt-0.5">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="ml-4 text-gray-500 hover:text-gray-700 p-1 hover:bg-white/50 rounded-lg"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const EditProfileModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        User_Name: '',
        EmailId: '',
        Mobile: '',
        userfullname: ''
    });

    const [initialData, setInitialData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [uid, setUid] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [updateUserProfile] = useUpdateUserProfileMutation();
    const modalRef = useRef(null);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            const encryptedUserData = sessionStorage.getItem('user_data');
            const userData = encryptedUserData ? decryptData(encryptedUserData) : null;
            setUid(userData?.uid || null);
        }
    }, [isOpen]);

    const { data: userData, isLoading: isFetching } = useGetUserByIdQuery(uid, {
        skip: !uid || !isOpen
    });

    useEffect(() => {
        if (userData) {
            const newData = {
                User_Name: userData.User_Name || '',
                EmailId: userData.EmailId || '',
                Mobile: userData.Mobile || '',
                userfullname: userData.userfullname || ''
            };
            setFormData(newData);
            setInitialData(newData);
        }
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
    };

    const isFormChanged = () => {
        return Object.keys(formData).some(key => formData[key] !== initialData[key]);
    };

    const validateForm = () => {
        const errors = [];

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.EmailId && !emailRegex.test(formData.EmailId)) {
            errors.push('Please enter a valid email address');
        }

        // Mobile validation (assuming 10-digit Indian number)
        const mobileRegex = /^[0-9]{10}$/;
        if (formData.Mobile && !mobileRegex.test(formData.Mobile)) {
            errors.push('Please enter a valid 10-digit mobile number');
        }

        // Required fields
        if (!formData.userfullname.trim()) {
            errors.push('Full name is required');
        }

        if (!formData.User_Name.trim()) {
            errors.push('Username is required');
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if form is changed
        if (!isFormChanged()) {
            showToast('No changes detected', 'info');
            return;
        }

        // Validate form
        const errors = validateForm();
        if (errors.length > 0) {
            showToast(errors[0], 'error');
            return;
        }

        setIsLoading(true);

        try {
            await updateUserProfile({ uid, ...formData }).unwrap();
            
            // Update session storage with new data
            const encryptedUserData = sessionStorage.getItem('user_data');
            if (encryptedUserData) {
                const userData = decryptData(encryptedUserData);
                const updatedUserData = {
                    ...userData,
                    User_Name: formData.User_Name,
                    userfullname: formData.userfullname
                };
                sessionStorage.setItem('user_data', updatedUserData);
            }
            
            showToast('Profile updated successfully!', 'success');
            setInitialData(formData); // Update initial data after successful save
            
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Error updating profile:', error);
            let errorMessage = 'Failed to update profile. Please try again.';
            
            if (error.data?.detail) {
                errorMessage = error.data.detail;
            } else if (error.data?.message) {
                errorMessage = error.data.message;
            }
            
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const fields = [
        { 
            label: 'Full Name', 
            name: 'userfullname', 
            type: 'text', 
            icon: User,
            placeholder: 'Enter your full name',
            required: true
        },
        { 
            label: 'Username', 
            name: 'User_Name', 
            type: 'text', 
            icon: UserCircle,
            placeholder: 'Enter username',
            required: true
        },
        { 
            label: 'Email Address', 
            name: 'EmailId', 
            type: 'email', 
            icon: Mail,
            placeholder: 'example@domain.com',
            required: false
        },
        { 
            label: 'Mobile Number', 
            name: 'Mobile', 
            type: 'tel', 
            icon: Phone,
            placeholder: '10-digit mobile number',
            required: false
        }
    ];

    return (
        <>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: '' })}
                />
            )}

            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-[55] p-4">

                <div 
                    ref={modalRef}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-gradient-to-br from-[#F5EBEB] to-[#FFE8E8] rounded-xl">
                                <User className="text-[#D92300]" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                                <p className="text-sm text-gray-500 mt-1">Update your personal information</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-5">
                            {fields.map((field) => {
                                const Icon = field.icon;
                                const isChanged = formData[field.name] !== initialData[field.name];
                                
                                return (
                                    <div key={field.name} className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                            <Icon className="w-4 h-4 mr-2 text-gray-500" />
                                            {field.label}
                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={field.type}
                                                name={field.name}
                                                value={formData[field.name]}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 pl-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D92300] focus:border-transparent text-gray-900 placeholder-gray-400 ${
                                                    isChanged 
                                                        ? 'border-blue-300 bg-blue-50/50' 
                                                        : 'border-gray-300'
                                                }`}
                                                placeholder={field.placeholder}
                                                required={field.required}
                                                disabled={isLoading || isFetching}
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Icon className="w-5 h-5 text-gray-400" />
                                            </div>
                                            {isChanged && (
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                                                </div>
                                            )}
                                        </div>
                                        {isChanged && (
                                            <p className="text-xs text-blue-600 animate-fade-in flex items-center">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                                                Unsaved changes
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Changed Fields Summary */}
                        {isFormChanged() && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 animate-fade-in">
                                <p className="text-sm font-medium text-blue-800 mb-2">Changes to save:</p>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    {Object.keys(formData).map(key => {
                                        if (formData[key] !== initialData[key]) {
                                            const field = fields.find(f => f.name === key);
                                            return (
                                                <li key={key} className="flex items-center">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                                                    {field?.label || key}: {initialData[key] || 'Empty'} → {formData[key]}
                                                </li>
                                            );
                                        }
                                        return null;
                                    })}
                                </ul>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-end space-x-4 pt-8 border-t border-gray-100 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                                disabled={isLoading || isFetching}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || isFetching || !isFormChanged()}
                                className="px-5 py-2.5 bg-gradient-to-r from-[#D92300] to-[#C11B00] text-white rounded-xl font-medium hover:from-[#C11B00] hover:to-[#A91600] shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>
                {`
                    @keyframes scale-in {
                        from {
                            opacity: 0;
                            transform: scale(0.95) translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                    }

                    @keyframes slide-in-right {
                        from {
                            opacity: 0;
                            transform: translateX(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }

                    @keyframes fade-in {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    .animate-scale-in {
                        animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }

                    .animate-slide-in-right {
                        animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }

                    .animate-fade-in {
                        animation: fade-in 0.3s ease-out;
                    }
                `}
            </style>
        </>
    );
};

export default EditProfileModal;