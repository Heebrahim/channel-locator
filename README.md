# MTNN Coverage Locator

## Contributing

### Getting started
```bash
git clone https://github.com/polarisdigitech/mtn-coverage-locator.git
cd mtn-coverage-locator
pnpm i
```

> Create a .env.local based on the .env.example file

### Start development server

```bash
pnpm dev
```

## Project folder structure

.
└── mtn-coverage-locator/
    ├── public
    └── src/
        ├── common
        ├── components
        ├── core/
        │   ├── adapters
        │   ├── models
        │   ├── repository
        │   └── service
        ├── libs
        ├── pages
        └── main.tsx

- `main.tsx` is the application entry point, where the router and routes are setup. With other application startup requirements.

- core: contains core business logic
   - adapters: define environment resources required to perform core business logic
   - models: core domain objects
   - repository: handles data fetching
   - services: handles core business logic

- pages: folder routing convention for code organization. But routes are assembles in the `main.tsx` entry point

- libs: modification or helper methods for external libraries

## Deployment

Provider - [Firebase hosting](https://console.firebase.google.com/u/0/project/mtn-coverage-locator-vite/hosting/sites)

```bash
pnpm clean
pnpm build
firebase deploy
```