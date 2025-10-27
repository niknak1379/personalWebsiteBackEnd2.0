# Use official Node.js 20.12 base image
FROM node:20.12

# Create and set working directory
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the backend port
EXPOSE 8080

# Start the server
CMD ["node", "index.js"]
