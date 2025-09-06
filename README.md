# RS Car Accessories

A modern React application for managing car accessories business operations.

## Features

- **Dashboard**: Overview of business metrics and recent activity
- **Customer Management**: Track customer information and service history
- **Lead Management**: Manage potential customers and their status
- **Service Management**: Organize service offerings and pricing
- **Requirements Tracking**: Track service requirements and appointments
- **Settings**: Configure business settings and preferences

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library
- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
src/
├── components/          # Reusable components
├── pages/              # Page components
├── test/               # Test setup files
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## Routes

- `/signin` - Sign in page
- `/` - Dashboard
- `/customers` - Customer management
- `/leads` - Lead management
- `/services` - Service management
- `/requirements` - Requirements tracking
- `/settings` - Settings

## Development

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **lint-staged** for pre-commit checks

Pre-commit hooks will automatically:
- Run ESLint and fix issues
- Format code with Prettier
- Run tests

## License

MIT


