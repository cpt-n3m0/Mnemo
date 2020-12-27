function injectCSS(cssContent){
	const style = document.createElement('style');
	style.textContent = cssContent;
	document.head.append(style);
}


function clearSelection(selector){
	for (let e of selector){
		if(e.nodeType == 3)
			continue;
		e.classList.remove("selected") ;
	}
}

function createButton(textContent, classes, id="")
{
	 	let newBtn = 	document.createElement("button");
 		newBtn.classList.add(...classes);
		newBtn.textContent = textContent;
		newBtn.id = id;
		return newBtn;
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

function getHoverColor(color, n=40){
	if(color.startsWith("rgb")){
		let vals = color.slice(4, -1).split(",");
		vals[0] = (parseInt(vals[0], 10) + n).toString(10);
		vals[1] = (parseInt(vals[1], 10) + n).toString(10);
	
		let finalVal =`rgb(${vals.join(',')})`;
		return  finalVal;
	}
	else if(color[0] == '#'){
		let addHex = (hexStr, v) => {
						let intval =  parseInt(hexStr, 16) + v ;
						if (intval > 255)
							return "FF";
						if (intval < 0)
							return "00";
						return intval.toString(16);
		}
		let finalVal = "";
		finalVal += addHex(color.slice(1,3),n );
		finalVal += addHex(color.slice(3,5),n );

		return "#" + finalVal + color.slice(start=5);
	}
}

function setupKbitBehaviour(highlight)
{
		let kbits = document.querySelectorAll('kbit[data-uid ="' + highlight._id + '"]');
		for (let kbit of kbits)
		{
				kbit.style.backgroundColor = highlight.color;
				kbit.style.display = "inline";
				kbit.onmouseover = () => {
							kbit.style.cursor = "pointer";
							for (let e of kbits)
								e.style.backgroundColor = getHoverColor(e.style.backgroundColor, -40);
						}

			  kbit.onmouseout = () => {
					let kbits = document.querySelectorAll('kbit[data-uid ="' + highlight._id + '"]');
					for (let e of kbits)
						e.style.backgroundColor = getHoverColor(e.style.backgroundColor, 40);
				};
				kbit.onclick = () => hoverMenu(highlight);

		}
		
				
}

function styleRange(r, highlight){
		let uid = highlight._id;
		let color = highlight.color;

		if(r.startContainer.isEqualNode(r.endContainer)){
			let oldText = r.startContainer.textContent.slice(r.startOffset, r.endOffset);
			oldText = escapeSpecialCharacters(oldText);
			r.commonAncestorContainer.parentElement.innerHTML = r.commonAncestorContainer.parentElement.innerHTML.replace(oldText, "<kbit  data-uid= " + uid + ">" + oldText + "</kbit>");
			
			setupKbitBehaviour(highlight);
			return;
		}

		let start = r.startContainer;
		let end = r.endContainer;
		let	textNodes = getTextNodes(r.commonAncestorContainer, start, end);
	
		for(let i = textNodes.length -1; i >= 0 ; i--){
				let pe = textNodes[i].parentElement;
				let oldText = textNodes[i].nodeValue;

				let kbit = document.createElement('kbit');
				kbit.dataset.uid = uid;


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
		}
		setupKbitBehaviour(highlight);
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
	query += ")";
	return query;
}

function setViewVisibility(cls, display, idoc)
{
	 let clsElements= idoc.querySelectorAll(cls);
	 for(let e of clsElements){
				if(display)
			 			e.classList.remove("hidden-view");
		 		else
			 			e.classList.add("hidden-view");
	 }
}
