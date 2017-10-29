var count = 0; 

// sends the json request and gets the information from the response
function getComic() {
var crypto = require('crypto');

var time = new Date().getTime();
// API keys
var publicKey = 'xxxxxxxxxxxxxxxxxxxxxxxxx';
var privateAPI = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

// creating a string with the timestamp and private api key and then creating a hash value 
var timeandAPI = time + privateAPI;
var hash = crypto.createHash('md5').update(timeandAPI).digest('hex');

// array for the title search to start with 
var comicTitle = ['Spider', 'Wolverine', 'Mighty', 'THOR', 'Star', 'DEADPOOL', 'X-MEN', 'DOCTOR', 'INCREDIBLE', 'MARVEL', 'AVENGERS', 'GUARDIANS', 'ROCKET', 'DEFENDERS', 'INDESTRUCTIBLE', 'luke', 'Magneto', 'Rogue', 'Gambit', 'PUNISHER', 'black', 'The', 'cable', 'inhumans', 'Spider-Gwen', 'Generation', 'Spider-Man'];

// random array item
var randomComic = comicTitle[Math.floor(Math.random() * comicTitle.length)];

// request url takes the title and a random comic from the top three titles
const request = require('request')
url = 'https://gateway.marvel.com:443/v1/public/comics?format=comic&hasDigitalIssue=true&titleStartsWith='+ randomComic + '&limit=1&offset='+ Math.floor(Math.random() * 3) + 1 +'&ts=' + time +'&apikey=' + publicKey + '&hash=' + hash

// using request to send the request
request(url, (error, response, body)=> {
  if (!error && response.statusCode === 200) {
    var mResponse = JSON.parse(body)
    
    // converting the resonse to a string
    var sResponce = body.toString()
    
    //  cutting image strings
    var imageurl  = sResponce.indexOf('http://i.annihil.us');
    var newimageurl = sResponce.substr(imageurl);
    newimageurl = newimageurl.substring(0, newimageurl.indexOf('"'));
    newimageurl = newimageurl + '.jpg'; 
          
    // cutting the title of the comic
    var title  = sResponce.indexOf('title":"');
    var title = sResponce.substr(title);
    title = title.substring(0, title.indexOf('",'));
    title = title.replace('title":"','');
    // getting the comics url
    var linkurl  = sResponce.indexOf('http://marvel.com/comics/issue/');
    var linkurl = sResponce.substr(linkurl);
    linkurl = linkurl.substring(0, linkurl.indexOf('?')); 
    // shorting the url for twitter
    var shortUrl = require('node-url-shortener');
    var comic_url = "";
    shortUrl.short(linkurl, function(err, newurl){
        console.log(newurl);
        comic_url = newurl;
    });
 //    console.log(body);
    //downloading the image
    var request = require('request'), 
    fs      = require('fs'),
    url     = url;
    count = count + 1;        
    var w = fs.createWriteStream('downloaded'+ count + '.jpg');

    request(newimageurl).pipe(w);
    // wait for the image to finish downloading before moving on
    // Javascript is asynchronous so this allows for the download to finish first
    w.on('finish', function(){
        console.log('file downloaded to ', 'downloaded'+ count + '.jpg');
        twitter_bot(title, comic_url);
    });
        
  } else {
    console.log("Got an error: ", error, ", status code: ", response.statusCode)
  }

    
})
    } // end of get Comic function



// TWEETER BOT ==========================
function twitter_bot(title, newurl){
var twit = require('twit');
var config = require('./config');
var Twitter = new twit(config);
    
var fs = require('fs');
  console.log('Opening an image...');
  var image_path = 'downloaded'+ count + '.jpg',
      b64content = fs.readFileSync(image_path, { encoding: 'base64' });

  console.log('Uploading an image...');

  Twitter.post('media/upload', { media_data: b64content }, function (err, data, response) {
    if (err){
      console.log('ERROR:');
      console.log(err);
    }
    else{
 
      console.log('Image uploaded!');
      console.log('Now tweeting it...');
       
      Twitter.post('statuses/update', {
          
        media_ids: new Array(data.media_id_string), status: title + '  - ' + newurl
      } ,
        function(err, data, response) {
          if (err){
            console.log('ERROR:');
            console.log(err);
          }
          else{
            console.log('Posted an image!');
          }
        }
      );
    }
  });
}

getComic();
// retweet in every 50 minutes
setInterval(getComic(), 86400000);



function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}
