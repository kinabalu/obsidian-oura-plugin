import {requestUrl, moment} from "obsidian";
import {
    ActivitiesEntry,
    ReadinessEntry,
    SleepEntry,
    SleepRouteEntry,
    OuraResponse,
    OuraUserInfo,
} from "./types";

const OURA_API_URL = 'https://api.ouraring.com/v2/usercollection'
// const OURA_API_URL = 'https://api.ouraring.com/v2/sandbox/usercollection'

export default class OuraApi {
    token: string | null

    constructor(token: string) {
        this.token = token
    }

    public async getSleepData(theDate: string): Promise<OuraResponse | null> {
        if (this.token) {
            try {
                const params = new URLSearchParams()
                const start = moment(theDate).subtract(1, 'days').format('YYYY-MM-DD')
                const end = moment(theDate).add(1, 'days').format('YYYY-MM-DD')
                params.set('start_date', start)
                params.set('end_date', end)
                const data = await requestUrl({
                    url: `${OURA_API_URL}/daily_sleep?${params.toString()}`, headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                })

                const sleepEntries: SleepEntry[] = data.json.data.map((entry: SleepEntry) => ({
                    id: entry.id,
                    contributors: {
                        deep_sleep: entry.contributors.deep_sleep,
                        efficiency: entry.contributors.efficiency,
                        latency: entry.contributors.latency,
                        rem_sleep: entry.contributors.rem_sleep,
                        restfulness: entry.contributors.restfulness,
                        timing: entry.contributors.timing,
                        total_sleep: entry.contributors.total_sleep,
                    },
                    day: entry.day,
                    score: entry.score,
                    timestamp: entry.timestamp,
                }));

                return {
                    data: sleepEntries,
                    next_token: data.json.next_token,
                };
            } catch (e) {
                console.error('Error fetching sleep entries:', e);
                return null;
            }
        }
        return null
    }

    public async getSleepRouteData(theDate: string): Promise<OuraResponse | null> {
        if (this.token) {
            try {
                const params = new URLSearchParams()
                const start = moment(theDate).subtract(1, 'days').format('YYYY-MM-DD')
                const end = moment(theDate).add(1, 'days').format('YYYY-MM-DD')
                params.set('start_date', start)
                params.set('end_date', end)
                const data = await requestUrl({
                    url: `${OURA_API_URL}/sleep?${params.toString()}`, headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                })

                const sleepRouteEntries: SleepRouteEntry[] = data.json.data.map((entry: SleepRouteEntry) => ({
                    id: entry.id,
                    average_breath: entry.average_breath,
                    average_heart_rate: entry.average_heart_rate,
                    average_hrv: entry.average_hrv,
                    awake_time: entry.awake_time,
                    bedtime_end: entry.bedtime_end,
                    bedtime_start: entry.bedtime_start,
                    day: entry.day,
                    deep_sleep_duration: entry.deep_sleep_duration,
                    efficiency: entry.efficiency,
                    heart_rate: entry.heart_rate ? {
                        interval: entry.heart_rate.interval,
                        items: entry.heart_rate.items,
                        timestamp: entry.heart_rate.timestamp,
                    } : null,
                    hrv: entry.hrv ? {
                        interval: entry.hrv.interval,
                        items: entry.hrv.items,
                        timestamp: entry.hrv.timestamp,
                    } : null,
                    latency: entry.latency,
                    light_sleep_duration: entry.light_sleep_duration,
                    low_battery_alert: entry.low_battery_alert,
                    lowest_heart_rate: entry.lowest_heart_rate,
                    movement_30_sec: entry.movement_30_sec,
                    period: entry.period,
                    readiness: {
                        contributors: {
                            activity_balance: entry.readiness.contributors.activity_balance,
                            body_temperature: entry.readiness.contributors.body_temperature,
                            hrv_balance: entry.readiness.contributors.hrv_balance,
                            previous_day_activity: entry.readiness.contributors.previous_day_activity,
                            previous_night: entry.readiness.contributors.previous_night,
                            recovery_index: entry.readiness.contributors.recovery_index,
                            resting_heart_rate: entry.readiness.contributors.resting_heart_rate,
                            sleep_balance: entry.readiness.contributors.sleep_balance,
                            sleep_regularity: entry.readiness.contributors.sleep_regularity,
                        },
                        score: entry.readiness.score,
                        temperature_deviation: entry.readiness.temperature_deviation,
                        temperature_trend_deviation: entry.readiness.temperature_trend_deviation,
                    },
                    readiness_score_delta: entry.readiness_score_delta,
                    rem_sleep_duration: entry.rem_sleep_duration,
                    restless_periods: entry.restless_periods,
                    sleep_phase_5_min: entry.sleep_phase_5_min,
                    sleep_score_delta: entry.sleep_score_delta,
                    sleep_algorithm_version: entry.sleep_algorithm_version,
                    sleep_analysis_reason: entry.sleep_analysis_reason,
                    time_in_bed: entry.time_in_bed,
                    total_sleep_duration: entry.total_sleep_duration,
                    type: entry.type,
                }));

                return {
                    data: sleepRouteEntries,
                    next_token: data.json.next_token,
                };
            } catch (e) {
                return null;
            }
        }
        return null
    }

    public async getActivityData(theDate: string): Promise<OuraResponse | null> {
        if (this.token) {
            try {
                const params = new URLSearchParams()
                const start = moment(theDate).subtract(1, 'days').format('YYYY-MM-DD')
                const end = moment(theDate).add(1, 'days').format('YYYY-MM-DD')
                params.set('start_date', start)
                params.set('end_date', end)
                const data = await requestUrl({
                    url: `${OURA_API_URL}/daily_activity?${params.toString()}`, headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                })

                const activitiesEntries: ActivitiesEntry[] = data.json.data.map((entry: ActivitiesEntry) => ({
                    id: entry.id,
                    class_5_min: entry.class_5_min,
                    score: entry.score,
                    active_calories: entry.active_calories,
                    average_met_minutes: entry.average_met_minutes,
                    contributors: {
                        meet_daily_targets: entry.contributors.meet_daily_targets,
                        move_every_hour: entry.contributors.move_every_hour,
                        recovery_time: entry.contributors.recovery_time,
                        stay_active: entry.contributors.stay_active,
                        training_frequency: entry.contributors.training_frequency,
                        training_volume: entry.contributors.training_volume,
                    },
                    equivalent_walking_distance: entry.equivalent_walking_distance,
                    high_activity_met_minutes: entry.high_activity_met_minutes,
                    high_activity_time: entry.high_activity_time,
                    inactivity_alerts: entry.inactivity_alerts,
                    low_activity_met_minutes: entry.low_activity_met_minutes,
                    low_activity_time: entry.low_activity_time,
                    medium_activity_met_minutes: entry.medium_activity_met_minutes,
                    medium_activity_time: entry.medium_activity_time,
                    met: {
                        interval: entry.met.interval,
                        items: entry.met.items,
                        timestamp: entry.met.timestamp,
                    },
                    meters_to_target: entry.meters_to_target,
                    non_wear_time: entry.non_wear_time,
                    resting_time: entry.resting_time,
                    sedentary_met_minutes: entry.sedentary_met_minutes,
                    sedentary_time: entry.sedentary_time,
                    steps: entry.steps,
                    target_calories: entry.target_calories,
                    target_meters: entry.target_meters,
                    total_calories: entry.total_calories,
                    day: entry.day,
                    timestamp: entry.timestamp,
                }));

                return {
                    data: activitiesEntries,
                    next_token: data.json.next_token,
                };
            } catch (e) {
                return null;
            }
        }
        return null
    }

    public async getReadinessData(theDate: string): Promise<OuraResponse | null> {
        if (this.token) {
            try {
                const params = new URLSearchParams()
                const start = moment(theDate).subtract(1, 'days').format('YYYY-MM-DD')
                const end = moment(theDate).add(1, 'days').format('YYYY-MM-DD')
                params.set('start_date', start)
                params.set('end_date', end)
                const data = await requestUrl({
                    url: `${OURA_API_URL}/daily_readiness?${params.toString()}`, headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                })

                const readinessEntries: ReadinessEntry[] = data.json.data.map((entry: ReadinessEntry) => ({
                    id: entry.id,
                    contributors: {
                        activity_balance: entry.contributors.activity_balance,
                        body_temperature: entry.contributors.body_temperature,
                        hrv_balance: entry.contributors.hrv_balance,
                        previous_day_activity: entry.contributors.previous_day_activity,
                        previous_night: entry.contributors.previous_night,
                        recovery_index: entry.contributors.recovery_index,
                        resting_heart_rate: entry.contributors.resting_heart_rate,
                        sleep_balance: entry.contributors.sleep_balance,
                    },
                    day: entry.day,
                    score: entry.score,
                    temperature_deviation: entry.temperature_deviation,
                    temperature_trend_deviation: entry.temperature_trend_deviation,
                    timestamp: entry.timestamp,
                }));

                return {
                    data: readinessEntries,
                    next_token: data.json.next_token,
                };
            } catch (e) {
                return null;
            }
        }
        return null
    }

    public async getUserInfo(): Promise<OuraUserInfo> {
        if (this.token) {
            try {
                const data = await requestUrl({
                    url: `${OURA_API_URL}/personal_info`, headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                })

                console.dir(data.json)
                return data.json as OuraUserInfo
            } catch (e) {
                return null;
            }
        }
        return null
    }
}
