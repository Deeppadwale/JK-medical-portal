// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const BASE_URL = 'http://localhost:8000';

// export const memberReportApi = createApi({
//   reducerPath: 'memberReportApi',
//   baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
//   tagTypes: ['MemberReport'],
//   endpoints: (builder) => ({

//     getReportsByFamily: builder.query({
//       query: (family_id) => `/member-report/family/${family_id}`,
//       providesTags: ['MemberReport'],
//       transformResponse: (response) => {
//         // Sort by Created_at in descending order
//         return [...response].sort((a, b) => 
//           new Date(b.Created_at) - new Date(a.Created_at)
//         );
//       }
//     }),

//     getReportById: builder.query({
//       query: (id) => `/member-report/${id}`,
//       providesTags: (result, error, id) => [{ type: 'MemberReport', id }],
//     }),

//     createReport: builder.mutation({
//       query: ({ payload, files }) => {
//         const formData = new FormData();
//         formData.append('payload', JSON.stringify(payload));

//         if (files) {
//           Object.keys(files).forEach((key) => {
//             if (files[key]) {
//               formData.append(key, files[key]);
//             }
//           });
//         }

//         return {
//           url: '/member-report/',
//           method: 'POST',
//           body: formData,
//         };
//       },
//       invalidatesTags: ['MemberReport'],
//     }),

//     updateReport: builder.mutation({
//       query: ({ reportId, payload, files }) => {
//         const formData = new FormData();
//         formData.append('payload', JSON.stringify(payload));

//         if (files) {
//           Object.keys(files).forEach((key) => {
//             if (files[key]) {
//               formData.append(key, files[key]);
//             }
//           });
//         }

//         return {
//           url: `/member-report/${reportId}`,
//           method: 'PUT',
//           body: formData,
//         };
//       },
//       invalidatesTags: ['MemberReport'],
//     }),

//     deleteReport: builder.mutation({
//       query: (reportId) => ({
//         url: `/member-report/${reportId}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: ['MemberReport'],
//     }),

//     previewFile: builder.query({
//       query: (filename) => ({
//         url: `/member-report/preview/${encodeURIComponent(filename)}`,
//         responseHandler: (response) => response.blob(),
//       }),
//       providesTags: ['MemberReport'],
//       keepUnusedDataFor: 0,
//     }),

//     downloadFile: builder.mutation({
//       query: (filename) => ({
//         url: `/member-report/download/${encodeURIComponent(filename)}`,
//         responseHandler: async (response) => {
//           const blob = await response.blob();
//           const url = window.URL.createObjectURL(blob);
//           const a = document.createElement('a');
//           a.href = url;
//           a.download = filename;
//           document.body.appendChild(a);
//           a.click();
//           window.URL.revokeObjectURL(url);
//           document.body.removeChild(a);
//           return { success: true };
//         },
//       }),
//     }),

//   }),
// });

// export const {
//   useGetReportsByFamilyQuery,
//   useGetReportByIdQuery,
//   useCreateReportMutation,
//   useUpdateReportMutation,
//   useDeleteReportMutation,
//   usePreviewFileQuery,
//   useDownloadFileMutation,
// } = memberReportApi;



import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const memberReportApi = createApi({
  reducerPath: 'memberReportAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000', // 🔁 change if needed
  }),
  tagTypes: ['MemberReport'],
  endpoints: (builder) => ({

    // ================= CREATE =================
    createMemberReport: builder.mutation({
      query: ({ payload, files }) => {
        const formData = new FormData();

        // payload must be string
        formData.append('payload', JSON.stringify(payload));

        // attach files
        if (files) {
          Object.entries(files).forEach(([key, file]) => {
            if (file) formData.append(key, file);
          });
        }

        return {
          url: '/member-report/create',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['MemberReport'],
    }),

    // ================= UPDATE =================
    updateMemberReport: builder.mutation({
      query: ({ MemberReport_id, payload, files }) => {
        const formData = new FormData();
        formData.append('payload', JSON.stringify(payload));

        if (files) {
          Object.entries(files).forEach(([key, file]) => {
            if (file) formData.append(key, file);
          });
        }

        return {
          url: `/member-report/update?MemberReport_id=${MemberReport_id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['MemberReport'],
    }),

    // ================= DELETE =================
    deleteMemberReport: builder.mutation({
      query: (MemberReport_id) => ({
        url: `/member-report/delete?MemberReport_id=${MemberReport_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MemberReport'],
    }),

    // ================= GET ALL =================
    getAllMemberReports: builder.query({
      query: () => '/member-report/',
      providesTags: ['MemberReport'],
    }),

    // ================= GET BY ID =================
    getMemberReportById: builder.query({
      query: (report_id) => `/member-report/${report_id}`,
      providesTags: ['MemberReport'],
    }),

    // ================= GET BY FAMILY =================
    getMemberReportsByFamily: builder.query({
      query: (family_id) => `/member-report/family/${family_id}`,
      providesTags: ['MemberReport'],
    }),

    // ================= FILE PREVIEW =================
    previewReportFile: builder.query({
      query: (filename) => ({
        url: `/member-report/preview/${filename}`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ================= FILE DOWNLOAD =================
    downloadReportFile: builder.query({
      query: (filename) => ({
        url: `/member-report/download/${filename}`,
        responseHandler: (response) => response.blob(),
      }),
    }),

  }),
});

export const {
  useCreateMemberReportMutation,
  useUpdateMemberReportMutation,
  useDeleteMemberReportMutation,
  useGetAllMemberReportsQuery,
  useGetMemberReportByIdQuery,
  useGetMemberReportsByFamilyQuery,
  useLazyPreviewReportFileQuery,
  useLazyDownloadReportFileQuery,
} = memberReportApi;
