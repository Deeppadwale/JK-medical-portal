// src/services/memberMasterApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

export const memberMasterApi = createApi({
  reducerPath: "memberMasterApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["MemberMaster"],
  endpoints: (builder) => ({
    // =========================
    // Get All Members (optional Family_id filter)
    // =========================
    getMemberMasters: builder.query({
    query: (family_id) =>
      family_id
        ? `/members?family_id=${family_id}`
        : "/members",
    providesTags: ["MemberMaster"],
  }),

    // =========================
    // Get Member by ID
    // =========================
    getMemberMasterById: builder.query({
      query: (id) => `/members/${id}`,
      providesTags: ["MemberMaster"],
    }),

    // =========================
    // Get Max doc_No
    // =========================
    getMaxMemberDocNo: builder.query({
      query: () => "/members/max-doc-no",
      providesTags: ["MemberMaster"],
    }),

    // =========================
    // Create Member with optional files
    // =========================
    addMemberMaster: builder.mutation({
      query: (member) => {
        const formData = new FormData();
        Object.keys(member).forEach((key) => {
          if (member[key] !== undefined && member[key] !== null) {
            if (key === "pan_file" || key === "adhar_file" || key === "insurance_file") {
              formData.append(key, member[key]);
            } else {
              formData.append(key, member[key]);
            }
          }
        });

        return {
          url: "/members",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["MemberMaster"],
    }),

    // =========================
    // Update Member with optional file replacement
    // =========================
    updateMemberMaster: builder.mutation({
      query: ({ id, ...member }) => {
        const formData = new FormData();
        Object.keys(member).forEach((key) => {
          if (member[key] !== undefined && member[key] !== null) {
            formData.append(key, member[key]);
          }
        });

        return {
          url: `/members/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["MemberMaster"],
    }),

    // =========================
    // Delete Member
    // =========================
    deleteMemberMaster: builder.mutation({
      query: (id) => ({
        url: `/members/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MemberMaster"],
    }),
  }),
});

export const {
  useGetMemberMastersQuery,
  useGetMemberMasterByIdQuery,
  useGetMaxMemberDocNoQuery,
  useAddMemberMasterMutation,
  useUpdateMemberMasterMutation,
  useDeleteMemberMasterMutation,
} = memberMasterApi;
