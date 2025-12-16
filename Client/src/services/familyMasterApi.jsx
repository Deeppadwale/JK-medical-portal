// src/services/familyMasterApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

export const familyMasterApi = createApi({
  reducerPath: "familyMasterApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["FamilyMaster"],

  endpoints: (builder) => ({

    // =========================
    // Get All Families
    // =========================
    getFamilyMasters: builder.query({
      query: () => "/families",
      providesTags: ["FamilyMaster"],
    }),

    // =========================
    // Get Family by ID
    // =========================
    getFamilyMasterById: builder.query({
      query: (id) => `/families/${id}`,
      providesTags: (result, error, id) => [
        { type: "FamilyMaster", id },
      ],
    }),

    // =========================
    // Create Family
    // Payload supports:
    // MobileNumbers: string[]
    // =========================
    addFamilyMaster: builder.mutation({
      query: (family) => ({
        url: "/families",
        method: "POST",
        body: {
          ...family,
          MobileNumbers: family.MobileNumbers || [], // ✅ ensure array
        },
      }),
      invalidatesTags: ["FamilyMaster"],
    }),

    // =========================
    // Update Family
    // =========================
    updateFamilyMaster: builder.mutation({
      query: ({ id, ...family }) => ({
        url: `/families/${id}`,
        method: "PUT",
        body: {
          ...family,
          MobileNumbers: family.MobileNumbers || [], // ✅ ensure array
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "FamilyMaster", id },
        "FamilyMaster",
      ],
    }),

    // =========================
    // Delete Family
    // =========================
    deleteFamilyMaster: builder.mutation({
      query: (id) => ({
        url: `/families/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FamilyMaster"],
    }),
  }),
});

export const {
  useGetFamilyMastersQuery,
  useGetFamilyMasterByIdQuery,
  useAddFamilyMasterMutation,
  useUpdateFamilyMasterMutation,
  useDeleteFamilyMasterMutation,
} = familyMasterApi;
