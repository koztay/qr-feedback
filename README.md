# Municipal AR Feedback System

A cross-platform mobile application for citizen feedback using Augmented Reality.

## Project Structure

```
.
├── mobile-app/          # React Native + Expo mobile application
├── backend/            # Node.js backend services
│   └── db/            # Database migrations and seeds
├── dashboard/          # Next.js municipality dashboard
├── infrastructure/     # Infrastructure as Code (AWS)
├── docs/              # Documentation and diagrams
├── docker-compose.yml # Development services configuration
├── package.json       # Root package.json for yarn workspaces
└── .cursorrules       # Cursor IDE configuration
```

## Prerequisites

- Node.js (v18 or later)
- Yarn (v1.22 or later)
- Docker
- AWS CLI
- Expo CLI

## Quick Start

1. Clone the repository:
```bash
git clone [repository-url]
cd municipal-ar-feedback
```

2. Start development services:
```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Wait for services to be healthy
docker-compose ps
```

3. Install dependencies for all workspaces:
```bash
yarn install
```

4. Set up environment variables:
```bash
# Copy example env files
cp mobile-app/.env.example mobile-app/.env
cp backend/.env.example backend/.env
cp dashboard/.env.example dashboard/.env
```

5. Start development servers:
```bash
# Start all services
yarn dev

# Or start individual services
yarn backend    # Start backend server
yarn dashboard  # Start dashboard
yarn mobile     # Start mobile app
```

## Development

### Setup
1. Install dependencies: `yarn install`
2. Start development servers: `yarn dev`

### Database
1. Run migrations: `yarn workspace backend prisma migrate deploy`
2. Seed initial data: `yarn workspace backend prisma db seed`
3. Seed translations: 
```bash
cd backend && DATABASE_URL="postgresql://postgres:postgres@localhost:5432/municipal_feedback?schema=public" yarn seed:translations
```

### Project Structure
- `backend/`: Node.js + Express backend
- `dashboard/`: Next.js dashboard
- `mobile-app/`: React Native + Expo app
- `docs/`: Documentation
- `infrastructure/`: DevOps & Infrastructure

### Important Commands
- `yarn dev`: Start both backend and dashboard
- `yarn backend`: Start only backend
- `yarn dashboard`: Start only dashboard
- `yarn mobile`: Start only mobile app

### Mobile App
- Uses Expo for cross-platform development
- AR implementation with ViroReact
- Location-based services
- Offline-first architecture

### Backend
- Microservices architecture
- RESTful APIs
- Real-time notifications
- Geospatial data processing

### Dashboard
- Real-time analytics
- Issue tracking
- Municipality management
- Payment processing

## Testing

Run tests across all workspaces:
```bash
yarn test
```

Or test individual workspaces:
```bash
yarn workspace mobile-app test
yarn workspace backend test
yarn workspace dashboard test
```

## Deployment

Refer to the deployment guides in the `docs` directory:
- [Mobile App Deployment](./docs/mobile-app-deployment.md)
- [Backend Deployment](./docs/backend-deployment.md)
- [Dashboard Deployment](./docs/dashboard-deployment.md)

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details 