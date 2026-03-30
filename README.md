# Voting app

Still work in progress.

**DOCKERFILE
The first line tells Docker to pull the official Node.js image. It usues Alpine Linux distribution.

Second line creates a directory inside the container and makes it the active working directory. Every commands from now on will be executed from this folder.

Third line copies dependency definitions (packaga.json) into the container. 

Fourth line execute npm installation. --omit=dev excludes dev tools and testing tools. 

Fifth line simply copies the rest of the application.

Sixth line ensure the containers are not run by the root user. This is a security meausure.

Seventh line actually does not expose the port but actually just tells a reader applications is on port 3000.

Last line simply executes and starts the node server.

**NETWORKING
I am using alpine because it is fast and secure. It is fast and also resourcefull meaning it takes less space on host machine. 
When Docker compose is launched a virtual private bridge is set up specifically for that project. Every container in my docker-compose.yml file is attaches to this network. This setup allows my app to communicate with database completely isolated from my primary network. This connection is invisible unless you explicitly map a port (in my case port:3000).
Hardcoding an IP address into my Node.js app to connect a database would breake everytime it is launched. To solve this issue, Docker has a built in DNS server for bridge networks. You just need to name your container in your Compose file and have Node.js point to that hostname. Docker's internal DNS automatically resolves the name with current active IP address. 
