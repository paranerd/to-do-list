const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 8084;
const router = express.Router();

router.get('*', function(req, res) {
	res.sendFile('index.html', { root: __dirname + '/dist/to-do' });
});

app.use(express.static(__dirname + '/dist/to-do'));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

app.use('/', router);

app.listen(port, function() {
	console.log("Listening on port: " + port);
});
