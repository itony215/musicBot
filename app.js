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
    subtitle: '我的心情現在適合這首歌',
    image_url: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTKqtJAouJ7Ys3qt2gfM_DH21_O18lWnKgbt47Ve0NtUhGUK2zh",
    item_url: 'https://www.youtube.com/watch?v=0Q444bzsehU'
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
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/01f14fbd-d409-4951-b638-080f5867ec65?subscription-key=93971faefdc84030b897dbdca188cde2&verbose=true&timezoneOffset=0.0&q=';
const YOUTUBE_API = `https://www.youtube.com/results?search_query=`;

var recognizer = new builder.LuisRecognizer(model);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', function (session) {
  session.send("分享好音樂，想點什麼歌呢？ 或者說說現在的心情，推薦幾首好歌給您。");
  session.beginDialog('/moodMusic');
});

bot.dialog('/moodMusic', intents);

intents.matches('點歌', [
  function (session, args, next) {
    var task = builder.EntityRecognizer.findEntity(args.entities, '歌曲');
    var singer = builder.EntityRecognizer.findEntity(args.entities, '歌手');
    if (!task) {
      if (singer.entity) {
        builder.Prompts.text(session, '想聽' + singer.entity.toString() + '的什麼歌呢?');
      } else {
        builder.Prompts.text(session, "什麼歌名呢?");
      }
    } else {
      if (!singer) {
        next({ response: task.entity });
      } else {
        next({ response: task.entity, response2: singer.entity });
      }
    }
  },
  function (session, results) {
    if (results.response) {
      const youtubeUrl = `${YOUTUBE_API}${encodeURIComponent(results.response)}`;
      request({ uri: youtubeUrl }, function (error, response, body) {
        const $ = cheerio.load(body);
        const href = $('.yt-lockup-title > a').attr('href');
        const img_href = $('.yt-thumb-simple > img').attr('src');
        const videoHref = `https://www.youtube.com${href}`;
        msg = new builder.Message(session);
        msg.attachments([{
          contentType: "image/jpeg",
          contentUrl: img_href
        }]);
        session.send(msg);
        session.send(`[${videoHref}](${videoHref})`);
      });
      session.send('好喔~ "%s"的連結跟預覽圖來囉！', results.response);
    } else {
      session.send("oops!");//error handling
    }
  }
]);
let matchProp = '';

intents.matches('心情', [
  function (session) {
    if (session.message.text) {
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
      builder.Prompts.choice(session, "我能理解你的心情，推薦三首好歌給您選擇唷！", DATA[matchProp]);
    } else {
      session.send("Ok");
    }
  },
  function (session, results) {

    if (results.response) {
      var mood = DATA[matchProp][results.response.entity];
      msg = new builder.Message(session);
      msg.sourceEvent({
        facebook: {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: [{
                title: mood.title,
                subtitle: mood.subtitle,
                image_url: mood.image_url,
                item_url: mood.item_url,
                buttons: [{
                  type: "element_share"
                }]
              }]
            }
          }
        }
      });
      if (session.message.source == 'facebook') {
        session.send(msg);
      } else {
        msg.attachments([{
          contentType: "image/jpeg",
          contentUrl: mood.image_url
        }]);
        session.send(msg);
        session.send("%(item_url)s", mood);
      }

    } else {
      session.send("ok");
    }
  }

]);

intents.onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."));