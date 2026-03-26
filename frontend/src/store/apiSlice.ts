import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "../authTokenStorage";
import { logout } from "../features/auth/authSlice";

// 1. Create the fundamental fetch call, automatically injecting the access token
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_API_URL,
  // Prevent "Loading..." from hanging forever if the backend is unreachable.
  // RTK Query will abort the request and return an error.
  timeout: 15000,
  prepareHeaders: async (headers) => {
    const token = await getAccessToken();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// 2. Wrap the baseQuery with our auto-refresh logic
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  // Wait until the mutex is available without locking it
  let result = await baseQuery(args, api, extraOptions);

  // If the backend says our token is expired (401 Unauthorized)
  if (result.error && result.error.status === 401) {
    const refreshToken = await getRefreshToken();
    
    if (refreshToken) {
      // Step A: Automatically try to get a new pair of tokens
      const refreshResult = await baseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Step B: Success! Save the new tokens physically
        const { token, refreshToken: newRefresh } = refreshResult.data as { token: string; refreshToken: string };
        await saveTokens(token, newRefresh);
        
        // Step C: Retry the original failed API call, invisibly to the user
        result = await baseQuery(args, api, extraOptions);
      } else {
        // The refresh token is ALSO dead. Wipe everything.
        await clearTokens();
        api.dispatch(logout()); // Tell Redux we are logged out
      }
    } else {
      // No refresh token on the device at all
      await clearTokens();
      api.dispatch(logout());
    }
  }

  return result;
};

// 3. Export the setup. We will inject endpoints (like login/signup) into this later.
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Course", "Enrollment", "AdminStudent", "AdminStats"],
  endpoints: () => ({}),
});
