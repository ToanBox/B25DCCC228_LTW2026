import React, { useRef, useMemo } from "react";
import { getGrade } from "../utils";
import { formatPoint } from "../data";

const CourseRow = React.memo(({ course, onScore, onRemove }) => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  const grade = useMemo(() => getGrade(course.score), [course.score]);
  const isFail = grade.letter === "F";

  return (
    <tr style={isFail ? { color: "#c62828" } : undefined}>
      <td>{course.code}</td>
      <td>{course.name}</td>
      <td>{course.credits}</td>
      <td>{course.semester}</td>
      <td>
        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          aria-label={`Điểm ${course.name}`}
          value={course.score}
          onChange={(e) => {
            const val = e.target.valueAsNumber;
            if (!Number.isNaN(val) && val >= 0 && val <= 10) {
              onScore(course.id, val);
            }
          }}
        />
      </td>
      <td>{isFail ? "F – Học lại" : grade.letter}</td>
      <td>{formatPoint(grade.point)}</td>
      <td>{renderCount.current}</td>
      <td>
        <button type="button" onClick={() => onRemove(course.id, course.name)}>
          Xóa
        </button>
      </td>
    </tr>
  );
});

export default CourseRow;
