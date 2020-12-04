var {MongoClient, ObjectID} = require("mongodb");

class MongoDB {

	constructor(){
		this.connect();
	}


	async connect(){
		try{
			const client = new MongoClient("mongodb://127.0.0.1:27017", {useNewUrlParser: true, useUnifiedTopology: true});
			await client.connect();
			this.db = client.db("mykbits");
		}
		catch(err){
			console.error(err, "MongoDb connection failed");
		}
	}

	async insertHighlight(doc){
		console.log(doc);
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


	async updateHighlight(highlight){
		let oldTopic = highlight.oldTopic;
		delete highlight.oldTopic;

		if (this.db){
			this.db.collection("highlights").replaceOne({"_id" :  highlight._id}, highlight).then(() => {
				if (oldTopic)
				{

					console.log("UPDATING TOPICs");
					this.db.collection("topics").updateOne({"_id": oldTopic}, {
						"$pull": {
							"highlights" : {"highlight" :highlight._id }
						}
					})
					.then(() => {
						this.db.collection("topics").updateOne({"_id": highlight.topicID}, {
						"$push": {
							"highlights" : {"highlight" :highlight._id }
							}
						});

					})
				}
			})
			.catch(err => console.log(err, `update failed for ${highlight._id}`));
		}
		else
			console.error("Database instance not found");
	}


	async removeHighlight(highlight){
		if(this.db){
			this.db.collection("topics").update({"_id": highlight.topicID}, {
				"$pull": {
					"highlights" : {"_id" :highlight._id }
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
    async ankify(ankiItem){
        if (this.db){
			this.db.collection("highlights").updateOne({"_id": ankiItem.hid}, {
                "$set" :{
                    "ankied": true
                }
            })
            .catch(err => console.error(err, ": Unable to change ankied state"));
		}
		else
			console.error("Database instance not found");
    }
}

module.exports = MongoDB;
