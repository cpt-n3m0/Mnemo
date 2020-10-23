
function KnowledgeBase(){
	var highlights = [];
	this.addHighlight = (hl) =>{ highlights.push(hl)};
	this.removeHighlight = function(hl){
		let pos  = highlights.map((e)=> {return e.uid}).indexOf(hl.uid);
		highlights.splice(pos, 1);
	};
	this.updateHighlight = function(hl) {
		for(let i in highlights)
			if(highlights[i].uid == hl.uid)
				highlights[i] = hl;
	};
	this.getHighlights = function(url){
		var urlHls = [];
		for(let e of highlights){
			if(e.url == url.trim())
				urlHls.push(e);
		}
		return urlHls;
	};
	this.print = () => {
		console.log(highlights);
	};
	
	this.getAllHighlights = () => {
		return highlights;
	}

}

let KB = new KnowledgeBase()
KB.print();
function optionStatus(){
	console.log(browser.runtime.lastError);
}

function onError(error){
	console.log(error);
}



browser.runtime.onMessage.addListener(function(request, sender){
	console.log("Message received: " );
	console.log(request);
	switch(request.request){
		case "loadHighlights":
			var hls = KB.getHighlights(request.url);
			console.log("Found :");
			console.log(hls);
			console.log(KB);
			return Promise.resolve( { response: hls});
		case "saveHighlight":

			if(request.hl){
				for (let e of request.hl){
					KB.addHighlight(e);
					console.log(e);
				}
			}
			break;
		case "updateHighlight":
			KB.updateHighlight(request.newHighlight);
			break;
		case "removeHighlight":
			KB.removeHighlight(request.toRemove);
			break;
		case "viewer-getHighlights":
			console.log("viewer requuest received");
			return Promise.resolve({highlights: KB.getAllHighlights() });
	}
});
