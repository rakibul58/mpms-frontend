import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  isMobile: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: "system",
  isMobile: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload;
    },
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
      if (action.payload) {
        state.sidebarOpen = false;
      }
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setTheme, setIsMobile } =
  uiSlice.actions;
export default uiSlice.reducer;
