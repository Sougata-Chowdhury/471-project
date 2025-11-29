FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY backend/src ./src

# Copy environment variables example
# Do not copy example env file; expect environment to be provided at runtime

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]