import {App, Editor, Plugin, PluginSettingTab, Setting, MarkdownView} from 'obsidian';
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

const DEFAULT_SETTINGS: OuraPluginSettings = {
	personalAccessToken: null
}

export default class OuraPlugin extends Plugin {
	settings: OuraPluginSettings;

	getToday() {
		return window.moment().format('YYYY-MM-DD')
	}

	iso8601ToTime(theString: string): string {
		return window.moment(theString).format('HH:mm:ss')
	}

	minutesToHMS(minutes: number): string {
		const hours = Math.floor(minutes / 60)
		const minutesRemainder = minutes % 60

		return `${numeral(hours).format('00')}:${numeral(minutesRemainder).format('00')}:00`
	}

	secondsToHMS(seconds: number): string {
		const hours = Math.floor(seconds / 60 / 60)
		const minutes = Math.floor(seconds / 60) % 60
		const secondsRemainder = (seconds % 60)
		return `${numeral(hours).format('00')}:${numeral(minutes).format('00')}:${numeral(secondsRemainder).format('00')}`
	}

	async onload() {
		console.log('loading plugin');

		await this.loadSettings();

		this.addStatusBarItem().setText('Oura Ring');

		this.addCommand({
			id: 'insert-oura-ring-stats',
			name: 'Insert Oura Ring Stats',
			editorCallback: async (editor: Editor) => {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

				const activeDocument = activeView.file.basename

				const metricsForDay = window.moment(activeDocument, 'YYYY-MM-DD', true).isValid() ? activeDocument : this.getToday()

				console.log(`Grabbing Oura sleep / activity metrics for ${metricsForDay}`)

				const ouraApi = new OuraApi(this.settings.personalAccessToken)
				const sleepData = await ouraApi.getSleepData(metricsForDay)
				const activityData = await ouraApi.getActivityData(metricsForDay)
				const readinessData = await ouraApi.getReadinessData(metricsForDay)

				const sleepEntry = sleepData.sleep[0]
				const activityEntry = activityData.activity[0]
				const readinessEntry = readinessData.readiness[0]

				let sleepOutput = ''

				if (sleepEntry) {
					sleepOutput += `- Bedtime Start: ${this.iso8601ToTime(sleepEntry.bedtime_start)}`
					sleepOutput += '\n'
					sleepOutput += `- Bedtime End: ${this.iso8601ToTime(sleepEntry.bedtime_end)}`
					sleepOutput += '\n'
					sleepOutput += `- Sleep Score: ${sleepEntry.score}`
					sleepOutput += '\n'
					sleepOutput += `- Sleep Efficiency: ${sleepEntry.efficiency}`
					sleepOutput += '\n'
					sleepOutput += `- Sleep Duration: ${this.secondsToHMS(sleepEntry.duration)}`
					sleepOutput += '\n'
					sleepOutput += `- Total Sleep: ${this.secondsToHMS(sleepEntry.total)}`
					sleepOutput += '\n'
					sleepOutput += `- Total Awake: ${this.secondsToHMS(sleepEntry.awake)}`
					sleepOutput += '\n'
					sleepOutput += `- Sleep Latency: ${this.secondsToHMS(sleepEntry.onset_latency)}`
					sleepOutput += '\n'
					sleepOutput += `- Light Sleep: ${this.secondsToHMS(sleepEntry.light)}`
					sleepOutput += '\n'
					sleepOutput += `- Rem Sleep: ${this.secondsToHMS(sleepEntry.rem)}`
					sleepOutput += '\n'
					sleepOutput += `- Deep Sleep: ${this.secondsToHMS(sleepEntry.deep)}`
				}

				if (activityEntry) {
					if (sleepEntry) {
						sleepOutput += '\n'
					}
					sleepOutput += `- Day Start: ${this.iso8601ToTime(activityEntry.day_start)}`
					sleepOutput += '\n'
					sleepOutput += `- Day End: ${this.iso8601ToTime(activityEntry.day_end)}`
					sleepOutput += '\n'
					sleepOutput += `- Activity Score: ${activityEntry.score}`
					sleepOutput += '\n'
					sleepOutput += `- Low Activity: ${this.minutesToHMS(activityEntry.low)}`
					sleepOutput += '\n'
					sleepOutput += `- Medium Activity: ${this.minutesToHMS(activityEntry.medium)}`
					sleepOutput += '\n'
					sleepOutput += `- High Activity: ${this.minutesToHMS(activityEntry.high)}`
					sleepOutput += '\n'
					sleepOutput += `- Rest Activity: ${this.minutesToHMS(activityEntry.rest)}`
					sleepOutput += '\n'
					sleepOutput += `- Steps: ${activityEntry.steps}`
				}

				if (readinessEntry) {
					if (sleepEntry || activityEntry) {
						sleepOutput += '\n'
					}
					sleepOutput += `- Readiness Score: ${readinessEntry.score}`
				}

				editor.replaceSelection(sleepOutput)

			}
		});

		this.addSettingTab(new OuraSettingTab(this.app, this));
	}

	onunload() {
		console.log('unloading plugin');
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
