# OAuth implementation and verification

## Decisions

Use a user-owned Oura application and authorization-code flow with only the daily scope. Oura documents a client secret requirement, but does not document PKCE. A shared secret must never be shipped in a community plugin. A hosted OAuth service is a separate product/deployment decision.

The default callback is `obsidian://oura-oauth`; a configurable HTTPS callback and manual full-URL entry support environments where custom schemes cannot be registered or dispatched. Acceptance of the custom scheme by Oura is unverified.

Credentials remain in Obsidian plugin storage, which is not encrypted. Documentation and settings disclose this. No credentials or personal information are logged. Disconnect is local; server-side revocation is done in Oura's account UI.

## Regression lessons

| Symptom | Cause | Prevention | Evidence |
| --- | --- | --- | --- |
| Refresh can invalidate another import | Oura refresh tokens are single-use | Share one refresh promise per plugin instance; persist rotated tokens | Concurrent refresh unit test |
| Login reappears after disconnect | An in-flight token exchange finishes later | Invalidate refreshes on disconnect; use a separate cancellation generation for sign-in | Disconnect-during-exchange unit test |
| Import appears empty after authentication fails | API errors were swallowed as null | Propagate failures to a notice; only edit the note after all fetches succeed | Command failure test |
| Tokens can appear in logs | Previous settings logged entered secrets | Remove secret and profile logging; use fixed OAuth errors | Source inspection |

## Automated checks

`npm test` exercises the OAuth implementation with mocked Obsidian HTTP requests: scope and redirect binding, state validation and replay, denial, manual callback validation, token rotation, concurrent refresh, bounded 401 retry, 403 handling, temporary errors, disconnect races, malformed responses, legacy settings migration, and no note mutation on authentication failure. These are protocol tests, not live Oura verification.

`npm run typecheck` checks TypeScript. `npm run build` produces the production plugin bundle. CI runs all three commands.

## Current evidence

All 22 automated tests, TypeScript checking, production build, and `git diff --check` passed after the review fixes. The sandboxed production build generated the bundle but stayed open; rerunning outside the sandbox exited successfully. The earlier Rollup update alone did not eliminate this sandbox-specific behavior. The generated `main.js` is available locally and is ignored by git, as before.

The available Obsidian session was a personal vault without this build installed. No rendered settings, light/dark appearance, mobile keyboard, or live Oura account flow has been verified.

## Next checks before a release

1. Register a test Oura application; verify accepted redirect URI schemes. Exercise browser authorization, denial, manual callback, data import, restart, expired access token refresh, and revocation using a test account.
2. Install the production bundle in an isolated desktop vault. Inspect settings in OS light/dark modes, narrow/wide windows and larger text, including keyboard focus, long credentials, notices, disconnected/connected states and application-link navigation.
3. Repeat browser handoff/manual callback and import on Obsidian mobile, including the software keyboard. Mobile compatibility is intended through Obsidian requestUrl and protocol APIs; it is not device-verified.
4. Keep synced plugin credential files out of multi-device use, or design per-device credential storage before claiming seamless multi-device authentication.

No personal vault has been modified for testing. Release validation status is recorded below.


## Review fixes and follow-ups

- Legacy tokens are preserved on upgrade, used only without OAuth tokens, and removed after a successful OAuth exchange or explicit disconnect. Regression tests cover migration, API precedence, rejected legacy tokens, and the migration notice.
- Starting/cancelling sign-in does not discard single-use refresh rotation results. Separate sign-in cancellation still rejects stale code exchanges. Completing a new sign-in waits for an existing refresh before replacing tokens. Deferred-response tests cover reconnect, cancellation, credential edits, disconnect, and refresh/code exchange ordering.
- Retain AGENTS.md, this quality document, and the CI workflow as intended change-set files; no commit/staging action is implied.
- Removed unused profile and detailed sleep-route methods and their types; the active API methods need only the daily scope.
- Configured redirect validation now uses a shared actionable message. Tests cover malformed/empty URIs, unsupported schemes, and malformed pasted callbacks.
- Standardized on npm: package-lock.json is included, yarn.lock is removed, and both check/release workflows use npm ci with Node 22.
- Refresh failures clear tokens only for explicit invalid_grant responses with HTTP 400/401. Other errors, including non-JSON responses, preserve the saved connection. Tests distinguish invalid_request, invalid_client, missing error codes, rate limits, and server errors.
- Remaining follow-ups: consider saving credential fields on blur and verify a daily-data request after connection. Live callback and rendered UI checks above remain unverified; no real Oura app is available for that check in this task.


## Release version consistency

Symptom: published tags through 0.2.6 contained a 0.2.3 manifest. Cause: release tags were not checked against plugin metadata. Prevention: 0.2.7 updates package.json, package-lock.json, manifest.json, and versions.json together; check and release CI run check:version, with a tag equality check during release. Publication uses the triggering tag and uploads only the production bundle, manifest, and stylesheet, with GitHub build provenance attestations for each. Live provider and device checks remain unverified.
