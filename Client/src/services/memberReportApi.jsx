import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'http://localhost:8000';

export const memberReportApi = createApi({
  reducerPath: 'memberReportApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['MemberReport'],
  endpoints: (builder) => ({

    getReportsByFamily: builder.query({
      query: (family_id) => `/member-report/family/${family_id}`,
      providesTags: ['MemberReport'],
      transformResponse: (response) => {
        // Sort by Created_at in descending order
        return [...response].sort((a, b) => 
          new Date(b.Created_at) - new Date(a.Created_at)
        );
      }
    }),

    getReportById: builder.query({
      query: (id) => `/member-report/${id}`,
      providesTags: (result, error, id) => [{ type: 'MemberReport', id }],
    }),

    createReport: builder.mutation({
      query: ({ payload, files }) => {
        const formData = new FormData();
        formData.append('payload', JSON.stringify(payload));

        if (files) {
          Object.keys(files).forEach((key) => {
            if (files[key]) {
              formData.append(key, files[key]);
            }
          });
        }

        return {
          url: '/member-report/',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['MemberReport'],
    }),

    updateReport: builder.mutation({
      query: ({ reportId, payload, files }) => {
        const formData = new FormData();
        formData.append('payload', JSON.stringify(payload));

        if (files) {
          Object.keys(files).forEach((key) => {
            if (files[key]) {
              formData.append(key, files[key]);
            }
          });
        }

        return {
          url: `/member-report/${reportId}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['MemberReport'],
    }),

    deleteReport: builder.mutation({
      query: (reportId) => ({
        url: `/member-report/${reportId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MemberReport'],
    }),

    previewFile: builder.query({
      query: (filename) => ({
        url: `/member-report/preview/${encodeURIComponent(filename)}`,
        responseHandler: (response) => response.blob(),
      }),
      providesTags: ['MemberReport'],
      keepUnusedDataFor: 0,
    }),

    downloadFile: builder.mutation({
      query: (filename) => ({
        url: `/member-report/download/${encodeURIComponent(filename)}`,
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          return { success: true };
        },
      }),
    }),

  }),
});

export const {
  useGetReportsByFamilyQuery,
  useGetReportByIdQuery,
  useCreateReportMutation,
  useUpdateReportMutation,
  useDeleteReportMutation,
  usePreviewFileQuery,
  useDownloadFileMutation,
} = memberReportApi;