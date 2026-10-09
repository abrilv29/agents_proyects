const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getMondayKey,
  getSaveTargetKey,
  parseGoalInput,
  isValidGoal,
  parseGoalStore,
  readGoal,
  getPrefillValue,
  getProgress
} = require("../goals.js");

// getMondayKey: Monday..Sunday all map to the same Monday key.

test("getMondayKey maps every day of the week to its Monday", () => {
  // Week Monday 2026-10-05 .. Sunday 2026-10-11 (local).
  const days = [
    new Date(2026, 9, 5, 0, 0), // Monday 00:00
    new Date(2026, 9, 6, 12, 30), // Tuesday
    new Date(2026, 9, 7, 9, 15), // Wednesday (today of the spec)
    new Date(2026, 9, 8, 18, 45), // Thursday
    new Date(2026, 9, 9, 7, 0), // Friday
    new Date(2026, 9, 10, 21, 10), // Saturday
    new Date(2026, 9, 11, 23, 59) // Sunday 23:59
  ];
  days.forEach((day) => assert.equal(getMondayKey(day), "2026-10-05"));
});

test("getMondayKey keeps Monday's own week at both boundaries", () => {
  assert.equal(getMondayKey(new Date(2026, 9, 5, 0, 0)), "2026-10-05");
  assert.equal(getMondayKey(new Date(2026, 9, 5, 23, 59)), "2026-10-05");
});

test("getMondayKey crosses month boundaries", () => {
  // Sunday 2026-11-01 still belongs to the October week that starts on 2026-10-26.
  assert.equal(getMondayKey(new Date(2026, 10, 1, 23, 59)), "2026-10-26");
  // Week 2026-11-02 (Mon) .. 2026-11-08 (Sun), Monday and Sunday in the same week.
  assert.equal(getMondayKey(new Date(2026, 10, 2, 0, 0)), "2026-11-02");
  assert.equal(getMondayKey(new Date(2026, 10, 4)), "2026-11-02");
  assert.equal(getMondayKey(new Date(2026, 10, 8)), "2026-11-02");
});

test("getMondayKey crosses year boundaries", () => {
  // Week 2026-12-28 (Mon) .. 2027-01-03 (Sun).
  assert.equal(getMondayKey(new Date(2026, 11, 28)), "2026-12-28");
  assert.equal(getMondayKey(new Date(2027, 0, 1, 0, 30)), "2026-12-28");
  assert.equal(getMondayKey(new Date(2027, 0, 3, 23, 59)), "2026-12-28");
  assert.equal(getMondayKey(new Date(2027, 0, 4, 0, 0)), "2027-01-04");
});

test("getMondayKey stays local across the DST change (25-hour Sunday)", () => {
  // Europe switches back on Sunday 2026-10-25.
  assert.equal(getMondayKey(new Date(2026, 9, 19)), "2026-10-19");
  assert.equal(getMondayKey(new Date(2026, 9, 25, 23, 59)), "2026-10-19");
  assert.equal(getMondayKey(new Date(2026, 9, 26, 0, 0)), "2026-10-26");
  assert.equal(getMondayKey(new Date(2026, 10, 1)), "2026-10-26");
});

// getSaveTargetKey: D6/D7. Monday saves its own week, Tuesday..Sunday the next one.

test("getSaveTargetKey keeps Monday in its own week (D7)", () => {
  assert.equal(getSaveTargetKey(new Date(2026, 9, 5, 0, 0)), "2026-10-05");
  assert.equal(getSaveTargetKey(new Date(2026, 9, 5, 12, 30)), "2026-10-05");
  assert.equal(getSaveTargetKey(new Date(2026, 9, 5, 23, 59)), "2026-10-05");
});

test("getSaveTargetKey postpones Tuesday to Saturday to the next Monday (D6)", () => {
  assert.equal(getSaveTargetKey(new Date(2026, 9, 6)), "2026-10-12"); // Tuesday
  assert.equal(getSaveTargetKey(new Date(2026, 9, 7)), "2026-10-12"); // Wednesday
  assert.equal(getSaveTargetKey(new Date(2026, 9, 8)), "2026-10-12"); // Thursday
  assert.equal(getSaveTargetKey(new Date(2026, 9, 9)), "2026-10-12"); // Friday
  assert.equal(getSaveTargetKey(new Date(2026, 9, 10)), "2026-10-12"); // Saturday
});

test("getSaveTargetKey at the Sunday 23:59 / Monday 00:00 frontier", () => {
  // Sunday 23:59: the value rules the week starting in less than a minute...
  assert.equal(getSaveTargetKey(new Date(2026, 9, 11, 23, 59)), "2026-10-12");
  // ...and the closed week keeps its own Monday key.
  assert.equal(getMondayKey(new Date(2026, 9, 11, 23, 59)), "2026-10-05");
  // Monday 00:00: the value rules the week that has just started.
  assert.equal(getSaveTargetKey(new Date(2026, 9, 12, 0, 0)), "2026-10-12");
  assert.equal(getMondayKey(new Date(2026, 9, 12, 0, 0)), "2026-10-12");
});

test("getSaveTargetKey gives a different key to two consecutive weeks", () => {
  const thisWeek = getSaveTargetKey(new Date(2026, 9, 5)); // Monday
  const nextWeek = getSaveTargetKey(new Date(2026, 9, 6)); // Tuesday
  assert.notEqual(thisWeek, nextWeek);
  // A save on Sunday lands on the same Monday as a save on that Monday.
  assert.equal(
    getSaveTargetKey(new Date(2026, 9, 11, 23, 59)),
    getSaveTargetKey(new Date(2026, 9, 12, 0, 0))
  );
});

test("getSaveTargetKey crosses month boundaries", () => {
  assert.equal(getSaveTargetKey(new Date(2026, 9, 27)), "2026-11-02"); // Tuesday 27/10
  assert.equal(getSaveTargetKey(new Date(2026, 10, 1, 23, 59)), "2026-11-02"); // Sunday 01/11
  assert.equal(getSaveTargetKey(new Date(2026, 10, 2, 0, 0)), "2026-11-02"); // Monday 02/11
});

test("getSaveTargetKey crosses year boundaries", () => {
  // Week 2026-12-28 (Mon) .. 2027-01-03 (Sun): saves go to Monday 2027-01-04.
  assert.equal(getSaveTargetKey(new Date(2026, 11, 29)), "2027-01-04"); // Tuesday 29/12
  assert.equal(getSaveTargetKey(new Date(2027, 0, 3, 23, 59)), "2027-01-04"); // Sunday 03/01
  assert.equal(getSaveTargetKey(new Date(2027, 0, 4, 0, 0)), "2027-01-04"); // Monday 04/01
});

test("getSaveTargetKey stays local across the DST change (25-hour Sunday)", () => {
  // Europe switches back on Sunday 2026-10-25: the frontier week still resolves.
  // A save on Saturday 24/10 (just before the change) lands on Monday 26/10.
  assert.equal(getSaveTargetKey(new Date(2026, 9, 25, 23, 59)), "2026-10-26");
  assert.equal(getSaveTargetKey(new Date(2026, 9, 26, 0, 0)), "2026-10-26");
  assert.equal(getSaveTargetKey(new Date(2026, 9, 24)), "2026-10-26");
});

// parseGoalInput: what "Guardar objetivo" does with the raw text field (RF-2).

test('parseGoalInput treats an empty field or "0" as a delete', () => {
  assert.deepEqual(parseGoalInput(""), { valid: true, value: null });
  assert.deepEqual(parseGoalInput("0"), { valid: true, value: null });
});

test("parseGoalInput accepts integers from 1 to 100000", () => {
  assert.deepEqual(parseGoalInput("1"), { valid: true, value: 1 });
  assert.deepEqual(parseGoalInput("300"), { valid: true, value: 300 });
  assert.deepEqual(parseGoalInput("100000"), { valid: true, value: 100000 });
});

test("parseGoalInput rejects letters, negatives, decimals and out-of-range values", () => {
  ["abc", "-5", "3.5", "100001", "1e5"].forEach((raw) => {
    assert.equal(parseGoalInput(raw).valid, false, `should reject ${raw}`);
  });
});

test("parseGoalInput rejects input that is not a string", () => {
  [300, 0, -5, null, undefined, {}, [], true].forEach((raw) => {
    assert.equal(parseGoalInput(raw).valid, false, `should reject ${String(raw)}`);
  });
});

// isValidGoal: integer between GOAL_MIN (1) and GOAL_MAX (100000).

test("isValidGoal accepts only integers from 1 to 100000", () => {
  assert.equal(isValidGoal(1), true);
  assert.equal(isValidGoal(300), true);
  assert.equal(isValidGoal(100000), true);
  assert.equal(isValidGoal(0), false);
  assert.equal(isValidGoal(100001), false);
  assert.equal(isValidGoal(-5), false);
  assert.equal(isValidGoal(3.5), false);
  assert.equal(isValidGoal("300"), false);
  assert.equal(isValidGoal(null), false);
  assert.equal(isValidGoal(NaN), false);
});

// parseGoalStore: JSON -> object; unreadable or non-object -> {} (RNF-4 defense).

test("parseGoalStore parses a JSON object with one entry per monday", () => {
  const store = parseGoalStore('{"2026-10-05":300,"2026-10-12":null}');
  assert.equal(store["2026-10-05"], 300);
  assert.equal(store["2026-10-12"], null);
});

test("parseGoalStore never throws: unreadable or non-object JSON becomes {}", () => {
  assert.deepEqual(parseGoalStore(""), {});
  assert.deepEqual(parseGoalStore("{not json"), {});
  assert.deepEqual(parseGoalStore("null"), {});
  assert.deepEqual(parseGoalStore("42"), {});
  assert.deepEqual(parseGoalStore('"texto"'), {});
  assert.deepEqual(parseGoalStore("[300]"), {});
  assert.deepEqual(parseGoalStore(undefined), {});
});

// readGoal: goal of a monday key; missing, explicit null or corrupt -> null.

test("readGoal returns the goal stored for a monday key", () => {
  const store = parseGoalStore('{"2026-10-05":300,"2026-10-12":240}');
  assert.equal(readGoal(store, "2026-10-05"), 300);
  assert.equal(readGoal(store, "2026-10-12"), 240);
});

test("readGoal returns null for missing, explicit null or corrupt values", () => {
  const store = parseGoalStore(
    '{"2026-10-05":null,"2026-10-12":"texto","2026-09-28":3.5,' +
      '"2026-09-21":100001,"2026-09-14":0,"2026-09-07":-5}'
  );
  assert.equal(readGoal(store, "2026-10-19"), null); // key absent (new week)
  assert.equal(readGoal(store, "2026-10-05"), null); // explicit null (deleted)
  assert.equal(readGoal(store, "2026-10-12"), null); // string
  assert.equal(readGoal(store, "2026-09-28"), null); // decimal
  assert.equal(readGoal(store, "2026-09-21"), null); // above the limit
  assert.equal(readGoal(store, "2026-09-14"), null); // 0
  assert.equal(readGoal(store, "2026-09-07"), null); // negative
  assert.equal(readGoal({}, "2026-10-05"), null); // empty store
});

test("readGoal reads two monday keys without them overwriting each other", () => {
  const store = parseGoalStore('{"2026-10-05":300,"2026-10-12":null}');
  assert.equal(readGoal(store, "2026-10-05"), 300);
  assert.equal(readGoal(store, "2026-10-12"), null);
  // A third week that never had a goal stays without one.
  assert.equal(readGoal(store, "2026-09-28"), null);
});

test("readGoal tolerates a corrupt store", () => {
  assert.equal(readGoal(null, "2026-10-05"), null);
  assert.equal(readGoal("basura", "2026-10-05"), null);
  assert.equal(readGoal(parseGoalStore("{not json"), "2026-10-05"), null);
});

// getPrefillValue: value of the latest monday key for the initial field (RF-6).

test("getPrefillValue returns no value for an empty or corrupt store", () => {
  assert.equal(getPrefillValue({}), null);
  assert.equal(getPrefillValue(parseGoalStore("{not json")), null);
  assert.equal(getPrefillValue(null), null);
  assert.equal(getPrefillValue("basura"), null);
});

test("getPrefillValue returns the value of the latest monday key", () => {
  // A single entry: the field comes pre-filled with it.
  assert.equal(getPrefillValue(parseGoalStore('{"2026-10-05":300}')), 300);
  // Among several entries, the latest key wins even with an older value around.
  const store = parseGoalStore('{"2026-09-28":240,"2026-10-05":300}');
  assert.equal(getPrefillValue(store), 300);
});

test("getPrefillValue stays empty when the latest entry is empty or corrupt, even with older values", () => {
  // Empty on purpose (the field was saved blank): older goals are never offered back.
  const emptied = parseGoalStore('{"2026-09-28":240,"2026-10-05":null}');
  assert.equal(getPrefillValue(emptied), null);
  // Corrupt values are ignored too, in every flavour.
  const asText = parseGoalStore('{"2026-09-28":240,"2026-10-05":"texto"}');
  assert.equal(getPrefillValue(asText), null);
  const outOfRange = parseGoalStore('{"2026-09-28":240,"2026-10-05":100001}');
  assert.equal(getPrefillValue(outOfRange), null);
  const asDecimal = parseGoalStore('{"2026-09-28":240,"2026-10-05":3.5}');
  assert.equal(getPrefillValue(asDecimal), null);
});

test("getPrefillValue picks the latest key across a year boundary", () => {
  // Week 2026-12-28 vs week 2027-01-04: the newer year is later as text too.
  const store = parseGoalStore('{"2026-12-28":240,"2027-01-04":300}');
  assert.equal(getPrefillValue(store), 300);
});

test("getPrefillValue ignores keys that are not valid dates", () => {
  const store = parseGoalStore('{"basura":999,"2026-13-40":500,"2026-10-05":300}');
  assert.equal(getPrefillValue(store), 300);
  // Only invalid keys: nothing to offer.
  assert.equal(getPrefillValue(parseGoalStore('{"basura":999}')), null);
});

// getProgress: whole percent with Math.round and the completed flag (RF-5).

test("getProgress rounds the percent with Math.round", () => {
  assert.deepEqual(getProgress(0, 300), { percent: 0, completed: false });
  assert.deepEqual(getProgress(100, 300), { percent: 33, completed: false });
  assert.deepEqual(getProgress(150, 300), { percent: 50, completed: false });
  assert.deepEqual(getProgress(200, 300), { percent: 67, completed: false });
});

test("getProgress marks the goal completed at 100% and beyond, never above 100", () => {
  assert.deepEqual(getProgress(300, 300), { percent: 100, completed: true });
  assert.deepEqual(getProgress(350, 300), { percent: 100, completed: true });
});
