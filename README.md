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


## v3.2 reactions and desktop conversation polish

- added live Messenger-style reactions to text and voice messages.
- reactions are anonymous, session-only, and synchronized to both participants.
- users can toggle Like, Heart, Laugh, Wow, or Sad reactions.
- desktop shows reaction/reply controls on message hover.
- mobile exposes React and Reply through the existing long-press action sheet.
- fixed the desktop composer so Send stays compact instead of stretching across the row.
- highlighted the always-visible End button with a lighter rose destructive palette that stays inside the AnonIsko theme.
- `schema.sql` remains unchanged.


## v3.3 emoji and reactions system

- replaced the old icon-based reactions with Messenger-style emoji reactions.
- reaction bar now includes Heart, Laugh, Wow, Sad, Cry, Angry, and Like.
- reactions remain synchronized live between both anonymous users.
- added a full emoji picker beside the desktop composer.
- emoji picker includes categories, search, frequently used emojis, smileys, animals, food, activities, travel, objects, and symbols.
- selected emojis are inserted at the current message cursor position.
- mobile emoji picker uses a bottom-sheet layout.
- reactions and emoji picker are frontend/session features; `schema.sql` remains unchanged.


## v3.3.1 mobile conversation ui fix

- fixed the mobile composer so emoji, message input, and Send stay on one row.
- kept Voice as a compact mobile action below the composer.
- removed desktop hover reaction/reply controls from phone layouts.
- fixed the stray `laugh` text caused by an old reaction identifier.
- mobile reactions remain available through long press and the action sheet.
- `schema.sql` remains unchanged.


## v3.3.4 navigation and matching polish

- highlighted Main chat on Home so users can find the primary action faster.
- added the AnonIsko favicon/logo inside the anonymous profile modal.
- hid modal scrollbars and made the close button sticky.
- removed visible online/searching counters for now.
- vibes no longer affect matchmaking score; any vibe can match with any other vibe.
- shared interests can still be used as a soft preference.
- `schema.sql` remains unchanged.


## v3.3.5 modal close and online cleanup

- fixed the profile modal X button by positioning it absolutely inside the modal instead of using sticky positioning.
- removed the remaining online counter from the anonymous profile popup.
- kept the modal scrollbar hidden and preserved mobile responsiveness.
- `schema.sql` remains unchanged.


## v3.3.6 sticky profile modal header

- removed the remaining green online indicator from the profile modal.
- made the AnonIsko modal logo and X button stay together in a sticky header while scrolling.
- kept the modal scrollbar visually hidden.
- `schema.sql` remains unchanged.


## v3.3.7 performance and modal ui cleanup

- removed the sticky profile modal header because it was causing layout bugs.
- simplified the modal into a normal top row with logo and close button.
- reduced heavy blur/backdrop-filter effects that can cause lag on phones.
- removed broad transitions and reduced animation durations.
- reduced frequent box shadows and layout-shifting hover transforms.
- simplified the mobile modal spacing and controls.
- `schema.sql` remains unchanged.


## v3.3.8 mobile chat and activities

- rebuilt the mobile conversation layout around the viewport so the header, messages, composer, and Voice action fit cleanly on phones.
- partner gender and campus now wrap instead of being truncated.
- replaced the full-width Icebreaker bar with a compact Activities button beside Main chat.
- Activities opens Icebreaker, Would You Rather, This or That, and Quick Question options.
- activity prompts are synchronized to both users and remain session-only.
- `schema.sql` remains unchanged.


## v3.3.9 mobile composer cleanup

- moved a Voice shortcut beside the Activities/game control in the Main chat row.
- removed the redundant bottom Voice dock on phones.
- fixed the mobile message input width and the empty strip beside the textarea.
- hid the visual chat/message-input scrollbars while keeping scrolling functional.
- tightened the mobile partner header and composer sizing.
- `schema.sql` remains unchanged.


## v3.3.10 mobile header and composer controls

- fixed the partner header collapsing gender/campus into vertical letters.
- removed the Voice shortcut from the Main chat row.
- moved Activities beside Emoji and Voice in the composer.
- mobile composer now uses Emoji + Voice + Activities + input + Send on one row.
- simplified the Main chat strip again.
- `schema.sql` remains unchanged.


## v3.3.13 stable conversation header repair

- rebuilt from the last stable mobile layout instead of layering fixes onto the broken partner-header build.
- uses a fixed three-column structure: avatar, always-visible partner information, End/more controls.
- always shows `Chatting with`, nickname, gender, and campus.
- explicitly prevents vertical text/writing-mode collapse.
- restored and protected the mobile message viewport so sending a message cannot collapse/disappear the chat area.
- removed the remaining top online counter.
- `schema.sql` remains unchanged.


## v3.3.14 mobile composer, reply, and reactions repair

- switched the phone conversation body to a flex layout so the composer remains visible and stable.
- fixed the mobile message input surface, focus state, and Send alignment.
- removed the redundant phone Voice dock; Emoji, Voice, Activities, input, and Send stay in one bottom bar.
- phone users can tap or long-press a message to open message actions.
- the message action sheet now shows the full reaction strip directly plus Reply.
- reply preview is anchored above the composer and no longer overlaps/disappears into the chat viewport.
- `schema.sql` remains unchanged.


## v3.3.15 rate limit + automatic leave ending

- moved the HTTP rate limiter from the entire website to `/api` only.
- increased API allowance to 300 requests per minute.
- normal HTML, CSS, JavaScript, images, and page refreshes no longer consume the API rate limit.
- added a lightweight leave beacon endpoint.
- leaving the conversation page, returning Home, closing the tab, or closing the browser ends the active conversation.
- the other participant receives the normal partner-ended state.
- explicit End still works and duplicate end requests are suppressed.
- `schema.sql` remains unchanged.


## v3.3.16 mobile composer visibility

- increased bottom composer height and spacing on phones.
- added mobile safe-area padding for browser bars and phone gesture areas.
- raised emoji, voice, activities, message input, and Send controls so they are not clipped.
- added a little separation between the conversation timer and composer.
- kept the message viewport scrollable without exposing a scrollbar.
- `schema.sql` remains unchanged.


## v3.3.17 composer cleanup

- removed the separator line above the mobile composer.
- message input starts with `Say hi!`.
- `Say hi!` disappears after the first chat message in the conversation.
- a new conversation resets the placeholder back to `Say hi!`.
- `schema.sql` remains unchanged.


## v3.3.18 theme toggle polish

- light mode now shows a Sun icon.
- dark mode now shows a Moon icon.
- improved theme switching animation with smoother color, border, and background transitions.
- added a short icon swap animation.
- respects reduced-motion accessibility settings.
- `schema.sql` remains unchanged.


## v3.3.19 global dark-mode readability

- rebuilt the dark-mode text palette across all pages and UI components.
- fixed unreadable text in confirmation dialogs, modals, action sheets, forms, Home, About, Terms, footer, chat, activities, reactions, and conversation-ended states.
- improved placeholder, muted, label, and secondary-text contrast.
- preserved maroon brand accents while increasing dark-mode accessibility.
- `schema.sql` remains unchanged.


## v3.6.0 conversation feedback + timed notices

Added only:
- Conversation Feedback: Good / Okay / Bad after ending a chat.
- Safety Reminder: subtle privacy reminder at about 12 minutes.
- Conversation Streak: 10, 30, and 60-minute milestones.

The safety reminder is inline, not a modal.
`schema.sql` remains unchanged.


## v3.6.1 About Me + Vibe Indicator

Added only:
- Anonymous About Me: optional up to 120 characters.
- Conversation Vibe Indicator: subtle badge in the chat header with icons for Gaming, Casual, Study, and Late Night.

`schema.sql` remains unchanged.


## v3.6.6 Home opacity / intro-state fix

- fixed the Home page becoming permanently faded at 40% opacity.
- removed `home-entering` from the initial HTML state.
- the intro animation no longer dims or scales the entire `.site-shell`.
- added cleanup for refresh, pageshow/pagehide, and browser back-forward cache.
- added a 1.9 second fail-safe so stale intro state can never leave the page faded.
- `schema.sql` remains unchanged.


## v3.6.7 In-chat branding

- Added a subtle `AnonIsko.com` watermark inside the conversation background.
- The watermark stays behind messages and cannot interfere with clicking, selecting, replying, reactions, or scrolling.
- Responsive on desktop and mobile.
- Separate low-opacity treatment for light and dark modes.


## v3.6.8 mobile conversation layout

- Mobile chat layout redesigned closer to the supplied AnimoChat reference while preserving AnonIsko styling.
- Added a horizontally-scrollable Icebreaker / quick-prompt rail.
- Tightened mobile message bubbles and spacing.
- Moved `AnonIsko.com` branding to a subtle lower-right chat watermark on phones.
- Typing indicator sits naturally above the bottom interaction area.
- Composer is now a compact mobile-first single-row layout.
- Desktop layout remains unchanged.


## v3.6.9 mobile message actions

- Tap or long-press a phone message to open an AnonIsko-themed reaction strip.
- Added compact Reply and Copy actions beneath the reactions.
- Reaction count badge remains attached to the message bubble.
- Dark and light mode styles follow the supplied reference while keeping AnonIsko colors.


## v3.6.10 mobile composer repair

- fixed the phone composer collapsing below the quick-prompt rail.
- restored Emoji, Voice, Activities, message input, and Send into one visible row.
- removed the broken absolute-positioned Send behavior on mobile.
- kept quick prompts above the composer without overlapping controls.


## v3.6.11 mobile responsiveness cleanup

- reduced the mobile quick-prompt rail to exactly two controls:
  Icebreaker + one rotating conversation prompt.
- rebuilt the phone composer as a fixed 5-column layout:
  Voice / Emoji / Activities / Message / Send.
- removed horizontal overflow from the bottom conversation UI.
- tightened extra-small phone sizing.


## v3.6.12 mobile icebreaker flow

- Icebreaker button now only generates/changes the suggested question.
- Tapping the suggested question sends it directly into the conversation.
- Prompt automatically changes after sending.
- Restored visible Emoji, Voice, and Games/Activities icons on phones.
- Added a small icebreaker icon and prompt-refresh animation.


## v3.6.13 composer controls + desktop icebreaker

- Restored Emoji, Voice, and Games/Activities controls on phones.
- Emoji control now uses the AnonIsko favicon as its visible icon.
- Games/Activities uses a dedicated gamepad icon.
- Icebreaker + one clickable suggestion now appears on desktop as well as phone.
- Rebuilt composer layout responsively for desktop, phone, and extra-small phones.


## v3.6.14 mobile header + composer repair

- Keeps the AnonIsko site header visible at the top on phones.
- Only the message body scrolls; the top header, partner header, quick prompts, and composer remain in layout.
- Forces favicon Emoji, Voice, and Games/Activities buttons visible on mobile.
- Rebuilds the phone composer as Emoji / Voice / Games / Input / Send.
- Removes horizontal overflow from quick prompts and composer controls.


## v3.6.16 Icebreaker + watermark + favicon fix

- Fixed the Icebreaker handler scope bug.
- Icebreaker button changes the question; tapping the question sends it through the normal composer send path.
- Emoji button uses `/assets/favicon.svg`.
- Watermark is subtle and centered on desktop, smaller on the lower-right for phones.
- `schema.sql` unchanged.


## v3.6.17 gestures + Happy Face icon + watermark

- Emoji button uses Happy Face icon #4989500 from Flaticon.
- Phone: long-press a message for reactions/actions.
- Phone: slide/swipe a message right to reply.
- Fixed desktop Emoji / Voice / Games / input / Send alignment.
- AnonIsko.com is now a small lower-right in-chat watermark.
- Attribution: Happy Face icon by th studio from Flaticon.
- `schema.sql` unchanged.


## v3.6.19 themed emoji + message bubble fix

- Emoji button now uses the Happy Face artwork as a CSS mask so it automatically follows AnonIsko's maroon theme.
- Dark mode uses the matching pink accent.
- Fixed short messages such as `hey` wrapping vertically on phones.
- Long messages still wrap normally within responsive message bubbles.
- Swipe-to-reply no longer causes message bubbles to collapse in width.
- `schema.sql` unchanged.


## v3.6.21 consent headline overlap fix

- Reduced the desktop size of `Use AnonIsko respectfully.`.
- Added a strict maximum width so the heading can never overlap the Terms panel.
- Increased the desktop column gap and made both columns responsive.
- Tightened heading/description spacing for desktop, tablet, and phone.
- `schema.sql` unchanged.


## v3.6.22 consent button + mobile scroll fix

- Both consent checkboxes now reliably enable `I agree & continue`.
- Clicking the button stores Terms + 18+ confirmation and navigates to `/home`.
- Rebuilt the consent controller to avoid conflicting/duplicate listeners.
- Restored vertical scrolling and touch scrolling on phone/tablet.
- Terms expand naturally on small screens instead of trapping the page inside a non-scrollable viewport.
- `schema.sql` unchanged.


## v3.6.23 consent + chat polish

- Unified consent storage keys and removed conflicting consent logic.
- Terms + 18+ checkboxes now enable the button reliably.
- `I agree & continue` saves both confirmations and redirects to `/home`.
- Reduced and strengthened the consent headline gradient for readability.
- Restored mobile message bubble width so messages no longer collapse vertically.
- Added partner-found animation and a short WebAudio chime.
- Added subtle message entrance and composer interaction animations.
- Respects `prefers-reduced-motion`.
- `schema.sql` unchanged.


## v3.6.24 Home redesign

- Redesigned Home to feel closer to the supplied reference while retaining AnonIsko's own maroon/cream identity.
- Added large centered AnonIsko branding, intro copy, peak-hours pill, Main chat card, and feature cards.
- Added support contact: `pupanonisko@gmail.com`.
- Added footer: `© 2026 AnonIsko. All rights reserved.`
- Responsive for desktop, tablet, and phone.
- `schema.sql` unchanged.


## v3.6.25 Home matching flow

- Reworked Home to: Username -> Male/Female/Any -> details modal -> Find someone.
- Existing profile/matching modal is preserved and repaired.
- University, About Me, Interests and existing matching fields stay inside the details modal.
- Removed the peak-hours pill.
- Restored the older animated AnonIsko maroon/pink gradient.
- Replaced Home emoji glyphs with Flaticon icon masks.
- Footer includes `pupanonisko@gmail.com` and `© 2026 AnonIsko. All rights reserved.`
- Flaticon assets are used under their applicable attribution/license terms.
- `schema.sql` unchanged.


## v3.6.26 Home control + Flaticon fix

- Moved Home quick-start interactions out of inline JavaScript and into `home.js`, fixing CSP-related dead buttons.
- Male / Female / Any now reliably select the desired match preference.
- Continue copies the username + preference into the existing profile modal and opens it.
- Existing modal remains the details step for user's gender, university, vibe, interests, About Me, and Find someone.
- Bundled Home Flaticon assets locally so icons render even when remote CDN masks are blocked.
- Improved modal responsiveness on phone.
- `schema.sql` unchanged.


## v3.6.27 inline Home matching form

- Removed the profile modal from the Home matching flow.
- Home now uses: Nickname -> Match with Male/Female/Any -> University -> Conversation vibe -> Interests -> About me -> Find someone.
- Removed duplicate Nickname and Gender fields from the old modal by removing the modal entirely.
- Matching labels now use:
  - Male -> `Finding an Isko`
  - Female -> `Finding an Iska`
  - Any -> `Finding an Iska or Isko`
- Preference is saved and reflected on the Finding page.
- Responsive for desktop, tablet, and phone.
- `schema.sql` unchanged.


## v3.6.28 Home profile validation + staged reveal

- Fixed `Please complete your profile correctly.` appearing on a completed Home form.
- Added staged animated flow:
  Match with -> University/Campus -> Conversation vibe -> Interests -> About me -> Find someone.
- Selected options animate when chosen.
- Finding wording:
  - Male -> `Finding an Isko...`
  - Female -> `Finding an Iska...`
  - Any -> `Finding an Iska or Isko...`
- Responsive on desktop and phone.
- `schema.sql` unchanged.


## v3.6.29 campus option + matchmaking label fix

- Added `Other school / Rather not say` as the first selectable campus option.
- Backend CAMPUS_LIST now accepts that value, so profile validation will not reject it.
- Fixed matchmaking label mapping:
  - Male -> `Finding an Isko...`
  - Female -> `Finding an Iska...`
  - Any -> `Finding an Iska or Isko...`
- Normalized saved preference values to `male`, `female`, or `anyone`.
- `schema.sql` unchanged.


## v3.6.30 matchmaking wording source-of-truth fix

- Removed the old Finding-page logic that derived the target from `profile.gender`.
- The Finding page now uses only `profile.preference` / canonical saved preference.
- The intro heading, main matchmaking heading, and rotating search phrase all use the same mapping:
  - Male -> `Finding an Isko...`
  - Female -> `Finding an Iska...`
  - Any -> `Finding an Iska or Isko...`
- Prevents older code from overwriting the correct wording after page load.
- `schema.sql` unchanged.
