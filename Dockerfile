FROM node:18-alpine
WORKDIR /app
COPY . .

# Install a lightweight server
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Start server
CMD ["serve", "-s", ".", "-l", "5173"]