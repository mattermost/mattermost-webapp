export type ScheduleType = {
    user_id: string;
    mode: Number;
    sunday_start: string;
    monday_start: string;
    tuesday_start: string;
    wednesday_start: string;
    thursday_start: string;
    friday_start: string;
    saturday_start: string;
    sunday_end: string;
    monday_end: string;
    tuesday_end: string;
    wednesday_end: string;
    thursday_end: string;
    friday_end: string;
    saturday_end: string;
};

export type SchedulesType = {
    [x: string]: ScheduleType;
};
