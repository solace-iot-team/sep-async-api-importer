# Development importer-cli


## Download Solace Event Portal Open API Spec

```bash
curl https://openapi-v2.solace.cloud/api-docs-v2.json --output ../resources/sep-openapi-spec.json
```

## Build

```bash
npm install
npm run dev:build
```

## Run

```bash

export CLI_SOLACE_CLOUD_TOKEN={token}

# single spec
npm run dev:start -- -fp ../data/acme-retail/central-it/till-system/AcmeRetail-Central-IT-Provider-TillSystem-v1.spec.yml -d dev/test | npx pino-pretty

# glob
npm run dev:start -- -fp ../data/**/*.spec.yml | npx pino-pretty

npm run dev:start -- -fp ../data/**/*.spec.yml -d dev/test | npx pino-pretty


# redirect to log file

npm run dev:start -- -fp ../data/**/*.spec.yml | npx pino-pretty > ./devel/logs/log.log 2>&1


```

---

The End.
