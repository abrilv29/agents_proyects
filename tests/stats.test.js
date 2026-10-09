const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getHeatLevel,
  toDayKey,
  isValidDayKey,
  getDayTotals,
  getHeatCells
} = require("../stats.js");

test("getHeatLevel applies the fixed thresholds", () => {
  assert.equal(getHeatLevel(0), 0);
  assert.equal(getHeatLevel(1), 1);
  assert.equal(getHeatLevel(30), 1);
  assert.equal(getHeatLevel(31), 2);
  assert.equal(getHeatLevel(60), 2);
  assert.equal(getHeatLevel(61), 3);
  assert.equal(getHeatLevel(120), 3);
  assert.equal(getHeatLevel(121), 4);
  assert.equal(getHeatLevel(10000), 4);
});

test("getHeatLevel ignores invalid numbers", () => {
  assert.equal(getHeatLevel(-5), 0);
  assert.equal(getHeatLevel(NaN), 0);
  assert.equal(getHeatLevel(undefined), 0);
  assert.equal(getHeatLevel("abc"), 0);
});

test("isValidDayKey rejects malformed and impossible dates", () => {
  assert.equal(isValidDayKey("2026-10-07"), true);
  assert.equal(isValidDayKey("2026-02-30"), false);
  assert.equal(isValidDayKey("2026-13-01"), false);
  assert.equal(isValidDayKey("07-10-2026"), false);
  assert.equal(isValidDayKey("hoy"), false);
  assert.equal(isValidDayKey(undefined), false);
});

test("getDayTotals sums several sessions of the same day", () => {
  const totals = getDayTotals([
    { fecha: "2026-10-07", minutos: 20 },
    { fecha: "2026-10-07", minutos: 25 },
    { fecha: "2026-10-06", minutos: 130 }
  ]);
  assert.equal(totals.get("2026-10-07"), 45);
  assert.equal(totals.get("2026-10-06"), 130);
});

test("getDayTotals skips invalid minutes and invalid dates", () => {
  const totals = getDayTotals([
    { fecha: "2026-10-07", minutos: 0 },
    { fecha: "2026-10-07", minutos: -10 },
    { fecha: "2026-10-07", minutos: "abc" },
    { fecha: "2026-10-07", minutos: 45.5 },
    { fecha: "2026-02-30", minutos: 50 },
    { fecha: "no-fecha", minutos: 50 },
    { fecha: "2026-10-07", minutos: 45 }
  ]);
  assert.equal(totals.get("2026-10-07"), 45);
  assert.equal(totals.size, 1);
});

test("getHeatCells covers Monday to Sunday, 28 cells ending on Sunday", () => {
  // Wednesday 2026-10-07: window runs Monday 2026-09-14 to Sunday 2026-10-11.
  const today = new Date(2026, 9, 7);
  const cells = getHeatCells([], today);
  assert.equal(cells.length, 28);
  assert.equal(cells[0].key, "2026-09-14");
  assert.equal(cells[27].key, "2026-10-11");
});

test("getHeatCells marks today and future days", () => {
  const today = new Date(2026, 9, 7);
  const cells = getHeatCells(
    [
      { fecha: "2026-10-07", minutos: 45 },
      { fecha: "2026-10-10", minutos: 100 }
    ],
    today
  );
  const todayCell = cells.find((cell) => cell.isToday);
  assert.equal(todayCell.key, "2026-10-07");
  assert.equal(todayCell.level, 2);

  const futureCells = cells.filter((cell) => cell.isFuture);
  assert.equal(futureCells.length, 4);
  futureCells.forEach((cell) => {
    assert.equal(cell.level, 0);
    assert.equal(cell.minutes, 0);
  });
});

test("getHeatCells ignores sessions older than the window", () => {
  const today = new Date(2026, 9, 7);
  const cells = getHeatCells([{ fecha: "2026-09-13", minutos: 120 }], today);
  assert.equal(cells.some((cell) => cell.key === "2026-09-13"), false);
  assert.equal(cells.every((cell) => cell.level === 0), true);
});

test("getHeatCells crosses month and year boundaries", () => {
  const today = new Date(2027, 0, 2);
  const cells = getHeatCells([], today);
  assert.equal(cells.length, 28);
  assert.equal(cells[0].key, "2026-12-07");
  assert.equal(cells[27].key, "2027-01-03");
});

test("getHeatCells keeps the window correct across a DST change", () => {
  // Monday 2026-10-26 sits right after the European DST switch (2026-10-25).
  const today = new Date(2026, 9, 26);
  const cells = getHeatCells([], today);
  assert.equal(cells.length, 28);
  assert.equal(cells[0].key, "2026-10-05");
  assert.equal(cells[27].key, "2026-11-01");
});

test("getHeatCells with no sessions returns an empty, error-free map", () => {
  const today = new Date(2026, 9, 7);
  const cells = getHeatCells([], today);
  assert.equal(cells.length, 28);
  assert.equal(cells.every((cell) => cell.level === 0 && cell.minutes === 0), true);
});

test("toDayKey always formats in local time", () => {
  const date = new Date(2026, 0, 5);
  assert.equal(toDayKey(date), "2026-01-05");
  assert.equal(toDayKey(new Date(2026, 9, 7)), "2026-10-07");
});
