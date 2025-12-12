// src/services/memberMasterApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

export const memberMasterApi = createApi({
    reducerPath: "memberMasterApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ["MemberMaster"],
    endpoints: (builder) => ({
        
        // ✔ Get All Members
        getMemberMasters: builder.query({
            query: () => "/members", // Changed from "/membermaster"
            providesTags: ["MemberMaster"],
        }),

        // ✔ Get Member by ID
        getMemberMasterById: builder.query({
            query: (id) => `/members/${id}`, // Changed from "/membermaster/${id}"
            providesTags: ["MemberMaster"],
        }),

        // ✔ Get Max doc_No
        getMaxMemberDocNo: builder.query({
            query: () => "/members/max-doc-no", // Changed from "/membermaster/max-doc-no"
            providesTags: ["MemberMaster"],
        }),

        // ✔ Create Member
        addMemberMaster: builder.mutation({
            query: (member) => ({
                url: "/members", // Changed from "/membermaster"
                method: "POST",
                body: member,
            }),
            invalidatesTags: ["MemberMaster"],
        }),

        // ✔ Update Member
        updateMemberMaster: builder.mutation({
            query: ({ id, ...member }) => ({
                url: `/members/${id}`, // Changed from `/membermaster/${id}`
                method: "PUT",
                body: member,
            }),
            invalidatesTags: ["MemberMaster"],
        }),

        // ✔ Delete Member
        deleteMemberMaster: builder.mutation({
            query: (id) => ({
                url: `/members/${id}`, // Changed from `/membermaster/${id}`
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