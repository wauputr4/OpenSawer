FROM oven/bun:1.3.14 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun --bun run build

FROM oven/bun:1.3.14-slim
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 OPENSAWER_DB_PATH=/data/opensawer.db
COPY --from=build /app/package.json /app/bun.lock ./
RUN bun install --production --frozen-lockfile
COPY --from=build /app/build ./build
RUN mkdir -p /data && chown -R bun:bun /app /data
USER bun
EXPOSE 3000
VOLUME ["/data"]
CMD ["bun", "./build/index.js"]
