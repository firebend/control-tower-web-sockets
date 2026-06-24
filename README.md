# Control Tower Real-Time Events Web Sockets

This repository contains the official `@firebend/control-tower-web-socket-client` npm package, an Angular sample application, and tooling for receiving real-time events from the [Control Tower Platform](https://github.com/firebend) over SignalR web sockets.

The package is published as `@firebend/control-tower-web-socket-client` and provides a fluent builder API around `@microsoft/signalr` for connecting, authenticating, and subscribing to real-time entity events.

## Table of Contents

- [What is this repo?](#what-is-this-repo)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Using the web-socket-client library](#using-the-web-socket-client-library)
- [Developing on the library](#developing-on-the-library)
- [Running the sample app](#running-the-sample-app)
- [Common commands](#common-commands)
- [Troubleshooting](#troubleshooting)
- [Publishing](#publishing)

## What is this repo?

Control Tower exposes real-time events (created, modified, deleted) for entities such as loads, stops, and customers. This repo provides:

1. **`@firebend/control-tower-web-socket-client`** — a TypeScript client library that wraps SignalR and handles reconnection, token refresh, transport fallback, and subscription recovery.
2. **`ct-rte-ws-sample`** — an Angular app that demonstrates how to authenticate with Auth0 and subscribe to real-time events using the library.
3. **Nx workspace tooling** — build, test, lint, and publish targets for the library and sample app.

## Repository layout

```text
├── apps/
│   └── ct-rte-ws-sample/     # Angular sample application
├── libs/
│   └── web-socket-client/     # The @firebend/control-tower-web-socket-client package
├── tools/
│   └── scripts/
│       └── publish.mjs         # Helper script for publishing the library
├── nx.json                     # Nx workspace configuration
├── package.json                # Workspace dependencies and scripts
└── README.md                   # This file
```

## Prerequisites

- [Node.js](https://nodejs.org/) — the version pinned by the workspace is in `package.json` (use the latest active LTS that matches the Angular/Nx versions in the repo).
- [npm](https://www.npmjs.com/) — this repo uses npm exclusively (`npm install` is enforced via `only-allow`).
- An Auth0 account and a Control Tower Platform real-time events endpoint if you want to run the sample app against a live backend.

## Getting started

Clone the repo and install dependencies:

```bash
git clone https://github.com/firebend/control-tower-web-sockets.git
cd control-tower-web-sockets
npm install
```

> The `postinstall` script decorates the Angular CLI for Nx computation caching. This is expected and safe.

## Using the web-socket-client library

The library is published as `@firebend/control-tower-web-socket-client`. You can import it from another package or use it directly from this workspace via the `@ct-rte-ws/web-socket-client` path alias.

### Basic connection

```typescript
import {
  realTimeEventFactory,
  HttpTransportType,
} from '@firebend/control-tower-web-socket-client';

const builder = await realTimeEventFactory(
  'https://platform-qa.controltower.tech/events/signalr'
)
  .withAccessToken(() => getJwtToken()) // string, Promise<string>, or factory
  .withTransport(HttpTransportType.WebSockets | HttpTransportType.LongPolling)
  .withAutomaticReconnect([0, 2000, 10000, 30000, 60000])
  .withKeepAliveInterval(10000)
  .withServerTimeout(30000)
  .startAsync();

// Listen to all triggers for an entity
builder.onAll('loads', (event) => {
  console.log('Load event:', event.trigger, event.entity);
});
```

### Builder options

All options have sensible defaults and can be chained:

| Method | Default | Purpose |
|--------|---------|---------|
| `withAccessToken(token)` | none | Token string, promise, or factory. Factories are re-invoked on reconnect so you can refresh expired tokens. |
| `withTransport(transport)` | `WebSockets \| LongPolling` | SignalR transport(s) to use. |
| `withAutomaticReconnect(delays)` | `[0, 2000, 10000, 30000, 60000]` | Retry delays in milliseconds. |
| `withKeepAliveInterval(ms)` | `10000` | Ping interval. |
| `withServerTimeout(ms)` | `30000` | Server timeout. |
| `withCloseHandler(handler)` | `console.error` | Callback invoked when the connection is permanently closed. |

### Listening to specific triggers

```typescript
builder.on('loads', (b) =>
  b
    .onTrigger('Created')
    .onTrigger('Modified', (filters) =>
      filters
        .withFilter('/loadStatus')
        .withFilter('/stops/*')
    )
    .withEventHandler((event) => {
      console.log('Load updated:', event);
    })
);
```

For more library examples, see [`libs/web-socket-client/README.md`](./libs/web-socket-client/README.md).

## Developing on the library

The library source lives in `libs/web-socket-client/src`.

### Build

```bash
npx nx build web-socket-client
```

Output is written to `dist/libs/web-socket-client`.

### Test

```bash
npx nx test web-socket-client
```

### Lint

```bash
npx nx lint web-socket-client
```

### Local consumption

The root `package.json` references the library as a local file dependency:

```json
"@firebend/control-tower-web-socket-client": "file:libs/web-socket-client"
```

When you build the library, the sample app will consume the built output. The package version is read from `libs/web-socket-client/package.json`.

### Publishing

Use the Nx publish target:

```bash
npx nx publish web-socket-client --ver=1.2.3 --tag=latest
```

This runs `tools/scripts/publish.mjs`, which builds the library and publishes the `dist/libs/web-socket-client` output.

## Running the sample app

The sample app demonstrates Auth0 login, connecting to the real-time events endpoint, and subscribing to entity events.

### 1. Create the Auth0 configuration

The sample app expects an Auth0 config file at `apps/ct-rte-ws-sample/src/environments/auth-config.ts`. This file is gitignored so you can keep secrets out of the repo.

Create the file with your Auth0 domain, client ID, audience, and error path:

```typescript
// apps/ct-rte-ws-sample/src/environments/auth-config.ts
export default {
  domain: 'your-tenant.us.auth0.com',
  clientId: 'your-client-id',
  audience: 'https://your-control-tower-api',
  errorPath: '/error',
};
```

### 2. Set the real-time events endpoint

The sample app connects to the Control Tower real-time events endpoint in `apps/ct-rte-ws-sample/src/app/pages/events/base.events.component.ts`:

```typescript
const eventBuilder = await realTimeEventFactory(
  'https://platform-qa.controltower.tech/events/signalr'
)
  .withAccessToken(token.token)
  .startAsync();
```

Update the URL to match your environment.

### 3. Serve the app

```bash
npm start
# or
npx nx serve ct-rte-ws-sample
```

The dev server will start on `http://localhost:4200`.

### 4. Build for production

```bash
npx nx build ct-rte-ws-sample
```

## Common commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies. |
| `npm start` | Serve the sample app. |
| `npx nx test web-socket-client` | Run library unit tests. |
| `npx nx test ct-rte-ws-sample` | Run sample app unit tests. |
| `npx nx lint web-socket-client` | Lint the library. |
| `npx nx lint ct-rte-ws-sample` | Lint the sample app. |
| `npx nx build web-socket-client` | Build the library. |
| `npx nx build ct-rte-ws-sample` | Build the sample app. |
| `npx nx run-many --target=test --all` | Run all tests. |
| `npx nx affected --target=test` | Run affected tests. |

## Troubleshooting

### `Required property 'buildTarget' is missing`

The Angular dev-server target uses `buildTarget` instead of the older `browserTarget`. If you see this error after a migration, verify the `serve` and `extract-i18n` targets in `apps/ct-rte-ws-sample/project.json` use `buildTarget`.

### `Cannot find module './auth-config'`

The sample app requires `apps/ct-rte-ws-sample/src/environments/auth-config.ts`. Create that file with your Auth0 settings (see [Running the sample app](#running-the-sample-app)).

### Token expiration

If your connection drops and reconnects after the token expires, pass a token factory to `withAccessToken`:

```typescript
.withAccessToken(() => authService.getAccessTokenSilently())
```

SignalR calls the factory each time it needs a token.

## Publishing

See the [Publishing](#publishing) section above. Ensure you have npm publish permissions for the `@firebend` scope and that the version in `libs/web-socket-client/package.json` is correct.
