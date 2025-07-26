const { sum, subtract, multiply, divide } = require('./index.js');

test('sum adds numbers', () => {
  expect(sum(2, 3)).toBe(5);
});

test('sum with non-numbers returns NaN', () => {
  expect(sum('a', 3)).toBeNaN();
});

test('subtract subtracts numbers', () => {
  expect(subtract(5, 3)).toBe(2);
});

test('subtract with non-numbers returns NaN', () => {
  expect(subtract(5, 'b')).toBeNaN();
});

test('multiply multiplies numbers', () => {
  expect(multiply(2, 3)).toBe(6);
});

test('multiply with non-numbers returns NaN', () => {
  expect(multiply(2, 'c')).toBeNaN();
});

test('divide divides numbers', () => {
  expect(divide(6, 3)).toBe(2);
});

test('divide by zero returns Infinity', () => {
  expect(divide(6, 0)).toBe(Infinity);
});

test('divide with non-numbers returns NaN', () => {
  expect(divide('d', 2)).toBeNaN();
});