## Oura Ring Plugin for Obsidian
Add your oura ring stats to an Obsidian note for any dates. The documentation for the Oura Ring
API is available at [API Documentation](https://cloud.ouraring.com/docs).

### Features
- Fetch your Oura Ring data using your personal access token
  - To create a personal access token visit and login to https://cloud.ouraring.com/personal-access-tokens 
and copy the token into the settings for this plugin 
- Insert the data in a page which is formatted YYYY-MM-DD
- Or insert into any page and it will use whatever today's date is

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
`Oura Ring: Insert Oura Ring Stats` action and your data will be written to your 
current cursor location.

## Say Thanks 🙏

If you like this plugin and would like to buy me a coffee, you can!

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="BuyMeACoffee" width="100">](https://www.buymeacoffee.com/andrewlombardi)
