var express = require("express");
var bodyParser= require("body-parser");
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
			try {

				await this.db.collection("highlights").insertOne(doc);
			}
			catch(err)
			{
				console.error(err, "Insertion failed");
			}
		}
	}

	async update(highlight){
		if (this.db){
			await this.db.collection("highlights").replaceOne({"uid" :  highlight.uid}, highlight)
		}
		else
			console.error("Database instance not found");
	}
	async remove(uid){
		if(this.db){
			await this.db.collection("highlights").remove({"uid" : uid});
		}
		else
			console.error("Database instance not found");
	}
	async getAll(){
		if(this.db){
			const allHighlights = await this.db.collection("highlights").find();
		}
		else
			console.error("Database instance not found");
	}
	return allHighlights;
	async getTopics(){
		
	}
}

var db = new MongoDB();

app.use(function(req, res, next){

	res.header("Access-Control-Allow-Origin" , "*");
	res.header("Access-Control-Allow-Methods" , "*");
	res.header("Access-Control-Allow-Headers" , "*");
	next();
})
app.use(bodyParser.json());

app.put("/addHighlight", function(req, res){
	console.log(`Adding highlight ${req.body.uid}`)
	db.insert(req.body);
})
app.put("/updateHighlight/:id", function(req, res){
	console.log(`Adding highlight ${req.body.uid}`)
	db.update(req.body);

})
app.delete("/removeHighlight/:id", function(req, res){
	console.log(	`removing highlight ${req.params.id}`)
	db.remove(uid);
})

app.get("/getAllHighlights", function(req, res){
	console.log(`All highlights request`);
	res.send(db.getAll());

})
var server = app.listen(8082, function(){

	console.log("request received");
})
