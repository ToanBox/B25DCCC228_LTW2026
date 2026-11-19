import { configureStore } from "@reduxjs/toolkit";
import coursesReducer from "./features/coursesSlice";
import goalReducer from "./features/goalSlice";
import { loadSaved, saveCourses } from "./storage";

const preloaded = loadSaved();
export const hasSaved = preloaded !== null;

const store = configureStore({
  reducer: {
    courses: coursesReducer,
    goal: goalReducer,
  },
  preloadedState: {
    courses: preloaded ?? [],
  },
});

// Lưu vào localStorage khi mảng courses đổi tham chiếu
let prevCourses = store.getState().courses;
store.subscribe(() => {
  const current = store.getState().courses;
  if (current !== prevCourses) {
    prevCourses = current;
    saveCourses(current);
  }
});

export default store;
