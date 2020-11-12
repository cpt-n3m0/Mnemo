var express = require("express");
var bodyParser= require("body-parser");
var cors = require("cors");
var MongoClient= require("mongodb").MongoClient;
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

	async insert(doc){
		if(this.db){
				this.db.collection("highlights").insertOne(doc)
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
	async remove(uid){
		if(this.db){
			this.db.collection("highlights").remove({"_id" : uid});
		}
		else
			console.error("Database instance not found");
	}
	async getHighlights(url){
		let result;
		console.log(`query url = ${url}`);
		if(this.db){
			 result = await this.db.collection("highlights").find({"url" : url }).toArray();
		}
		else
			console.error("Database instance not found");
		return result;
	}
	async getTopics(){
		let result;
		if(this.db){
			 result = await this.db.collection("highlights").distinct("topic");
			 console.log(result)
		}
		else
			console.error("Database instance not found");
		return result;
	}
	async getAll(){

		let results;
		if(this.db){
			results = await this.db.collection("highlights").find().toArray();
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
	db.insert(req.body);db.collection("highlights").distinct("topic")
});
app.put("/updateHighlight", function(req, res){
	console.log(`update highlight ${req.body._id}`)
	db.update(req.body);

});
app.delete("/removeHighlight/:id", function(req, res){
	console.log(	`removing highlight ${req.params.id}`)
	db.remove(req.params.id);
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
	db.getAll().then(results =>res.send(results))
						 .catch(err => console.error(err, "Unable to fetch highlights"));
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
