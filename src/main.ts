import {Editor, MarkdownView, moment, Notice, Plugin} from 'obsidian';
import OuraApi from "./oura-api";
import {ActivitiesEntry, OuraPluginSettings, OuraRingStats, ReadinessEntry, SleepEntry} from "./types";
import {OuraSettingTab} from "./settings";
import {getToday} from "./utils";


const fetchOuraStats = async (api: OuraApi, day: string): Promise<OuraRingStats> => {
	const ouraRingStats : OuraRingStats = {}

	const sleepData = await api.getSleepData(day)
	const readinessData = await api.getReadinessData(day)
	const activityData = await api.getActivityData(day)

	if (sleepData && sleepData.data.length > 0) {
		const sleepEntry = sleepData.data[0] as SleepEntry;

		ouraRingStats.sleep_day = sleepEntry.day;
		ouraRingStats.sleep_score = sleepEntry.score;
		ouraRingStats.sleep_timestamp = sleepEntry.timestamp;
		ouraRingStats.sleep_contributors_deep_sleep = sleepEntry.contributors.deep_sleep;
		ouraRingStats.sleep_contributors_efficiency = sleepEntry.contributors.efficiency;
		ouraRingStats.sleep_contributors_latency = sleepEntry.contributors.latency;
		ouraRingStats.sleep_contributors_rem_sleep = sleepEntry.contributors.rem_sleep;
		ouraRingStats.sleep_contributors_restfulness = sleepEntry.contributors.restfulness;
		ouraRingStats.sleep_contributors_timing = sleepEntry.contributors.timing;
		ouraRingStats.sleep_contributors_total_sleep = sleepEntry.contributors.total_sleep;
	}

	if (readinessData && readinessData.data.length > 0) {
		const readinessEntry = readinessData.data[0] as ReadinessEntry;

		ouraRingStats.readiness_day = readinessEntry.day;
		ouraRingStats.readiness_score = readinessEntry.score;
		ouraRingStats.readiness_temperature_deviation = readinessEntry.temperature_deviation;
		ouraRingStats.readiness_temperature_trend_deviation = readinessEntry.temperature_trend_deviation;
		ouraRingStats.readiness_timestamp = readinessEntry.timestamp;
		ouraRingStats.readiness_contributors_activity_balance = readinessEntry.contributors.activity_balance;
		ouraRingStats.readiness_contributors_body_temperature = readinessEntry.contributors.body_temperature;
		ouraRingStats.readiness_contributors_hrv_balance = readinessEntry.contributors.hrv_balance;
		ouraRingStats.readiness_contributors_previous_day_activity = readinessEntry.contributors.previous_day_activity;
		ouraRingStats.readiness_contributors_previous_night = readinessEntry.contributors.previous_night;
		ouraRingStats.readiness_contributors_recovery_index = readinessEntry.contributors.recovery_index;
		ouraRingStats.readiness_contributors_resting_heart_rate = readinessEntry.contributors.resting_heart_rate;
		ouraRingStats.readiness_contributors_sleep_balance = readinessEntry.contributors.sleep_balance;
	}

	if (activityData && activityData.data.length > 0) {
		const activitiesEntry = activityData.data[0] as ActivitiesEntry;

		ouraRingStats.activities_class_5_min = activitiesEntry.class_5_min;
		ouraRingStats.activities_score = activitiesEntry.score;
		ouraRingStats.activities_active_calories = activitiesEntry.active_calories;
		ouraRingStats.activities_average_met_minutes = activitiesEntry.average_met_minutes;
		ouraRingStats.activities_equivalent_walking_distance = activitiesEntry.equivalent_walking_distance;
		ouraRingStats.activities_high_activity_met_minutes = activitiesEntry.high_activity_met_minutes;
		ouraRingStats.activities_high_activity_time = activitiesEntry.high_activity_time;
		ouraRingStats.activities_inactivity_alerts = activitiesEntry.inactivity_alerts;
		ouraRingStats.activities_low_activity_met_minutes = activitiesEntry.low_activity_met_minutes;
		ouraRingStats.activities_low_activity_time = activitiesEntry.low_activity_time;
		ouraRingStats.activities_medium_activity_met_minutes = activitiesEntry.medium_activity_met_minutes;
		ouraRingStats.activities_medium_activity_time = activitiesEntry.medium_activity_time;
		ouraRingStats.activities_meters_to_target = activitiesEntry.meters_to_target;
		ouraRingStats.activities_non_wear_time = activitiesEntry.non_wear_time;
		ouraRingStats.activities_resting_time = activitiesEntry.resting_time;
		ouraRingStats.activities_sedentary_met_minutes = activitiesEntry.sedentary_met_minutes;
		ouraRingStats.activities_sedentary_time = activitiesEntry.sedentary_time;
		ouraRingStats.activities_steps = activitiesEntry.steps;
		ouraRingStats.activities_target_calories = activitiesEntry.target_calories;
		ouraRingStats.activities_target_meters = activitiesEntry.target_meters;
		ouraRingStats.activities_total_calories = activitiesEntry.total_calories;
		ouraRingStats.activities_day = activitiesEntry.day;
		ouraRingStats.activities_timestamp = activitiesEntry.timestamp;
		ouraRingStats.activities_met_interval = activitiesEntry.met.interval;
		ouraRingStats.activities_met_timestamp = activitiesEntry.met.timestamp;
		ouraRingStats.activities_contributors_meet_daily_targets = activitiesEntry.contributors.meet_daily_targets;
		ouraRingStats.activities_contributors_move_every_hour = activitiesEntry.contributors.move_every_hour;
		ouraRingStats.activities_contributors_recovery_time = activitiesEntry.contributors.recovery_time;
		ouraRingStats.activities_contributors_stay_active = activitiesEntry.contributors.stay_active;
		ouraRingStats.activities_contributors_training_frequency = activitiesEntry.contributors.training_frequency;
		ouraRingStats.activities_contributors_training_volume = activitiesEntry.contributors.training_volume;
	}

	return ouraRingStats
}

const DEFAULT_SETTINGS: OuraPluginSettings = {
	personalAccessToken: null,
	sleepTemplate: `Sleep Day: $$sleep_day
Sleep Score: $$sleep_score
Sleep Timestamp: $$sleep_timestamp
Deep Sleep: $$sleep_contributors_deep_sleep
Efficiency: $$sleep_contributors_efficiency
Latency: $$sleep_contributors_latency
REM Sleep: $$sleep_contributors_rem_sleep
Restfulness: $$sleep_contributors_restfulness
Timing: $$sleep_contributors_timing
Total Sleep: $$sleep_contributors_total_sleep`,
	readinessTemplate: `Readiness Day: $$readiness_day
Readiness Score: $$readiness_score
Temperature Deviation: $$readiness_temperature_deviation
Temperature Trend Deviation: $$readiness_temperature_trend_deviation
Readiness Timestamp: $$readiness_timestamp
Activity Balance: $$readiness_contributors_activity_balance
Body Temperature: $$readiness_contributors_body_temperature
HRV Balance: $$readiness_contributors_hrv_balance
Previous Day Activity: $$readiness_contributors_previous_day_activity
Previous Night: $$readiness_contributors_previous_night
Recovery Index: $$readiness_contributors_recovery_index
Resting Heart Rate: $$readiness_contributors_resting_heart_rate
Sleep Balance: $$readiness_contributors_sleep_balance`,
	activitiesTemplate: `Class (5 min): $$activities_class_5_min
Score: $$activities_score
Active Calories: $$activities_active_calories
Average MET Minutes: $$activities_average_met_minutes
Equivalent Walking Distance: $$activities_equivalent_walking_distance
High Activity MET Minutes: $$activities_high_activity_met_minutes
High Activity Time: $$activities_high_activity_time
Inactivity Alerts: $$activities_inactivity_alerts
Low Activity MET Minutes: $$activities_low_activity_met_minutes
Low Activity Time: $$activities_low_activity_time
Medium Activity MET Minutes: $$activities_medium_activity_met_minutes
Medium Activity Time: $$activities_medium_activity_time
Meters to Target: $$activities_meters_to_target
Non-Wear Time: $$activities_non_wear_time
Resting Time: $$activities_resting_time
Sedentary MET Minutes: $$activities_sedentary_met_minutes
Sedentary Time: $$activities_sedentary_time
Steps: $$activities_steps
Target Calories: $$activities_target_calories
Target Meters: $$activities_target_meters
Total Calories: $$activities_total_calories
Day: $$activities_day
Timestamp: $$activities_timestamp
MET Interval: $$activities_met_interval
MET Items: $$activities_met_items
MET Timestamp: $$activities_met_timestamp
Meet Daily Targets: $$activities_contributors_meet_daily_targets
Move Every Hour: $$activities_contributors_move_every_hour
Recovery Time: $$activities_contributors_recovery_time
Stay Active: $$activities_contributors_stay_active
Training Frequency: $$activities_contributors_training_frequency
Training Volume: $$activities_contributors_training_volume`,
}

function replacePlaceholders(template: string, data: OuraRingStats) {
	return template.split('\n').map(line => {
		const replacedLine = line.replace(/\$\$(\w+)/g, (_, key) => {
			return data[key] !== undefined ? String(data[key]) : `$$${key}`;
		});
		return replacedLine.includes('$$') ? '' : replacedLine;
	}).filter(line => line.trim() !== '').join('\n');
}

export default class OuraPlugin extends Plugin {
	public ouraApi: OuraApi;
	settings: OuraPluginSettings;

	async onload() {
		console.log('Loading Oura Ring plugin');

		await this.loadSettings();

		if (!this.ouraApi) {
			this.ouraApi = new OuraApi(this.settings.personalAccessToken);
		}

		this.addCommand({
			id: 'insert-oura-ring-stats',
			name: 'Insert Oura Ring Stats',
			editorCallback: async (editor: Editor) => {
				if (!this.settings.personalAccessToken) {
					new Notice('Personal access token missing, please enter in plugin settings')
					return
				}
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				const activeDocument = activeView.file.basename
				const metricsForDay = moment(activeDocument, 'YYYY-MM-DD', true).isValid() ? activeDocument : getToday()

				const stats : OuraRingStats = await fetchOuraStats(this.ouraApi, metricsForDay)

				let ouraText = ''

				ouraText += replacePlaceholders(this.settings.sleepTemplate, stats);
				ouraText += replacePlaceholders(this.settings.readinessTemplate, stats);
				ouraText += replacePlaceholders(this.settings.activitiesTemplate, stats);

				editor.replaceSelection(ouraText);

			}
		});

		this.addSettingTab(new OuraSettingTab(this.app, this));
	}

	onunload() {
		console.log('unloading Oura Ring plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

