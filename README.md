# Across the Blue Sky

## Development

### Setup Back-End

Prerequisite:

- Python v3.9 or higher
- Make CLI

Create Python virtual environments

```bash
python3 -m venv path/to/venv
```

Move to `back-end` directory

```bash
cd ./back-end
```

Activate the virtual environments

```bash
source path/to/venv/bin/activate
```

Install dependencies

```bash
pip install --no-cache-dir --upgrade -r ./requirements.txt
```

Start development

```bash
make dev
```

Simulate the deployment with Docker

```bash
docker compose -f compose.dev.yaml up --build
```

### Setup Front-End

Prerequisite:

- Node v22 or higher
- PNPM v10 or higher

Move to `front-end` directory

```bash
cd ./front-end
```

Create `.env` file by duplicate `.env.example` (Edit the value in `.env` if necessary)

```bash
cp .env.example .env
```

Install dependencies

```bash
pnpm install
```

Start development

```bash
npm run dev
# OR
npm run dev:next # for Next.js only
# OR
npm run dev:ws # for WebSocket only
```

Simulate the deployment with Docker

```bash
docker compose -f compose.dev.yaml up --build
```

## Deployment with Docker

### Deployment for Back-End

Using `docker compose`

```bash
docker compose up --build
```

Using `docker` CLI

```bash
# 1. Build the image first
docker build -t tag-name .
# 2. Run the image
docker run -p 8080:80 tag-name
```

### Deployment for Front-End

Using `docker compose`

```bash
docker compose up --build
```

Using `docker` CLI

```bash
# 1. Build the WebSocket image first
docker build \
    -t tag-name-ws \
    --build-arg WS_PORT=<WS_PORT> \
    -f Dockerfile.ws .

# 2. Build the Front-End image
docker build \
    -t tag-name-fe \
    --build-arg PORT=<PORT> \
    -f Dockerfile ..

# 3. Run the WebSocket image
docker run \
    -d \
    -p <EXPOSED_PORT>:<WS_PORT> \
    -e WS_PORT=<WS_PORT> \
    -e BLUESKY_API_URL=<BLUESKY_API_URL> \
    tag-name-ws

# 4. Run the Front-End image
docker run \
    -d \
    -p <EXPOSED_PORT>:<PORT> \
    -e PORT=<PORT> \
    -e NEXT_PUBLIC_WS_URL=<NEXT_PUBLIC_WS_URL> \
    tag-name-fe
```
