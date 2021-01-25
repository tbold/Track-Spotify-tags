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

app.use(express.static('public'));

const uri = 'mongodb+srv://' + process.env.DB_USERNAME +':'+process.env.DB_PASSWORD+'@cluster0.bapzq.mongodb.net/<dbname>?retryWrites=true&w=majority';
console.log(uri);
let tagsCollection = null;

app.get('/browse', async (req, res) => { 
    res.render('browse.ejs', {browse: {}});
});
app.get('/browseTag', async (req, res) => { 
  res.render('browseTag.ejs', {key: {}});
});

app.post('/browse', async (req, res) => { 
  let key = req.body.searchKey;
  let type = req.body['choices-single-defaul'];
  if (tagsCollection && type == "Tracks") {
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
  } else if (tagsCollection && type == "Tags") {
    // return collection with at least 1 matching tag
    tagsCollection.find({"tag": key}).toArray()
    .then(async(tags) => {
      const getTracksByTag = (tags) => {
        const promises = tags.map((track) => {
          return Promise.all(track.tag.map(async (t) => {
            return {
              id: track.spotify_id,
              tag: t,
              track: await spotify(track.spotify_id, type)
            }
          }))
        });
        return Promise.all(promises);
      }
      let items = await getTracksByTag(tags);
      console.log(items);
      // res.render('browseTags.ejs', {browse: items});

    }).catch((err) => {
      console.log("couldn't load browse");
      console.log(err);
      res.render('browse.ejs', {browse: {}});

    }); 
  } else {
    console.log("no tags to display");
    res.render('index.ejs', {browse: {}});
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

app.delete('/delete-tag', (req, res) => {
  if (tagsCollection) {
    tagsCollection.updateOne(
      { spotify_id: req.body.spotify_id },
      { $pull: { 'tag': req.body.tag } 
    },
    ).then(tagsCollection.deleteOne({"$and": [{spotify_id: req.body.spotify_id}, { tags: { $exists: true, $size: 0 }}]}))
    .then(result => {
      res.json({
          error: false
        });
        }).catch(error => {
        res.json({
          error: true
        });
      });
  
  } else {
    console.log("no tags in database");
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

