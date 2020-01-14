var AWS = require('aws-sdk');

module.exports = function(RED) {
    
    function UpdateRoute53(config) {
        RED.nodes.createNode(this,config);

        var accesskey = this.credentials.accesskey;
    	var accesssecret = this.credentials.accesssecret;
        var hostname = config.hostname;
	var zoneID = config.zoneid;

        var node = this;

        node.on('input', function(msg, send, done) {

	    this.status({});
		
	    var client = new AWS.Route53({
	    	'version': 'latest',
		 'region': 'us-east-1',
		 'accessKeyId': accesskey,
		 'secretAccessKey': accesssecret
	    }); 
		
	    var ip = msg.payload.ip || msg.payload;

            var params = {
 	 	ChangeBatch: {
   			Changes: [
      				{
     				Action: "UPSERT", 
     				ResourceRecordSet: {
      					Name: hostname, 
      					ResourceRecords: [
         					{
        					Value: ip
       						}
      					], 
      					TTL: 10, 
      					Type: "A"
     					}
    				}
   			], 
   			Comment: "Dynamic DNS Update"
  			}, 
 	 	HostedZoneId: zoneID
 		};

	    client.changeResourceRecordSets(params, function(err, data) {
   		if (err) {
			done(err);
		} else {
			var result = { 'payload': data};
			send(result);
			
			node.status({fill:"green",shape:"dot",text: ip});
			
			done();
		}
	    });

        });
    }

    RED.nodes.registerType("route53", UpdateRoute53, {
    	 credentials: {
         	accesskey: {type: "text"},
         	accesssecret: {type: "password"}
     	}
    });
}
