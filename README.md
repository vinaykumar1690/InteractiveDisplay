<h1>Public Displays and Interaction</h1><br>
<h2>18-843 Mobile and Pervasive Computing (Carnegie Mellon University)</h2>
<p>The aim of this project is to explore various game design techniques that will foster interaction among people in different scenarios, such as a cocktail party or an informal networking event. The core idea is a to build a game consists of a question displayed on a large public screen and multiple users playing on mobile device.</p>

<p>To Install and Play this game:</p>
<ol>
<li><p>Install Crossbar from http://crossbar.io/docs/Installation-on-Linux/</p>
	<p>(For Crossbar installation on other operating systems, please see http://crossbar.io/docs/)</p>
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
<li><p>Start the Crossbar router from the root directory</p>
<p>cd InteractiveDisplay/google_places_game_deploy/</p>
<p>crossbar start</p>
<li><p>The Display screen is hosted at, http://localhost:8080/display/index.html</p>
<li><p>The Device screen is hosted at, http://localhost:8080/device/index.html</p>
</ol>
