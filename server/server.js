var express = require("express");
var bodyParser= require("body-parser");
var cors = require("cors");
var {MongoClient, ObjectID} = require("mongodb");
var app = express();




class MongoDB {

	constructor(){
		this.connect();
	}


	async connect(){
		try{
			const client = new MongoClient("mongodb://localhost:27017")
			await client.connect();
			this.db = client.db("mykbits");
		}
		catch(err){
			console.error(err, "MongoDb connection failed");
		}
	}

	async insertHighlight(doc){
		if(this.db){
			this.db.collection("highlights").insertOne(doc).then(()=> {
				this.db.collection("topics").update({_id : doc.topicID}, {
						$push: {
							highlights: {"highlight": doc._id}
						}
				}).catch(err => console.error(err, `could not update topic : ${doc.topicID}`));
			})
			.catch(err => console.error(err, `could not insert ${doc._id}`));
			
		}
	}


	async update(highlight){
		if (this.db){
			this.db.collection("highlights").replaceOne({"_id" :  highlight._id}, highlight)
											.catch(err => console.log(err, `update failed for ${highlight._id}`));
		}
		else
			console.error("Database instance not found");
	}


	async removeHighlight(highlight){
		if(this.db){
			this.db.collection("topic").update({"_id": highlight.topicID}, {
				"$pull": {
					"highlights.highlight" : highlight._id
				}
			}).then(()=> {
				this.db.collection("highlights").remove({"_id" : highlight._id});
			}).catch(err => console.error(err, ` unable to remove highlight ${highlight._id}`));
		}
		else
			console.error("Database instance not found");
	}


	async getHighlights(url){
		let result; console.log(`query url = ${url}`);
		if(this.db){
			 result = await this.db.collection("highlights").find({"url" : url }).toArray();
		}
		else
			console.error("Database instance not found");
		return result;
	}

	async insertTopic(topic){
		if(this.db){
				this.db.collection("topics").insertOne(topic)
				.catch(err => console.error(err, `could not add topic ${topic._id}`));
		}
		else
			console.error("Database instance note found");
	}

	async removeTopic(topicName){
		if(this.db){
			this.db.collection("topics").deleteOne({"_id": topicName}).then(()=> {
				this.db.collection("highlights").deleteMany({"topicID" : topicName});
			}).catch(err => console.error(err, ` unable to remove topic ${topicName}`));
		}
		else
			console.error("Database instance not found");
	}


	async getTopics(){
		let results;
		if(this.db){
			 results = await this.db.collection("topics").find().toArray();
		}
		else
			console.error("Database instance not found");
		return results;
	}


	async getAllHighlights(){

		let results;
		if(this.db){
			results = await this.db.collection("highlights").find().toArray();
		}
		else
			console.error("Database instance not found");
		return results;
	}

	async getTopicHighlights(topicName){
		let results;
		if(this.db){
			results = await this.db.collection("topics").aggregate([{ '$match' : {'_id': topicName}}, {'$lookup': { 'from':'highlights', 'localField': 'highlights.highlight', 'foreignField': '_id', 'as': 'highlights'}}]).toArray();
		}
		else
			console.error("Database instance not found");
		return results;
	}
	
}
var db = new MongoDB();

app.use(cors());
app.use(bodyParser.json());

app.put("/addHighlight", function(req, res){
	console.log(`Adding highlight ${req.body._id}`)
	db.insertHighlight(req.body);
});

app.put("/updateHighlight", function(req, res){
	console.log(`update highlight ${req.body._id}`)
	db.update(req.body);

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

var server = app.listen(8082, function(){

	console.log("request received");
})
