import { GRADES, RANKS } from "./data";

export function getGrade(score) {
  return GRADES.find((g) => score >= g.min) || GRADES[GRADES.length - 1];
}

export function getRank(gpa) {
  return RANKS.find((r) => gpa >= r.min)?.title || "Yếu";
}

export function calcStats(courses) {
  if (!courses || courses.length === 0) {
    return { count: 0, credits: 0, points: 0, gpa: 0, rank: "Chưa xếp loại" };
  }

  const { credits, points } = courses.reduce(
    (acc, course) => {
      const grade = getGrade(course.score);
      acc.credits += course.credits;
      acc.points += course.credits * grade.point;
      return acc;
    },
    { credits: 0, points: 0 }
  );

  const gpa = credits > 0 ? Math.round((points / credits) * 100) / 100 : 0;
  const rank = getRank(gpa);

  return { count: courses.length, credits, points, gpa, rank };
}

export function calcRequired(courses, target, remaining) {
  const t = Number(target);
  const r = Number(remaining);

  // Kiểm tra dữ liệu đầu vào
  if (
    Number.isNaN(t) || t < 0 || t > 4 ||
    Number.isNaN(r) || !Number.isInteger(r) || r < 1
  ) {
    return "Hãy nhập GPA mục tiêu (0–4) và số tín chỉ còn lại (từ 1)";
  }

  const stats = calcStats(courses);
  const need = (t * (stats.credits + r) - stats.points) / r;

  if (need > 4) return "Không thể đạt mục tiêu này";
  if (need <= 0) return "Bạn đã đạt mục tiêu";
  return `Cần đạt trung bình ${need.toFixed(2)} điểm (hệ 4) ở ${r} tín chỉ còn lại`;
}