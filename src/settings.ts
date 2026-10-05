import {App, Notice, PluginSettingTab, Setting} from 'obsidian';
import OuraPlugin from './main';
import {autoResizeTextArea} from './utils';

export class OuraSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: OuraPlugin) {
    super(app, plugin);
  }

  display(): void {
    const {containerEl} = this;
    containerEl.empty();
    new Setting(containerEl).setName('Connection').setHeading();
    containerEl.createEl('p', {text: 'Create your own Oura application and enter its credentials below. Register the exact redirect URI shown here.'});
    containerEl.createEl('a', {text: 'Manage Oura applications', href: 'https://cloud.ouraring.com/oauth/applications'});
    containerEl.createEl('p', {text: 'Credentials and tokens are stored in this vault’s plugin data.json without encryption. Keep that file private and avoid syncing it between devices; refresh tokens are single-use.'});

    const connected = !!this.plugin.settings.oauthTokens;
    for (const [key, label] of [
      ['clientId', 'Client ID'], ['clientSecret', 'Client secret'], ['redirectUri', 'Redirect URI'],
    ] as const) {
      new Setting(containerEl).setName(label)
        .setDesc(key === 'redirectUri' ? 'If Oura requires HTTPS, use a URL you control and paste the resulting callback URL below.' : '')
        .addText(text => {
          text.inputEl.setAttribute("aria-label", label);
          text.setValue(this.plugin.settings[key]).setDisabled(connected);
          if (key === 'clientSecret') text.inputEl.type = 'password';
          text.onChange(async value => {
            this.plugin.oauth.cancel();
            this.plugin.settings[key] = value.trim();
            await this.plugin.saveSettings();
          });
        });
    }

    new Setting(containerEl)
      .setName(connected ? 'Connected to Oura' : this.plugin.settings.personalAccessToken ? 'Using a legacy personal access token' : 'Oura is not connected')
      .setDesc(connected ? 'Access tokens refresh automatically when you import data.' : 'Please migrate to OAuth. Any saved personal token remains available until OAuth connects or you disconnect.')
      .addButton(button => button.setButtonText(connected ? 'Reconnect to Oura' : 'Connect to Oura').setCta()
        .onClick(() => {
          try { window.open(this.plugin.oauth.authorize()); }
          catch (error) { this.showError(error); }
        }));

    let callbackUrl = '';
    new Setting(containerEl).setName('Complete sign-in manually')
      .setDesc('If the browser does not return to this vault, paste the complete redirect URL here within 10 minutes of connecting.')
      .addText(text => {
        text.inputEl.type = 'password';
        text.inputEl.setAttribute('aria-label', 'Complete callback URL');
        text.setPlaceholder('Complete callback URL').onChange(value => { callbackUrl = value; });
      })
      .addButton(button => button.setButtonText('Complete sign-in').onClick(async () => {
        button.setDisabled(true);
        try {
          await this.plugin.oauth.completeUrl(callbackUrl);
          new Notice('Connected to Oura');
          this.display();
        } catch (error) { this.showError(error); }
        finally { button.setDisabled(false); }
      }));

    new Setting(containerEl).setName('Disconnect')
      .setDesc('Clears saved tokens and cancels pending sign-in. To revoke access, remove this application in your Oura account.')
      .addButton(button => button.setButtonText('Disconnect').onClick(async () => {
        try { await this.plugin.oauth.disconnect(); this.display(); }
        catch (error) { this.showError(error); }
      }));

    new Setting(containerEl).setName('Templates').setHeading();
    for (const [key, label] of [
      ['sleepTemplate', 'Sleep Template'], ['activitiesTemplate', 'Activities Template'], ['readinessTemplate', 'Readiness Template'],
    ] as const) {
      new Setting(containerEl).setName(label).addTextArea(text => {
        text.inputEl.setAttribute("aria-label", label);
        text.setValue(this.plugin.settings[key]).onChange(async value => {
          this.plugin.settings[key] = value;
          await this.plugin.saveSettings();
        });
        text.inputEl.classList.add('autoresize');
        autoResizeTextArea(text.inputEl);
        text.inputEl.addEventListener('input', () => autoResizeTextArea(text.inputEl));
        containerEl.appendChild(text.inputEl);
      });
    }
  }

  private showError(error: unknown): void {
    new Notice(error instanceof Error ? error.message : 'Oura sign-in failed. Please try again.');
  }
}
