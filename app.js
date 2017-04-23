//如何寫成一個table
const kill = {
  '自殺1': {
    title: '自殺1',
    subtitle: '',
    image_url: "https://en.wikipedia.org/wiki/Space_Needle.jpg",
    item_url: 'http://wwe'
  },
  '自殺2': {
    title: '自殺2',
    subtitle: '',
    image_url: "https://en.wikipedia.org/wiki/Space_Needle.jpg",
    item_url: 'http://222'
  },
  '自殺3': {
    title: '自殺3',
    subtitle: '',
    image_url: "https://en.wikipedia.org/wiki/Space_Needle.jpg",
    item_url: 'http://22233332'
  }
};
const cry = {
  '哭哭1': {
    title: '哭哭',
    subtitle: '',
    image_url: "https://en.wikipedia.org/wiki/Space_Needle.jpg",
    item_url: 'http://wwe'
  },
  '哭哭2': {
    title: '哭哭哭',
    subtitle: '',
    image_url: "https://en.wikipedia.org/wiki/Space_Needle.jpg",
    item_url: 'http://222'
  },
  '哭哭3': {
    title: '哭哭哭哭',
    subtitle: '',
    image_url: "https://en.wikipedia.org/wiki/Space_Needle.jpg",
    item_url: 'http://22233332'
  }
};

const fuck = {
  '分手1': {
    title: '分手快樂',
    subtitle: '',
    image_url: "https://en.wikipedia.org/wiki/Space_Needle.jpg",
    item_url: 'http://wwe'
  },
  '分手2': {
    title: '分手需要練習的',
    subtitle: '',
    image_url: "https://en.wikipedia.org/wiki/Space_Needle.jpg",
    item_url: 'http://222'
  },
  '分手3': {
    title: '我們沒有在一起',
    subtitle: '',
    image_url: "https://en.wikipedia.org/wiki/Space_Needle.jpg",
    item_url: 'http://22233332'
  }
};

const grace = {
  '恩典1': {
    title: '恩典之路',
    subtitle: '',
    image_url: "https://en.wikipedia.org/wiki/Space_Needle.jpg",
    item_url: 'http://wwe'
  },
  '恩典2': {
    title: '恩典之路2',
    subtitle: '',
    image_url: "https://en.wikipedia.org/wiki/Space_Needle.jpg",
    item_url: 'http://222'
  },
  '恩典3': {
    title: '恩典之路3',
    subtitle: '',
    image_url: "https://en.wikipedia.org/wiki/Space_Needle.jpg",
    item_url: 'http://22233332'
  }
};
const DATA = { '殺': kill, '開心': 'happy', '哭': cry, '分手': fuck, '恩典': grace };


var builder = require('botbuilder');
var restify = require('restify');
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
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/01f14fbd-d409-4951-b638-080f5867ec65?subscription-key=93971faefdc84030b897dbdca188cde2&verbose=true&timezoneOffset=0.0&q=';
const YOUTUBE_API = `https://www.youtube.com/results?search_query=`;

var recognizer = new builder.LuisRecognizer(model);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', function (session) {
  session.send("想聽什麼歌呢？ 或者說說現在的心情，推薦幾首好歌給您。");
  session.beginDialog('/moodMusic');
});

bot.dialog('/moodMusic', intents);

intents.matches('點歌', [
  function (session, args, next) {
    console.log(args.entities);
    var task = builder.EntityRecognizer.findEntity(args.entities, '歌曲');
    var singer = builder.EntityRecognizer.findEntity(args.entities, '歌手');
    if (!task) {
      if (singer.entity) {
        builder.Prompts.text(session, '想聽' + singer.entity.toString() + '的什麼歌呢?');
        //缺傳入歌手
      } else {
        builder.Prompts.text(session, "什麼歌名呢?");
      }
    } else {
      if (!singer) {
        next({ response: task.entity });//代替user的回應
      } else {
        next({ response: task.entity, response2: singer.entity });//代替user的回應
      }
    }
  },
  function (session, results) {
    console.log('！！！！session: %j,results : %j', session, results);
    if (results.response) {
      // ... save task
      const youtubeUrl = `${YOUTUBE_API}${encodeURIComponent(results.response)}`;
      console.log(youtubeUrl);
      request({ uri: youtubeUrl }, function (error, response, body) {

        console.log('body:', body);
        const $ = cheerio.load(body);
        const href = $('.yt-lockup-title > a').attr('href');
        const img_href = $('.yt-thumb-simple > img').attr('src');
        const videoHref = `https://www.youtube.com${href}`;
        console.log('href', videoHref);
        msg = new builder.Message(session);
        msg.attachments([{
          contentType: "image/jpeg",
          contentUrl: img_href
        }]);

        session.send(msg);
        session.send(`[${videoHref}](${videoHref})`);
        //console.log('error2:', error2); // Print the error if one occurred
      });
      session.send('好喔~ "%s"的連結跟縮圖來囉！', results.response);
    } else {
      session.send("oops!");//error handling
    }
  }
]);
let matchProp = '';

intents.matches('心情', [
  function (session) {
    if (session.message.text) {
      // ... save task
      let isMatch = false;
      Object.keys(DATA).forEach((prop) => {
        if (isMatch) {
          return;
        }
        isMatch = session.message.text.indexOf(prop) >= 0;
        if (isMatch) {
          matchProp = prop;
        } else {
          matchProp = '恩典';
        }
      })
      console.log('matchProp: ', DATA[matchProp]);
      builder.Prompts.choice(session, "Ok... play the", DATA[matchProp]);
    } else {
      session.send("Ok");
    }
  },
  function (session, results) {

    if (results.response) {
      var mood = DATA[matchProp][results.response.entity];
      console.log('moooooooood        ', mood.title);
      msg = new builder.Message(session);
      msg.sourceEvent({
        facebook: {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: [{
                title: 'ddd',
                subtitle: "context",
                image_url: "https://en.wikipedia.org/wiki/Space_Needle.jpg",
                item_url: "http://m.me",
                buttons: [{
                  type: "element_share"
                }]
              }]
            }
          }
        }
      });
      if (session.message.source == 'facebook') {
        session.endDialog(msg);
      } else {
        msg.attachments([{
          contentType: "image/jpeg",
          contentUrl: "http://www.theoldrobots.com/images62/Bender-18.JPG"
        }]);
        session.send(msg);
        session.endDialog("%(image_url)s", mood);
      }

    } else {
      session.send("ok");
    }
  }

]);

intents.onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."));