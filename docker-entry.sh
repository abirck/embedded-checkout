#!/bin/sh
# yarn start
 rsyslogd -n &
 yarn start 2>&1 | logger -t node