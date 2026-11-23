/** Receives a day as `'YYYY-MM-DD'`, its index from 0001-01-01 and its weekday (0 is Sunday). */
export type CivilDayVisitor = (day: string, index: number, weekday: number) => void;
