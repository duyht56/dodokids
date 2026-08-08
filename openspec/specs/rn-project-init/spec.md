# rn-project-init

## Purpose

Defines requirements for React Native project initialization, covering the Expo TypeScript setup, folder structure, linting/formatting tooling, and absolute import configuration.

## Requirements

### Requirement: React Native project initialized with TypeScript
The system SHALL have an Expo React Native project with TypeScript in the `/mobile` directory targeting iOS 15+ and Android API 26+.

#### Scenario: Project builds on iOS simulator
- **WHEN** developer runs `npx expo run:ios`
- **THEN** app builds and launches on iOS 15+ simulator without errors

#### Scenario: Project builds on Android emulator
- **WHEN** developer runs `npx expo run:android`
- **THEN** app builds and launches on Android API 26+ emulator without errors

### Requirement: Standard folder structure enforced
The mobile project SHALL follow the defined folder structure under `/mobile/src/`.

#### Scenario: Required folders exist
- **WHEN** project is initialized
- **THEN** the following folders exist: `screens`, `components`, `navigation`, `hooks`, `store`, `services`, `types`, `assets`, `constants`

### Requirement: ESLint and Prettier configured
The project SHALL have ESLint and Prettier configured with React Native rules.

#### Scenario: Linting passes on fresh project
- **WHEN** developer runs `npm run lint`
- **THEN** no lint errors are reported on the template code

### Requirement: Absolute imports configured
The project SHALL support absolute imports using `@/` prefix.

#### Scenario: Absolute import resolves correctly
- **WHEN** a file imports `@/components/Button`
- **THEN** TypeScript and Metro bundler resolve it to `src/components/Button`
