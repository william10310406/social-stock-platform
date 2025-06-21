# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the frontend application code
COPY . .

# Set environment variables for Docker
ENV NODE_ENV=docker
ENV VITE_API_BASE_URL=""
ENV VITE_HOST=0.0.0.0
ENV VITE_PORT=5173

# Expose the port Vite runs on
EXPOSE 5173

# Also expose HMR port
EXPOSE 5174

# The command to start the Vite dev server with Docker-specific settings
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
