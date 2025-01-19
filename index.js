require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.DB_URL);
const db = client.db('urls');
const urls = db.collection('webs');
const dns = require('dns');
const urlparser = require('url')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function (req, res) {
  let inputUrl = req.body.url;
  const dnslookup = dns.lookup(urlparser.parse(inputUrl).hostname, async(err, address)=> {
    if(!address){
      res.json({ error: 'invalid url' })
    }else{
       const urlCount = await urls.countDocuments();
       const urlObj = {
        original_url: inputUrl,
        short_url: urlCount 
       }
       
       const insert_result = await urls.insertOne(urlObj);
       
      res.json({ original_url: inputUrl, short_url: urlCount})
    }
  })

});

app.get('/api/shorturl/:shortUrl', async (req,res) => {
  const reqUrl = req.params.shortUrl;
  const urlObj = await urls.findOne({ short_url: +reqUrl })
  res.redirect(urlObj.original_url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
