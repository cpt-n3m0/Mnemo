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
		if(recording && activeNode.nodeType == 3 && activeNode.textContent.trim() != '')
			textNodes.push(activeNode);
		for(let i = activeNode.childNodes.length - 1; i >= 0; i--)
			frontier.push(activeNode.childNodes[i]);

	}

	return textNodes;
}


function escapeSpecialCharacters(text, xquery = false){
	return text.replace(/&/g, "&amp;")
		.replace(/>/g, "&gt;")
		.replace(/</g, "&lt;")
		.replace(/\xa0/g, "&nbsp;");
		

}
function styleRange(r, highlight){
		let uid = highlight._id;
		let color = highlight.color;

		if(r.startContainer.isEqualNode(r.endContainer)){
			let oldText = r.startContainer.textContent.slice(r.startOffset, r.endOffset);
			// escape special characters

			oldText = escapeSpecialCharacters(oldText);
			console.log(oldText);
			console.log(r.commonAncestorContainer.parentElement.innerHTML);
			r.commonAncestorContainer.parentElement.innerHTML = r.commonAncestorContainer.parentElement.innerHTML.replace(oldText, "<kbit style='background-color: "+ color + ";display:inline;' data-uid= " + uid + ">" + oldText + "</kbit>");
			let h = document.querySelector('kbit[data-uid ="' + highlight._id + '"]');

			h.onclick = () => hoverMenu(highlight);
			return;
		}

		let start = r.startContainer;
		let end = r.endContainer;
		let	textNodes = getTextNodes(r.commonAncestorContainer, start, end);
	
		for(let i = textNodes.length -1; i >= 0 ; i--){
				let pe = textNodes[i].parentElement;
				let oldText = textNodes[i].nodeValue;

				let kbit = document.createElement('kbit');
				kbit.style.background = color;
				kbit.style.display = "inline";
				kbit.dataset.uid = uid;
				kbit.onclick = () => hoverMenu(highlight);

				if(i == textNodes.length - 1)
				{
					kbit.textContent = oldText.slice(0,  r.endOffset);
					var remainingText =document.createTextNode(oldText.slice (r.endOffset, oldText.length ));
				}
				else if(i == 0)
				{
					kbit.textContent = oldText.slice(r.startOffset, oldText.length );
					var remainingText =document.createTextNode(oldText.slice (0, r.startOffset ));
				}
				else
					kbit.textContent = oldText;

				pe.replaceChild( kbit, textNodes[i]);

				if(i == textNodes.length - 1)
					pe.insertBefore(remainingText, kbit.nextSibling);
				if(i == 0)
					pe.insertBefore(remainingText, kbit);

				console.log(`${i}/${textNodes.length}`)
		}
	  console.log("range Styling completed");
}


function getXPathQueryText(context){
	if(context.indexOf("\"") < 0 && context.indexOf("'") < 0)
		return `"${context}"`;

	let query = "concat("

	let portion="";
	for(let c of context){
		if(c == '"'){
			query += `, "${portion}"`;
			query += ", '\"'";
			portion = "";
			continue;
		}
		if(c == "'"){
			query += `, "${portion}"`;
			query += ', "\'"';
			portion="";
			continue;
		}
		portion += c;
	}
	query = query.slice(0, 7) + query.slice(8, query.length);
	query += ")"
	return query
}
