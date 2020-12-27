var MAX_TOPIC_LENGTH= 20;
var scrollIntoViewRequest = null;
var colorFilterMenuOpen = false;
var isOrderAscending = false;

window.onload = () => browser.tabs.query({active: true, lastFocusedWindow:true}).then(tabs => {
       updateContent(tabs[0].Id, null,tabs[0] );
     });
browser.tabs.onActivated.addListener((activeInfo) => browser.tabs.get(activeInfo.tabId).then((tab) => updateContent(tab, null, tab.id)));
browser.tabs.onUpdated.addListener(updateContent);
browser.runtime.onMessage.addListener(function(request, sender){
	if(request.request == "updateViewerContent")
	{
		browser.tabs.query({active: true, lastFocusedWindow:true}).then(tabs => {
			updateContent(tabs[0].id, null,tabs[0] );
		});
	}
});

function refreshViewer(){
	browser.tabs.query({active: true, lastFocusedWindow:true}).then(tabs =>
	{
		console.log("Refreshing view");
		updateContent(tabs[0].id, null, tabs[0]);
	});
	browser.runtime.sendMessage({request: "updateViewerContent"});
}
function setupContainerBehavior(newEntry, tab, highlight){
	let deleteBtn = newEntry.querySelector("img.delete-highlight" );
	deleteBtn.onclick = () => {
		if(tab.url == highlight.url)
		{
			browser.tabs.executeScript(tab.id, {
				code: `removeHighlight(${JSON.stringify(highlight)})`
			});
		}
		else
			removeHighlight(highlight);

		updateContent(tab.tabId, null, tab);
	}

	let goToLinkBtn =newEntry.querySelector("img.gotolink" );
	goToLinkBtn.onclick = () => {
		if(tab.url == highlight.url)
		{
			browser.tabs.executeScript( {
				code : `document.querySelector("kbit[data-uid='${highlight._id}']").scrollIntoView();`
			});
			return;
		}
		browser.tabs.update(tab.tabId, {url: highlight.url}).then( t => scrollIntoViewRequest = highlight);
	}

	let options = newEntry.querySelector(".entry-options");
	newEntry.onmouseover = () => {
		options.style.display="block";
	};
	newEntry.onmouseout = () => {
		options.style.display="none";
	};

	let noteContent = newEntry.querySelector(".entry-note-container");
	noteContent.onclick = ()=> {
		if(noteContent.firstChild.localName != 'p')
			noteContent.innerHTML = '<p class="entry-note"> ' + highlight.note+ '</p>';
		else
			noteContent.innerHTML = "<img src='../resources/icons/ellipses.svg' title='show note'>";

	};

	let copyBtn = newEntry.querySelector(".copy");
	copyBtn.onclick =  function copy(){
			navigator.clipboard.writeText(highlight.text)
	}
    let ankiBtn = newEntry.querySelector(".add-to-anki");
    if(highlight.ankied)
        ankiBtn = ()=>{};
    else
    	ankiBtn.onclick = () => {
    		let options = {
    			type:"popup",
    			url: "../resources/anki_popup/anki_form.html",
    			width: 472,
    			height: 450,
    			allowScriptsToClose: true,
    			titlePreface: "Anki"
    		}
            browser.storage.local.set({"anki_kbit" : highlight}).then(() => browser.windows.create(options));
        };

}

function buildHLDisplayElement(highlight, tab){
	let newEntry = document.createElement("div");
	newEntry.className = "entry";
	newEntry.innerHTML = `
				<div class="entry-content" id="${highlight._id}" style="border-left: solid 10px ${highlight.color};"><p>${highlight.text} </p>
					<div class="entry-note-container" style="display: ${highlight.note != ""?"block":"none"}">
						<img src='../resources/icons/ellipses.svg' title='showNote'>
					</div>
					<div class="entry-options">
						<img class="delete-highlight" src="../resources/icons/delete.svg" title="delete highlight">
						<img class="gotolink" src="../resources/icons/external-link.svg" title="go to source">
						<img class="copy" src="../resources/icons/copy.svg" title="copy content">
						<img class="add-to-anki" src=../resources/icons/${highlight.ankied?"task":"flag"}.svg title=${highlight.ankied?"Added to Anki":"Add to Anki"}>
					</div>
				</div>
	`;

	setupContainerBehavior(newEntry, tab, highlight);
	return newEntry;
}

function buildTopicElement(topicName="") {
	let topicElement = document.createElement("div");
	topicElement.classList.add("dropdown-item");
	topicElement.textContent = topicName;
	topicElement.id = topicName;
	topicElement.onclick = () => {
		 let topicSelectBtn = document.getElementById("topic-title");
		 topicSelectBtn.textContent = topicElement.textContent;
		 browser.storage.local.set({"lastSelectedTopic": topicElement.textContent})
		 .then(() => refreshViewer())
		 .catch(err => console.error(err, " error updating view after topic selection"));
	};

	return topicElement;
}

function setupAddTopicBehaviour(addTopBtn){
	addTopBtn.onclick = () => {
		let newTopicElement = buildTopicElement();
		newTopicElement.contentEditable = true;
		newTopicElement.onkeydown = (e) => {
				if(newTopicElement.textContent.length >= MAX_TOPIC_LENGTH && e.code != "Backspace")
					e.preventDefault();

				if(e.code == "Enter")
				{
						newTopicElement.contentEditable = false;
						let nt= {
							"_id" : newTopicElement.textContent,
							"highlights": []
						}
					browser.runtime.sendMessage({request: "addTopic", newTopic : nt});
					browser.storage.local.set({"lastSelectedTopic" : nt._id}).then(refreshViewer);

				}

		}
		addTopBtn.parentElement.insertBefore(newTopicElement, addTopBtn);
		newTopicElement.focus();
	}
}


function buildTopicSelectionMenu(topics)
{
	let topicsList = [];
	let topicContainer = document.querySelector(".dropdown-content");

	topicContainer.textContent = "";
	for(let t of topics)
	{
		topicsList.push(t._id);
		let topicElement = buildTopicElement(t._id);
		topicContainer.appendChild(topicElement);

	}

	let addTopicBtn = document.createElement("a");
	addTopicBtn.textContent = "Add Topic";
	addTopicBtn.classList.add("option-add-topic");
	setupAddTopicBehaviour(addTopicBtn);
	topicContainer.appendChild(addTopicBtn);
	return topicsList;
}

function setupTopicOptionsBehaviour(){
	let removeBtn = document.getElementById("topic-option-remove");

	removeBtn.onmouseover = () => removeBtn.src = "../resources/icons/topic-delete-hover.svg";
	removeBtn.onmouseout = () => removeBtn.src = "../resources/icons/topic-delete.svg";
	removeBtn.onclick = () => {
		let tt = document.getElementById("topic-title");
		let old = tt.textContent;
		let topics = document.getElementById("topic-selection");
		if(topics.childNodes.length > 2)
		{
			browser.runtime.sendMessage({request: "removeTopic", toRemove: old});
			browser.storage.local.set({"lastSelectedTopic": tt.textContent}).then(refreshViewer);
		}
	}
	let editBtn = document.getElementById("topic-option-edit");

}
function setupFiltersBehaviour(tabId, changeInfo, tab, topic_clrs){
	

	let colorFilter = document.querySelector(".color-filter-container");	
	colorFilter.onclick = () => { 
		colorFilterMenuOpen = !colorFilterMenuOpen;
		document.querySelector(".menu-arrow").src = `../resources/icons/chevron-${colorFilterMenuOpen?"top":"bottom"}.svg`;
		document.getElementById("color-filter-menu").style.display = colorFilterMenuOpen?"block":"None";
	}

	let colorDropdown = document.getElementById("color-filter-menu");
	colorDropdown.textContent = "";

	let create_color_option = (clr) => {
		let color_selection = document.createElement("div");
		color_selection.classList.add("highlight-color", "dropdown-item");
		color_selection.style.borderBottom = "solid grey 1px";
		color_selection.style.backgroundColor = clr;
		color_selection.dataset.clr = clr;

		color_selection.onclick = () => {
			let selected = color_selection.dataset.clr;
			colorFilter.click();
			updateContent(tabId, changeInfo, tab, (selected == "#ffffff")?"":selected );
		}
		return color_selection;
	}

	let disable_color_filter_option = create_color_option("#ffffff");
	colorDropdown.appendChild(disable_color_filter_option);
	
	for(clr of topic_clrs)
	{
		let color_selection = create_color_option(clr);
		
		colorDropdown.appendChild(color_selection);
	}

	let disp_order = document.querySelector(".display-order")
	disp_order.onclick = () => {
		let hex = (x) => { 
			var hexDigits = new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"); 
			return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16] 
		}
		let rgb2hex = (rgb) =>{
				 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
			if (rgb == null || rgb.filter(e => e == 255).length == 3)
					return "";
				 return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
			} 	
		isOrderAscending = !isOrderAscending;
		disp_order.src = `../resources/icon/sort-${isOrderAscending?"ascending":"descending"}.svg`;
		console.log(rgb2hex(document.querySelector(".selected-color").style.backgroundColor))
		updateContent(tabId, changeInfo, tab, rgb2hex(document.querySelector(".selected-color").style.backgroundColor), isOrderAscending );
	}

}
function updateContent(tabId, changeInfo, tab, colorFilter="", dispAscending=true){
	document.querySelector(".selected-color").style.backgroundColor = colorFilter != ""?colorFilter:"#ffffff";
	if(changeInfo && changeInfo.status != "complete")
		return;
	if(scrollIntoViewRequest != null)
	{
		browser.tabs.executeScript( {
			code : `
					setTimeout(() =>{
								document.querySelector("kbit[data-uid='${scrollIntoViewRequest._id}']").scrollIntoView();
					} , 500);
					`
		});
		scrollIntoViewRequest = null;
	}


	browser.runtime.sendMessage({request: "getTopics"}).then(response => {
		let topicsList;
		if(response.topics)
			topicsList = buildTopicSelectionMenu(response.topics);
		else
			console.error("Topics not found");

		browser.storage.local.get("lastSelectedTopic").then(result => {
			console.log(topicsList);
			console.log(result.lastSelectedTopic);
			if( !result.lastSelectedTopic || result.lastSelectedTopic == "" || topicsList.indexOf(result.lastSelectedTopic) < 0  )
			{
				 browser.storage.local.set({"lastSelectedTopic": topicsList[0]});
				 console.log(`topic list not up to date default selected : ${topicsList[0]}`)

			}
		});
	})
	.then(()=> {
		browser.storage.local.get("lastSelectedTopic")
		.then(result => {
			document.getElementById("topic-title").textContent = result.lastSelectedTopic;
			browser.runtime.sendMessage({request: "getTopicHighlights", topicName: result.lastSelectedTopic})
			.then(response => {
								let hlList = document.getElementById("entries-container");
								while(hlList.firstChild){
									hlList.removeChild(hlList.firstChild);
								}
								if(dispAscending)
									response.highlights.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
								else
									response.highlights.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
								let topic_clrs = [];
								for(let hl of response.highlights){
									if(topic_clrs.indexOf(hl.color) == -1)
										topic_clrs.push(hl.color)
									if(colorFilter != "" && hl.color != colorFilter )
										continue;
									hlList.appendChild(buildHLDisplayElement(hl, tab));
								}
								document.getElementById("hl-count").textContent = hlList.childNodes.length + " highlights";
								setupFiltersBehaviour(tabId, changeInfo, tab,topic_clrs)
								console.log(topic_clrs)
						})
			.catch(e => console.error(e));
		})
		.catch(e => console.error(e));
	})
	.catch(e => console.error(e));

	setupTopicOptionsBehaviour();

}
