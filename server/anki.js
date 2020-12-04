var http = require("http");


function processTags(rawTags){
    let tags = rawTags.split(",").map((s, i, a) =>{
            let ns =s ;
            ns.trim();
            ns = ns.replace(" ", "_");
            return ns;
    });
    return tags;
}

async function invoke(data){
    const options = {
		hostname : 'localhost',
        port: 8765,
		method: 'POST',
		headers: {
			'Content-Type' : 'application/json',
            'Content-Length': data.length
		}
	};



    const req =  http.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`);
		console.log("Anki Note Added");

        let respObject = [] ;
		let respSize = 0;
		res.on('data', chunk =>{
			respObject.push(chunk);
			respSize += chunk.length;
		} );
		res.on('end', () => {
			respObject = Buffer.concat(respObject, respSize).toString();
            console.log(`respObject : ${JSON.stringify(respObject)}`);
        });
	});
	req.on('error', err => console.error(err));
	req.write(data);
	req.end();
}
exports.addNote = async function(an) {
    const data = JSON.stringify({
        "action": "addNote",
        "version": 6,
        "params": {
            "note": {
                "deckName": "Test Deck",
                "modelName": "Basic",
                "fields": {
                    "Front": an.front,
                    "Back": an.back
                },
                "options": {
                    "allowDuplicate": false,
                    "duplicateScope": "deck",
                    "duplicateScopeOptions": {
                        "deckName": "Default",
                        "checkChildren": false
                    }
                },
                "tags": processTags(an.tags)
            }
        }
    });
    invoke(data);
}
exports.sync = async function() {
    const data = JSON.stringify({
        "action": "sync",
        "version": 6
    });
    invoke(data);
}
