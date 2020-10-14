
function KnowledgeBase(){
	var highlights = {};
	this.addHL = function(hl) {
		highlights[hl.id] = hl;
		return hl.length;
	};
	this.removeHL = function(hl){};
}



function optionStatus(){
	console.log(browser.runtime.lastError);
}




//browser.runtime.onMessage.addListener(handleMessage);

browser.contextMenus.create({
	id: "log-selection",
	title: "highlight",
	//title: browser.i18n.getMessage("contextMenuItemSelectionLogger"),
	contexts: ['selection']
}, optionStatus);



function onError(error){
	console.log("error:"+ error);
}

browser.contextMenus.onClicked.addListener(function(info, tab){
	switch(info.menuItemId){
		case "log-selection":
			console.log(tab.id);
			browser.tabs.sendMessage(tab.id, {msg : "ToggleHighlight"}).then(response => {
			console.log(response.msg).catch(onError);	
			});
			break;
	}
});

