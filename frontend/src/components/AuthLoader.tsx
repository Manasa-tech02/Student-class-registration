import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getAccessToken } from "../authTokenStorage";
import { setCredentials, setInitialized } from "../features/auth/authSlice";
import { useLazyGetMeQuery } from "../features/auth/authApi";
import type { ReactNode } from "react";

export function AuthLoader({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const [triggerGetMe] = useLazyGetMeQuery();

  useEffect(() => {
    async function initAuth() {
      const token = await getAccessToken();
      if (token) {
        try {
          // Immediately try to fetch user profile with saved token
          const res = await triggerGetMe().unwrap();
          dispatch(setCredentials({ user: res.user, token }));
        } catch (e) {
          // baseQueryWithReauth will handle 401s automatically.
          // If it entirely fails, set status as initialized (unauthenticated)
          dispatch(setInitialized());
        }
      } else {
        // No token on hard drive, user must log in
        dispatch(setInitialized());
      }
    }
    initAuth();
  }, [dispatch, triggerGetMe]);

  return <>{children}</>;
}
