function updateContent(tabId, changeInfo, tab){
	if(changeInfo.status != "complete")
		return;
	browser.runtime.sendMessage({request: "viewer-getHighlights"}).then(response => {
		let hlList = document.getElementById("notes");
		while(hlList.firstChild){
			hlList.removeChild(hlList.firstChild);
		}
		console.log(response);
		for(let hl of response.highlights){
			let li = document.createElement("li");
			li.textContent = hl.text;
			li.style.background = hl.color;
			hlList.appendChild(li);
		}


	}).catch(e => console.log(e));
}

//browser.tabs.onActivated.addListener(updateContent);
browser.tabs.onUpdated.addListener(updateContent);
