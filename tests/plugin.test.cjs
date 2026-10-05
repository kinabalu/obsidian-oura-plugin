const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function pluginFixture(saved) {
  const notices = [];
  class Plugin {
    app = {workspace: {getActiveViewOfType: () => ({file: {basename: '2026-09-17'}})}};
    async loadData() { return saved; }
    async saveData(data) { this.saved = data; }
    addCommand(command) { this.command = command; }
    addSettingTab() {}
    registerObsidianProtocolHandler() {}
  }
  const module = {exports: {}};
  const source = ts.transpileModule(fs.readFileSync('src/main.ts', 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020},
  }).outputText;
  vm.runInNewContext(source, {module, exports: module.exports, Error, console: {log() {}}, require: name => {
    if (name === 'obsidian') return {Plugin, Notice: class {constructor(message) { notices.push(message); }}, moment: () => ({isValid: () => true})};
    if (name === './settings') return {OuraSettingTab: class {}};
    if (name === './oura-api') return {default: class {async getSleepData() {throw new Error('Reconnect to Oura');}}};
    if (name === './oauth') return {OuraOAuth: class {}, DEFAULT_REDIRECT_URI: 'obsidian://oura-oauth'};
    return {};
  }});
  return {plugin: new module.exports.default(), notices};
}

test('upgrade preserves personal token and templates without rewriting settings', async () => {
  const {plugin} = pluginFixture({personalAccessToken: 'deprecated', sleepTemplate: 'custom sleep', readinessTemplate: 'custom readiness'});
  await plugin.loadSettings();
  assert.equal(plugin.settings.sleepTemplate, 'custom sleep');
  assert.equal(plugin.settings.readinessTemplate, 'custom readiness');
  assert.equal(plugin.settings.oauthTokens, null);
  assert.equal(plugin.settings.personalAccessToken, 'deprecated');
  assert.equal(plugin.saved, undefined);
});

test('an authentication failure does not mutate the note', async () => {
  const {plugin, notices} = pluginFixture({oauthTokens: {accessToken: 'test'}});
  await plugin.initialize();
  let mutations = 0;
  await plugin.command.editorCallback({replaceSelection() { mutations++; }});
  assert.equal(mutations, 0);
  assert.deepEqual(notices, ['Reconnect to Oura']);
});


test('legacy users see migration notice and imports are allowed to reach the API', async () => {
  const {plugin, notices} = pluginFixture({personalAccessToken: 'legacy'});
  await plugin.initialize();
  await plugin.command.editorCallback({replaceSelection() { assert.fail('must not mutate on API failure'); }});
  assert.match(notices[0], /Please migrate to OAuth/);
  assert.equal(notices[1], 'Reconnect to Oura');
});
