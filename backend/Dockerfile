# Use Node.js LTS (20)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Expose the API port
EXPOSE 5001

# Command to run the application
CMD ["npm", "start"]
