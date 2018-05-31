var request = require('request');
var node_ttl = require( "node-ttl" );
var mqtt_priv_options = require('./private/mqtt_options.js');
var market_priv_options = require('./private/market_options.js');
var topic_priv_options = require('./private/topic_options.js');

var notified = new node_ttl({
        ttl: 1795,
        checkPeriode: 1800});

var request_options = {
    url: market_priv_options.markets,
    method: 'GET'
};

var mqtt = require('mqtt');
var mqtt_options = {
    port: 1883,
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: mqtt_priv_options.username,
    password: mqtt_priv_options.password,
    keepalive: 60,
    reconnectPeriod: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8'
};
var client = mqtt.connect(mqtt_priv_options.url, mqtt_options);

client.on('connect', function() { 
// When connected
    console.log('connected');
// Start the request
var market = function () {request(request_options, function (error, response, body) {
  if (!error && response.statusCode == 200) {
        var coins = JSON.parse(body);
        coins.forEach(parse);
	} else {console.log(error)};
})};


function parse(coin){
	var key = Object.keys(coin)[0];
        // bid section
        var new_bid = parseFloat(coin[key].bid) + 0.00000001;
        var inv_bid = 1/new_bid;
        var fee_bid = 1/new_bid * 0.2 / 100;
        var fin_bid = inv_bid - fee_bid;

        //ask section
        var new_ask = parseFloat(coin[key].ask) - 0.00000001;
        var fee_ask = new_ask * 0.2 / 100;
        var fin_ask = new_ask - fee_ask;
        var bit_ask = ((fin_ask * fin_bid  - 1 ) * 100).toFixed(2);
	
	if (bit_ask > 100) {
		if (!notified.get(key)) {
			client.publish(topic_priv_options.extras, key + ' ' + bit_ask, function() {});
			notified.push(key, bit_ask);
			}
		}

}

function myMarket() {
	market();
	setTimeout(myMarket, 5000);
}

myMarket();
});
