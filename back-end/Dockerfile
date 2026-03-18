FROM python:3.9-slim-bookworm

# Install ca-certificates and curl for health checks
RUN apt-get update && \
    apt-get install -y ca-certificates curl tzdata && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./app /code/app

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/docs || exit 1

CMD ["fastapi", "run", "app/main.py", "--port", "80"]