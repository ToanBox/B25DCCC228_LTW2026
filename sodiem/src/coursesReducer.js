export function coursesReducer(state, action) {
  switch (action.type) {
    case "LOAD":
      return action.payload;
    case "ADD": {
      const maxId = state.reduce((max, item) => Math.max(max, item.id), 0);
      return [...state, { ...action.payload, id: maxId + 1 }];
    }
    case "REMOVE":
      return state.filter((course) => course.id !== action.payload);
    case "SET_SCORE":
      return state.map((course) =>
        course.id === action.payload.id
          ? { ...course, score: action.payload.score }
          : course
      );
    default:
      return state;
  }
}