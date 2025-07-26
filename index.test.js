const { sum, multiply}  = require("./index");

test("adds negative numbers", () => {
  expect(sum(-1, -2)).toBe(-3);
});

test("adds 0 + 0 to equal 0", () => {
  expect(sum(0, 0)).toBe(0);
});

test("Multiply numbers", () => {
  expect(multiply(2,3)).toBe(6)
});