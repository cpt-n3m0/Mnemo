exports.tag = async function(request, response, next){
	var https = require("https");
	const options = {
		hostname : 'api.meaningcloud.com',
		path: '/topics-2.0',
		method: 'POST',
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
		}
	};
	let tags = [];
	const req =  https.request(options, res => {
		console.log(`statusCode: ${res.statusCode}`);
		
			
		let respObject = [] ;
		let respSize = 0;
		res.on('data', chunk =>{
			respObject.push(chunk);
			respSize += chunk.length;
		} );
		res.on('end', () => {
		
			
			respObject = JSON.parse(Buffer.concat(respObject, respSize).toString());
			
			console.log(request.body.url);
			console.log(respObject);
			if(respObject.status.code != '200')
			{
				next();
				return;
			}
			for (let e of respObject.entity_list)
			{
				if(e.sementity.type && (e.sementity.type == "Top" || e.sementity.type.indexOf("MethodSystem") > -1 ) && tags.indexOf(e.form) == -1) 
					tags.push(e.form);
			}
			for (let e of respObject.concept_list)
			{
				if(e.relevance > 20 && tags.indexOf(e.form) ==  -1 )
					tags.push(e.form);
			}
			request.body.tags = tags;
			next();
		});
	});
	req.on('error', err => {
		console.error(err);
		next();
	} );
	let query = `${new URLSearchParams({"lang": "en", "key" : "d73eb84997ffe0489c85d52674710f80", "url": request.body.url, "uw" : "y", "of" : "json", "tt" : "ec" })}`;
	console.log(query);
	req.write(query);

	req.end();
} 
