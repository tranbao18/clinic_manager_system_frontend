// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import doctorReducer from "./Slice/doctorSlice";

export const store = configureStore({
    reducer: {
        doctors: doctorReducer,
    },
});

// Kiểu của RootState và AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
