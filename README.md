# TPLT | Node Server

## Setup

Create .env file matching the .env.example

#### package.json

- update project name
- update project description

#### build.mjs

- update debug statement in define to match project name: 'process.env.DEBUG': JSON.stringify('<project-name>:\*'),

#### Jenkinsfile

- update project name in the build configuration section: $DOCKER_IMAGE:<project-name>

## Creating a Typeorm migration

`npx typeorm migration:create ./src/resources/migrations/<MAJOR VERSION>_<MINOR VERSION>__<MIGRATION NAME>`

## Running the produced docker image on the target machine

- pull the docker image onto the target machine `docker pull <docker hub username>/<docker hub repository>:<project tag>`
- create a .env file which contains the desired environment variables. This just needs to be the directory from which you will run the docker run command, but it makes sense to put it into a project directory.
- run `docker images` to get the image id
- from the same directory as the .env file, run `docker run -d -p <external port>:<internal port> --env-file .env <image id>`
