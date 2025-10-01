# Use a specific Node version with Alpine for a smaller image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files and Prisma schema first (for layer caching)
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies with --build-from-source to ensure bcrypt is compiled for the current architecture
RUN npm install 


# Copy the rest of the application
COPY . .

# 👇 Create uploads folder (ensure it exists inside the container)
RUN mkdir -p uploads

# Build the app (NestJS -> dist/)
RUN npm run build

# Expose port your app uses (adjust if needed)
EXPOSE 3000

# Start with migrations and prod server
CMD ["npm", "run", "start:migrate:prod"]
