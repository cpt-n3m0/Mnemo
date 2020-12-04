var express = require("express");
var https = require('https');
var bodyParser= require("body-parser");
var cors = require("cors");
var tagger = require("./tagger");
var MongoDB = require("./mongo");
var anki = require("./anki")
var app = express();





var db = new MongoDB();


app.use(cors());
app.use(bodyParser.json());
app.use("/addHighlight", tagger.tag);

app.put("/addHighlight", function(req, res){
	console.log(`Adding highlight ${req.body._id}`)
	db.insertHighlight(req.body).then(() => res.send("success"));

});

app.put("/updateHighlight", function(req, res){
	console.log(`update highlight ${req.body._id}`)
	console.log(req.body.oldTopic);
	db.updateHighlight(req.body);

});

app.put("/removeHighlight", function(req, res){
	console.log(	`removing highlight ${req.body._id}`);
	db.removeHighlight(req.body);
});

app.get("/getHighlights/:url/", function(req, res){
	console.log(`Getting highlights for  ${req.params.url}`);
	try {
		db.getHighlights(req.params.url.replace("url=", "")).then(results =>{
			console.log(`found ${results.length}`);
			res.send(results);
		})
		.catch(err => console.error(err, "Unable to fetch url highlights"));
	}
	catch(err){
		console.error(err);
	}
});

app.get("/getAllHighlights", function(req, res){
	console.log(`All highlights request`);
	db.getAllHighlights().then(results =>res.send(results))
						 .catch(err => console.error(err, "Unable to fetch highlights"));
});

app.get("/getTopicHighlights/:topic", function(req, res){
	console.log(`highlight request for topic : ${req.params.topic}`);
	db.getTopicHighlights(req.params.topic).then(results =>
		{
			res.send(results[0].highlights);
		})
	.catch(err => console.error(err, `Unable to fetch topic highlights for : ${req.params.topic}`));
});

app.put("/addTopic", function(req, res){
	console.log(`Adding topic: ${req.body._id}`);
	db.insertTopic(req.body).catch(err => console.error(err, ` Unable to add topic : ${req.body._id}` ));
});

app.delete("/removeTopic/:id", function(req, res){
	console.log(`removing topic: ${req.params.id}`);
	db.removeTopic(req.params.id).catch(err => console.error(err, ` Unable to remove topic : ${req.body._id}` ));
});


app.get("/getTopics", function(req, res){
	console.log(`Topics request`);
	db.getTopics().then(results =>{
			res.send(results);
	})
	.catch(err => console.error(err, "Unable to fetch Topics"));
});

app.post("/addAnkiNote", function(req, res) {
    console.log("Add Anki note request");
    anki.addNote(req.body).then(() => {
        db.ankify(req.body).then(() => res.send("success"));
    })
    .then(() => anki.sync())
    .catch(err => console.error(err, " : ankifying failed"));
});

var server = app.listen(8082, function(){

	console.log("request received");
})
