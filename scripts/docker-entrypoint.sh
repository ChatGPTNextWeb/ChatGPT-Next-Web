#!/bin/sh

if [ -n "$PROXY_URL" ]; then
    export HOSTNAME="127.0.0.1"
    protocol=$(echo $PROXY_URL | cut -d: -f1)
    host=$(echo $PROXY_URL | cut -d/ -f3 | cut -d: -f1)
    port=$(echo $PROXY_URL | cut -d: -f3)
    conf=/etc/proxychains.conf
    echo "strict_chain" > $conf
    echo "proxy_dns" >> $conf
    echo "remote_dns_subnet 224" >> $conf
    echo "tcp_read_time_out 15000" >> $conf
    echo "tcp_connect_time_out 8000" >> $conf
    echo "localnet 127.0.0.0/255.0.0.0" >> $conf
    echo "localnet ::1/128" >> $conf
    echo "[ProxyList]" >> $conf
    echo "$protocol $host $port" >> $conf
    cat /etc/proxychains.conf
    proxychains -f $conf node ./server.js
else
    node ./server.js
fi
