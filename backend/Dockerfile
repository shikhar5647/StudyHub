# Use Node.js LTS (18)
FROM node:18-alpine

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
