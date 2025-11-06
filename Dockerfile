# Use Node.js 20 LTS
FROM node:20.19

WORKDIR /usr/src/app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Build the React app (output goes to /build)
RUN npm run build

# Install 'serve' to serve static files
RUN npm install -g serve

# Azure will inject PORT automatically
EXPOSE 3000

# Serve the React build folder
CMD ["serve", "-s", "build", "-l", "tcp://0.0.0.0:3000"]
