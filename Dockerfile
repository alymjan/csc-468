# Use a lightweight, specific version of Node.js
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files and install dependencies cleanly
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# DEFENSE IN DEPTH: Run the container as a non-root user
USER node

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
