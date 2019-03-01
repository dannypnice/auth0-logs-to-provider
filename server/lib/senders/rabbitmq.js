const config = require('../config');
const logger = require('../logger');

const amqp = require('amqplib');

module.exports = () => {

    let rabbituriconfig = {
        protocol: config('RABBITMQ_URI_PROTOCOL') || 'amqp',
        hostname: config('RABBITMQ_URI_HOSTNAME') || 'localhost',
        port: config('RABBITMQ_URI_PORT') || 5672,
        username: config('RABBITMQ_URI_USER') || 'guest',
        password: config('RABBITMQ_URI_PASSWORD') || 'guest',
        locale: config('RABBITMQ_URI_LOCALE') || 'en_US',
        frameMax: config('RABBITMQ_URI_FRAMEMAX') || 0,
        heartbeat: config('RABBITMQ_URI_HEARTBEAT') || 0,
        vhost: config('RABBITMQ_URI_VHOST') || '/',
    }

    exchange = config('RABBITMQ_URI_EXCHANGE') || 'logging.application.auth0';
    routingkey = config('RABBITMQ_URI_ROUTINGKEY') || '' ;

    let rabbitconnection = amqp.connect(rabbituriconfig);

    return (logs, callback) => {
        if (!logs || !logs.length) {
            return callback();
        }

        logger.info(`Sending ${logs.length} logs to RabbitMQ.`);
        
        rabbitconnection.createChannel().then(function(channel){
        
            var ok = channel.assertExchange(exchange, 'topic', {durable: true});

            return ok.then(function(){
                logs.forEach(log => {
                    channel.publish(exchange,routingkey,Buffer.from(log));                    
                });
            })
        })
        
    };
}