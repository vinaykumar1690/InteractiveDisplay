// document.writeln("Hello, world!");
var connection = new autobahn.Connection({
   url: "ws://127.0.0.1:8080/ws",
   realm: "realm1"
});

connection.onopen = function (session, details) {

   console.log("Connected");
   t1 = setInterval(function () {
      session.publish('com.myapp.oncounter', ["hello"]);
      console.log("published to topic 'com.myapp.oncounter'");
   }, 1000);
   
};


connection.onclose = function (reason, details) {
   // handle connection lost
   document.writeln("Failed to connect");
}

connection.open();
