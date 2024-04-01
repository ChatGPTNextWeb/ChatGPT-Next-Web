# Use a specific version of node (18) with Alpine Linux as the base image
FROM node:18-alpine AS base

# Create a new layer from the base stage
FROM base AS deps

# Install libc6-compat without caching to reduce image size
RUN apk add --no-cache libc6-compat

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock files into the working directory
COPY package.json yarn.lock ./

# Configure yarn to use a specific registry mirror for dependencies
RUN yarn config set registry 'https://registry.npmmirror.com/'
# Install dependencies defined in package.json and yarn.lock
RUN yarn install

# Create a builder layer from the base image
FROM base AS builder

# Update apk index and install git without caching
RUN apk update && apk add --no-cache git

# Set environment variables, can be overridden by build args
ENV OPENAI_API_KEY=""
ENV GOOGLE_API_KEY=""
ENV CODE=""

# Set the working directory in the container
WORKDIR /app

# Copy installed node_modules from the deps stage to the current stage
COPY --from=deps /app/node_modules ./node_modules
# Copy all local files into the container's working directory
COPY . .

# Build the application
RUN yarn build

# Create the final runner image from the base image
FROM base AS runner
# Set the working directory in the container
WORKDIR /app

# Install proxychains-ng
RUN apk add proxychains-ng

# Set environment variables that can be configured with docker run
ENV PROXY_URL=""
ENV OPENAI_API_KEY=""
ENV GOOGLE_API_KEY=""
ENV CODE=""

# Copy built assets from the builder stage to this stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/server ./.next/server

# Inform Docker that the container listens on the specified network port at runtime
EXPOSE 3000

# Define command to run when the container starts
CMD if [ -n "$PROXY_URL" ]; then \
<<<<<<< HEAD
        export HOSTNAME="127.0.0.1"; \
        # Parse protocol, host, and port from `PROXY_URL` environment variable
        protocol=$(echo $PROXY_URL | cut -d: -f1); \
        host=$(echo $PROXY_URL | cut -d/ -f3 | cut -d: -f1); \
        port=$(echo $PROXY_URL | cut -d: -f3); \
        # Prepare configuration file for proxychains
        conf=/etc/proxychains.conf; \
        echo "strict_chain" > $conf; \
        echo "proxy_dns" >> $conf; \
        echo "remote_dns_subnet 224" >> $conf; \
        echo "tcp_read_time_out 15000" >> $conf; \
        echo "tcp_connect_time_out 8000" >> $conf; \
        echo "localnet 127.0.0.0/255.0.0.0" >> $conf; \
        echo "localnet ::1/128" >> $conf; \
        echo "[ProxyList]" >> $conf; \
        echo "$protocol $host $port" >> $conf; \
        # Display the proxy configuration for debugging purposes
        cat /etc/proxychains.conf; \
        # Start the app using proxychains with the specified proxy configuration
        proxychains -f $conf node server.js; \
    else \
        # Start the app normally without a proxy
        node server.js; \
=======
    export HOSTNAME="127.0.0.1"; \
    protocol=$(echo $PROXY_URL | cut -d: -f1); \
    host=$(echo $PROXY_URL | cut -d/ -f3 | cut -d: -f1); \
    port=$(echo $PROXY_URL | cut -d: -f3); \
    conf=/etc/proxychains.conf; \
    echo "strict_chain" > $conf; \
    echo "proxy_dns" >> $conf; \
    echo "remote_dns_subnet 224" >> $conf; \
    echo "tcp_read_time_out 15000" >> $conf; \
    echo "tcp_connect_time_out 8000" >> $conf; \
    echo "localnet 127.0.0.0/255.0.0.0" >> $conf; \
    echo "localnet ::1/128" >> $conf; \
    echo "[ProxyList]" >> $conf; \
    echo "$protocol $host $port" >> $conf; \
    cat /etc/proxychains.conf; \
    proxychains -f $conf node server.js; \
    else \
    node server.js; \
>>>>>>> 9eaf492d5b72d252c9dcaa55d5d99dab87bf19e0
    fi
