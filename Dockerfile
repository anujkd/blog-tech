# Use an official Node image to build the app
FROM node:20 AS build

# Set working directory
WORKDIR /app

# Copy project files
COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Build the app
RUN npm run build

# Use a simple nginx server to serve the built files
FROM nginx:alpine

# Copy the build output to the nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html/rui

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
