//給連結意願低 給圖
//https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/1f85c73e-d39f-4719-bda5-889f4e4afd5f?subscription-key=a755d82f005e4d54bf63a14565213823&timezoneOffset=0.0&verbose=true&q=我要聽周杰倫的安靜
//const { API_KEY } = require('./config');
const API_URL = `https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/1f85c73e-d39f-4719-bda5-889f4e4afd5f?subscription-key=a755d82f005e4d54bf63a14565213823&timezoneOffset=0.0&verbose=true&q=`;
const YOUTUBE_API = `https://www.youtube.com/results?search_query=`;
var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var cheerio = require('cheerio');
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
  appId: process.env.BOTFRAMEWORK_APPID,
  appPassword: process.env.BOTFRAMEWORK_APPSECRET
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/',
  [function(session)
  {
      session.send("Hi,I am bot ~");
      builder.Prompts.text(session,'What\'s your name ?');
  },
  function(session,result)
  {
    const queryUrl = `${API_URL}${encodeURIComponent(result.response)}`;
    console.warn('queryUrl', queryUrl);
    /*request.get(queryUrl).on('response', (response) => {
      console.warn('response', response.toJSON());
      if (response) {
        session.send('is you? Clay');
      }
    });*/
    request({ uri: queryUrl, encoding: null,}, function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      if ( response.statusCode === 200) {
        body = JSON.parse(body);
        console.log('body:', body); // Print the HTML for the Google homepage.*/
        const { intent } = body.topScoringIntent;
        if (intent === 'None') {
          session.send('I don\'t understand');
        } else {
          session.send(intent)
          console.warn('result.response', result.response);
          const youtubeUrl = `${YOUTUBE_API}${encodeURIComponent(result.response)}`;
          console.log(youtubeUrl);
          request({uri: youtubeUrl},function(error2, response2, body2){
            
            console.log('body2:', body2);
            const $ = cheerio.load(body2);
            const href = $('.yt-lockup-title > a').attr('href');
            const videoHref = `https://www.youtube.com.tw${href}`;
            console.log('href', videoHref);
            session.send(`[${videoHref}](${videoHref})`);
            //console.log('error2:', error2); // Print the error if one occurred
          });
        }
      } else {
        session.send('oops');
      }
     
    });
  }]
);