export interface LoveDuration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
}

export function calculateDaysTogether(startDate: Date, currentDate: Date = new Date()): LoveDuration {
  const diffMs = Math.max(0, currentDate.getTime() - startDate.getTime());
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    days: totalDays,
    hours,
    minutes,
    seconds,
    totalDays,
  };
}

export function filterMemories<T extends { title: string; caption: string; tag: string }>(
  items: T[],
  category: string,
  searchQuery: string = ''
): T[] {
  const query = searchQuery.trim().toLowerCase();

  return items.filter((item) => {
    const matchesCategory = category === 'all' || item.tag.toLowerCase() === category.toLowerCase();
    if (!matchesCategory) return false;

    if (!query) return true;
    return (
      item.title.toLowerCase().includes(query) ||
      item.caption.toLowerCase().includes(query) ||
      item.tag.toLowerCase().includes(query)
    );
  });
}

export function calculateRedeemedCoupons(coupons: { isRedeemed: boolean }[]): {
  redeemedCount: number;
  totalCount: number;
  percent: number;
} {
  const totalCount = coupons.length;
  if (totalCount === 0) return { redeemedCount: 0, totalCount: 0, percent: 0 };
  const redeemedCount = coupons.filter((c) => c.isRedeemed).length;
  const percent = Math.round((redeemedCount / totalCount) * 100);
  return { redeemedCount, totalCount, percent };
}

export function sanitizeWish(input: string): { valid: boolean; message: string; sanitized: string } {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { valid: false, message: 'Lời ước không được để trống nè!', sanitized: '' };
  }
  if (trimmed.length > 500) {
    return { valid: false, message: 'Lời ước dài quá rồi, rút gọn dưới 500 ký tự nhé!', sanitized: trimmed.slice(0, 500) };
  }
  return { valid: true, message: 'Lời ước hợp lệ!', sanitized: trimmed };
}

export function getGreetingByHour(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Chào buổi sáng rạng rỡ của anh! ☀️';
  if (hour >= 12 && hour < 18) return 'Chúc em một buổi chiều thật ngọt ngào! 🌸';
  return 'Buổi tối ấm áp và ngập tràn hạnh phúc nhé em! 🌙';
}
