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
		await	fetch(`${dburl}/removeHighlight/${highlight._id}`, {
			 method: 'DELETE', 
    mode: 'cors', 
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
		})
		.catch((error) => {
			console.error('Error:', error);
		});	
}
async function updateHighlight(highlight){
		await	fetch(`${dburl}/updateHighlight`, {
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

async function getHighlights(url){
	var pageHighlightsResponse = await	fetch(`${dburl}/getHighlights/${new URLSearchParams({"url" :url})}/`)
		.catch((error) => {
			console.error('Error:', error);
		});
	return pageHighlightsResponse;
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


var highlight_cache = {};
var isCacheCoherent = false;

browser.runtime.onMessage.addListener(async function(request, sender){
	console.log("Message received: " );
	console.log(request);
	switch(request.request){
		case "loadHighlights":
			var hls;
			 await getHighlights(request.url).then(response => response.json())
																	.then(data => hls = data);
																  
			return Promise.resolve( { response: hls});
		case "saveHighlight":
			if(request.hl){
				for (let e of request.hl){
					addHighlight(e);
				}
			}
			isCacheCoherent = false;
			break;
		case "updateHighlight":
			updateHighlight(request.newHighlight);
			isCacheCoherent = false;
			break;
		case "removeHighlight":
			removeHighlight(request.toRemove);
			isCacheCoherent = false;
			break;
		case "viewer-getHighlights":
			console.log("viewer request received");
			if (!isCacheCoherent){
				await getAllHighlights().then(response => response.json())
																.then( data => highlight_cache = data);
				isCacheCoherent = true;
			}
			console.log(highlight_cache);
			return Promise.resolve({highlights: highlight_cache });
	}
});
console.log("Loaded");
