	async addHighlight(highlight){
		await	fetch(`http://localhost:8082/addHighlight`, {
			 method: 'PUT', 
    mode: 'cors', 
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data) // body data type must match "Content-Type" header
		})
		.catch((error) => {
			console.error('Error:', error);
		});	
}
async removeHighlight(highlight){
		await	fetch(`http://localhost:8082/removeHighlight/${highlight.uid}`, {
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
async updateHighlight(highlight){
		await	fetch(`http://localhost:8082/updateHighlight`, {
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

async getHighlights(url){
	var pageHighlightsResponse = await	fetch(`http://localhost:8082/updateHighlight/${highlight.uid}`, {
			 method: 'GET', 
    mode: 'cors', 
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
		)
		.catch((error) => {
			console.error('Error:', error);
		});
	return pageHighlightsResponse;
}
async getAllHighlights(){
	var HighlightsResponse = await	fetch(`http://localhost:8082/getAllHighlights`, {
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
	return pageHighlightsResponse;
}

function optionStatus(){
	console.log(browser.runtime.lastError);
}

function onError(error){
	console.log(error);
}


var highlight_cache = {};
var cache_relevant = false;

browser.runtime.onMessage.addListener(function(request, sender){
	console.log("Message received: " );
	console.log(request);
	switch(request.request){
		case "loadHighlights":
			var hls = getHighlights(request.url); 
			return Promise.resolve( { response: hls});
		case "saveHighlight":
			if(request.hl){
				for (let e of request.hl){
					addHighlight(e);
				}
			}
			cache_relevant = false;
			break;
		case "updateHighlight":
			updateHighlight(request.newHighlight);
			cache_relevant = false;
			break;
		case "removeHighlight":
			removeHighlight(request.toRemove);
			break;
		case "viewer-getHighlights":
			console.log("viewer request received");
			if (!cache_relevant){
				getAllHighlights().then(response => highlight_cache = response.body);
				cache_relevant = true;
			}
			return Promise.resolve({highlights: highlight_cache });
	}
});
console.log("Loaded");
