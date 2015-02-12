// document.writeln("Hello, world!");

var connection = new autobahn.Connection({
   url: "ws://127.0.0.1:8080/ws",
   realm: "realm1"
});

connection.onopen = function (session, details) 
{
   console.log("Connected in realm[" + session.realm + "]");
   
   console.log("Calling RPC");
   
   session.call('com.myapp.add2', [3, 18]).then(
      function (res) {
         console.log("add2() result:", res);
      }
   );
};


connection.onclose = function (reason, details) {
   // handle connection lost
   document.writeln("Failed to connect");
}

connection.open();
