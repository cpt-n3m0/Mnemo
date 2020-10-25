function buildHLDisplayElement(highlight, tabId){

	let newEntry = document.createElement("div");
	newEntry.className = "entry";

/*	let colorIndicator= document.createElement("div");
	colorIndicator.className = "entry-color";
	colorIndicator.style.background = highlight.color;

	let textContent = document.createElement("div");
	textContent.className = "entry-content";

	let text = document.createElement("p");

	text.textContent = highlight.text;
	textContent.appendChild(text);

	newEntry.appendChild(colorIndicator);
	newEntry.appendChild(textContent);
*/
	newEntry.innerHTML = `
		 <div class="entry-color" data-uid="${highlight.uid}" style="background-color: ${highlight.color};"></div>
                                <div class="entry-content"><p>${highlight.text} </p></div>
                                <div class="entry-options">
                                        <img class="show-note" src="../icons/ellipses.svg" title="view note">
                                        <img class="delete-highlight" src="../icons/delete.svg" title="delete highlight">
                                        <img class="gotolink" src="../icons/external-link.svg" title="go to source">

                 		</div>
		</div>

	`;

	let deleteBtn = newEntry.querySelector("img.delete-highlight" );
	deleteBtn.onclick = () => {
		removeHighlight(highlight);
		updateContent(tabId, null, null);
	}
	let goToLinkBtn =newEntry.querySelector("img.gotolink" ); 
	goToLinkBtn.onclick = () => {
		browser.tabs.update(tabId, {url: highlight.url});
		updateContent(tabId, null, null);
	}
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
			

			hlList.appendChild(buildHLDisplayElement(hl, tabId));
		}


	}).catch(e => console.log(e));
}

browser.tabs.onActivated.addListener(updateContent);
browser.tabs.onUpdated.addListener(updateContent);

browser.runtime.onMessage.addListener(function(request, sender){
	if(request.request == "updateViewerContent")
		updateContent(null, null, null);

});

