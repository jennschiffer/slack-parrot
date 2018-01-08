//
// This code is where the magic you create happens!
// Go to line 22 to start!
//

'use strict';

const ts = require('./tinyspeck.js');
const axios = require('axios');
const datastore = require('./datastore.js').data;
let connected = false;

getConnected() // Check we have a database connection
  .then(function(){
    let slack = ts.instance({});

    // listen for a message
    slack.on('message', 'message.im', payload => {  
      datastore.get(payload.team_id) // Grab the team's token
        .then(function(value){
          /************************************************************
          * OK SO LISTEN UP!! This is where the "fun" starts
          **************************************************************/
        
          // 1. create a slack instance for our bot
          let parrotBot = slack.instance({ token: value });
        
          // 2. create our parroted message. In this app, we're just sending the `payload.event.text` 
          // of the last message. You may want to do something to the text and *then* send it. That's cool, have fun!
          const parrotMessageText = payload.event.text;
        
          // 3. generate the postmessage object - you probably don't want to edit this, but you can 
          // read these docs to see what else you can send: https://api.slack.com/methods/chat.postMessage :)
          const parrotMessage = {
            token: value,
            channel: payload.event.channel,
            text: parrotMessageText,
          }      
          
          // 4. send the postmessage object - UNLESS the message came from a bot!
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
        
          /******************************************************************
          * THAT'S ALL! You probably don't want to edit anything after this
          *******************************************************************/
    
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