/** Day-of-week constants (0 = Sunday, 1 = Monday, …, 6 = Saturday). */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Schedule slot domain model. */
export interface Schedule {
  id: string;
  professionalId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface SchedulePayload {
  professionalId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}
