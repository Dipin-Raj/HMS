import { format, parseISO, isToday, isTomorrow, addDays, differenceInDays } from 'date-fns';

export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 || 12;
  return `${displayHours}:${minutes} ${suffix}`;
}

export function getRelativeDay(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  const diff = differenceInDays(d, new Date());
  if (diff > 0 && diff <= 7) return format(d, 'EEEE');
  return format(d, 'MMM dd');
}

export function generateTimeSlots(start: number = 9, end: number = 17, interval: number = 30): string[] {
  const slots: string[] = [];
  for (let hour = start; hour < end; hour++) {
    for (let min = 0; min < 60; min += interval) {
      slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
  }
  return slots;
}

export function getNextNDays(n: number): Date[] {
  return Array.from({ length: n }, (_, i) => addDays(new Date(), i));
}
