// // services/memberReportApi.js
// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8000";

// export const memberReportApi = createApi({
//     reducerPath: "memberReportApi",
//     baseQuery: fetchBaseQuery({
//         baseUrl: API_BASE_URL,
//         prepareHeaders: (headers) => {
//             const token = localStorage.getItem("token");
//             if (token) headers.set("Authorization", `Bearer ${token}`);
//             return headers;
//         },
//     }),

//     tagTypes: ["MemberReport"],

//     endpoints: (builder) => ({

//         // GET ALL REPORTS
//         getMemberReports: builder.query({
//             query: ({ skip = 0, limit = 100 }) =>
//                 `/memberreport?skip=${skip}&limit=${limit}`,
//             providesTags: ["MemberReport"],
//         }),

//         // GET REPORT BY ID
//         getMemberReportById: builder.query({
//             query: ({ id, includePreview = false }) =>
//                 `/memberreport/${id}?include_preview=${includePreview}`,
//             providesTags: (_, __, { id }) => [{ type: "MemberReport", id }],
//         }),

//         // MAX DOC NO
//         getMaxDocNo: builder.query({
//             query: () => `/memberreport/max-doc-no`,
//         }),

//         // CREATE (UPLOAD)
//         uploadMemberReport: builder.mutation({
//             query: (formData) => ({
//                 url: `/memberreport/upload`,
//                 method: "POST",
//                 body: formData,
//             }),
//             invalidatesTags: ["MemberReport"],
//         }),

//         // UPDATE
//         updateMemberReport: builder.mutation({
//             query: ({ id, formData }) => ({
//                 url: `/memberreport/update/${id}`,
//                 method: "PUT",
//                 body: formData,
//             }),
//             invalidatesTags: (_, __, { id }) => [{ type: "MemberReport", id }],
//         }),

//         // DELETE
//         deleteMemberReport: builder.mutation({
//             query: (id) => ({
//                 url: `/memberreport/${id}`,
//                 method: "DELETE",
//             }),
//             invalidatesTags: ["MemberReport"],
//         }),

//         // DOWNLOAD FILE
//         lazyDownloadFile: builder.query({
//             query: (filename) => `/memberreport/download/${filename}`,
//         }),

//         // FILE PREVIEW
//         previewFile: builder.query({
//             query: (filename) => `/memberreport/preview/${filename}`,
//         }),

//         // ALL FILES PREVIEW
//         getAllFilesPreview: builder.query({
//             query: (fileType) =>
//                 fileType
//                     ? `/memberreport/files/preview?file_type=${fileType}`
//                     : `/memberreport/files/preview`,
//         }),

//         // FILES BY REPORT ID
//         getReportFilesPreview: builder.query({
//             query: (report_id) => `/memberreport/${report_id}/files/preview`,
//         }),

//         // REPORTS WITH PREVIEW
//         getAllReportsWithPreviews: builder.query({
//             query: ({ skip = 0, limit = 100 }) =>
//                 `/memberreport/with-previews/all?skip=${skip}&limit=${limit}`,
//         }),

//     }),
// });

// export const {
//     useGetMemberReportsQuery,
//     useGetMemberReportByIdQuery,
//     useGetMaxDocNoQuery,
//     useUploadMemberReportMutation,
//     useUpdateMemberReportMutation,
//     useDeleteMemberReportMutation,
//     useLazyDownloadFileQuery,
//     usePreviewFileQuery,
//     useGetAllFilesPreviewQuery,
//     useGetReportFilesPreviewQuery,
//     useGetAllReportsWithPreviewsQuery,
// } = memberReportApi;import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8000";

export const memberReportApi = createApi({
    reducerPath: "memberReportApi",
    baseQuery: fetchBaseQuery({ 
        baseUrl: API_BASE_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["MemberReport"],

    endpoints: (builder) => ({
        // GET ALL REPORTS
        getMemberReports: builder.query({
            query: ({ skip = 0, limit = 100 } = {}) => 
                `/memberreport?skip=${skip}&limit=${limit}`,
            providesTags: ["MemberReport"],
        }),

        // GET MAX DOC NO
        getMaxDocNo: builder.query({
            query: () => `/memberreport/max-doc-no`,
        }),

        // CREATE REPORT
        uploadMemberReport: builder.mutation({
            query: (formData) => {
                console.log('Sending form data:', Array.from(formData.entries()));
                return {
                    url: `/memberreport/upload`,
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["MemberReport"],
        }),

        // UPDATE REPORT
        updateMemberReport: builder.mutation({
            query: ({ id, formData }) => {
                console.log('Updating report:', id, Array.from(formData.entries()));
                return {
                    url: `/memberreport/update/${id}`,
                    method: "PUT",
                    body: formData,
                };
            },
            invalidatesTags: ["MemberReport"],
        }),

        // DELETE REPORT
        deleteMemberReport: builder.mutation({
            query: (id) => ({
                url: `/memberreport/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["MemberReport"],
        }),

        // DOWNLOAD FILE - Enhanced with better error handling
        downloadFile: builder.mutation({
            query: (filename) => ({
                url: `memberreport/download/${encodeURIComponent(filename)}`,
                method: "GET",
                responseHandler: async (response) => {
                    if (!response.ok) {
                        // Try to read error message
                        const errorText = await response.text();
                        console.error('Download error response:', errorText);
                        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
                    }
                    
                    // Check content type
                    const contentType = response.headers.get('content-type');
                    
                    // If it's JSON, it's probably an error
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        throw new Error(errorData.detail || 'Download failed');
                    }
                    
                    // Return blob for file download
                    return response.blob();
                },
                cache: 'no-cache',
            }),
        }),

        // GET FILE PREVIEW INFO
        getFilePreviewInfo: builder.query({
            query: (filename) => `/memberreport/preview/${encodeURIComponent(filename)}`,
        }),
    }),
});

export const {
    useGetMemberReportsQuery,
    useGetMaxDocNoQuery,
    useUploadMemberReportMutation,
    useUpdateMemberReportMutation,
    useDeleteMemberReportMutation,
    useDownloadFileMutation,
    useGetFilePreviewInfoQuery,
} = memberReportApi;