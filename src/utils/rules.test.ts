import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDaysTogether,
  filterMemories,
  calculateRedeemedCoupons,
  sanitizeWish,
  getGreetingByHour,
} from './rules.ts';

test('calculateDaysTogether returns positive days and breakdown for past dates', () => {
  const start = new Date(2026, 6, 1, 0, 0, 0); // July 1, 2026
  const current = new Date(2026, 9, 19, 10, 49, 0); // Oct 19, 2026 10:49:00
  const result = calculateDaysTogether(start, current);
  assert.equal(result.totalDays, 110);
  assert.equal(result.hours, 10);
  assert.equal(result.minutes, 49);
  assert.equal(result.seconds, 0);
});

test('calculateDaysTogether handles future dates gracefully without negative counts', () => {
  const future = new Date(2099, 0, 1);
  const current = new Date(2026, 0, 1);
  const result = calculateDaysTogether(future, current);
  assert.equal(result.totalDays, 0);
  assert.equal(result.hours, 0);
  assert.equal(result.minutes, 0);
  assert.equal(result.seconds, 0);
});

test('filterMemories filters correctly by category and search keyword', () => {
  const sample = [
    { title: 'Chuột Chanel', caption: 'Filter dễ thương', tag: 'Cute' },
    { title: 'Nụ cười tỏa nắng', caption: 'Bờm ngọc trai và sách', tag: 'Dịu dàng' },
    { title: 'Áo xanh thanh xuân', caption: 'Trường lớp ngọt ngào', tag: 'Kỷ niệm' },
  ];

  const allFiltered = filterMemories(sample, 'all');
  assert.equal(allFiltered.length, 3);

  const cuteOnly = filterMemories(sample, 'Cute');
  assert.equal(cuteOnly.length, 1);
  assert.equal(cuteOnly[0].title, 'Chuột Chanel');

  const searchKeyword = filterMemories(sample, 'all', 'ngọc trai');
  assert.equal(searchKeyword.length, 1);
  assert.equal(searchKeyword[0].title, 'Nụ cười tỏa nắng');
});

test('calculateRedeemedCoupons calculates counts and percentage accurately', () => {
  const coupons = [
    { isRedeemed: true },
    { isRedeemed: false },
    { isRedeemed: true },
    { isRedeemed: false },
  ];
  const stats = calculateRedeemedCoupons(coupons);
  assert.equal(stats.totalCount, 4);
  assert.equal(stats.redeemedCount, 2);
  assert.equal(stats.percent, 50);

  const emptyStats = calculateRedeemedCoupons([]);
  assert.equal(emptyStats.percent, 0);
});

test('sanitizeWish handles empty, long, and normal strings', () => {
  const emptyRes = sanitizeWish('   ');
  assert.equal(emptyRes.valid, false);

  const normalRes = sanitizeWish('Mong chúng mình luôn hạnh phúc bên nhau mãi mãi!');
  assert.equal(normalRes.valid, true);
  assert.equal(normalRes.sanitized, 'Mong chúng mình luôn hạnh phúc bên nhau mãi mãi!');

  const longInput = 'a'.repeat(600);
  const longRes = sanitizeWish(longInput);
  assert.equal(longRes.valid, false);
  assert.equal(longRes.sanitized.length, 500);
});

test('getGreetingByHour returns morning, afternoon, evening greetings appropriately', () => {
  const morningDate = new Date(2026, 9, 20, 8, 30);
  assert.match(getGreetingByHour(morningDate), /buổi sáng/i);

  const afternoonDate = new Date(2026, 9, 20, 14, 0);
  assert.match(getGreetingByHour(afternoonDate), /buổi chiều/i);

  const eveningDate = new Date(2026, 9, 20, 20, 0);
  assert.match(getGreetingByHour(eveningDate), /buổi tối/i);
});
