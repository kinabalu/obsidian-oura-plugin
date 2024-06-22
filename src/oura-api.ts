import {requestUrl, moment} from "obsidian";
import {
    ActivitiesEntry,
    ReadinessEntry,
    SleepEntry,
    OuraResponse,
    OuraUserInfo,
} from "./types";

const OURA_API_URL = 'https://api.ouraring.com/v2/usercollection'

export default class OuraApi {
    token: string | null

    constructor(token: string) {
        this.token = token
    }

    async getSleepData(theDate: string): Promise<OuraResponse | null> {
        if (this.token) {
            try {
                const params = new URLSearchParams()
                const start = moment(theDate).subtract(1, 'days').format('YYYY-MM-DD')
                params.set('start_date', start)
                params.set('end_date', theDate)
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

    async getActivityData(theDate: string): Promise<OuraResponse | null> {
        if (this.token) {
            try {
                const params = new URLSearchParams()
                const start = moment(theDate).subtract(1, 'days').format('YYYY-MM-DD')
                params.set('start_date', start)
                params.set('end_date', theDate)
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

    async getReadinessData(theDate: string): Promise<OuraResponse | null> {
        if (this.token) {
            try {
                const params = new URLSearchParams()
                const start = moment(theDate).subtract(1, 'days').format('YYYY-MM-DD')
                params.set('start_date', start)
                params.set('end_date', theDate)
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

    async getUserInfo(): Promise<OuraUserInfo> {
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
