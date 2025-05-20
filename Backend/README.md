# Mi Proyecto

<p align="center">
  <img src="/Backend/static/logoDeballComplete.png" alt="Descripción de la imagen" width="300"/>
</p>

# Tournament Management System - Backend

This is the backend API for the Tournament Management System, which provides functionality for organizing sports tournaments, managing teams, players, and fixture generation.

## Technologies

The backend is built using:

- **[NestJS](https://nestjs.com/)**: A progressive Node.js framework for building efficient and scalable server-side applications
- **[TypeScript](https://www.typescriptlang.org/)**: Typed JavaScript that compiles to plain JavaScript
- **[MongoDB](https://www.mongodb.com/)**: NoSQL database used for data persistence
- **[Mongoose](https://mongoosejs.com/)**: MongoDB object modeling tool designed to work in an asynchronous environment
- **[JWT](https://jwt.io/)**: JSON Web Token for secure authentication
- **REST API**: For standardized HTTP communication between frontend and backend
- **[Class-validator](https://github.com/typestack/class-validator)**: Decorator-based property validation for classes
- **[Swagger/OpenAPI](https://swagger.io/)**: API documentation

## Project Structure

The project follows a modular structure based on NestJS conventions:

```
Backend/
├── src/
│   ├── auth/                  # Authentication module (login, register, etc.)
│   ├── users/                 # User management
│   ├── tournaments/           # Tournament management
│   ├── phases/                # Tournament phases (groups, knockouts, etc.)
│   ├── matchdays/             # Match days within phases
│   ├── matches/               # Individual matches
│   ├── teams/                 # Team management
│   ├── registrations/         # Team registrations in tournaments
│   ├── players/               # Player management
│   ├── common/                # Shared utilities, guards, filters, etc.
│   ├── app.module.ts          # Main application module
│   ├── main.ts                # Application entry point
├── test/                      # Tests
├── nest-cli.json              # NestJS CLI configuration
├── package.json               # Node.js dependencies
├── tsconfig.json              # TypeScript configuration
```

## Entity Relationships

The system is based on the following entity relationships:

1. **Tournament**: The main competition entity

   - Has multiple Phases
   - Has many Teams through Registrations

2. **Phase**: A stage of the tournament (e.g., group stage, knockout stage)

   - Belongs to a Tournament
   - Has multiple Matchdays
   - Has a type (GROUP, KNOCKOUT, LEAGUE, etc.)

3. **Matchday**: A round or specific date of matches

   - Belongs to a Phase
   - Has multiple Matches
   - Has an order number (1, 2, 3, etc.)

4. **Match**: A game between two teams

   - Belongs to a Matchday
   - References two Teams (teamA and teamB)
   - Has optional result information

5. **Team**: A participating team in tournaments

   - Has many Players
   - Participates in many Tournaments through Registrations
   - Created by a User

6. **Registration**: Represents a team's participation in a tournament

   - Links a Team to a Tournament (many-to-many)
   - Has registration date information

7. **User**: A system user (including players, admins)
   - Has a role (ADMIN, MODERATOR, PLAYER)
   - Can be associated with Teams (as a player)

## Entity Relationship Diagram

```
Tournament 1──┐
              │
              ▼
         N┌───────┐
Registration│ M    │
         ▲  └───────┘
         │         │1
         │         │
         │         ▼
         │    N┌───────┐
Team ────┘     │ Phase │
 │             └───────┘
 │                 │1
 │                 │
 │                 ▼
 │            N┌───────┐
 │             │Matchday│
 │             └───────┘
 │                 │1
 │                 │
 │                 ▼
 │            N┌───────┐
 └──────────┐  │ Match │
 └──────────┘  └───────┘

User ─────────┐
              │
              ▼
         N┌───────┐
          │ Player│
          └───────┘
```

## API Endpoints

The API provides the following main endpoints:

- `/auth`: Authentication endpoints (login, register)
- `/users`: User management
- `/tournaments`: Tournament CRUD operations
- `/phases`: Tournament phase management
- `/matchdays`: Matchday management
- `/matches`: Match management
- `/teams`: Team CRUD operations
- `/registrations`: Team tournament registration

## Business Rules

- Teams must be registered in a tournament before they can be included in matches
- Phases must belong to a tournament
- Matchdays must be ordered within a phase
- Matches must include two different teams

## Fixture Generation

The system includes algorithms for fixture generation:

- Round-robin scheduling for league formats
- Support for home and away matches
- Options for manual fixture creation

## Validation

Validation is performed at multiple levels:

- DTOs using class-validator decorators
- Service-layer business rule validation
- MongoDB schema validation

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
