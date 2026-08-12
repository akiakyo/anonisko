# AnonIsko

AnonIsko is a text-only anonymous conversation platform designed for PUP students.

## Features

- Anonymous nickname
- Male / Female selection
- Campus selection
- Match preference: Anyone / Male / Female
- Random one-on-one matching
- Real-time text chat using Socket.IO
- Next, End Chat, Report, and Block
- Online user count
- Basic spam and rate-limit protection
- No profile photos
- No emojis in the interface
- Responsive PUP-inspired design
- Favicon included

## Requirements

- Node.js 20+
- MySQL 8+ or MariaDB 10.5+

## Setup

1. Create a database named `anonisko`.
2. Import `schema.sql`.
3. Copy `.env.example` to `.env`.
4. Update your MySQL credentials.
5. Install dependencies:

```bash
npm install
```

6. Start the project:

```bash
npm start
```

7. Open:

```text
http://localhost:3000
```

## Production notes

Use HTTPS in production and place the app behind a reverse proxy such as Nginx or Cloudflare. Replace `SESSION_SALT` with a long random value. Review your privacy policy, retention rules, and moderation process before public deployment.

AnonIsko is an independent student project and is not officially affiliated with the Polytechnic University of the Philippines.


## V2 interface

- New animated Home page
- About page
- Terms page
- Light and dark mode
- Animated logo intro
- Chat sound effects generated in-browser
- Animated conversation-ended screen for both users
- `/chat` contains the anonymous matchmaking interface

### New Romantics font

The project includes a CSS hook for `New Romantics`, but the font file itself is not bundled.
If you have the appropriate permission/license for web use, convert your copy to WOFF2 and place it at:

`public/assets/fonts/new-romantics.woff2`

Then uncomment the matching `@font-face` block in `public/styles.css`.

The existing `schema.sql` was not changed.


## V2.1 routing fix

If upgrading by copying files over an older AnonIsko folder, delete the old:

`public/index.html`

V2.1 also disables Express automatic index serving, so `/` always opens `home.html` and `/chat` always opens `chat.html`.

`schema.sql` remains unchanged.


## V2.2 Home modal update

- Home `Main chat` card now opens matchmaking in a modal instead of navigating away.
- Removed feature numbers from the Home page.
- Updated the student coverage copy to include students from other schools across the Philippines.
- Added `Other school in the Philippines` to the existing campus selector without changing the database schema.
- `schema.sql` remains byte-for-byte unchanged.


## V2.3 conversation redesign

- Active conversation redesigned using the AnimoChat reference as layout inspiration while keeping AnonIsko's maroon visual identity.
- Removed the large conversation action sidebar.
- Added compact partner header, conversation info strip, large message area, bottom composer, and compact End / Report / Block controls.
- Added live timestamp in the requested `MM/HH/DD` format.
- Added session-only voice messages using `MediaRecorder` and Socket.IO.
- Voice messages are limited to 120 seconds and are not persisted to MySQL.
- No friend system, calls, or conversation color changer were added.
- `schema.sql` remains byte-for-byte unchanged.

### Voice message note

Microphone recording requires browser permission. On deployed sites, microphone access normally requires HTTPS (localhost is allowed by modern browsers).


## V2.4 conversation flow

- The Home page modal is now used only for anonymous profile creation and initial matchmaking.
- After a match is found, users see a Connected animation and are moved to `/conversation`.
- Added an 8-second reconnect grace period so changing pages does not immediately end the active match.
- Added gender-aware finding animation:
  - Female profile: `Finding an Isko...`
  - Male profile: `Finding an Iska...`
- When either person ends the chat, both receive an animated Next Conversation popup.
- Clicking Next Conversation starts matchmaking again from the conversation page.
- Fixed voice Data URL validation so browser MIME values such as `audio/webm;codecs=opus` are accepted.
- Increased Socket.IO message capacity for short voice messages.
- Added dedicated mobile controls that differ from desktop controls.
- `schema.sql` remains byte-for-byte unchanged.


## V2.5 fixes

- Replaced the old `MM/HH/DD` display with a Discord-inspired live conversation duration (`HH:MM:SS`).
- The duration uses AnonIsko's maroon theme and a green connected accent.
- Mobile gets a compact themed duration pill.
- Fixed voice transport to send binary audio through Socket.IO instead of a Data URL, then reconstruct it as a Blob/Object URL for playback.
- Fixed end-chat ownership: the server now tells each client whether that client ended the chat. The other participant reliably receives `The other person ended the chat.` on desktop and mobile.
- `schema.sql` remains byte-for-byte unchanged.


## v2.6 ui, flow, and security update

- home `AnonIsko` intro now uses an animated maroon gradient.
- profile creation stays in a glass modal.
- finding an isko / iska is now a dedicated `/finding` page.
- ended conversations stay inside `/conversation`.
- end chat now uses a custom yes/no confirmation modal.
- block now uses a custom themed modal instead of `window.confirm()`.
- added stronger helmet headers, same-origin socket checks, lower request limits, and extra socket action rate limits.
- added casual inspect deterrents for right-click, f12, ctrl+shift+i/j/c, and ctrl+u.
- browser source cannot be made truly invisible; anything delivered to a browser can ultimately be inspected.
- `schema.sql` remains unchanged.


## v2.7 intro and voice compatibility update

- added ctrl + shift + . to the casual inspect deterrents.
- home intro now replays on normal loads, reloads, and browser back navigation.
- added a dedicated finding-page intro.
- added a glass modal entrance animation.
- cancel search now plays an exit transition before returning home.
- expanded voice-message support for chrome, edge, firefox, safari, ios, and android mediarecorder formats.
- added legacy getusermedia fallback and clearer microphone permission errors.
- mobile microphone access still requires https (or localhost) because browsers enforce secure-context rules.
- `schema.sql` remains unchanged.


## v2.8 devtools cleanup

- removed all right-click, f12, ctrl+shift+i/j/c/., and ctrl+u blocking.
- browser developer tools work normally again.
- minified public javascript and css to reduce readable client-side source.
- removed unnecessary frontend comments and whitespace.
- kept server-side logic readable and separate from public assets.
- sensitive logic and database credentials remain server-side.
- browser-delivered code can still be inspected by design; minification only reduces readability.
- `schema.sql` remains unchanged.


## v2.9 match lifecycle fix

- fixed false `the other person ended the chat` events.
- the server now explicitly tells each client whether that client ended the conversation.
- moved the ended state inside the conversation panel.
- removed a stale conversation-page listener that could stop later socket handlers from loading.
- fixed rematching after a conversation ends.
- `/finding` now avoids duplicate matchmaking requests during reconnects.
- cancel search exits the queue cleanly before returning home.
- `schema.sql` remains unchanged.


## v2.10 voice playback lifecycle fix

- fixed a bug where playing a voice message could cause a temporary socket disconnect to be interpreted as the partner ending the chat.
- increased disconnect grace period from 8 seconds to 20 seconds.
- voice playback no longer triggers any local conversation-ended state.
- the server now leaves the match untouched if a peer socket is temporarily unavailable.
- added safer audio object-url handling and playback event isolation.
- connect errors now allow socket.io to reconnect instead of redirecting the user away.
- voice messages remain session-only and `schema.sql` remains unchanged.


## v2.11 socket delivery fix

- moved text, typing, voice, and end-chat delivery to stable per-session socket.io rooms.
- reconnecting sockets no longer leave the server pointing at an outdated peer socket id.
- fixed cases where messages appeared only on one side after a reconnect.
- fixed end chat becoming unresponsive after the same stale-socket condition.
- the `Say hi!` placeholder now disappears once a real text or voice message is sent or received.
- end confirmation is protected against double-submit clicks.
- `schema.sql` remains unchanged.


## v2.12 composer placeholder fix

- removed the `Say hi!` placeholder immediately after a match is connected.
- this applies to desktop and mobile because both use the same conversation input.
- `schema.sql` remains unchanged.


## v2.13 composer placeholder hard fix

- removed the `Say hi!` placeholder directly from `conversation.html`.
- removed javascript placeholder-reset logic.
- reduced static cache time during development so mobile browsers pick up frontend changes faster.
- `schema.sql` remains unchanged.


## v2.14 manual conversation ending

- removed automatic conversation ending caused by disconnects, inactivity, phone sleep, tab changes, or temporary network loss.
- active matches remain active in server memory until a user explicitly ends the chat or blocks the other user.
- reconnecting with the same anonymous session resumes the existing match.
- server restarts still clear in-memory active matches.
- `schema.sql` remains unchanged.


## v2.15 consent, intro, typography, and flat layout

- intro now shows only the animated anonisko logo.
- replaced the home `Text only` feature with `Private conversations` to reflect voice messages.
- added first-time terms agreement flow at `/consent`.
- new users must agree before entering the main site.
- added a licensed-font hook for Verandah Reverie on the About and Terms hero headings.
- no font file is bundled; place a licensed `verandah-reverie.woff2` in `public/assets/fonts/`.
- simplified card-heavy sections into a flat, box-free layout.
- updated the footer copy across public pages.
- `schema.sql` remains unchanged.


## v2.16 responsive consent ui

- rebuilt the first-time terms agreement page with a mobile-first layout.
- reduced the oversized logo and added a subtle logo animation.
- improved typography, spacing, checkbox styling, and button hierarchy.
- mobile now uses one-column full-width actions.
- desktop uses a balanced two-column onboarding layout.
- added safe-area support for phones.
- `schema.sql` remains unchanged.


## v2.17 development cache fix

- disabled browser/static caching for local development.
- disabled express etags for public assets.
- added `?v=217` cache-busting to css and javascript references.
- added the `X-AnonIsko-Build: 2.17` response header for debugging.
- fixes stale rendering in vscode embedded/simple browser previews.
- `schema.sql` remains unchanged.


## v3 conversation and product ui

- added up to three conversation interests.
- added conversation vibe.
- matchmaking now prioritizes shared interests and matching vibes while still respecting gender preferences and blocks.
- added server-generated icebreakers.
- upgraded typing indicator with animated dots.
- added reply-to-message for live text messages.
- added partner reconnecting / reconnected status without automatically ending the conversation.
- redesigned home and conversation ui with flatter hierarchy, smaller radii, fewer card patterns, and a conversation-line visual language.
- desktop and mobile keep different conversation action layouts.
- these additions are session-based and `schema.sql` remains unchanged.


## v3.0.1 reconnecting status removal

- removed the visible partner reconnecting/reconnected status system.
- disconnects still do not automatically end an active conversation.
- conversations remain manual-end only.
- `schema.sql` remains unchanged.


## v3.1 ui/ux polish

- kept the end button permanently visible in the conversation header.
- moved report and block into a three-dot safety menu.
- added mobile bottom-sheet menus for safety actions and long-press message replies.
- added message entrance animations, date separators, hover/tap timestamps, reply actions, and sending/sent/delivered states.
- added smart auto-scroll with a new-message indicator when reading older messages.
- added voice playback progress and an animated live recording waveform.
- added changing matchmaking copy, a line-based search motif, and a richer match reveal.
- added an empty-conversation icebreaker state.
- added offline status without ending the chat.
- added tab unread counts and an unread favicon indicator.
- added focus-visible accessibility, escape-key cancellation, auto-growing composer, and a near-limit character counter.
- added subtle chat entrance, skeleton loading, haptic feedback where supported, and reduced-motion support.
- `schema.sql` remains unchanged.
