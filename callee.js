// document.writeln("Hello, world!");
var connection = new autobahn.Connection({
   url: "ws://127.0.0.1:8080/ws",
   realm: "realm1"
});

connection.onopen = function (session, details) {
   
   var add2 = function(args) {
      console.log("called");
      return args[0] + args[1];
   };

   //mpc: mobile & pervasive computing
   //ipd: interactive public display
   session.register('com.myapp.add2', add2).then(
      function (reg) {
         console.log('procedure registered');
      },
      function (err) {
         console.log('failed to register procedure', err);
      }
   );
};


connection.onclose = function (reason, details) {
   // handle connection lost
   document.writeln("Failed to connect");
}

connection.open();
