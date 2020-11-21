var IFRAME_HIGHLIGHTED_HEIGHT = "185px";
var IFRAME_SELECTED_HEIGHT = "80px";
var selectedTopic = "";

function selectTopic (selectTopicBtn, n)
{
		selectTopicBtn.textContent = n;
		selectedTopic = n;
}

function setupHoverMenuContent(activeHighlight, hovmen){
	let idoc = hovmen.contentDocument;
	
	let selectTopicBtn = idoc.querySelector(".selectTopic");
	selectTopicBtn.onclick = () =>{
			hovmen.style.height = IFRAME_HIGHLIGHTED_HEIGHT;
			setViewVisibility(".topic-view", true, idoc)	;
			setViewVisibility(".default-view", false, idoc)	;
		}
		
	let topicBtnBehaviour = function btnBehaviour(button){
								hovmen.style.height = activeHighlight?IFRAME_HIGHLIGHTED_HEIGHT:IFRAME_SELECTED_HEIGHT;
								setViewVisibility(".topic-view", false, idoc)	;
								setViewVisibility(".default-view", true, idoc)	;
								

								if(!button.classList.contains("exit-topic-view"))
								{
										selectTopic(selectTopicBtn, button.textContent)
								}
								if(activeHighlight)
								{
									let oldTopic = activeHighlight.topicID;
									activeHighlight.topicID = selectedTopic;
									updateHighlight(activeHighlight, oldTopic=((oldTopic != selectedTopic)?oldTopic:""));
									console.log(activeHighlight);
								}
									
							};
	
	if(activeHighlight && activeHighlight.topic != "")
		selectTopic(selectTopicBtn, activeHighlight.topicID);	

	let topicContainer = idoc.querySelector(".topic-selector");
	browser.storage.local.get("lastSelectedTopic").then(results => {
		 console.log(results);
			browser.runtime.sendMessage({request: "getTopics"}).then(response => {
				let cancelBtn = createButton("Cancel", ["exit-topic-view", "topic-view", "hidden-view"]);
				cancelBtn.onclick = () => topicBtnBehaviour(cancelBtn);
				topicContainer.appendChild(cancelBtn);

				for(let t of response.topics)
				{
						if(selectTopicBtn.textContent == "" && results && results.lastSelectedTopic == t._id )
						{
								selectTopic(selectTopicBtn, results.lastSelectedTopic);
						}
						let button = createButton(t._id,["topic", "topic-view", "hidden-view"], t._id )
						button.onclick = () => topicBtnBehaviour(button);
						topicContainer.appendChild(button);

				}
				console.log(selectTopicBtn.textContent);
				if(selectTopicBtn.textContent == "")
				{
						let firstTopic = response.topics[0];
						selectTopic(selectTopicBtn,  firstTopic._id);
				}
					
			});

	})
	
	

	let colorOptions = idoc.getElementById("color-selector");
	for(let e of colorOptions.childNodes){
		if(e.nodeType == 3)
			continue;

		e.style.backgroundColor = e.dataset.clr;
		e.onmouseover = () => e.style.backgroundColor = getHoverColor(e.style.backgroundColor, -40);
		e.onmouseout = () => e.style.backgroundColor = getHoverColor(e.style.backgroundColor, 40);
		

		if(activeHighlight && e.dataset.clr == activeHighlight.color)
			e.className = "selected";
		e.onclick = () => {
			if(activeHighlight == null)
			{
				addHighlight(e.dataset.clr, selectedTopic);
				e.classList.add( "selected");
				closeHoverMenu();
				return;
			}

			else if( activeHighlight.color == e.dataset.clr)
			{
				console.log(activeHighlight);
				removeHighlight(activeHighlight);
				closeHoverMenu();
			}
			else
			{
				clearSelection(colorOptions.childNodes);
				activeHighlight.color = e.dataset.clr;
				activeElements = document.querySelectorAll('kbit[data-uid = "' + activeHighlight._id + '" ]')
				for (let ae of activeElements){
					ae.style.background = e.dataset.clr;
				}
				e.classList.add( "selected");
				updateHighlight(activeHighlight);

			}
		}
	}
	if(activeHighlight){
		let notesContainer = idoc.getElementById("notes-container");
		let note = idoc.getElementById("note");
		notesContainer.classList.remove("hidden");
		note.classList.remove("hidden");

		note.value = activeHighlight.note;
		note.onchange = () => {
			activeHighlight.note = note.value;
			updateHighlight(activeHighlight);
		}
	}
}


function hoverMenu(activeHighlight=null){
	injectCSS(`
		 
		 #mykbits-hoverMenuContainer {
		 		display: flex;
				flex-direction:column;
		    z-index: 2456123459 !important;
		    position: fixed !important;
		    opacity: 1 !important;
		    user-select: none !important;
		    margin: 0px !important;
		    background: none !important;
				width: 140px;
		}
		#mykbits-hoverMenu{
			width: 100%;
			border-style: solid;
			border-width: 2px;
			border-color: grey;
			border-radius: 5px;
		
		}
	`);
	const hovmen = document.createElement('iframe');
	hovmen.id = "mykbits-hoverMenu";
	hovmen.style.height = (activeHighlight)?IFRAME_HIGHLIGHTED_HEIGHT:IFRAME_SELECTED_HEIGHT;
	hovmen.src = browser.runtime.getURL("resources/menu.html");
	
	let iframeContainer = document.createElement("div");
	iframeContainer.id = "mykbits-hoverMenuContainer";
	iframeContainer.style = "top:" + mouseY + "px; left:" + mouseX+ "px; "
	iframeContainer.appendChild(hovmen);

	hovmen.onload = () => setupHoverMenuContent(activeHighlight, hovmen);
	document.body.append(iframeContainer);
}
var isHoverMenuOpen = false;
function closeHoverMenu(e=null){
	const menuframe = document.getElementById("mykbits-hoverMenuContainer");
	if (menuframe != null){
		menuframe.parentNode.removeChild(menuframe);
	}
	isHoverMenuOpen = false;
}
function openHoverMenu(event){
	if(isHoverMenuOpen)
		closeHoverMenu();
	isHoverMenuOpen = true;
	let s = window.getSelection();
	if(s.anchorNode != s.focusNode || s.anchorOffset != s.focusOffset)
		hoverMenu();



}
