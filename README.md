# rtl_433_filter

Reads a stream of temperature/humidity readings from MQTT. Removes duplicates (the sensors typically sends 10 readings in a row) and pushes the values to InfluxDB. 

Start rtl_433 scanner as a service:

```
# /etc/systemd/system/rtl433.service
[Unit]
Description=rtl_433 sensor reader
Requires=
After=

[Service]
Restart=always

ExecStart=/usr/local/bin/rtl_433 -F "mqtt://localhost:1883,retain=1,events"

[Install]
WantedBy=multi-user.target
```

Enable the service:
```
systemctl enable rtl433.service
```

Build this docker image:
```
docker build -t emilb/sensorfilter:1 .
```
