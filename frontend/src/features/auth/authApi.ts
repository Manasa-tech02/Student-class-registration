import { apiSlice } from "../../store/apiSlice";
import type { User, TokenPair } from "../../api"; 

// We 'inject' these endpoints into the main apiSlice so we don't need multiple stores.
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST /auth/login
    login: builder.mutation<TokenPair & { user?: User }, any>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    
    // POST /auth/signup
    signup: builder.mutation<TokenPair & { user?: User }, any>({
      query: (userData) => ({
        url: "/auth/signup",
        method: "POST",
        body: userData,
      }),
    }),
    
    // GET /auth/me
    getMe: builder.query<{ user: User }, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

// RTK Query magically generates these custom hooks for your UI screens!
export const { 
  useLoginMutation, 
  useSignupMutation, 
  useLazyGetMeQuery // 'Lazy' so we can trigger it manually during app startup
} = authApi;
