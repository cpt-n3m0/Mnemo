var mouseX, mouseY;
function trackMouse(event){
	mouseX = event.clientX;
	mouseY = event.clientY;
	
}
function checkDisplay(event){
	let s = window.getSelection();
	if(s.anchorNode != s.focusNode || s.anchorOffset != s.focusOffset)
	{

		hoverMenu();
	}
}
function closeHoverMenu(e=null){
	const menuframe = document.getElementById("kbytes-hovering-menu");
	if (menuframe != null){
		menuframe.parentNode.removeChild(menuframe);
	}
}
function loadHighlights(){
	console.log(window.location);
	var location = ' ' + window.location;
	browser.runtime.sendMessage({request: "loadHighlights", url: location}).then(highlights => {
		console.log(highlights.response);
		if(highlights.response.length > 0){
			var urlHls = highlights.response;
			console.log(urlHls);
			for (let h of urlHls){
				var start = getNode(h.selection.start);
				var startOffset = h.selection.startOffset;
				var end  = getNode(h.selection.end);
				var endOffset = h.selection.endOffset;
				console.log(start);
				console.log(end);
				var range = document.createRange();
				range.setStart(start, startOffset);
				range.setEnd(end, endOffset);

				styleRange(range, h);
			}
		}

	}).catch(error =>{console.log("ERROR while loading highlights : " + error)});

}
loadHighlights();
document.onmousemove = trackMouse;
document.onmouseup = checkDisplay;
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
		e.style.border = "none";
	}
}

function setupHoverMenuContent(activeHighlight, hovmen){
	let idoc = hovmen.contentDocument;
	let colorOptions = idoc.getElementById("color-selector");
	for(let e of colorOptions.childNodes){
		if(e.nodeType == 3)
			continue;
		if(activeHighlight && e.dataset.clr == activeHighlight.color)
			e.style.border = "2px solid black";
		e.onclick = () => {
			console.log(e);
			if(activeHighlight == null)
			{
				console.log(e.dataset.clr);
				addHighlight(e.dataset.clr);
				e.style.border = "2px solid black";
				closeHoverMenu();
			}
			else if( activeHighlight.color == e.dataset.clr)
			{
				console.log(activeHighlight);
				removeHighlight(activeHighlight);
				e.style.border = "2px solid black";
				closeHoverMenu();
			}
			else
			{ 
				clearSelection(colorOptions.childNodes);
				activeHighlight.color = e.dataset.clr;
				activeElements = document.querySelectorAll('kbit[data-uid = "' + activeHighlight.uid + '" ]')
				for (let ae of activeElements){
					ae.style.background = e.id;
				}

				e.style.border = "2px solid black";
				updateHighlight(activeHighlight);

			}
		}
	}
}
function hoverMenu(activeHighlight=null){
	const hovmen = document.createElement('iframe');
	hovmen.id = "kbytes-hovering-menu";
	hovmen.scrolling = "no";
	hovmen.src = browser.runtime.getURL("resources/menu.html");
	hovmen.style = "height: 80px !important; width: 150px !important; top:" + mouseY + "px; left:" + mouseX+ "px; display: block;";
	injectCSS(`
		 #kbytes-hovering-menu {
		    display: none;
		    top: 50px;
		    right: 50px;
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
	var frontier = Array.from(root.childNodes).reverse();
	var recording = false;
	var textNodes = [];


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
		if(recording && activeNode.nodeType == 3 && !(activeNode.nodeValue.trim() === ''))
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
			khelement.onclick = () => {
				hoverMenu(highlight);
			}

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

//browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
//	if(request.request == "ToggleHighlight")
//	{
//		var highlights = [];
//
//		var selection = window.getSelection();
//
//		for(let i = 0 ; i < selection.rangeCount; i++){
//			var r = selection.getRangeAt(i);
//			var id = makeid();
//			var nh = {
//				selection : {
//					start : getNodeCoordinates(r.startContainer),
//					startOffset : r.startOffset,
//					end: getNodeCoordinates(r.endContainer),
//					endOffset: r.endOffset
//				},
//				text: r.toString(),
//				note : "",
//				color : "",
//				uid : id,
//				url : r.startContainer.baseURI,
//				timestamp: new Date()
//			};
//
//			styleRange(r, id );
//			console.log(nh);
//			highlights.push(nh);
//		}
//		console.log(highlights);
//		return Promise.resolve({response: highlights});
//	}
//});
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
					startOffset : r.startOffset,
					end: getNodeCoordinates(r.endContainer),
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
