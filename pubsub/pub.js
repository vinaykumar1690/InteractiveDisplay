// document.writeln("Hello, world!");
var connection = new autobahn.Connection({
   url: "ws://127.0.0.1:8080/ws",
   realm: "realm1"
});

var counter = 0;

var pub = (function() {
      
      var count = 0;
      
      return function(x) {
         x.publish('com.myapp.oncounter', [count]);
         count++;
      }

      })();
      
connection.onopen = function (session, details) {

   console.log("Connected");

   // var counter = (function () {
   //    var value = 0;

   //    return {
   //       increment: function(inc) {
   //          value += typeof inc === 'number' ? inc : 1;
   //       },
   //       getValue : function() {
   //          return value;
   //       }
   //    }
   // }());
   

   /*
   t1 = setInterval(function () {
      session.publish('com.myapp.oncounter', [counter]);
      console.log("published to topic 'com.myapp.oncounter'");
      ++counter;
   }, 1000);
   */


   t1 = setInterval(function () {
         pub(session);
   }, 1000);

};


connection.onclose = function (reason, details) {
   // handle connection lost
   document.writeln("Failed to connect");
}

connection.open();
