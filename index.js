const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://mqtt');
const Influx = require('influxdb-nodejs');

const influxdb_host = 'influxdb';
const influxdb_database = 'measurements';
const influxClient = new Influx(`http://${influxdb_host}:8086/${influxdb_database}`);

let sensorConfig = {
  147: 'kitchen',
  175: 'garage',
  206: 'outside-front'
}

let lastReportTime = {};

Object.keys(sensorConfig).forEach(key => {
  lastReportTime[key] = new Date(0);
});

console.log("Connecting to mqtt...");

client.on('connect', function () {
  client.subscribe('#', function (err) {
    if (err) {
      console.log("Error connecting to MQTT", err);
    } else {
      console.log("... connected!");
    }
  })
});

client.on('message', (topic, message) => {
  if (!topic.endsWith('events')) {
    return;
  }
  let stringBuf = message && message.toString('utf-8')
  let tempReport = JSON.parse(stringBuf);

  // Is the sensor known?
  if (!sensorConfig.hasOwnProperty(tempReport.id)) {
    return;
  }

  let sensor = sensorConfig[tempReport.id];
  let now = new Date();

  // If less than ten seconds since last report, ignore
  if (now.getTime() - lastReportTime[tempReport.id].getTime() < 10000) {
    return;
  }

  lastReportTime[tempReport.id] = now;

  console.log(`${sensor}: ${tempReport.temperature_C}`);
  
  influxClient.write(influxdb_database)
    .tag({
      sensor: sensor
    })
    .field({
      temperature: tempReport.temperature_C,
      humidity: tempReport.humidity
    })
    .then()
    .catch(console.error);
});
