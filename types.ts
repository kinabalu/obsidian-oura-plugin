export interface OuraUserInfo {
    email: string;
    gender: string;
    height: number;
    weight: number;
    age: number;
}

export interface OuraActivityEntries {
    activity: OuraActivity[];
}

export interface OuraActivity {
    summary_date: string;
    day_start: string;
    day_end: string;
    timezone: number;
    score: number;
    score_stay_active: number;
    score_move_every_hour: number;
    score_meet_daily_targets: number;
    score_training_frequency: number;
    score_training_volume: number;
    score_recovery_time: number;
    daily_movement: number;
    non_wear: number;
    rest: number;
    inactive: number;
    inactivity_alerts: number;
    low: number;
    medium: number;
    high: number;
    steps: number;
    cal_total: number;
    cal_active: number;
    met_min_inactive: number;
    met_min_low: number;
    met_min_medium_plus: number;
    met_min_medium: number;
    met_min_high: number;
    average_met: number;
    class_5min: string;
    met_1min: number[];
    rest_mode_state: number;
}

export interface OuraReadinessEntries {
    readiness: OuraReadiness[];
}

export interface OuraReadiness {
    summary_date: string;
    period_id: number;
    score: number;
    score_previous_night: number;
    score_sleep_balance: number;
    score_previous_day: number;
    score_activity_balance: number;
    score_resting_hr: number;
    score_hrv_balance: number;
    score_recovery_index: number;
    score_temperature: number;
    rest_mode_state: number;
}

export interface OuraSleepEntries {
    sleep: OuraSleep[];
}

export interface OuraSleep {
    awake: number;
    bedtime_end: string;
    bedtime_end_delta: number;
    bedtime_start: string;
    bedtime_start_delta: number;
    breath_average: number;
    deep: number;
    duration: number;
    efficiency: number;
    hr_5min: number[];
    hr_average: number;
    hr_lowest: number;
    hypnogram_5min: string;
    is_longest: number;
    light: number;
    midpoint_at_delta: number;
    midpoint_time: number;
    onset_latency: number;
    period_id: number;
    rem: number;
    restless: number;
    rmssd: number;
    rmssd_5min: number[];
    score: number;
    score_alignment: number;
    score_deep: number;
    score_disturbances: number;
    score_efficiency: number;
    score_latency: number;
    score_rem: number;
    score_total: number;
    summary_date: string;
    temperature_delta: number;
    temperature_deviation: number;
    temperature_trend_deviation: number;
    timezone: number;
    total: number;
}