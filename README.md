<h1>Public Displays and Interaction</h1><br>
<h2>18-843 Mobile and Pervasive Computing (Carnegie Mellon University)</h2>
<p>This project aims to explore various game design techniques that will foster interaction among people 
in a scenario like a cocktail party or an informal networking event. The core idea is a game where the major elements 
including the question is displayed on a large public screen and users play using a mobile device.</p>

<p>To Install and Play this game:</p>
<ol>
<li><p>Install Crossbar from http://crossbar.io/docs/Installation-on-Linux/</p>
<li><p>Install Node.js</p>
<p>curl -sL https://deb.nodesource.com/setup | sudo bash -</p>
<p>sudo apt-get install nodejs</p>
<p>sudo apt-get install build-essential</p>
<li><p>Install CouchDb</p>
<p>sudo apt-get install couchdb</p>
<li><p>Clone this repository</p>
<li><p>Install autobahn and when modules</p>
<p>Browse to InteractiveDisplay/google_places_game_deploy/</p>
<p>npm install autobahn</p>
<p>npm link autobahn</p>
<p>npm install when</p>
<li><p>Replace the autobahn connection URL to 'ws://localhost:8080/ws' in the following files</p>
<p>InteractiveDisplay/google_places_game_deploy/web/display/js/frontend.js</p>
<p>InteractiveDisplay/google_places_game_deploy/web/device/js/device.js</p>
<p>InteractiveDisplay/google_places_game_deploy/node/backend.js</p>
<p>InteractiveDisplay/google_places_game_deploy/node/createUserClient.js</p>
<li><p>Start the Crossbar router from the root directory</p>
<p>cd InteractiveDisplay/google_places_game_deploy/</p>
<p>crossbar start</p>
<li><p>The Display screen is hosted at, http://localhost:8080/display/index.html</p>
<li><p>The Device screen is hosted at, http://localhost:8080/device/index.html</p>
</ol>
