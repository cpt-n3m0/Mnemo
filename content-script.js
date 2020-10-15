
console.log("hello there");

function Highlight(selection, id){
	this.selection = selection;
	this.note = "";
	this.color = "";
	this.id = id;

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


function ogetTextNodes(root, start, end, init=true){
	if(init){
		getTextNodes.textNodes = [];
		getTextNodes.recording = false;
		getTextNodes.done = false;
	}


	if(root.isEqualNode(start)){
		getTextNodes.recording = true;
		getTextNodes.textNodes.push(start);
		return;
	}
	if (root.isEqualNode(end)){
		console.log(root.parentElement);
		getTextNodes.textNodes.push(root);
		getTextNodes.done = true;
		return;
	}
	if(getTextNodes.recording && root.nodeType == 3 && !(root.nodeValue.trim() === ''))
		getTextNodes.textNodes.push(root);
	


	for(let e of root.childNodes){
		getTextNodes(e, start, end, init=false);
		if(getTextNodes.done)
			return;
		
	}
}

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


function styleSelection(s, id){
	for(let i = 0 ; i < s.rangeCount; i++){
		var textNodes = [];
		var r = s.getRangeAt(i);
		
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
}

browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.msg == "ToggleHighlight")
	{

		var selection = window.getSelection();
		var id = makeid(); 
		styleSelection(selection, id );	
		var nh = new Highlight(selection, id);
		return Promise.resolve({msg: nh});
	}
});

document.body.style.background = 'yellow';
