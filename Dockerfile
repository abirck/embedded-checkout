FROM node:20-alpine
WORKDIR /app
COPY . .
RUN apk update \
  && apk add --no-cache rsyslog \
  && echo "\$ActionForwardDefaultTemplate RSYSLOG_SyslogProtocol23Format" >> /etc/rsyslog.conf \
  && echo "*.* @@andrew.andrewbirck.com:5044" >> /etc/rsyslog.conf \
  && yarn install \
  && yarn build

EXPOSE 3000
EXPOSE 80

# TODO: Something to remove dev dependencies?
COPY docker-entry.sh .
CMD ["/bin/sh","-c","./docker-entry.sh"]
