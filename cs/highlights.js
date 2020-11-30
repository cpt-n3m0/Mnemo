function loadHighlights(){
	var location = (' ' + window.location).trim();
	browser.runtime.sendMessage({request: "loadHighlights", url: location}).then(highlights => {
		if(highlights.response.length > 0){
			var urlHls = highlights.response;
			console.log(urlHls);
			for (let h of urlHls){
				let endOffset = h.selection.endOffset;
				let startOffset = h.selection.startOffset;

				let startquery = `//${h.selection.startContainerTag}/text()[contains(.,  ${getXPathQueryText(h.selection.startContext)})]`;
				let endquery = `//${h.selection.endContainerTag}/text()[contains(.,  ${getXPathQueryText(h.selection.endContext)})]`;
				let start = document.evaluate(startquery , document, null, XPathResult.ANY_TYPE, null).iterateNext();
				let end = document.evaluate(endquery, document, null, XPathResult.ANY_TYPE, null).iterateNext();

				let range = document.createRange();
				range.setStart(start, startOffset);
				range.setEnd(end, endOffset);

				styleRange(range, h);
			}
		}

	}).then(() => {
			browser.runtime.sendMessage({request: "updateViewerContent"});
		}).catch(error =>{console.log("ERROR while loading highlights : " + error)});

}

function addHighlight(clr, tpcID)
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
				_id : id,
				url : r.startContainer.baseURI,
				topicID: tpcID,
				tags: [],
				timestamp: new Date()
			};

			styleRange(r, nh );
			highlights.push(nh);
		}

		browser.runtime.sendMessage({request: "saveHighlight", hl: highlights}).then(() => {
			browser.runtime.sendMessage({request: "updateViewerContent"});
		});
	}
function removeHighlight(hl){
	let highlightComponents = document.querySelectorAll('kbit[data-uid="' + hl._id +'"]');

	for(let c of highlightComponents){
		console.log(c);
		let pn = c.parentNode;
		let prevText = (c.previousSibling && c.previousSibling.nodeType == 3)?c.previousSibling.wholeText:"";
		let nextText = (c.nextSibling && c.nextSibling.nodeType == 3)?c.nextSibling.wholeText:"";
		let textNode = document.createTextNode( prevText + c.lastChild.wholeText + nextText);
		
		console.log(textNode);

		if(prevText != "")
			pn.removeChild(c.previousSibling);
		if(nextText != "")
			pn.removeChild(c.nextSibling);

		pn.insertBefore(textNode, c);
		pn.removeChild(c);
	}

	browser.runtime.sendMessage({request: "removeHighlight", toRemove: hl}).then(() => {
		browser.runtime.sendMessage({request: "updateViewerContent"});
	});
}

function updateHighlight(hl, ot=""){
	browser.runtime.sendMessage({request: "updateHighlight", newHighlight: hl, oldTopic: ot}).then(() => {
		browser.runtime.sendMessage({request: "updateViewerContent"});
	});

}
