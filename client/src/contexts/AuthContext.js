import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { authService } from "../utils/auth";

// Auth Context
const AuthContext = createContext();

// Auth Actions
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  RESTORE_SESSION: "RESTORE_SESSION",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Initial State
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.RESTORE_SESSION:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// AuthProvider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on app load
  useEffect(() => {
    const restoreSession = () => {
      try {
        if (authService.isAuthenticated()) {
          const user = authService.getUser();
          const token = authService.getToken();

          if (user && token) {
            dispatch({
              type: AUTH_ACTIONS.RESTORE_SESSION,
              payload: { user, token },
            });
          } else {
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } catch (error) {
        console.error("Session restore failed:", error);
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    restoreSession();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";
      const url = `${API_BASE}/api/users/login`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        const text = await res.text();
        throw new Error(text || "Unexpected empty response from server");
      }

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store auth data
      authService.setAuth(data);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: data.user,
          token: data.token,
        },
      });

      return { success: true, user: data.user };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message,
      });
      return { success: false, error: error.message };
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";
      const url = `${API_BASE}/api/users/register`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        const text = await res.text();
        throw new Error(text || "Unexpected empty response from server");
      }

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Store auth data
      authService.setAuth(data);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: data.user,
          token: data.token,
        },
      });

      return { success: true, user: data.user };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message,
      });
      return { success: false, error: error.message };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    authService.clearAuth();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Update user data (for settings updates, etc.)
  const updateUser = useCallback(
    (updatedUser) => {
      authService.setAuth({ user: updatedUser, token: state.token });
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: updatedUser,
          token: state.token,
        },
      });
    },
    [state.token]
  );

  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    register,
    logout,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
