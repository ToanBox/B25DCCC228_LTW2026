import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCourses } from "../features/coursesSlice";
import { setTarget, setRemaining } from "../features/goalSlice";
import { calcRequired } from "../utils";

const GoalPlanner = () => {
  const courses = useSelector(selectCourses);
  const goal = useSelector((state) => state.goal);
  const dispatch = useDispatch();

  const result = useMemo(
    () => calcRequired(courses, goal.target, goal.remaining),
    [courses, goal.target, goal.remaining]
  );

  return (
    <section style={{ marginTop: 24 }}>
      <h2>Mục tiêu GPA</h2>
      <div>
        <label htmlFor="goal-target">GPA mục tiêu: </label>
        <input
          id="goal-target"
          type="number"
          step="0.01"
          value={goal.target}
          onChange={(e) => dispatch(setTarget(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor="goal-remaining">Số tín chỉ còn lại: </label>
        <input
          id="goal-remaining"
          type="number"
          value={goal.remaining}
          onChange={(e) => dispatch(setRemaining(e.target.value))}
        />
      </div>
      <p>{result}</p>
    </section>
  );
};

export default GoalPlanner;
