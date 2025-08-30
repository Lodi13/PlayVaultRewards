# Overview

PlayVault is a gamified reward platform that allows users to earn XP through various activities like completing surveys, playing games, and referring friends. The application features a comprehensive leveling system, milestone tracking, and reward redemption capabilities. Users can compete on leaderboards and maintain daily streaks to maximize their earnings, then redeem their XP for real-world rewards like PayPal cash and gift cards.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built as a React single-page application using TypeScript and Vite as the build tool. The application follows a component-based architecture with shadcn/ui components for consistent design. Key architectural decisions include:

- **Routing**: Uses Wouter for lightweight client-side routing with authentication-based route protection
- **State Management**: TanStack Query for server state management with React hooks for local state
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **UI Framework**: Radix UI primitives via shadcn/ui for accessible, composable components
- **Authentication Flow**: Redirects unauthenticated users to landing page, authenticated users to dashboard

## Backend Architecture
The backend follows a REST API pattern built with Express.js and TypeScript. Core architectural patterns include:

- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect for secure user authentication
- **Session Management**: PostgreSQL-backed session storage with configurable TTL
- **API Structure**: RESTful endpoints organized by feature (auth, XP, rewards, etc.)
- **Middleware**: Request logging, JSON parsing, and error handling middleware
- **Storage Pattern**: Repository pattern with IStorage interface for database operations

## Database Design
The database schema supports the gamification features with the following key tables:

- **Users**: Core user data with XP, level, streak tracking, and referral system
- **Activities**: Historical record of all XP-earning activities with metadata
- **Rewards**: Catalog of available rewards with XP costs and availability
- **Redemptions**: User reward redemption history with status tracking
- **Milestones**: Progress tracking for achievements and goals
- **Daily Tasks**: Time-based challenges with completion tracking
- **Sessions**: Required table for Replit Auth session management

## Authentication & Authorization
Authentication is handled through Replit's OAuth system with session-based authorization:

- **OAuth Flow**: Uses OpenID Connect with Replit as the identity provider
- **Session Security**: Secure HTTP-only cookies with configurable expiration
- **Route Protection**: Middleware-based authentication checking for protected endpoints
- **User Management**: Automatic user creation/update on first login with profile sync

# External Dependencies

## Core Services
- **Neon Database**: PostgreSQL hosting service for primary data storage
- **Replit Auth**: OAuth authentication service for user identity management

## Payment Integration  
- **PayPal SDK**: Server-side integration for processing reward payments and gift card purchases

## Third-party Services
- **CPX Research**: Survey provider integration for external survey completion tracking
- **Game Offer Networks**: External game installation and completion tracking services

## Development Tools
- **Vite**: Frontend build tool and development server with HMR support
- **Drizzle Kit**: Database migration and schema management tooling
- **TypeScript**: Type safety across both frontend and backend codebases