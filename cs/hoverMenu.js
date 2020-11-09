
function setupHoverMenuContent(activeHighlight, hovmen){
	let idoc = hovmen.contentDocument;
	
	let selectTopicBtn = idoc.querySelector(".selectTopic");
	selectTopicBtn.onclick = () =>{
			hovmen.style.height = "150px";
			toggleVisibility(".topic-view", true, idoc)	;
			toggleVisibility(".default-view", false, idoc)	;
			
	}
	
	let back = idoc.querySelector(".exit-topic-view");
	back.onclick = () => {
			hovmen.style.height = "90px";
			toggleVisibility(".topic-view", false, idoc)	;
			toggleVisibility(".default-view", true, idoc)	;
	};

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
				addHighlight(e.dataset.clr);
				e.className = "selected";
				closeHoverMenu();
				return;
			}

			else if( activeHighlight.color == e.dataset.clr)
			{
				console.log(activeHighlight);
				removeHighlight(activeHighlight);
				e.className = "selected";
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

				e.className = "selected";
				updateHighlight(activeHighlight);

			}
		}
	}
	if(activeHighlight){
		let notesContainer = idoc.getElementById("notes-container");
		notesContainer.style.display = "flex";
		let note = idoc.getElementById("note");
		note.value = activeHighlight.note;
		note.onchange = () => {
			activeHighlight.note = note.value;
			updateHighlight(activeHighlight);
		}
	}
}


function hoverMenu(activeHighlight=null){
	injectCSS(`
		 body, html{
			display: flex;
			flex-direction: column;
			height: 100%
		 }
		 #mykbits-hoverMenuContainer {
		 		display: flex;
				flex-direction:column;
		    z-index: 2456123459 !important;
		    position: fixed !important;
		    opacity: 1 !important;
		    user-select: none !important;
		    margin: 0px !important;
		    background: none !important;
				width: 150px;
		}
		#mykbits-hoverMenu{
			display: flex;
			flex-direction : column;
			height: 100%;
			flex: 1 1 auto;
		}
	`);
	const hovmen = document.createElement('iframe');
	hovmen.id = "mykbits-hoverMenu"
	hovmen.style.height = "90px";
	hovmen.src = browser.runtime.getURL("resources/menu.html");
	hovmen.onload = ()=> {
			console.log("height adjustment done");
			hovmen.style.height = hovmen.contentWindow.document.body.offsetHeight + "px";
	}
//	hovmen.style = "height:  100% !important; width: 100% !important; ";


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
