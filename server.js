const express = require('express');
const bodyParser= require('body-parser');
const MongoClient = require('mongodb').MongoClient
const spotify = require('./spotify');
const dotenv = require("dotenv");

const app = express();
dotenv.config();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use(bodyParser.json({ type: 'application/*+json' }));
app.use(express.static('public'));

const uri = 'mongodb+srv://' + process.env.DB_USERNAME +':'+process.env.DB_PASSWORD+'@cluster0.bapzq.mongodb.net/<dbname>?retryWrites=true&w=majority';
console.log(uri);
let tagsCollection = null;

app.get('/browse', async (req, res) => { 
    res.render('browse.ejs', {browse: {}});
});

app.post('/browse', async (req, res) => { 
  let key = req.body.searchKey;
  let type = req.body['choices-single-defaul'];
  if (tagsCollection) {
    tagsCollection.find().toArray()
    .then(async(tags) => {
      
      var spotifyResponse = await spotify(key, type);
      const items = spotifyResponse.map(d => ({
        id : d.id,
        name: d.name,
        artists: d.artists,
        tags: tags.find(tag => 
          tag.spotify_id === d.id
        ),
        cover_art: d.album.images
      }));
      // console.log(spotifyResponse);
      res.render('browse.ejs', {browse: items});
      
    }).catch((err) => {
      console.log("couldn't load browse");
      console.log(err);
      res.render('browse.ejs', {browse: {}});

    }); 
  } else {
    console.log("no tags to display");
    var spotifyResponse = await spotify(key, type);
    res.render('index.ejs', {browse: spotifyResponse});
  }
});


app.put('/submit-form', (req, res) => {
  console.log(req.body);
  if (tagsCollection) {
    tagsCollection.findOneAndUpdate(
      { spotify_id: req.body.spotify_id },
    {
      $push: {
        tag: req.body.tag
      }
    },
    {
      upsert: true,
      returnOriginal: false
    }).then(result => {
        res.json({
          error: false,
          tags: result.value.tag
        });
        }).catch(error => {
        res.json({
          error: true
        });
      });
  
  } else {
    res.render('index.ejs', {});

  }
  
});

MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database');
    const db = client.db('app');
    tagsCollection = db.collection('tags');
    // console.log(tagsCollection);
    app.get('/', async (req, res) => {
      res.render('index.ejs', {});
    });
    
    // tagsCollection.insertOne(req.body)
  //     .then(result => {
  //         console.log(result);
  //         res.redirect('/');
  //     })
  //     .catch(error => console.error(error));
    app.put('/tags', (req, res) => {
        tagsCollection.findOneAndUpdate(/* ... */)
          .then(result => {
             res.json('Success');
           })
          .catch(error => console.error(error));
      });
}).catch((err) => {
  console.log("couldn't connect to mongo");
  console.log(err);
});



app.listen(3000, function() {
    console.log('listening on 3000');
});

