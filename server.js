const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // The JSON file is in the same directory

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://parkwise-18-default-rtdb.firebaseio.com" // Updated Firebase database URL
});

const db = admin.database();

// Initialize SerialPort with your Arduino connection
const port = new SerialPort('/dev/cu.usbmodem11201', { baudRate: 9600 }); // Updated serial port
const parser = port.pipe(new Readline({ delimiter: '\n' }));

parser.on('data', (data) => {
  console.log(Sensor Value: ${data});
  const ref = db.ref('sensors');
  ref.push({ value: data, timestamp: Date.now() });

  io.emit('sensorData', data);
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(3001, () => {
  console.log('Listening on port 3001');
});
