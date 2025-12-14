

// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8000";

// export const memberReportApi = createApi({
//     reducerPath: "memberReportApi",
//     baseQuery: fetchBaseQuery({ 
//         baseUrl: API_BASE_URL,
//         prepareHeaders: (headers) => {
//             const token = localStorage.getItem("token");
//             if (token) {
//                 headers.set("Authorization", `Bearer ${token}`);
//             }
//             // Don't set Content-Type for FormData - browser will set it automatically
//             return headers;
//         },
//     }),
//     tagTypes: ["MemberReport"],
//     endpoints: (builder) => ({
//         // GET ALL REPORTS
//         getMemberReports: builder.query({
//             query: ({ skip = 0, limit = 100 } = {}) => 
//                 `/memberreport?skip=${skip}&limit=${limit}`,
//             providesTags: ["MemberReport"],
//             transformResponse: (response, meta) => {
//                 // Add console log for debugging
//                 console.log('Reports fetched:', response?.length || 0, 'items');
//                 return response;
//             },
//         }),

//         // GET MAX DOC NO
//         getMaxDocNo: builder.query({
//             query: () => `/memberreport/max-doc-no`,
//             transformResponse: (response) => {
//                 console.log('Max doc no:', response?.max_doc_no);
//                 return response;
//             },
//         }),

//         // CREATE REPORT
//         uploadMemberReport: builder.mutation({
//             query: (formData) => {
//                 // Debug form data
//                 const formDataEntries = Array.from(formData.entries());
//                 console.log('Uploading report - FormData entries:', formDataEntries.length);
                
//                 // Log non-file fields for debugging
//                 formDataEntries.forEach(([key, value]) => {
//                     if (!(value instanceof File)) {
//                         console.log(`${key}:`, value);
//                     } else {
//                         console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
//                     }
//                 });
                
//                 return {
//                     url: `/memberreport/upload`,
//                     method: "POST",
//                     body: formData,
//                 };
//             },
//             invalidatesTags: ["MemberReport"],
//         }),

//         // UPDATE REPORT
//         updateMemberReport: builder.mutation({
//             query: ({ id, formData }) => {
//                 // Debug form data for update
//                 const formDataEntries = Array.from(formData.entries());
//                 console.log(`Updating report ${id} - FormData entries:`, formDataEntries.length);
                
//                 formDataEntries.forEach(([key, value]) => {
//                     if (!(value instanceof File) && key !== 'file_actions') {
//                         console.log(`${key}:`, value);
//                     } else if (value instanceof File) {
//                         console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
//                     } else if (key === 'file_actions') {
//                         console.log(`${key}:`, value);
//                     }
//                 });
                
//                 return {
//                     url: `/memberreport/update/${id}`,
//                     method: "PUT",
//                     body: formData,
//                 };
//             },
//             invalidatesTags: ["MemberReport"],
//         }),

//         // DELETE REPORT
//         deleteMemberReport: builder.mutation({
//             query: (id) => ({
//                 url: `/memberreport/${id}`,
//                 method: "DELETE",
//             }),
//             invalidatesTags: ["MemberReport"],
//         }),

//         // DOWNLOAD FILE - Enhanced version
//         downloadFile: builder.mutation({
//             query: (filename) => {
//                 // Clean filename
//                 const cleanFilename = encodeURIComponent(filename);
//                 console.log('Downloading file:', filename, '->', cleanFilename);
                
//                 return {
//                     url: `/memberreport/download/${cleanFilename}`,
//                     method: "GET",
//                     responseHandler: async (response) => {
//                         if (!response.ok) {
//                             // Try to read error message
//                             const errorText = await response.text();
//                             console.error('Download error:', {
//                                 status: response.status,
//                                 statusText: response.statusText,
//                                 error: errorText
//                             });
                            
//                             let errorMessage = `Download failed: ${response.status} ${response.statusText}`;
//                             try {
//                                 const errorJson = JSON.parse(errorText);
//                                 errorMessage = errorJson.detail || errorJson.message || errorMessage;
//                             } catch {
//                                 // Not JSON, use text
//                             }
                            
//                             throw new Error(errorMessage);
//                         }
                        
//                         // Check content type
//                         const contentType = response.headers.get('content-type');
//                         const contentLength = response.headers.get('content-length');
                        
//                         console.log('Download response:', {
//                             contentType,
//                             contentLength,
//                             filename
//                         });
                        
//                         // If it's JSON, it's probably an error
//                         if (contentType && contentType.includes('application/json')) {
//                             const errorData = await response.json();
//                             throw new Error(errorData.detail || 'Server returned JSON instead of file');
//                         }
                        
//                         // Return blob for file download
//                         return response.blob();
//                     },
//                     cache: 'no-cache',
//                 };
//             },
//         }),

//         // VIEW FILE IN BROWSER (for preview)
//         viewFileInBrowser: builder.mutation({
//             query: (filename) => {
//                 const cleanFilename = encodeURIComponent(filename);
//                 console.log('Viewing file in browser:', filename);
                
//                 return {
//                     url: `/memberreport/view/${cleanFilename}`,
//                     method: "GET",
//                     responseHandler: async (response) => {
//                         if (!response.ok) {
//                             const errorText = await response.text();
//                             console.error('View error:', errorText);
//                             throw new Error(`Preview failed: ${response.status}`);
//                         }
                        
//                         const contentType = response.headers.get('content-type');
                        
//                         // For images and PDFs, we can return blob for preview
//                         if (contentType && (
//                             contentType.includes('image/') || 
//                             contentType.includes('application/pdf') ||
//                             contentType.includes('text/')
//                         )) {
//                             return response.blob();
//                         }
                        
//                         // For other types, get the URL
//                         throw new Error('File cannot be previewed in browser');
//                     },
//                 };
//             },
//         }),

//         // GET FILE PREVIEW INFO
//         getFilePreviewInfo: builder.query({
//             query: (filename) => {
//                 const cleanFilename = encodeURIComponent(filename);
//                 return `/memberreport/preview/${cleanFilename}`;
//             },
//         }),

//         // GET FILE LIST (for debugging)
//         getFileList: builder.query({
//             query: () => `/memberreport/files/list`,
//         }),

//         // HEALTH CHECK
//         healthCheck: builder.query({
//             query: () => `/memberreport/health/check`,
//         }),
//     }),
// });

// // Export hooks
// export const {
//     useGetMemberReportsQuery,
//     useGetMaxDocNoQuery,
//     useUploadMemberReportMutation,
//     useUpdateMemberReportMutation,
//     useDeleteMemberReportMutation,
//     useDownloadFileMutation,
//     useViewFileInBrowserMutation,
//     useGetFilePreviewInfoQuery,
//     useGetFileListQuery,
//     useHealthCheckQuery,
//     useLazyGetFilePreviewInfoQuery,
// } = memberReportApi;

// Helper function to format FormData for debugging
// export const logFormData = (formData) => {
//     const entries = Array.from(formData.entries());
//     console.group('FormData Contents');
//     entries.forEach(([key, value]) => {
//         if (value instanceof File) {
//             console.log(`${key}: File - ${value.name} (${value.size} bytes, ${value.type})`);
//         } else {
//             console.log(`${key}:`, value);
//         }
//     });
//     console.groupEnd();
//     return entries;
// };

// // Helper to create FormData for report
// export const createReportFormData = (data, files = {}) => {
//     const formData = new FormData();
    
//     // Add regular fields
//     if (data.Member_id) formData.append('Member_id', data.Member_id);
//     if (data.Report_id) formData.append('Report_id', data.Report_id);
//     if (data.purpose) formData.append('purpose', data.purpose);
//     if (data.remarks !== undefined) formData.append('remarks', data.remarks);
//     if (data.doc_No) formData.append('doc_No', data.doc_No);
//     if (data.Created_by) formData.append('Created_by', data.Created_by);
//     if (data.Modified_by) formData.append('Modified_by', data.Modified_by);
    
//     // Add files
//     Object.entries(files).forEach(([key, file]) => {
//         if (file && file instanceof File) {
//             formData.append(key, file);
//         }
//     });
    
//     return formData;
// };

// // Helper to create update FormData
// export const createUpdateFormData = (data, files = {}, existingFiles = {}) => {
//     const formData = new FormData();
    
//     // Add regular fields
//     if (data.purpose !== undefined) formData.append('purpose', data.purpose);
//     if (data.remarks !== undefined) formData.append('remarks', data.remarks);
//     if (data.Modified_by !== undefined) formData.append('Modified_by', data.Modified_by);
    
//     // Build file actions JSON
//     const fileActions = {};
    
//     Object.keys(files).forEach(key => {
//         const file = files[key];
//         const oldFile = existingFiles[key];
        
//         if (file === null && oldFile) {
//             // File removed
//             fileActions[key] = 'delete';
//         } else if (file && file instanceof File) {
//             // New file uploaded
//             formData.append(key, file);
//             fileActions[key] = 'update';
//         } else if (file && typeof file === 'string' && file === oldFile) {
//             // File unchanged
//             fileActions[key] = 'keep';
//         }
//     });
    
//     // Add file actions JSON
//     if (Object.keys(fileActions).length > 0) {
//         formData.append('file_actions', JSON.stringify(fileActions));
//     }
    
//     return formData;
// };




import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8000";

export const memberReportApi = createApi({
    reducerPath: "memberReportApi",
    baseQuery: fetchBaseQuery({ 
        baseUrl: API_BASE_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["MemberReport", "MemberReportDetail", "File"],
    endpoints: (builder) => ({
        // ========== GET REQUESTS ==========
        
        // GET ALL REPORTS
        getMemberReports: builder.query({
            query: ({ skip = 0, limit = 100 } = {}) => ({
                url: `/memberreport`,
                params: { skip, limit }
            }),
            providesTags: ["MemberReport"],
            transformResponse: (response) => {
                console.log('Reports fetched:', response?.length || 0, 'items');
                return response;
            },
        }),

        // GET SINGLE REPORT
        getMemberReport: builder.query({
            query: (reportId) => `/memberreport/${reportId}`,
            providesTags: (result, error, id) => [
                { type: "MemberReport", id },
                { type: "MemberReportDetail", id }
            ],
            transformResponse: (response) => {
                console.log('Report fetched:', response?.MemberReport_id);
                return response;
            },
        }),

        // GET REPORT WITH PREVIEW
        getMemberReportWithPreview: builder.query({
            query: (reportId) => `/memberreport/${reportId}?include_preview=true`,
            providesTags: (result, error, id) => [
                { type: "MemberReport", id },
                { type: "MemberReportDetail", id }
            ],
        }),

        // GET MAX DOC NO
        getMaxDocNo: builder.query({
            query: () => `/memberreport/max-doc-no`,
            transformResponse: (response) => {
                console.log('Max doc no:', response?.max_doc_no);
                return response?.max_doc_no || 0;
            },
        }),

        // GET FILE PREVIEW INFO
        getFilePreviewInfo: builder.query({
            query: (filename) => {
                const encodedFilename = encodeURIComponent(filename);
                return `/memberreport/preview/${encodedFilename}`;
            },
            providesTags: (result, error, filename) => [
                { type: "File", id: filename }
            ],
        }),

        // GET FILE LIST
        getFileList: builder.query({
            query: () => `/memberreport/files/list`,
            providesTags: ["File"],
        }),

        // HEALTH CHECK
        healthCheck: builder.query({
            query: () => `/memberreport/health/check`,
        }),

        // ========== POST/MUTATION REQUESTS ==========

        // CREATE REPORT WITHOUT FILES
        createMemberReport: builder.mutation({
            query: (reportData) => {
                const formData = new FormData();
                
                // Add basic report data
                formData.append("Member_id", reportData.Member_id.toString());
                formData.append("Family_id", reportData.Family_id.toString());
                formData.append("purpose", reportData.purpose);
                formData.append("Created_by", reportData.Created_by);
                
                if (reportData.remarks) {
                    formData.append("remarks", reportData.remarks);
                }
                
                // Add details as JSON
                const detailsJson = JSON.stringify(reportData.details || []);
                formData.append("details_json", detailsJson);
                
                console.log('Creating report:', {
                    Member_id: reportData.Member_id,
                    purpose: reportData.purpose,
                    detailsCount: reportData.details?.length || 0
                });
                
                return {
                    url: "/memberreport/upload",
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["MemberReport"],
        }),

        // CREATE REPORT WITH FILES
        createMemberReportWithFiles: builder.mutation({
            query: ({ reportData, files }) => {
                const formData = new FormData();
                
                // Add basic report data
                formData.append("Member_id", reportData.Member_id.toString());
                formData.append("Family_id", reportData.Family_id.toString());
                formData.append("purpose", reportData.purpose);
                formData.append("Created_by", reportData.Created_by);
                
                if (reportData.remarks) {
                    formData.append("remarks", reportData.remarks);
                }
                
                // Add details as JSON
                const detailsJson = JSON.stringify(reportData.details || []);
                formData.append("details_json", detailsJson);
                
                // Add files
                if (files && files.length > 0) {
                    files.forEach((file, index) => {
                        formData.append(`files`, file);
                    });
                }
                
                console.log('Creating report with files:', {
                    Member_id: reportData.Member_id,
                    purpose: reportData.purpose,
                    detailsCount: reportData.details?.length || 0,
                    fileCount: files?.length || 0
                });
                
                return {
                    url: "/memberreport/upload-with-files",
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["MemberReport"],
        }),

        // UPDATE REPORT
        updateMemberReport: builder.mutation({
            query: ({ reportId, reportData }) => {
                const formData = new FormData();
                
                // Add updated fields
                if (reportData.purpose !== undefined) {
                    formData.append("purpose", reportData.purpose);
                }
                if (reportData.remarks !== undefined) {
                    formData.append("remarks", reportData.remarks);
                }
                if (reportData.Modified_by !== undefined) {
                    formData.append("Modified_by", reportData.Modified_by);
                }
                
                // Add updated details as JSON
                if (reportData.details !== undefined) {
                    const detailsJson = JSON.stringify(reportData.details);
                    formData.append("details_json", detailsJson);
                }
                
                console.log('Updating report:', {
                    reportId,
                    purpose: reportData.purpose,
                    detailsCount: reportData.details?.length || 0
                });
                
                return {
                    url: `/memberreport/${reportId}`,
                    method: "PUT",
                    body: formData,
                };
            },
            invalidatesTags: (result, error, { reportId }) => [
                { type: "MemberReport", id: reportId },
                { type: "MemberReportDetail", id: reportId }
            ],
        }),

        // UPDATE DETAIL FILE
        updateDetailFile: builder.mutation({
            query: ({ detailId, file }) => {
                const formData = new FormData();
                formData.append("file", file);
                
                console.log('Updating detail file:', {
                    detailId,
                    fileName: file.name,
                    fileSize: file.size
                });
                
                return {
                    url: `/memberreport/detail/${detailId}/file`,
                    method: "PUT",
                    body: formData,
                };
            },
            invalidatesTags: (result, error, { detailId }) => [
                { type: "MemberReportDetail", id: detailId },
                "File"
            ],
        }),

        // DELETE REPORT
        deleteMemberReport: builder.mutation({
            query: (reportId) => ({
                url: `/memberreport/${reportId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["MemberReport"],
        }),

        // DELETE DETAIL
        deleteDetail: builder.mutation({
            query: (detailId) => ({
                url: `/memberreport/detail/${detailId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, detailId) => [
                { type: "MemberReportDetail", id: detailId },
                "MemberReport"
            ],
        }),

        // ========== FILE OPERATIONS ==========

        // DOWNLOAD FILE
        downloadFile: builder.mutation({
            query: (filename) => {
                const encodedFilename = encodeURIComponent(filename);
                console.log('Downloading file:', filename);
                
                return {
                    url: `/memberreport/download/${encodedFilename}`,
                    method: "GET",
                    responseHandler: async (response) => {
                        if (!response.ok) {
                            const errorText = await response.text();
                            console.error('Download error:', errorText);
                            throw new Error(`Download failed: ${response.status}`);
                        }
                        
                        const contentType = response.headers.get('content-type');
                        const contentLength = response.headers.get('content-length');
                        
                        console.log('Download response:', {
                            contentType,
                            contentLength,
                            filename
                        });
                        
                        return response.blob();
                    },
                    cache: 'no-cache',
                };
            },
        }),

        // VIEW FILE IN BROWSER
        viewFileInBrowser: builder.mutation({
            query: (filename) => {
                const encodedFilename = encodeURIComponent(filename);
                console.log('Viewing file in browser:', filename);
                
                return {
                    url: `/memberreport/view/${encodedFilename}`,
                    method: "GET",
                    responseHandler: async (response) => {
                        if (!response.ok) {
                            const errorText = await response.text();
                            console.error('View error:', errorText);
                            throw new Error(`Preview failed: ${response.status}`);
                        }
                        
                        const contentType = response.headers.get('content-type');
                        
                        if (contentType && (
                            contentType.includes('image/') || 
                            contentType.includes('application/pdf') ||
                            contentType.includes('text/')
                        )) {
                            return response.blob();
                        }
                        
                        throw new Error('File cannot be previewed in browser');
                    },
                };
            },
        }),

        // ========== BATCH OPERATIONS ==========

        // BATCH UPLOAD
        batchUploadReports: builder.mutation({
            query: (reportsData) => {
                const formData = new FormData();
                formData.append("reports_json", JSON.stringify(reportsData));
                
                console.log('Batch uploading reports:', reportsData.length);
                
                return {
                    url: "/memberreport/batch-upload",
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["MemberReport"],
        }),
    }),
});

// Export hooks
export const {
    // Queries
    useGetMemberReportsQuery,
    useGetMemberReportQuery,
    useGetMemberReportWithPreviewQuery,
    useGetMaxDocNoQuery,
    useGetFilePreviewInfoQuery,
    useGetFileListQuery,
    useHealthCheckQuery,
    useLazyGetFilePreviewInfoQuery,
    useLazyGetMemberReportQuery,
    useLazyGetMemberReportsQuery,
    
    // Mutations
    useCreateMemberReportMutation,
    useCreateMemberReportWithFilesMutation,
    useUpdateMemberReportMutation,
    useUpdateDetailFileMutation,
    useDeleteMemberReportMutation,
    useDeleteDetailMutation,
    useDownloadFileMutation,
    useViewFileInBrowserMutation,
    useBatchUploadReportsMutation,
} = memberReportApi;

// Export types