var dburl = "http://localhost:8082";

async function addHighlight(highlight){
	await	fetch(`${dburl}/addHighlight`, {
		method: 'PUT', 
		mode: 'cors', 
		cache: 'no-cache',
		headers: {
		  'Content-Type': 'application/json'
		},
		body: JSON.stringify(highlight) // body data type must match "Content-Type" header
	})
	.catch((error) => {
		console.error('Error:', error);
	});	
}

async function removeHighlight(highlight){
	await	fetch(`${dburl}/removeHighlight`, {
		method: 'PUT', 
		mode: 'cors', 
		cache: 'no-cache',
		headers: {
		  'Content-Type': 'application/json'
		},
		body:  JSON.stringify(highlight)
	})
	.catch((error) => {
		console.error('Error:', error);
	});	
}

async function updateHighlight(highlight, oldTopic){
	if(oldTopic != "")
	{

		highlight.oldTopic = oldTopic;
		console.log("add old topic to highlight");
	}

	await	fetch(`${dburl}/updateHighlight`, {
		method: 'PUT', 
		mode: 'cors', 
		cache: 'no-cache',
		headers: {
		  'Content-Type': 'application/json'
		},
		body: JSON.stringify(highlight) 
	})
	.catch((error) => {
		console.error('Error:', error);
	});	
}

async function addTopic(topic){
	await	fetch(`${dburl}/addTopic`, {
		method: 'PUT', 
		mode: 'cors', 
		cache: 'no-cache',
		headers: {
		  'Content-Type': 'application/json'
		},
		body: JSON.stringify(topic) 
	})
	.catch((error) => {
		console.error('Error:', error);
	});	
}

async function removeTopic(topicName){
	await	fetch(`${dburl}/removeTopic/${topicName}`, {
		method: 'DELETE', 
		mode: 'cors', 
		cache: 'no-cache',
	})
	.catch((error) => {
		console.error('Error:', error);
	});	
}
async function getTopics(){
	let topicsResponse = await	fetch(`${dburl}/getTopics`)
		.catch((error) => {
			console.error('Error:', error);
		});
	return topicsResponse;
}

async function getUrlHighlights(url){
	var pageHighlightsResponse = await	fetch(`${dburl}/getHighlights/${new URLSearchParams({"url" :url})}/`)
		.catch((error) => {
			console.error('Error:', error);
		});
	return pageHighlightsResponse;
}
async function getTopicHighlights(topicName){
	var HighlightsResponse = await	fetch(`${dburl}/getTopicHighlights/${topicName}`)
		.catch((error) => {
			console.error('Error:', error);
		});
	return HighlightsResponse;
}
async function getAllHighlights(){
	var HighlightsResponse = await	fetch(`${dburl}/getAllHighlights`, {
		method: 'GET', 
    mode: 'cors', 
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
		})
		.catch((error) => {
			console.error('Error:', error);
		});
	return HighlightsResponse;
}

function optionStatus(){
	console.log(browser.runtime.lastError);
}

function onError(error){
	console.log(error);
}

browser.runtime.onMessage.addListener( function(request, sender){
	console.log("Message received: " );
	console.log(request);
	switch(request.request){
		case "loadHighlights":
			 return getUrlHighlights(request.url).then(response => response.json())
				.then(data => { 
					console.log("data loaded : ");
					console.log(data);
					return {response : data};
				});
																  
		case "saveHighlight":
			if(request.hl){
				for (let e of request.hl){
					addHighlight(e);
				}
			}
			break;

		case "updateHighlight":
			console.log(`updating highlight ${request.newHighlight._id}`);
			console.log(`old highlight topic : ${request.oldTopic}`);
			console.log(`new highlight topic : ${request.newHighlight.topicID}`);
			updateHighlight(request.newHighlight, request.oldTopic);
			break;

		case "removeHighlight":
			removeHighlight(request.toRemove);
			break;
			
		case "viewer-getHighlights":
			console.log("viewer request received");
			return getAllHighlights().then(response => response.json())
									.then( data => { 
											return {highlights: data};
									});
		case "getTopicHighlights":
			 console.log("received Topic highlights request");
			return getTopicHighlights(request.topicName). then(data => data.json()).then(data => {
				return {highlights : data}
			});

		case "getTopics":
			console.log("received Topics request");
			return getTopics().then(data => data.json()).then(data =>{ 
					return {topics: data}});

		case "addTopic":
			console.log(`received Add topic request : ${request.newTopic._id}`);
			return addTopic(request.newTopic);

		case "removeTopic": 
			console.log(`received remove topic request: ${request.toRemove}`)
			return	removeTopic(request.toRemove);
	}
});
console.log("Loaded");
