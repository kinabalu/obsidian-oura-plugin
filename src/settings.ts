import {App, Notice, PluginSettingTab, Setting} from "obsidian";
import OuraApi from "./oura-api";
import OuraPlugin from "./main";
import {autoResizeTextArea} from "./utils";

export class OuraSettingTab extends PluginSettingTab {
  plugin: OuraPlugin;

  constructor(app: App, plugin: OuraPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  async display(): Promise<void> {
    let {containerEl} = this;

    containerEl.empty();

    containerEl.createEl('h2', {text: 'Oura Ring Settings'});

    if (!this.plugin.settings.personalAccessToken) {
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
      new Setting(containerEl)
        .addButton(button => button
          .setButtonText("Login with token")
          .onClick(async (evt) => {
            const ouraApi = new OuraApi(this.plugin.settings.personalAccessToken)
            const userInfo = await ouraApi.getUserInfo()

            if (userInfo) {
              new Notice("Login to cloud.ouraring.com was successful")
              await this.plugin.saveSettings()
              await this.display()
            } else {
              new Notice("Login to cloud.ouraring.com was unsuccessful")
            }
          })
        )
    }
    if (this.plugin.settings.personalAccessToken) {
      const ouraApi = new OuraApi(this.plugin.settings.personalAccessToken)
      const userInfo = await ouraApi.getUserInfo()

      if (userInfo === null) {
        new Notice("Personal token is invalid")
        this.plugin.settings.personalAccessToken = null;
        await this.display()
      }
      new Setting(containerEl)
        .setName("Email")
        .addText(text => text
          .setPlaceholder(userInfo.email)
          .setDisabled(true)
        )
      new Setting(containerEl)
        .addButton(button => button
          .setButtonText("Logout")
          .onClick(async (evt) => {
            new Notice("Logged out of cloud.ouraring.com")
            this.plugin.settings.personalAccessToken = null
            await this.plugin.saveSettings()
            await this.display()
          })
        )
      new Setting(containerEl)
        .setName("Sleep Template")
        .setDesc('Template for the sleep data.')
          .addTextArea((text) => {
            text
                .setValue(this.plugin.settings.sleepTemplate)
                .onChange(async (value: string) => {
                    this.plugin.settings.sleepTemplate = value
                    await this.plugin.saveSettings()
                });
            // Add autoresize to the textarea
            text.inputEl.classList.add('autoresize');
            autoResizeTextArea(text.inputEl);
            text.inputEl.addEventListener('input', () => autoResizeTextArea(text.inputEl));
            containerEl.appendChild(text.inputEl);
        })

      new Setting(containerEl)
        .setName("Activities Template")
        .setDesc('Template for the activities data.')
        .addTextArea((text) => {
            text
                .setValue(this.plugin.settings.activitiesTemplate)
                .onChange(async (value: string) => {
                    this.plugin.settings.activitiesTemplate = value
                    await this.plugin.saveSettings()
                });
            // Add autoresize to the textarea
            text.inputEl.classList.add('autoresize');
            autoResizeTextArea(text.inputEl);
            text.inputEl.addEventListener('input', () => autoResizeTextArea(text.inputEl));
            containerEl.appendChild(text.inputEl);
        })

      new Setting(containerEl)
        .setName("Readiness Template")
        .setDesc('Template for the readiness data.')
        .addTextArea((text) => {
            text
              .setValue(this.plugin.settings.readinessTemplate)
              .onChange(async (value: string) => {
                this.plugin.settings.readinessTemplate = value
                await this.plugin.saveSettings()
              });
            // Add autoresize to the textarea
            text.inputEl.classList.add('autoresize');
            autoResizeTextArea(text.inputEl);
            text.inputEl.addEventListener('input', () => autoResizeTextArea(text.inputEl));
            containerEl.appendChild(text.inputEl);
        })
    }

  }
}


/*


    new Setting(containerEl)
      .setName('Frontmatter Template')
      .setDesc(
        'Frontmatter / properties template for notes. recording_id and the three dashes before and after properties automatically added'
      )
      .addTextArea((text) => {
        text
          .setPlaceholder(this.plugin.settings.frontmatterTemplate)
          .setValue(this.plugin.settings.frontmatterTemplate)
          .onChange(async (value) => {
            this.plugin.settings.frontmatterTemplate = value;
            await this.plugin.saveSettings();
          });
        // Add autoresize to the textarea
        text.inputEl.classList.add('autoresize');
        autoResizeTextArea(text.inputEl);
        text.inputEl.addEventListener('input', () => autoResizeTextArea(text.inputEl));
        containerEl.appendChild(text.inputEl);
      })

 */