// Pure logic for the weekly study goal.
// No DOM, no localStorage: callers pass "today" in as a local Date.

// Local "AAAA-MM-DD" key for a date. Never toISOString(): that is UTC.
function toLocalDayKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Inverse of toLocalDayKey: local Date at midnight (never new Date("AAAA-MM-DD")).
function fromLocalDayKey(key) {
  const parts = key.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

// Monday (local) of the week that contains "today": Monday..Sunday.
// Days are moved with setDate(), never by subtracting milliseconds (DST).
function getMondayKey(today) {
  const day = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysFromMonday = (day.getDay() + 6) % 7; // Mon = 0 ... Sun = 6
  day.setDate(day.getDate() - daysFromMonday);
  return toLocalDayKey(day);
}

// Key of the week a save belongs to (D6/D7): during Monday it is its own week;
// from Tuesday to Sunday the save is postponed to the next Monday. The local
// weekday decides the key: no instants are compared anywhere.
function getSaveTargetKey(today) {
  const mondayKey = getMondayKey(today);
  if (today.getDay() === 1) {
    return mondayKey;
  }
  const nextMonday = fromLocalDayKey(mondayKey);
  nextMonday.setDate(nextMonday.getDate() + 7);
  return toLocalDayKey(nextMonday);
}

// Valid goal range in minutes (RF-2). Exported: app.js reuses them in the
// error message ("Introduce un número entero entre 1 y 100000").
const GOAL_MIN = 1;
const GOAL_MAX = 100000;

// true only for an integer between GOAL_MIN and GOAL_MAX.
function isValidGoal(value) {
  return Number.isInteger(value) && value >= GOAL_MIN && value <= GOAL_MAX;
}

// What "Guardar objetivo" does with the raw text field (RF-2):
//   { valid: true, value: n }    -> save n as the goal of the target week;
//   { valid: true, value: null } -> delete the goal (empty field or "0");
//   { valid: false, value: null }-> invalid: show the error and save nothing.
function parseGoalInput(raw) {
  if (typeof raw !== "string") {
    return { valid: false, value: null };
  }
  const text = raw.trim();
  if (text === "") {
    return { valid: true, value: null };
  }
  if (!/^[0-9]+$/.test(text)) {
    // Letters, sign, decimal point or exponent: never a valid goal.
    return { valid: false, value: null };
  }
  const value = Number(text);
  if (value === 0) {
    // "0" deletes, exactly like an empty field (never a goal).
    return { valid: true, value: null };
  }
  if (!isValidGoal(value)) {
    return { valid: false, value: null };
  }
  return { valid: true, value };
}

// localStorage JSON of the store -> object. Unreadable JSON or a value that
// is not an object -> {} (never throws: a corrupt key acts like a new user).
function parseGoalStore(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    // Unreadable JSON: fall through to the empty store below.
  }
  return {};
}

// Goal of a monday key. Missing key (week that never had a goal), explicit
// null (week left without a goal on purpose) or a corrupt value -> null.
function readGoal(store, mondayKey) {
  if (store === null || typeof store !== "object") {
    return null;
  }
  const value = store[mondayKey];
  if (value === undefined || value === null) {
    return null;
  }
  return isValidGoal(value) ? value : null;
}

// true for a key shaped like a real local date "AAAA-MM-DD" (a calendar
// impossible date such as "2026-13-40" round-trips to a different key).
function isDayKey(key) {
  return (
    typeof key === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(key) &&
    toLocalDayKey(fromLocalDayKey(key)) === key
  );
}

// Value to pre-fill the field with on load (RF-6): the entry of the latest
// monday key, compared as text (ISO keys sort chronologically). An empty or
// corrupt latest entry stays empty: older values are never offered back.
function getPrefillValue(store) {
  if (store === null || typeof store !== "object") {
    return null;
  }
  let latestKey = null;
  for (const key of Object.keys(store)) {
    if (isDayKey(key) && (latestKey === null || key > latestKey)) {
      latestKey = key;
    }
  }
  if (latestKey === null) {
    return null;
  }
  return readGoal(store, latestKey);
}

// Progress of the week against its goal (RF-5): whole percent with classic
// rounding, capped at 100 (the excess is never shown); completed from the
// goal on. Precondition: goal >= 1 (only a stored valid goal reaches here).
function getProgress(minutes, goal) {
  const percent = Math.min(100, Math.round((minutes / goal) * 100));
  return { percent, completed: minutes >= goal };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getMondayKey,
    getSaveTargetKey,
    GOAL_MIN,
    GOAL_MAX,
    parseGoalInput,
    isValidGoal,
    parseGoalStore,
    readGoal,
    getPrefillValue,
    getProgress
  };
}
