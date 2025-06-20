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

# Expose the port Vite runs on
EXPOSE 5173

# The command to start the Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
