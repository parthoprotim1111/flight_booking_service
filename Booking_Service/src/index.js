const express = require('express');
const amqplib = require('amqplib')

const { ServerConfig, Queue } = require('./config');
const apiRoutes = require('./routes');

const CRON = require('./utils/common/cron-jobs' )

// async function connectQueue() {
//     try {
//         const connection = await amqplib.connect('amqp://localhost');
//         const channel = await connection.createChannel();
//         await channel.assertQueue('notification-queue');
//         setInterval(() => {
//            channel.sendToQueue("notification-queue", Buffer.from("connecting...")); 
//         }, 1000);
//     } catch (error) {
//         console.log(error);
        
//     }
    
// }


const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // to parse JSON bodies
app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT,async () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    CRON();
    await Queue.connectQueue();
    // await connectQueue();
    console.log("queue connected");


});
