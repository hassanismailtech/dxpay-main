# syntax=docker/dockerfile:1
# Registry-verified Node 24 base; build for the Forge linux/amd64 nodes.
ARG NODE_IMAGE=node:24-bookworm-slim@sha256:01d566e8d94d8c619591d78652babfccd3c6992a3dffa9ed5ab39e11cf6c70e9

FROM ${NODE_IMAGE} AS frontend-build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# The API is a second container in the same pod, not a browser-visible bank endpoint.
ENV BACKEND_URL=http://127.0.0.1:5000
RUN mkdir -p public && npm run build

FROM ${NODE_IMAGE} AS backend-dependencies
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=8080
WORKDIR /app
COPY --from=frontend-build --chown=node:node /app/frontend/.next/standalone ./frontend/
COPY --from=frontend-build --chown=node:node /app/frontend/.next/static ./frontend/.next/static/
COPY --from=frontend-build --chown=node:node /app/frontend/public ./frontend/public/
COPY --from=backend-dependencies --chown=node:node /app/backend/node_modules ./backend/node_modules/
COPY --chown=node:node backend/package.json backend/server.js ./backend/
COPY --chown=node:node backend/config/ ./backend/config/
COPY --chown=node:node backend/routes/ ./backend/routes/
COPY --chown=node:node backend/utils/ ./backend/utils/
USER node
EXPOSE 8080 5000
CMD ["node", "/app/frontend/server.js"]
