
function KnowledgeBase(){
	var highlights = [];
	this.addHighlight = (hl) =>{ highlights.push(hl)};
	this.removeHighlight = function(hl){
		let pos  = highlights.map((e)=> {return e.uid}).indexOf(hl.uid);
		console.log(pos);
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
	

}

let KB = new KnowledgeBase()
KB.print();
function optionStatus(){
	console.log(browser.runtime.lastError);
}




//browser.runtime.onMessage.addListener(handleMessage);

browser.contextMenus.create({
	id: "log-selection",
	title: "Highlight",
	//title: browser.i18n.getMessage("contextMenuItemSelectionLogger"),
	contexts: ['selection']
}, optionStatus);

browser.contextMenus.create({
	id: "unHighlight",
	title: "Remove Highlight",
	//title: browser.i18n.getMessage("contextMenuItemSelectionLogger"),
	contexts: ['all']
}, optionStatus);




function onError(error){
	console.log(error);
}

browser.contextMenus.onClicked.addListener(function(info, tab){
	switch(info.menuItemId){
		case "log-selection":
			console.log(tab.id);
			browser.tabs.sendMessage(tab.id, {request : "ToggleHighlight"}).then(hl => {
				
			}).catch(onError);
			break;
	}
});


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
	}
});
