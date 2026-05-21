FROM oven/bun:1-slim AS runtime

WORKDIR /app

# Install curl for cron jobs
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy only dependency files first for better layer caching
COPY package.json bun.lock ./

# Install only production dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY . .

# Remove unnecessary files from final image
RUN rm -rf \
    .git \
    node_modules/.cache \
    tests \
    docs

# Bun apps usually run on 3000
EXPOSE 3000

# Use exec form
CMD ["bun", "run", "index.ts"]