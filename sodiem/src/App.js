import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFetch } from "./hooks/useFetch";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useDebounce } from "./hooks/useDebounce";
import { selectCourses, setCourses, setScore, removeCourse } from "./features/coursesSlice";
import { calcStats, getGrade } from "./utils";
import { SEMESTERS, GRADES } from "./data";
import { useTheme } from "./context/ThemeContext";
import { useNotice } from "./context/NoticeContext";
import { hasSaved } from "./store";
import CourseRow from "./components/CourseRow";
import AddCourseForm from "./components/AddCourseForm";
import GoalPlanner from "./components/GoalPlanner";

const BUILD_TAG = "gp-4073";

function App() {
  const { data, loading, error } = useFetch("/data/courses.json");
  const courses = useSelector(selectCourses);
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const showNotice = useNotice();

  // State lọc học kỳ (lưu localStorage)
  const [semesterFilter, setSemesterFilter] = useLocalStorage("ltw_sodiem_semester", "all");

  // State tìm kiếm
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const searchInputRef = useRef(null);

  // Nạp dữ liệu mẫu khi chưa có dữ liệu lưu
  useEffect(() => {
    if (data && !hasSaved) {
      dispatch(setCourses(data));
    }
  }, [data, dispatch]);

  // Lọc theo học kỳ
  const filteredByBySemester = useMemo(() => {
    if (semesterFilter === "all") return courses;
    return courses.filter((c) => c.semester === semesterFilter);
  }, [courses, semesterFilter]);

  // Thống kê tính trên môn theo học kỳ (KHÔNG ảnh hưởng bởi tìm kiếm)
  const filteredStats = useMemo(() => calcStats(filteredByBySemester), [filteredByBySemester]);
  const totalStats = useMemo(() => calcStats(courses), [courses]);

  // Lọc thêm theo tìm kiếm (chỉ ảnh hưởng bảng, không ảnh hưởng thống kê)
  const displayedCourses = useMemo(() => {
    if (!debouncedSearch) return filteredByBySemester;
    const q = debouncedSearch.toLowerCase();
    return filteredByBySemester.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [filteredByBySemester, debouncedSearch]);

  // Phân bố điểm chữ (theo học kỳ)
  const gradeDistribution = useMemo(() => {
    return GRADES.map((g) => ({
      letter: g.letter,
      count: filteredByBySemester.filter((c) => getGrade(c.score).letter === g.letter).length,
    }));
  }, [filteredByBySemester]);

  // Tiêu đề tab
  useEffect(() => {
    if (courses.length > 0) {
      document.title = `GPA ${totalStats.gpa.toFixed(2)} – Sổ điểm`;
    } else {
      document.title = "Sổ điểm";
    }
  }, [courses.length, totalStats.gpa]);

  // Phím tắt / và Esc
  useEffect(() => {
    const handleKey = (e) => {
      const tag = e.target.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "SELECT" && tag !== "TEXTAREA") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
      if (e.key === "Escape" && e.target === searchInputRef.current) {
        setSearch("");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Hàm xử lý ô tìm kiếm
  const handleCourseShift = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  // Hàm xử lý điểm (useCallback để CourseRow không render lại)
  const handleScore = useCallback(
    (id, score) => {
      dispatch(setScore({ id, score }));
    },
    [dispatch]
  );

  // Hàm xử lý xóa (useCallback để CourseRow không render lại)
  const handleRemove = useCallback(
    (id, name) => {
      dispatch(removeCourse(id));
      showNotice(`Đã xóa môn ${name}`);
    },
    [dispatch, showNotice]
  );

  // Đặt lại dữ liệu mẫu
  const handleReset = useCallback(() => {
    if (data) {
      dispatch(setCourses(data));
      showNotice("Đã đặt lại dữ liệu mẫu");
    }
  }, [data, dispatch, showNotice]);

  // Nếu chưa có dữ liệu lưu và đang tải
  if (!hasSaved && loading) {
    return (
      <div data-build={BUILD_TAG}>
        <p>Đang tải bảng điểm...</p>
      </div>
    );
  }

  // Nếu chưa có dữ liệu lưu và lỗi fetch
  if (!hasSaved && error) {
    return (
      <div data-build={BUILD_TAG}>
        <p>Không tải được bảng điểm</p>
      </div>
    );
  }

  return (
    <div
      data-build={BUILD_TAG}
      className={`app ${theme}`}
      style={{ maxWidth: 960, margin: "0 auto", padding: 20 }}
    >
      <h1>Sổ điểm sinh viên</h1>
      <button type="button" onClick={toggleTheme}>
        {theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
      </button>

      {/* Khu vực Thống kê */}
      <section>
        <h2>Thống kê</h2>
        <p>Số môn: {filteredStats.count}</p>
        <p>Tổng tín chỉ: {filteredStats.credits}</p>
        <p>GPA (hệ 4): {filteredStats.gpa.toFixed(2)}</p>
        <p>Xếp loại: {filteredStats.rank}</p>
        <p>GPA tích lũy: {totalStats.gpa.toFixed(2)}</p>

        <h3>Phân bố điểm chữ</h3>
        <ul>
          {gradeDistribution.map((g) => (
            <li key={g.letter}>
              {g.letter}: {g.count}
              <span
                style={{
                  display: "inline-block",
                  marginLeft: 8,
                  background: "#1976d2",
                  height: 10,
                  width: 24 * g.count,
                  verticalAlign: "middle",
                }}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Khu vực Lọc & Bảng điểm */}
      <section>
        <h2>Bảng điểm</h2>
        <div>
          <label htmlFor="semester-filter">Xem học kỳ: </label>
          <select
            id="semester-filter"
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            {SEMESTERS.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 8 }}>
          <label htmlFor="search-input">Tìm môn học: </label>
          <input
            id="search-input"
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={handleCourseShift}
            placeholder="Tìm theo tên hoặc mã môn..."
          />
        </div>

        {debouncedSearch && <p>Tìm thấy {displayedCourses.length} môn</p>}

        {displayedCourses.length === 0 ? (
          <p>Chưa có môn học nào</p>
        ) : (
          <table
            border="1"
            cellPadding="8"
            style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}
          >
            <thead>
              <tr>
                <th>Mã môn</th>
                <th>Tên môn</th>
                <th>Tín chỉ</th>
                <th>Học kỳ</th>
                <th>Điểm (hệ 10)</th>
                <th>Điểm chữ</th>
                <th>Điểm (hệ 4)</th>
                <th>Số lần render</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {displayedCourses.map((course) => (
                <CourseRow
                  key={course.id}
                  course={course}
                  onScore={handleScore}
                  onRemove={handleRemove}
                />
              ))}
            </tbody>
          </table>
        )}

        <button type="button" onClick={handleReset} style={{ marginTop: 12 }}>
          Đặt lại dữ liệu mẫu
        </button>
      </section>

      {/* Form thêm môn học */}
      <AddCourseForm />

      {/* Mục tiêu GPA */}
      <GoalPlanner />
    </div>
  );
}

export default App;
