import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCourses, addCourse } from "../features/coursesSlice";
import { useNotice } from "../context/NoticeContext";
import { SEMESTERS, CREDIT_OPTIONS } from "../data";

const AddCourseForm = () => {
  const courses = useSelector(selectCourses);
  const dispatch = useDispatch();
  const showNotice = useNotice();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [credits, setCredits] = useState(3);
  const [semester, setSemester] = useState("Học kỳ 1");
  const [score, setScore] = useState("");
  const [errors, setErrors] = useState({});

  const codeInputRef = useRef(null);

  const handleAddCourse = (e) => {
    e.preventDefault();
    const newErrors = {};
    const trimmedCode = code.trim();
    const trimmedName = name.trim();
    const numScore = score === "" ? NaN : Number(score);

    if (!trimmedCode) {
      newErrors.code = "Hãy nhập mã môn";
    } else if (
      courses.some((c) => c.code.toLowerCase() === trimmedCode.toLowerCase())
    ) {
      newErrors.code = "Mã môn đã tồn tại";
    }

    if (!trimmedName) {
      newErrors.name = "Hãy nhập tên môn";
    }

    if (score === "" || Number.isNaN(numScore) || numScore < 0 || numScore > 10) {
      newErrors.score = "Điểm phải từ 0 đến 10";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    dispatch(
      addCourse({
        code: trimmedCode.toUpperCase(),
        name: trimmedName,
        credits: Number(credits),
        semester,
        score: numScore,
      })
    );

    showNotice(`Đã thêm môn ${trimmedName}`);

    // Reset form
    setCode("");
    setName("");
    setCredits(3);
    setSemester("Học kỳ 1");
    setScore("");
    setErrors({});
    if (codeInputRef.current) {
      codeInputRef.current.focus();
    }
  };

  return (
    <section style={{ marginTop: 24 }}>
      <h2>Thêm môn học</h2>
      <form onSubmit={handleAddCourse} noValidate>
        <div>
          <label htmlFor="course-code">Mã môn: </label>
          <input
            id="course-code"
            ref={codeInputRef}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {errors.code && <div role="alert">{errors.code}</div>}
        </div>

        <div>
          <label htmlFor="course-name">Tên môn: </label>
          <input
            id="course-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <div role="alert">{errors.name}</div>}
        </div>

        <div>
          <label htmlFor="course-credits">Số tín chỉ: </label>
          <select
            id="course-credits"
            value={credits}
            onChange={(e) => setCredits(Number(e.target.value))}
          >
            {CREDIT_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="course-semester">Học kỳ: </label>
          <select
            id="course-semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            {SEMESTERS.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="course-score">Điểm hệ 10: </label>
          <input
            id="course-score"
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
          {errors.score && <div role="alert">{errors.score}</div>}
        </div>

        <button type="submit">Thêm môn</button>
      </form>
    </section>
  );
};

export default AddCourseForm;
