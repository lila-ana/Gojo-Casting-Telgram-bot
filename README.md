# Telegram Bot with TypeScript and GrammY

A professional Telegram bot built with TypeScript, GrammY, and modern best practices.

## Features

- 🚀 TypeScript for type safety
- 🤖 GrammY as the Telegram Bot framework
- 📦 Prisma for database management
- 🔧 Environment configuration with dotenv
- 📝 ESLint and Prettier for code quality
- 🧪 Jest for testing
- 🐳 Docker support

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (if using database)
- Telegram Bot Token (get it from [@BotFather](https://t.me/BotFather))

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd telegram-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
- Add your Telegram Bot Token
- Configure your database connection (if using)

5. Generate Prisma client:
```bash
npm run prisma:generate
```

6. Run database migrations:
```bash
npm run prisma:migrate
```

## Development

Start the development server:
```bash
npm run dev
```

## Building

Build the project:
```bash
npm run build
```

## Running

Start the production server:
```bash
npm start
```

## Testing

Run tests:
```bash
npm test
```

## Code Quality

- Lint code:
```bash
npm run lint
```

- Format code:
```bash
npm run format
```

## Project Structure

```
src/
├── config/         # Configuration files
├── handlers/       # Bot command and message handlers
├── middlewares/    # Bot middlewares
├── models/         # Database models
├── services/       # Business logic
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 