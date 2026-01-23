# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

ARG VITE_API_URL
ARG VITE_TENANT_ID
ARG VITE_APP_NAME

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_TENANT_ID=$VITE_TENANT_ID
ENV VITE_APP_NAME=$VITE_APP_NAME

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Install envsubst (gettext package)
RUN apk add --no-cache gettext

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

# Cloud Run sets PORT, default to 8080 if not set
ENV PORT=8080

EXPOSE $PORT

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]