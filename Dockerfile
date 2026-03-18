FROM node:20

# Install LibreOffice
RUN apt-get update && apt-get install -y libreoffice

# Set working directory
WORKDIR /app

# Copy backend package files
COPY Backend/package*.json ./Backend/

# Install backend dependencies
WORKDIR /app/Backend
RUN npm install

# Copy entire project
WORKDIR /app
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "Backend/server.js"]
#Done