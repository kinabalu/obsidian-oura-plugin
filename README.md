## Oura Ring Plugin for Obsidian
Add your oura ring stats to an Obsidian note for any dates. The documentation for the Oura Ring
API is available at [API Documentation](https://cloud.ouraring.com/docs).

### Features
- Connect to Oura using OAuth, with automatic access-token refresh
- Insert the data in a page which is formatted YYYY-MM-DD
- Or insert into any page and it will use whatever today's date is

### Connect to Oura

1. Create a personal application in [Oura My Applications](https://cloud.ouraring.com/oauth/applications).
2. Register `obsidian://oura-oauth` as its redirect URI. If Oura's application form requires HTTPS, register an HTTPS URL you control and enter that exact URL in the plugin instead. The destination must preserve the query string so you can copy the callback URL.
3. Open **Settings → Oura Ring** and enter your application's client ID and client secret. These must be your own application's credentials, not a shared secret distributed with the plugin.
4. Select **Connect to Oura**, sign in through your browser, and allow daily data access.
5. Allow the browser to open Obsidian. If it does not return to the correct vault, copy the complete redirected URL into **Complete sign-in manually** and submit within 10 minutes. Keep the plugin loaded during sign-in.

Sleep, readiness, and activity imports request only the `daily` scope. Expiring tokens refresh automatically on import. If authorization expires or is revoked, reconnect in settings. Existing personal access tokens and templates are preserved on upgrade. When no OAuth connection exists, imports continue to use the saved personal token and show a migration notice. A successful OAuth exchange removes the legacy token; disconnect also clears it. Legacy token acceptance remains controlled by Oura.

OAuth credentials and tokens are stored **without encryption** in `.obsidian/plugins/obsidian-oura-plugin/data.json`. Keep this file out of source control and sharing. Avoid syncing it between devices: Oura refresh tokens are single-use and each plugin instance maintains its own connection. Disconnect clears local tokens and cancels pending sign-in; revoke the application's access in your Oura account to remove the server-side grant.

This uses Oura's documented [authorization-code flow](https://cloud.ouraring.com/docs/authentication#oauth2), which requires a client secret. No shared application secret is bundled. A public one-click connection would require a separately operated OAuth backend. The custom-scheme callback's acceptance by Oura and desktop/mobile browser handoff still require live verification; the manual HTTPS callback is available when a custom scheme cannot be registered.

### Development

Use npm and the tracked `package-lock.json` for reproducible installs. Run `npm ci`, `npm test`, `npm run typecheck`, and `npm run build`. The production bundle is `main.js`. See [OAuth verification and next steps](docs/oauth-quality.md) for validation scope and remaining device checks.

### Oura API Variables

#### Sleep

| Name                   | Field                                 |
|------------------------|---------------------------------------|
| Sleep Day              | sleep_day                             |
| Sleep Score            | sleep_score                           |
| Sleep Timestamp        | sleep_timestamp                       |
| Deep Sleep             | sleep_contributors_deep_sleep         |
| Efficiency             | sleep_contributors_efficiency         |
| Latency                | sleep_contributors_latency            |
| REM Sleep              | sleep_contributors_rem_sleep          |
| Restfulness            | sleep_contributors_restfulness        |
| Timing                 | sleep_contributors_timing             |
| Total Sleep            | sleep_contributors_total_sleep        |

#### Readiness

| Name                       | Field                                     |
|----------------------------|-------------------------------------------|
| Readiness Day              | readiness_day                             |
| Readiness Score            | readiness_score                           |
| Temperature Deviation      | readiness_temperature_deviation           |
| Temperature Trend Deviation| readiness_temperature_trend_deviation     |
| Readiness Timestamp        | readiness_timestamp                       |
| Activity Balance           | readiness_contributors_activity_balance   |
| Body Temperature           | readiness_contributors_body_temperature   |
| HRV Balance                | readiness_contributors_hrv_balance        |
| Previous Day Activity      | readiness_contributors_previous_day_activity|
| Previous Night             | readiness_contributors_previous_night     |
| Recovery Index             | readiness_contributors_recovery_index     |
| Resting Heart Rate         | readiness_contributors_resting_heart_rate |
| Sleep Balance              | readiness_contributors_sleep_balance      |

#### Activities

| Name                           | Field                                     |
|--------------------------------|-------------------------------------------|
| Class (5 min)                  | activities_class_5_min                    |
| Score                          | activities_score                          |
| Active Calories                | activities_active_calories                |
| Average MET Minutes            | activities_average_met_minutes            |
| Equivalent Walking Distance    | activities_equivalent_walking_distance    |
| High Activity MET Minutes      | activities_high_activity_met_minutes      |
| High Activity Time             | activities_high_activity_time             |
| Inactivity Alerts              | activities_inactivity_alerts              |
| Low Activity MET Minutes       | activities_low_activity_met_minutes       |
| Low Activity Time              | activities_low_activity_time              |
| Medium Activity MET Minutes    | activities_medium_activity_met_minutes    |
| Medium Activity Time           | activities_medium_activity_time           |
| Meters to Target               | activities_meters_to_target               |
| Non-Wear Time                  | activities_non_wear_time                  |
| Resting Time                   | activities_resting_time                   |
| Sedentary MET Minutes          | activities_sedentary_met_minutes          |
| Sedentary Time                 | activities_sedentary_time                 |
| Steps                          | activities_steps                          |
| Target Calories                | activities_target_calories                |
| Target Meters                  | activities_target_meters                  |
| Total Calories                 | activities_total_calories                 |
| Day                            | activities_day                            |
| Timestamp                      | activities_timestamp                      |
| MET Interval                   | activities_met_interval                   |
| MET Items                      | activities_met_items                      |
| MET Timestamp                  | activities_met_timestamp                  |
| Meet Daily Targets             | activities_contributors_meet_daily_targets|
| Move Every Hour                | activities_contributors_move_every_hour   |
| Recovery Time                  | activities_contributors_recovery_time     |
| Stay Active                    | activities_contributors_stay_active       |
| Training Frequency             | activities_contributors_training_frequency|
| Training Volume                | activities_contributors_training_volume   |

### Installation
The Oura Plugin for Obsidian release is pending review.

### Manual Installation
Two methods and the first one is easier:

#### Method 1
- Enable community plugins and install Obsidian42 - BRAT
- Go to settings and under Beta Plugin List click "Add Beta plugin" and type kinabalu/obsidian-oura-plugin

#### Method 2
- Create an `obsidian-oura-plugin` folder under `.obsidian/plugins` in your vault. Add the
  `main.js`, `manifest.json`, and the `styles.css` files from the
  [latest release](https://github.com/kinabalu/obsidian-oura-plugin/releases) to the folder.

### Usage

Open the command palette (⌃+P or ⌘+P) and type `Oura Ring`. Execute the 
`Oura Ring: Insert daily stats` action and your data will be written to your 
current cursor location.

## Say Thanks 🙏

If you like this plugin and would like to buy me a coffee, you can!

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="BuyMeACoffee" width="100">](https://www.buymeacoffee.com/andrewlombardi)
