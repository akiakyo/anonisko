# AnonIsko

AnonIsko is an anonymous real-time chat and matchmaking platform designed for students who want to meet new people, have conversations, and connect based on their preferences and interests.

Users can choose a nickname, select who they want to match with, set their university or campus, choose a conversation vibe and interests, and start searching for another user.

## Features

- Anonymous real-time matchmaking
- Male, Female, or Any matching preferences
- University / Campus selection
- Conversation vibe selection
- Interest-based matching
- Custom "About Me" profiles
- Real-time private messaging
- Message reactions
- Typing indicators
- Chat sound effects
- Match-found sound effects
- Voice chat support
- Interactive chat features
- Conversation ending and rematching
- Report and block system
- Consent and community guidelines
- Dark and light mode
- Responsive mobile and desktop interface
- Persistent matchmaking using a shared database
- Anonymous session management

## Matchmaking

AnonIsko uses user preferences to search for compatible people.

| Preference | Matchmaking Display |
|---|---|
| Male | Finding an Isko... |
| Female | Finding an Iska... |
| Any | Finding an Iska or Isko... |

The matchmaking queue is stored in the database so users can still be matched when their connections are handled by different server instances.

## Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript
- Responsive Web Design
- Socket.IO Client

### Backend

- Node.js
- Express.js
- Socket.IO
- Prisma ORM

### Database

- PostgreSQL
- Neon

### Deployment

- Vercel
- GitHub

## Database

AnonIsko uses PostgreSQL hosted on Neon.

Prisma handles the database models, migrations, and application queries.

Database data includes:

- Anonymous sessions
- User profiles
- Matchmaking queue
- Matches
- Conversations
- Messages
- Reports
- Blocked users

## Environment Variables

Create a `.env` file for local development:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL="YOUR_NEON_DATABASE_URL"

SESSION_SALT="YOUR_LONG_RANDOM_SECRET"
```

Never commit your `.env` file or database credentials to GitHub.

For production, configure the environment variables directly through your hosting provider.

## Installation

Clone the repository:

```bash
git clone <your-repository-url>
cd anonisko
```

Install dependencies:

```bash
npm install
```

Generate the Prisma Client:

```bash
npx prisma generate
```

Apply database migrations:

```bash
npx prisma migrate deploy
```

Start the application:

```bash
npm start
```

The local server will normally be available at:

```text
http://localhost:3000
```

## Prisma

After modifying `prisma/schema.prisma`, generate the Prisma Client again:

```bash
npx prisma generate
```

For development migrations:

```bash
npx prisma migrate dev --name <migration-name>
```

For production:

```bash
npx prisma migrate deploy
```

## Project Structure

```text
AnonIsko/
├── generated/
│   └── prisma/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── public/
├── server.js
├── prisma.config.ts
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Security

AnonIsko is designed around anonymous communication, but users are still expected to follow the platform's rules and community guidelines.

The application includes reporting, blocking, consent, session protection, and server-side validation features.

Sensitive information such as `DATABASE_URL` and `SESSION_SALT` must only be stored in environment variables and must never be committed to the repository.

## Responsible Use

Use AnonIsko respectfully.

Do not use the platform for harassment, threats, impersonation, sharing private information, spam, or other abusive behavior.

Users should report inappropriate behavior using the built-in reporting system.

## Feedback & Bug Reports

Found a bug, encountered an error, or have a suggestion?

Email:

**pupanonisko@gmail.com**

## Disclaimer

AnonIsko is an independent project and is not an official communication platform of any university or educational institution unless explicitly stated otherwise.

## Copyright

© 2026 AnonIsko. All rights reserved.
