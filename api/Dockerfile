# Use Node
FROM node:16

# Set the working directory to /api
WORKDIR /api

# copy package.json into the container at /api
COPY package*.json /api/

# generated prisma files
COPY prisma ./prisma/

# COPY ENV variable
COPY .env ./

# Copy the current directory contents into the container at /api
COPY . /api/

RUN npm install -g npm@8.1.3
RUN npm install -g nodemon

RUN npm install

RUN npx prisma generate

# Run the app when the container launches
CMD ["yarn", "start"]