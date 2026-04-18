function getPriorityColorVar(category) {
  const colors = {
    A: "var(--priority-a)",
    B: "var(--priority-b)",
    C: "var(--priority-c)"
  };
  return colors[category];
}
function formatDisplayDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}
function formatISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}
function getWeekDates(date) {
  const weekStart = getWeekStart(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}
function getMonthDates(year, month) {
  const firstDay = new Date(year, month, 1);
  const startDate = getWeekStart(firstDay);
  const dates = [];
  const current = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}
function isToday(date) {
  const today = /* @__PURE__ */ new Date();
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}
function getWeekdayName(date, short = false) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: short ? "short" : "long"
  }).format(date);
}
function getMonthName(month) {
  const date = new Date(2e3, month, 1);
  return new Intl.DateTimeFormat("de-DE", {
    month: "long"
  }).format(date);
}
function filterTasksBySearch(tasks, query) {
  if (!query.trim()) return tasks;
  const lowerQuery = query.toLowerCase();
  return tasks.filter(
    (task) => task.title.toLowerCase().includes(lowerQuery) || task.description?.toLowerCase().includes(lowerQuery)
  );
}
function filterTasksByPriorities(tasks, priorities) {
  if (priorities.size === 0 || priorities.size === 3) return tasks;
  return tasks.filter((task) => priorities.has(task.category));
}
function filterTasksByStatuses(tasks, statuses) {
  if (statuses.size === 0) return tasks;
  return tasks.filter((task) => statuses.has(task.status));
}
function extractDatePart(datetimeStr) {
  if (!datetimeStr) return "";
  return datetimeStr.split("T")[0];
}
function extractTimePart(datetimeStr) {
  if (!datetimeStr || !datetimeStr.includes("T")) return "00:00";
  const timePart = datetimeStr.split("T")[1];
  return timePart.slice(0, 5);
}
function filterTasksByDate(tasks, date) {
  const dateStr = formatISODate(date);
  return tasks.filter((task) => {
    const taskDueDate = extractDatePart(task.dueDate);
    const taskStartDate = extractDatePart(task.startDate);
    return taskDueDate === dateStr || taskStartDate === dateStr;
  });
}
export {
  filterTasksByDate as a,
  getMonthDates as b,
  getWeekdayName as c,
  getPriorityColorVar as d,
  extractTimePart as e,
  formatISODate as f,
  getMonthName as g,
  extractDatePart as h,
  isToday as i,
  getWeekDates as j,
  formatDisplayDate as k,
  filterTasksBySearch as l,
  filterTasksByPriorities as m,
  filterTasksByStatuses as n
};
