# Why?

Meteor does not provide an official Dockerfile, so this app will try to follow all versions and release them as docker images in an automated way so we can speed up our onbuild Meteor Docker images where we need them and allows for easy multi-stage Dockerfile deployment.

# How does this all work?

1. The node app in this repository is deployed to Zeit's Now Platform with credentials for Github and Docker Hub
1. A Zapier app listens to the https://github.com/meteor/meteor/releases.atom RSS Feed and if there is a new item in the feed (Meteor version), it invokes a call to the node app with the new version number as argument.
3. The webapp uses a Github App's private file and accesses pozylon/meteor-docker-auto, replicating Dockerfile-ubuntu.template with the corresponding new version -> VERSION-X/Dockerfile + latest/Dockerfile and push the changes back to Github, auto updating itself.
4. At the end the webapp starts the build triggers for the automated build configuration on Docker hub and new docker build tags for the docker image "pozylon/meteor-docker-auto" are created

# How can I use the ``pozylon/meteor-docker-auto`` image?

There is multiple ways how you can use this meteor docker image but basically you
have to add a file named ``Dockerfile`` to the root of your app and run ``docker build .``
Here are some examples of Dockerfiles that you could use:

**Simple Image for development**

```dockerfile
FROM pozylon/meteor-docker-auto as bundler
RUN adduser -D -u 501 -h /home/meteor meteor
ADD . /source
WORKDIR /source
USER meteor
RUN meteor npm install
CMD meteor --no-release-check 
```

**Multi-stage-building of Alpine Production Image of your Meteor app**

```dockerfile
FROM pozylon/meteor-docker-auto as bundler
ADD . /source
WORKDIR /source
RUN meteor npm install && \
  meteor build --server-only --allow-superuser --directory /bundle

FROM node:12-alpine as rebuilder
RUN apk add --no-cache make gcc g++ python sudo
RUN adduser -D -u 501 -h /home/meteor meteor
COPY --from=bundler /bundle /rebuild
WORKDIR /rebuild/bundle/programs/server
RUN npm install && npm run install --production

FROM node:12-alpine as runtime
RUN adduser -D -u 501 -h /home/meteor meteor
COPY --from=rebuilder /rebuild/bundle /webapp
WORKDIR /webapp
ENV PORT 3000
ENV NODE_ENV production
EXPOSE 3000
USER meteor
CMD node main.js
```

# Add secrets to the now config
now secrets add access-token "XXX"
now secrets add github-key "$(cat ./key.pem | base64)"
