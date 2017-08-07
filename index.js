//
// This implements most of the app code and implements code that sets up 
// event handling for when the 'link_shared' event is activated.
//

'use strict';

const ts = require('./tinyspeck.js');
const axios = require('axios');
const datastore = require('./datastore.js').data;
const glitchEndpoint = 'https://api.glitch.com/projects/';

// some link and style defaults
const thumb_url = 'https://gomix.com/slack-icon.png';
const color = '#ff00ff';

let connected = false;
getConnected() // Check we have a database connection
  .then(function(){
    let slack = ts.instance({});

    // listen for a message
    slack.on('message', payload => {  
      datastore.get(payload.team_id) // Grab the team's token
        .then(function(value){
          // create a slack instance for our bot
          let parrotBot = slack.instance({ token: value });
        
          /*
          * OK SO LISTEN UP!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
          */
          
          // Here is where we create our parroted message. In this app, we're just sending the `payload.event.text` 
          // of the last message. You may want to do something to the text and *then* send it. That's cool, have fun!
          const parrotMessageText = payload.event.text;
        
          // you probably don't want to edit this, but you can read these docs to see what else you can send:
          // https://api.slack.com/methods/chat.postMessage :)
          const parrotMessage = {
            token: value,
            channel: payload.event.channel,
            text: parrotMessageText,
          }
          
          
          // this section will send the message generated above!
          if ( !payload.event.bot_id ) {
             parrotBot.send('chat.postMessage', parrotMessage).then(res => {
              // success, message sent!
              console.log('Message parroted!', res.data);
            }, error => {
              // on failure
              console.log('An error occurred when parroting message: ' + error);
            });
          } else {
            // don't parrot a bot or it may parrot itself into infinity and beyond!
            console.log('last message was from a bot :)');
          }
    
        });
     });
    // incoming http requests
    slack.listen('3000');

});

function getConnected() {
  return new Promise(function (resolving) {
    if(!connected){
      connected = datastore.connect().then(function(){
        resolving();
      });
    } else {
      resolving();
    }
  });
}