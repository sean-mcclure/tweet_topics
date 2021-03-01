var express = require("express");
var app = express();
var router = express.Router();
var cors = require('cors')

app.use(cors())

require("./main.js")

const port = 8000;

router.get('/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    incoming_text = req.query.text;
    results = utility.pipeline(incoming_text, thesaurus)

    res.json({
        "response": results.toString('utf8')
    })

})

app.use('/api', router);
app.listen(port);
console.log('Running API on port: ' + port)