import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient, { tokenUtils, handleApiError } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { IUser, ILoginInput, IRegisterInput, ILoginResponse } from "@/types";

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: ILoginInput, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<{ data: ILoginResponse }>(
        API_ENDPOINTS.LOGIN,
        credentials
      );

      // Store tokens
      tokenUtils.setTokens(
        data.data.tokens.accessToken,
        data.data.tokens.refreshToken
      );

      return data.data.user;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData: IRegisterInput, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<{ data: ILoginResponse }>(
        API_ENDPOINTS.REGISTER,
        userData
      );

      // Store tokens
      tokenUtils.setTokens(
        data.data.tokens.accessToken,
        data.data.tokens.refreshToken
      );

      return data.data.user;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT);
      tokenUtils.clearTokens();
    } catch (error) {
      // Clear tokens even if API call fails
      tokenUtils.clearTokens();
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<{ data: IUser }>(API_ENDPOINTS.ME);
      return data.data;
    } catch (error) {
      tokenUtils.clearTokens();
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData: Partial<IUser>, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.patch<{ data: IUser }>(
        API_ENDPOINTS.USER_PROFILE,
        userData
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
