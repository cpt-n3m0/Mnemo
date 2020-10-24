function buildHLDisplayElement(highlight){

	let newEntry = document.createElement("div");
	newEntry.className = "entry";

	let colorIndicator= document.createElement("div");
	colorIndicator.className = "entry-color";
	colorIndicator.style.background = highlight.color;

	let textContent = document.createElement("div");
	textContent.className = "entry-content";

	let text = document.createElement("p");

	text.textContent = highlight.text;
	textContent.appendChild(text);

	newEntry.appendChild(colorIndicator);
	newEntry.appendChild(textContent);

	return newEntry;
	
}
function updateContent(tabId, changeInfo, tab){
	if(changeInfo && changeInfo.status != "complete")
		return;
	browser.runtime.sendMessage({request: "viewer-getHighlights"}).then(response => {
		let hlList = document.getElementById("entries-container");
		while(hlList.firstChild){
			hlList.removeChild(hlList.firstChild);
		}
		console.log(response);
		for(let hl of response.highlights){
			

			hlList.appendChild(buildHLDisplayElement(hl));
		}


	}).catch(e => console.log(e));
}

//browser.tabs.onActivated.addListener(updateContent);
browser.tabs.onUpdated.addListener(updateContent);

browser.runtime.onMessage.addListener(function(request, sender){
	if(request.request == "updateViewerContent")
		updateContent(sender.tabId, null, null);

});

