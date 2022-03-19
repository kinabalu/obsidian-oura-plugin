import {App, Editor, Notice, Plugin, PluginSettingTab, Setting, MarkdownView} from 'obsidian';
import type moment from "moment"
import numeral from 'numeral'
import OuraApi from "./oura-api";

declare global {
	interface Window {
		moment: typeof moment;
	}
}

interface OuraPluginSettings {
	personalAccessToken: string;
}

interface OuraRingStats {
	hasSleepData?: boolean;
	hasActivityData?: boolean;
	hasReadinessData?: boolean;
	bedtimeStart?: string;
	bedtimeEnd?: string;
	sleepScore?: number;
	sleepEfficiency?: number;
	sleepDuration?: string;
	sleepTotal?: string;
	sleepLatency?: string;
	sleepAwake?: string;
	sleepLight?: string;
	sleepRem?: string;
	sleepDeep?: string;
	activityDayStart?: string;
	activityDayEnd?: string;
	activityScore?: number;
	activityLow?: string;
	activityMedium?: string;
	activityHigh?: string;
	activityRest?: string;
	activitySteps?: number;
	readinessScore?: number;
}

const getToday = () => {
	return window.moment().format('YYYY-MM-DD')
}

const iso8601ToTime = (theString: string): string => {
	return window.moment(theString).format('HH:mm:ss')
}

const minutesToHMS = (minutes: number): string => {
	const hours = Math.floor(minutes / 60)
	const minutesRemainder = minutes % 60

	return `${numeral(hours).format('00')}:${numeral(minutesRemainder).format('00')}:00`
}

const secondsToHMS = (seconds: number): string => {
	const hours = Math.floor(seconds / 60 / 60)
	const minutes = Math.floor(seconds / 60) % 60
	const secondsRemainder = (seconds % 60)
	return `${numeral(hours).format('00')}:${numeral(minutes).format('00')}:${numeral(secondsRemainder).format('00')}`
}


const fetchOuraStats = async (token: string, day: string): Promise<OuraRingStats> => {
	const ouraRingStats : OuraRingStats = {
		hasSleepData: false,
		hasActivityData: false,
		hasReadinessData: false,
	}

	const ouraApi = new OuraApi(token)
	const sleepData = await ouraApi.getSleepData(day)
	const activityData = await ouraApi.getActivityData(day)
	const readinessData = await ouraApi.getReadinessData(day)

	const sleepEntry = sleepData.sleep[0]
	const activityEntry = activityData.activity[0]
	const readinessEntry = readinessData.readiness[0]

	if (sleepEntry) {
		ouraRingStats.hasSleepData = true
		ouraRingStats.bedtimeStart = iso8601ToTime(sleepEntry.bedtime_start)
		ouraRingStats.bedtimeEnd = iso8601ToTime(sleepEntry.bedtime_end)
		ouraRingStats.sleepScore = sleepEntry.score
		ouraRingStats.sleepEfficiency = sleepEntry.efficiency
		ouraRingStats.sleepDuration = secondsToHMS(sleepEntry.duration)
		ouraRingStats.sleepTotal = secondsToHMS(sleepEntry.total)
		ouraRingStats.sleepAwake = secondsToHMS(sleepEntry.awake)
		ouraRingStats.sleepLatency = secondsToHMS(sleepEntry.onset_latency)
		ouraRingStats.sleepLight = secondsToHMS(sleepEntry.light)
		ouraRingStats.sleepRem = secondsToHMS(sleepEntry.rem)
		ouraRingStats.sleepDeep = secondsToHMS(sleepEntry.deep)
	}

	if (activityEntry) {
		ouraRingStats.hasActivityData = true
		ouraRingStats.activityDayStart = iso8601ToTime(activityEntry.day_start)
		ouraRingStats.activityDayEnd = iso8601ToTime(activityEntry.day_end)
		ouraRingStats.activityScore = activityEntry.score
		ouraRingStats.activityLow = secondsToHMS(activityEntry.low)
		ouraRingStats.activityMedium = secondsToHMS(activityEntry.medium)
		ouraRingStats.activityHigh = secondsToHMS(activityEntry.high)
		ouraRingStats.activityRest = secondsToHMS(activityEntry.rest)
		ouraRingStats.activitySteps = activityEntry.steps
	}

	if (readinessEntry) {
		ouraRingStats.hasReadinessData = true
		ouraRingStats.readinessScore = readinessEntry.score
	}

	return ouraRingStats
}

const DEFAULT_SETTINGS: OuraPluginSettings = {
	personalAccessToken: null
}

export default class OuraPlugin extends Plugin {
	settings: OuraPluginSettings;

	getToday() {
		return window.moment().format('YYYY-MM-DD')
	}

	async onload() {
		console.log('Loading Oura Ring plugin');

		await this.loadSettings();

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

				const metricsForDay = window.moment(activeDocument, 'YYYY-MM-DD', true).isValid() ? activeDocument : this.getToday()


				const stats : OuraRingStats = await fetchOuraStats(this.settings.personalAccessToken, metricsForDay)

				let sleepOutput = ''

				if (stats.hasSleepData) {
					sleepOutput += `- Bedtime_Start:: ${stats.bedtimeStart}`
					sleepOutput += '\n'
					sleepOutput += `- Bedtime_End:: ${stats.bedtimeStart}`
					sleepOutput += '\n'
					sleepOutput += `- Sleep_Score:: ${stats.sleepScore}`
					sleepOutput += '\n'
					sleepOutput += `- Sleep_Efficiency:: ${stats.sleepEfficiency}`
					sleepOutput += '\n'
					sleepOutput += `- Sleep_Duration:: ${stats.sleepDuration}`
					sleepOutput += '\n'
					sleepOutput += `- Total_Sleep:: ${stats.sleepTotal}`
					sleepOutput += '\n'
					sleepOutput += `- Total_Awake:: ${stats.sleepAwake}`
					sleepOutput += '\n'
					sleepOutput += `- Sleep_Latency:: ${stats.sleepLatency}`
					sleepOutput += '\n'
					sleepOutput += `- Light_Sleep:: ${stats.sleepLight}`
					sleepOutput += '\n'
					sleepOutput += `- Rem_Sleep:: ${stats.sleepRem}`
					sleepOutput += '\n'
					sleepOutput += `- Deep_Sleep:: ${stats.sleepDeep}`
				}

				if (stats.hasActivityData) {
					if (stats.hasSleepData) {
						sleepOutput += '\n'
					}
					sleepOutput += `- Day_Start:: ${stats.activityDayStart}`
					sleepOutput += '\n'
					sleepOutput += `- Day_End:: ${stats.activityDayEnd}`
					sleepOutput += '\n'
					sleepOutput += `- Activity_Score:: ${stats.activityScore}`
					sleepOutput += '\n'
					sleepOutput += `- Low_Activity:: ${stats.activityLow}`
					sleepOutput += '\n'
					sleepOutput += `- Medium_Activity:: ${stats.activityMedium}`
					sleepOutput += '\n'
					sleepOutput += `- High_Activity:: ${stats.activityHigh}`
					sleepOutput += '\n'
					sleepOutput += `- Rest_Activity:: ${stats.activityRest}`
					sleepOutput += '\n'
					sleepOutput += `- Steps:: ${stats.activitySteps}`
				}

				if (stats.hasReadinessData) {
					if (stats.hasSleepData || stats.hasActivityData) {
						sleepOutput += '\n'
					}
					sleepOutput += `- Readiness_Score:: ${stats.readinessScore}`
				}

				editor.replaceSelection(sleepOutput)

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

class OuraSettingTab extends PluginSettingTab {
	plugin: OuraPlugin;

	constructor(app: App, plugin: OuraPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async display(): Promise<void> {
		let { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Oura Ring Settings'});

		new Setting(containerEl)
			.setName('Personal Access Token')
			.setDesc('Available under https://cloud.ouraring.com/personal-access-tokens')
			.addText(text => text
				.setPlaceholder('Personal Access Token')
				.setValue(this.plugin.settings.personalAccessToken)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.personalAccessToken = value;
					await this.plugin.saveSettings();
				}));
		if (this.plugin.settings.personalAccessToken) {
			const ouraApi = new OuraApi(this.plugin.settings.personalAccessToken)
			const userInfo = await ouraApi.getUserInfo()
			containerEl.createEl('p', {text: `email: ${userInfo.email}`})
		}

	}
}
