// Pure logic for the study-day heat map.
// No DOM, no localStorage: callers pass "today" in as a local Date.

const HEAT_THRESHOLDS = [30, 60, 120];

function getHeatLevel(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return 0;
  }
  if (minutes <= HEAT_THRESHOLDS[0]) {
    return 1;
  }
  if (minutes <= HEAT_THRESHOLDS[1]) {
    return 2;
  }
  if (minutes <= HEAT_THRESHOLDS[2]) {
    return 3;
  }
  return 4;
}

function toDayKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDayKey(key) {
  const parts = key.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

// Rejects malformed keys and impossible dates such as "2026-02-30".
function isValidDayKey(key) {
  if (typeof key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    return false;
  }
  const date = fromDayKey(key);
  return !Number.isNaN(date.getTime()) && toDayKey(date) === key;
}

// Valid minutes: numeric integer > 0. Anything else adds up to nothing.
function toValidMinutes(value) {
  const minutes = Number(value);
  if (!Number.isInteger(minutes) || minutes <= 0) {
    return 0;
  }
  return minutes;
}

// Map of day key -> total valid minutes. Invalid dates and minutes are skipped.
function getDayTotals(sessions) {
  const totals = new Map();
  if (!Array.isArray(sessions)) {
    return totals;
  }
  sessions.forEach((session) => {
    if (!session || !isValidDayKey(session.fecha)) {
      return;
    }
    const minutes = toValidMinutes(session.minutos);
    if (minutes === 0) {
      return;
    }
    totals.set(session.fecha, (totals.get(session.fecha) || 0) + minutes);
  });
  return totals;
}

// The 28 cells of the heat map: 4 weeks from Monday to Sunday, ending on the
// Sunday of the week that contains "today". Future days are never painted.
function getHeatCells(sessions, today) {
  const day = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysFromMonday = (day.getDay() + 6) % 7;
  const start = new Date(day);
  start.setDate(start.getDate() - daysFromMonday - 21);

  const todayKey = toDayKey(day);
  const totals = getDayTotals(sessions);

  const cells = [];
  for (let i = 0; i < 28; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = toDayKey(date);
    const future = key > todayKey;
    const minutes = future ? 0 : totals.get(key) || 0;
    cells.push({
      key: key,
      minutes: minutes,
      level: future ? 0 : getHeatLevel(minutes),
      isFuture: future,
      isToday: key === todayKey
    });
  }
  return cells;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    HEAT_THRESHOLDS,
    getHeatLevel,
    toDayKey,
    fromDayKey,
    isValidDayKey,
    getDayTotals,
    getHeatCells
  };
}
