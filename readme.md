# Why?

Meteor does not provide an official Dockerfile, so this will try to follow all versions and release them as docker images in an automated way so we can speed up our onbuild Meteor Docker images where we need them and allows for easy multi-stage Dockerfile deployment.

# How?

1. Zapier listens to https://github.com/meteor/meteor/releases.atom RSS Feed
2. If there is a new item Zapier calls a now.sh deployment deployed from this repository.
3. The webservice uses a Github App's private file and accesses pozylon/meteor-docker-auto, replicating Dockerfile-ubuntu.template with the corresponding new version -> VERSION-X/Dockerfile + latest/Dockerfile
4. An automated build configuration on Docker hub picks up the changes in Github and automatically builds the new Meteor version

# Example Dockerfile for Multi-stage-building

```dockerfile
FROM pozylon/meteor-docker-auto as bundler
ADD . /source
WORKDIR /source
RUN meteor npm install && \
  meteor build --server-only --allow-superuser --directory /bundle

FROM node:8-alpine as rebuilder
RUN apk add --no-cache make gcc g++ python sudo
RUN adduser -D -u 501 -h /home/meteor meteor
COPY --from=bundler /bundle /rebuild
WORKDIR /rebuild/bundle/programs/server
RUN npm install && npm run install --production

FROM node:8-alpine as runtime
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
