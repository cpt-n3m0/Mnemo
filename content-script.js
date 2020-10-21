var mouseX, mouseY;
function trackMouse(event){
	mouseX = event.clientX;
	mouseY = event.clientY;
	
}
function openHoverMenu(event){
	let s = window.getSelection();
	if(s.anchorNode != s.focusNode || s.anchorOffset != s.focusOffset)
		hoverMenu();

}
function closeHoverMenu(e=null){
	const menuframe = document.getElementById("kbytes-hovering-menu");
	if (menuframe != null){
		menuframe.parentNode.removeChild(menuframe);
	}
}
function loadHighlights(){
	var location = ' ' + window.location;
	browser.runtime.sendMessage({request: "loadHighlights", url: location}).then(highlights => {
		if(highlights.response.length > 0){
			var urlHls = highlights.response;
			console.log(urlHls);
			for (let h of urlHls){
				let endOffset = h.selection.endOffset;
				let startOffset = h.selection.startOffset;
				

				let startquery = '//' + h.selection.startContainerTag +'/text()[contains(., "' + h.selection.startContext + '")]';
				let endquery = '//' + h.selection.endContainerTag +'/text()[contains(., "' + h.selection.endContext + '")]';
			
				let start = document.evaluate(startquery , document, null, XPathResult.ANY_TYPE, null).iterateNext();
				let end = document.evaluate(endquery, document, null, XPathResult.ANY_TYPE, null).iterateNext();
				let range = document.createRange();
				range.setStart(start, startOffset);
				range.setEnd(end, endOffset);

				styleRange(range, h);
			}
		}

	}).catch(error =>{console.log("ERROR while loading highlights : " + error)});

}
loadHighlights();
document.onmousemove = trackMouse;
document.onmouseup = openHoverMenu;
document.onmousedown = closeHoverMenu;
function injectCSS(cssContent){
	const style = document.createElement('style');
	style.textContent = cssContent;
	document.head.append(style);
}


function clearSelection(selector){
	for (let e of selector){
		if(e.nodeType == 3)
			continue;
		e.className = "";
	}
}

function setupHoverMenuContent(activeHighlight, hovmen){
	let idoc = hovmen.contentDocument;
	let colorOptions = idoc.getElementById("color-selector");
	for(let e of colorOptions.childNodes){
		if(e.nodeType == 3)
			continue;
		if(activeHighlight && e.dataset.clr == activeHighlight.color)
			e.className = "selected";
		e.onclick = () => {
			console.log(e);
			if(activeHighlight == null)
			{
				console.log(e.dataset.clr);
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
		note.onkeyup = () => console.log(note.value);
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


function makeid() {
   var length = 20;
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}


function getTextNodes(root, start, end){
	var textNodes = [];
	var rootChildNodes = Array.from(root.childNodes)
	let startRootChildNode = start;
	while(startRootChildNode.parentNode != root)
		startRootChildNode = startRootChildNode.parentNode;

	
	let startPos = rootChildNodes.map((e)=> {return e.isEqualNode(startRootChildNode)}).indexOf(true);

	var frontier = rootChildNodes.slice(startPos, rootChildNodes.length).reverse();


	var recording = false;


	while(frontier.length > 0){
		var activeNode = frontier.pop();

		if(activeNode.isEqualNode(start)){
			recording = true;
			textNodes.push(activeNode);
			continue;
		}
		if (activeNode.isEqualNode(end)){
			textNodes.push(activeNode);
			break;
		}
		if(recording && activeNode.nodeType == 3)
			textNodes.push(activeNode);
		for(let i = activeNode.childNodes.length - 1; i >= 0; i--)
			frontier.push(activeNode.childNodes[i]);


	}

	return textNodes;

}

function getNodeCoordinates(node){
	var coordinates = [];
	while(!node.isEqualNode(document.body)){
		coordinates.unshift(Array.from(node.parentElement.childNodes).indexOf(node));
		node = node.parentElement;
	}
	return coordinates;
}

function getNode(coordinates){
	var node = document.body;
	for (let i of coordinates){
		if (node == undefined)
			return null;
		node = node.childNodes[i];
	}
	return node;
}
function styleRange(r, highlight){
		let textNodes = [];
		
		let uid = highlight.uid;
		let color = highlight.color;

		if(r.startContainer.isEqualNode(r.endContainer)){
			let oldText = r.startContainer.textContent.slice(r.startOffset, r.endOffset);
			r.commonAncestorContainer.parentElement.innerHTML = r.commonAncestorContainer.parentElement.innerHTML.replace(oldText, "<kbit style='background-color: "+ color + ";' data-uid= " + uid + ">" + oldText + "</kbit>");
			let h = document.querySelector('kbit[data-uid ="' + highlight.uid + '"');
			
			h.onclick = () => hoverMenu(highlight);
			


			return;
		}


		var start = r.startContainer;
		var end = r.endContainer;


		textNodes = getTextNodes(r.commonAncestorContainer, start, end);
		for(let i = textNodes.length -1; i >= 0 ; i--){
			var pe = textNodes[i].parentElement;
			var oldText = textNodes[i].nodeValue;

			var khelement = document.createElement('kbit');
			khelement.style.background = color;
			khelement.dataset.uid = uid;
			khelement.onclick = () => hoverMenu(highlight);

			if(i == textNodes.length - 1)
			{
				khelement.textContent = oldText.slice(0,  r.endOffset);
				var remainingText =document.createTextNode(oldText.slice (r.endOffset, oldText.length ));
			}
			else if(i == 0)
			{
				khelement.textContent = oldText.slice(r.startOffset, oldText.length );
				var remainingText =document.createTextNode(oldText.slice (0, r.startOffset ));
			}
			else
				khelement.textContent = oldText;

			pe.replaceChild( khelement, textNodes[i]);

			if(i == textNodes.length - 1)
				pe.insertBefore(remainingText, khelement.nextSibling);
			if(i == 0)
				pe.insertBefore(remainingText, khelement);
		}
}


function addHighlight(clr)
	{
		var highlights = [];

		var selection = window.getSelection();

		for(let i = 0 ; i < selection.rangeCount; i++){
			let r = selection.getRangeAt(i);
			let id = makeid();
			let nh = {
				selection : {
					start : getNodeCoordinates(r.startContainer),
					startContainerTag : r.startContainer.parentElement.localName,
					startContext: r.startContainer.textContent,
					startOffset : r.startOffset,
					end: getNodeCoordinates(r.endContainer),
					endContainerTag : r.endContainer.parentElement.localName,
					endContext: r.endContainer.textContent,
					endOffset: r.endOffset
				},
				text: r.toString(),
				note : "",
				color : clr,
				uid : id,
				url : r.startContainer.baseURI,
				timestamp: new Date()
			};

			styleRange(r, nh );
			highlights.push(nh);
		}
		browser.runtime.sendMessage({request: "saveHighlight", hl: highlights});
	}
function removeHighlight(hl){
	console.log("removing ");
	let highlightComponents = document.querySelectorAll('kbit[data-uid="' + hl.uid +'"]');
	console.log(highlightComponents);
	for(let c of highlightComponents){
		console.log(c);
		let pn = c.parentNode;
		let prevText = (c.previousSibling && c.previousSibling.nodeType == 3)?c.previousSibling.wholeText:"";
		let nextText = (c.nextSibling && c.nextSibling.nodeType == 3)?c.nextSibling.wholeText:"";

		let textNode = document.createTextNode( prevText + c.lastChild.wholeText + nextText);
		console.log("inserted");
		console.log(textNode);
		if(prevText != "")
			pn.removeChild(c.previousSibling);
		if(nextText != "")
			pn.removeChild(c.nextSibling);
		pn.insertBefore(textNode, c);
		pn.removeChild(c);
	}
	browser.runtime.sendMessage({request: "removeHighlight", toRemove: hl});
}

function updateHighlight(hl){
	browser.runtime.sendMessage({request: "updateHighlight", newHighlight: hl});
	
}
document.body.style.background = "green";
