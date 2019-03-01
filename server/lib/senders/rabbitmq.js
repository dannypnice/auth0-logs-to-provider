const config = require('../config');
const logger = require('../logger');

const amqp = require('amqplib');

module.exports = () => {

    let rabbituriconfig = {
        protocol: config('protocol') || 'amqp',
        hostname: config('hostname') || 'localhost',
        port: config('port') || 5672,
        username: config('username') || 'guest',
        password: config('password') || 'guest',
        locale: config('locale') || 'en_US',
        frameMax: config('frameMax') || 0,
        heartbeat: config('heartbeat') || 0,
        vhost: config('vhost') || '/',
    }

    exchange = config('exchange') || 'logging.application.auth0';
    routingkey = config('exchange') || '' ;

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