window.addEventListener('load', function(){

		loadHighlights();
	});


function loadHighlights(){
	console.log(window.location);
	var location = ' ' + window.location;
	browser.runtime.sendMessage({request: "loadHighlights", url: location}).then(highlights => {
		console.log(highlights.response);
		if(highlights.response.length > 0){
			console.log("FOUND!");
			var urlHls = highlights.response;
			console.log(urlHls);
			for (let h of urlHls){
				var start = getNode(h.selection.start);
				var startOffset = h.selection.startOffset;
				var end  = getNode(h.selection.end);
				var endOffset = h.selection.endOffset;

				var range = document.createRange();
				range.setStart(start, startOffset);
				range.setEnd(end, endOffset);

				styleRange(range, h.hid);
			}
		}

	}).catch(error =>{console.log("ERROR while loading highlights : " + error)});

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


//function ogetTextNodes(root, start, end, init=true){
//	if(init){
//		getTextNodes.textNodes = [];
//		getTextNodes.recording = false;
//		getTextNodes.done = false;
//	}
//
//
//	if(root.isEqualNode(start)){
//		getTextNodes.recording = true;
//		getTextNodes.textNodes.push(start);
//		return;
//	}
//	if (root.isEqualNode(end)){
//		console.log(root.parentElement);
//		getTextNodes.textNodes.push(root);
//		getTextNodes.done = true;
//		return;
//	}
//	if(getTextNodes.recording && root.nodeType == 3 && !(root.nodeValue.trim() === ''))
//		getTextNodes.textNodes.push(root);
//	
//
//
//	for(let e of root.childNodes){
//		getTextNodes(e, start, end, init=false);
//		if(getTextNodes.done)
//			return;
//		
//	}
//}

function getTextNodes(root, start, end){
	var frontier = Array.from(root.childNodes).reverse();
	var recording = false;
	var textNodes = [];


	while(frontier.length > 0){
		console.log(frontier);
		var activeNode = frontier.pop();

		if(activeNode.isEqualNode(start)){
			recording = true;
			console.log("starting");
			textNodes.push(activeNode);
			continue;
		}
		if (activeNode.isEqualNode(end)){
			textNodes.push(activeNode);
			console.log("ending");
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
function styleRange(r, id){
		var textNodes = [];

		if(r.startContainer.isEqualNode(r.endContainer)){
			var oldText = r.startContainer.textContent.slice(r.startOffset, r.endOffset);
			r.commonAncestorContainer.parentElement.innerHTML = r.commonAncestorContainer.parentElement.innerHTML.replace(oldText, "<Kbit style='background-color: yellow;'>" + oldText + "</Kbit>");

			return;
		}


		var start = r.startContainer;
		var end = r.endContainer;


		textNodes = getTextNodes(r.commonAncestorContainer, start, end);
		//textNodes = getTextNodes.textNodes;
		console.log(r);
		console.log(textNodes);
		for(let i = textNodes.length -1; i >= 0 ; i--){
			var pe = textNodes[i].parentElement;	
			var oldText = textNodes[i].nodeValue;

			var khelement = document.createElement('Kbit');
			khelement.style.background = "yellow";
			khelement.id = id;

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

browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.request == "ToggleHighlight")
	{
		var highlights = [];

		var selection = window.getSelection();

		for(let i = 0 ; i < selection.rangeCount; i++){
			var r = selection.getRangeAt(i);
			var id = makeid(); 
			var nh = {
				selection : {
					start : getNodeCoordinates(r.startContainer),
					startOffset : r.startOffset,
					end: getNodeCoordinates(r.endContainer),
					endOffset: r.endOffset
				},
				text: r.toString(),
				note : "",
				color : "",
				hid : id,
				url : r.startContainer.baseURI,
				timestamp: new Date()
			};

			styleRange(r, id );	
			console.log(nh);
			highlights.push(nh);
		}
		console.log(highlights);
		return Promise.resolve({response: highlights});
	}
});

