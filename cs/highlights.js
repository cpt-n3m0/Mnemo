function loadHighlights(){
	var location = ' ' + window.location;
	browser.runtime.sendMessage({request: "loadHighlights", url: location}).then(highlights => {
		if(highlights.response.length > 0){
			var urlHls = highlights.response;
			console.log(urlHls);
			for (let h of urlHls){
				let endOffset = h.selection.endOffset;
				let startOffset = h.selection.startOffset;


				let startquery = `//${h.selection.startContainerTag}/text()[contains(.,  ${getXPathQueryText(h.selection.startContext)})]`;
				let endquery = `//${h.selection.endContainerTag}/text()[contains(.,  ${getXPathQueryText(h.selection.endContext)})]`;

				console.log(startquery);
				console.log(endquery);
				console.log(getXPathQueryText(h.selection.startContext));
				let start = document.evaluate(startquery , document, null, XPathResult.ANY_TYPE, null).iterateNext();
				let end = document.evaluate(endquery, document, null, XPathResult.ANY_TYPE, null).iterateNext();
				let range = document.createRange();
				console.log(start);
				console.log(end);
				range.setStart(start, startOffset);
				range.setEnd(end, endOffset);

				styleRange(range, h);
			}
		}

	}).catch(error =>{console.log("ERROR while loading highlights : " + error)});

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
					startContainerTag : r.startContainer.parentElement.localName,
					startContext: r.startContainer.textContent,
					startOffset : r.startOffset,
					endContainerTag : r.endContainer.parentElement.localName,
					endContext: r.endContainer.textContent,
					endOffset: r.endOffset
				},
				text: r.toString(),
				note : "",
				color : clr,
				uid : id,
				url : r.startContainer.baseURI,
				tags: [],
				timestamp: new Date()
			};

			styleRange(r, nh );
			highlights.push(nh);
		}


  /*		let data = `
  			url=${highlights[0].url}
  			extractors=topics
  			cleanup.mode=cleanHTML

  		`;
  		console.log(data);
  		const tags = await fetch("https://api.textrazor.com", {
  			method: 'POST',
  			mode: 'no-cors',
  			headers:{
  				'Content-Type': "application/x-www-form-urlencoded",
  				'X-TextRazor-Key': "xxxxx",
  				'Access-Control-Allow-Origin': 'https://api.textrazor.com'

  			},
  			body : data
  		});
  		console.log(tags.json());
  */
		browser.runtime.sendMessage({request: "saveHighlight", hl: highlights}).then(() => {
			browser.runtime.sendMessage({request: "updateViewerContent"});
		});
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
	browser.runtime.sendMessage({request: "removeHighlight", toRemove: hl}).then(() => {
			console.log("updating view after remove");
			browser.runtime.sendMessage({request: "updateViewerContent"});
		});
}

function updateHighlight(hl){
	browser.runtime.sendMessage({request: "updateHighlight", newHighlight: hl}).then(() => {
			browser.runtime.sendMessage({request: "updateViewerContent"});
		});

}
