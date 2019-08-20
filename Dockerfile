# Use node 10 LTS
FROM node:10

# Copy source code
COPY . /server

# Change working directory
WORKDIR /server

# Install dependencies
RUN npm install

# Expose API port to the outside
EXPOSE 4040:4000

# Launch application
CMD ["node","./bin/www"]
