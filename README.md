# Voting app

# Vision

The architecture of this voting application is designed as a distributed system comprised of two primary containerized services that interact over a virtualized network. The frontend, built with React and served via a Node.js backend, acts as the primary interface for user interaction, while the database manages persistent data storage. These components communicate through a structured REST API using standard HTTP protocols over TCP/IP, ensuring that client-side actions like user registration, authentication, and pill selection are reliably transmitted to the server for processing.

[Image of containerized web application architecture showing React frontend Node.js backend and MongoDB database communication]

# Proposal

The project utilizes specific base images chosen for their balance of performance, security, and hardware compatibility. The application service is built upon the official Node.js Alpine Linux image to minimize the container's footprint and reduce the attack surface. For the data layer, the proposal specifies MongoDB version 4.4 to ensure stable operation on virtualized research hardware, such as CloudLab nodes, which may lack support for advanced CPU instructions required by more recent database versions.

# Build Process

The Dockerfile for the application service begins with the statement `FROM node:18-alpine`, which establishes a lightweight and secure environment for the Node.js runtime. This base image was selected because Alpine Linux significantly reduces image size compared to standard Debian-based distributions, leading to faster deployment times and lower resource consumption on the host machine. The next instruction, `WORKDIR /usr/src/app`, defines the internal directory where all subsequent commands will execute and where the application code will reside. 

To optimize the build through layer caching, the file uses `COPY package*.json ./` followed by `RUN npm install`, which ensures that dependencies are only reinstalled if the package configuration changes. Once the environment is prepared, the command `COPY . .` transfers the entire application source code into the container. The `EXPOSE 3000` line serves as documentation indicating that the container listens for traffic on the specified port, and the build concludes with `CMD ["npm", "start"]`, which designates the primary execution command to launch the server upon container initialization.

# Networking

Networking between the containers is managed through a dedicated Docker bridge network, which facilitates isolated communication between the application and the database. This configuration allows the containers to resolve each other's addresses using internal DNS based on the service names defined in the configuration file. For instance, the application connects to the database using the hostname `db` rather than a static IP address, which ensures portability and resilience even if the internal IP assignments change during a restart. This name-based resolution simplifies the connection string logic and maintains a secure, private channel for data exchange that is not directly exposed to the external internet.
