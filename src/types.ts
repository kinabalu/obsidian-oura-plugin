export interface OuraUserInfo {
  id: string;
  email: string;
  biological_sex: string;
  height: number;
  weight: number;
  age: number;
}

export interface OuraPluginSettings {
  personalAccessToken: string;
  sleepTemplate: string;
  readinessTemplate: string;
  activitiesTemplate: string;
}

export interface OuraResponse {
  data: SleepEntry[] | ReadinessEntry[] | ActivitiesEntry[],
  next_token: string | null;
}

export interface SleepEntry {
  id: string;
  contributors: SleepEntryContributors;
  day: string;
  score: number;
  timestamp: string;
}

export interface SleepEntryContributors {
  deep_sleep: number;
  efficiency: number;
  latency: number;
  rem_sleep: number;
  restfulness: number;
  timing: number;
  total_sleep: number;
}

export interface ReadinessEntry {
  id: string;
  contributors: ReadinessEntryContributors;
  day: string;
  score: number;
  temperature_deviation: number;
  temperature_trend_deviation: number;
  timestamp: string;
}

export interface ReadinessEntryContributors {
  activity_balance: number;
  body_temperature: number;
  hrv_balance: number;
  previous_day_activity: number;
  previous_night: number;
  recovery_index: number;
  resting_heart_rate: number;
  sleep_balance: number;
}

export interface ActivitiesMet {
  interval: number;
  items: [],
  timestamp: string
}

export interface ActivitiesContributors {
  meet_daily_targets: number;
  move_every_hour: number;
  recovery_time: number;
  stay_active: number;
  training_frequency: number;
  training_volume: number;
}

export interface ActivitiesEntry {
  id: string;
  class_5_min: string;
  score: number;
  active_calories: number;
  average_met_minutes: number;
  contributors: ActivitiesContributors;
  equivalent_walking_distance: number;
  high_activity_met_minutes: number;
  high_activity_time: number;
  inactivity_alerts: number;
  low_activity_met_minutes: number;
  low_activity_time: number;
  medium_activity_met_minutes: number;
  medium_activity_time: number;
  met: ActivitiesMet;
  meters_to_target: number;
  non_wear_time: number;
  resting_time: number;
  sedentary_met_minutes: number;
  sedentary_time: number;
  steps: number;
  target_calories: number;
  target_meters: number;
  total_calories: number;
  day: string;
  timestamp: string
}

export interface OuraRingStats {
  sleep_day?: string;
  sleep_score?: number;
  sleep_timestamp?: string;
  sleep_contributors_deep_sleep?: number;
  sleep_contributors_efficiency?: number;
  sleep_contributors_latency?: number;
  sleep_contributors_rem_sleep?: number;
  sleep_contributors_restfulness?: number;
  sleep_contributors_timing?: number;
  sleep_contributors_total_sleep?: number;

  activities_class_5_min?: string;
  activities_score?: number;
  activities_active_calories?: number;
  activities_average_met_minutes?: number;
  activities_equivalent_walking_distance?: number;
  activities_high_activity_met_minutes?: number;
  activities_high_activity_time?: number;
  activities_inactivity_alerts?: number;
  activities_low_activity_met_minutes?: number;
  activities_low_activity_time?: number;
  activities_medium_activity_met_minutes?: number;
  activities_medium_activity_time?: number;
  activities_meters_to_target?: number;
  activities_non_wear_time?: number;
  activities_resting_time?: number;
  activities_sedentary_met_minutes?: number;
  activities_sedentary_time?: number;
  activities_steps?: number;
  activities_target_calories?: number;
  activities_target_meters?: number;
  activities_total_calories?: number;
  activities_day?: string;
  activities_timestamp?: string

  activities_met_interval?: number;
  activities_met_timestamp?: string

  activities_contributors_meet_daily_targets?: number;
  activities_contributors_move_every_hour?: number;
  activities_contributors_recovery_time?: number;
  activities_contributors_stay_active?: number;
  activities_contributors_training_frequency?: number;
  activities_contributors_training_volume?: number;

  readiness_day?: string;
  readiness_score?: number;
  readiness_temperature_deviation?: number;
  readiness_temperature_trend_deviation?: number;
  readiness_timestamp?: string;
  readiness_contributors_activity_balance?: number;
  readiness_contributors_body_temperature?: number;
  readiness_contributors_hrv_balance?: number;
  readiness_contributors_previous_day_activity?: number;
  readiness_contributors_previous_night?: number;
  readiness_contributors_recovery_index?: number;
  readiness_contributors_resting_heart_rate?: number;
  readiness_contributors_sleep_balance?: number;

  [key: string]: string | number | undefined;
}
