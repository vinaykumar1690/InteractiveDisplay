
var connection = new autobahn.Connection({
   url: "ws://127.0.0.1:8080/ws",
   realm: "realm1"
});

connection.onopen = function (session, details) {
   
   console.log("Connected");

   var onCounter = function(args) {
      console.log('new message: ', args[0]);
   }

   session.subscribe("com.myapp.oncounter", onCounter).then(
      function (sub) {
         console.log('subscribed to topic');
      },
      function (err) {
         console.log('failed to subscribe to topic', err);
      }
   );
}


connection.onclose = function (reason, details) {
   // handle connection lost
   console.log("Failed to connect");
}

connection.open();
