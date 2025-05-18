FROM python:3.12-slim AS builder

WORKDIR /app

RUN pip install --no-cache-dir mkslides

COPY slides.md .
COPY mkslides.yml .
COPY sysdesign.png . 

RUN mkslides build slides.md

FROM nginx:alpine

COPY --from=builder /app/site /usr/share/nginx/html
