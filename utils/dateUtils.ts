
/**
 * 台灣國定假日工具
 */

// 2024 - 2026 台灣主要國定假日
const TAIWAN_HOLIDAYS = [
  '2025-01-01', '2025-01-27', '2025-01-28', '2025-01-29', '2025-01-30', '2025-01-31', '2025-02-01', '2025-02-02',
  '2025-02-28', '2025-04-03', '2025-04-04', '2025-05-31', '2025-10-06', '2025-10-10',
];

const TAIWAN_MAKEUP_WORKDAYS = [
  '2025-02-08', '2026-02-07',
];

/**
 * 計算兩日期間的實際請假天數
 */
export const calculateWorkDays = (startDateStr: string, endDateStr: string, session: string = 'FULL'): number => {
  if (!startDateStr || !endDateStr) return 0;
  
  // 建立不含時間的 Date 物件，避免時區偏移
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  
  if (start > end) return 0;

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    // 取得 YYYY-MM-DD 格式
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    
    const dayOfWeek = current.getDay();

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = TAIWAN_HOLIDAYS.includes(dateStr);
    const isMakeupDay = TAIWAN_MAKEUP_WORKDAYS.includes(dateStr);

    if ((!isWeekend && !isHoliday) || isMakeupDay) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  if (startDateStr === endDateStr && (session === 'AM' || session === 'PM')) {
    return count > 0 ? 0.5 : 0;
  }

  return count;
};
