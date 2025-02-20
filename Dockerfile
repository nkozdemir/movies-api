# Use Node.js base image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the project files
COPY . .

# Compile Typescript files
RUN npm run build

# Expose the application port (adjust if necessary)
EXPOSE 3001

# Start the application
CMD ["npm", "start"]

