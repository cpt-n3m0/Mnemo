function setupHoverMenuContent(activeHighlight, hovmen){
	let idoc = hovmen.contentDocument;
	let colorOptions = idoc.getElementById("color-selector");
	for(let e of colorOptions.childNodes){
		if(e.nodeType == 3)
			continue;
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
				activeElements = document.querySelectorAll('kbit[data-uid = "' + activeHighlight.uid + '" ]')
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
		notesContainer.style.display = "block";
		let note = idoc.getElementById("note");
		note.value = activeHighlight.note;
		note.onchange = () => {
			activeHighlight.note = note.value;
			updateHighlight(activeHighlight);
		}
	}
}

function hoverMenu(activeHighlight=null){
	const hovmen = document.createElement('iframe');
	hovmen.id = "kbytes-hovering-menu";
	hovmen.scrolling = "no";
	hovmen.src = browser.runtime.getURL("resources/menu.html");
	let height = activeHighlight?"150":"50"
	hovmen.style = "height: " + height + "px !important; width: 150px !important; top:" + mouseY + "px; left:" + mouseX+ "px; display: block;";
	injectCSS(`
		 #kbytes-hovering-menu {
		    display: none;
		    z-index: 2147483645 !important;
		    animation-delay: 0s !important;
		    animation-direction: normal !important;
		    animation-duration: 0.18s !important;
		    animation-fill-mode: forwards !important;
		    animation-iteration-count: 1 !important;
		    animation-name: pop-upwards !important;
		    animation-timing-function: linear !important;
		    transition-delay: 0s, 0s !important;
		    transition-duration: 0.075s, 0.075s !important;
		    transition-property: top, left !important;
		    transition-timing-function: ease-out, ease-out !important;
		    position: fixed !important;
		    opacity: 1 !important;
		    width: 178px !important;
		    height: 77px !important;
		    user-select: none !important;
		    margin: 0px !important;
		    background: none !important;
		}
	`);

	hovmen.onload = () => setupHoverMenuContent(activeHighlight, hovmen);
	document.body.append(hovmen);
}
function closeHoverMenu(e=null){
	const menuframe = document.getElementById("kbytes-hovering-menu");
	if (menuframe != null){
		menuframe.parentNode.removeChild(menuframe);
	}
}
function openHoverMenu(event){
	let s = window.getSelection();
	if(s.anchorNode != s.focusNode || s.anchorOffset != s.focusOffset)
		hoverMenu();

}
