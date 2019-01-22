const fs = require('fs');
const https = require('https');
const { execFile } = require('child_process');

// exec shell script that i gave up on but returns list of url paths that contain inmate info
const child = execFile('./update-dataset.sh', (error, stdout, stderr) => {
  if (error) {
    throw error;
  }
  urlListToArray(stdout)
});

// filter no_statement inmates, get only up to .html of each url
const urlListToArray = urls => {
	urls = urls
						.split('/')
						.filter(u => u.includes('.html') || u.includes('no_last_statement'))
						.map(u => u.slice(0, u.indexOf('.html') + 5));

	fetchUrlData(urls);
}

// fetch data for each url
const fetchUrlData = pages => {
	const hostname = "https://www.tdcj.texas.gov";
	const path = "/death_row/dr_info/";
	const inmateJson = [];
						console.log('getting individual pages')

	pages.forEach((page, i) => {
		https.get(`${hostname}${path}${page}`, (resp) => {
			console.log('resolving', page);
			let data = '';
			resp.on('data', (chunk) => data += chunk);
			resp.on('end', () => {
				inmateJson.push(extractInmateData(data))
				if (inmateJson.length === pages.length) {
					console.log('writing file')
					console.log( inmateJson.filter(i => i.name && i.words))
					fs.writeFile("data/data.json", JSON.stringify(inmateJson), (err) => {
					});
				}
			});
		});
	})
}

// extract name & words from each inmate page
const extractInmateData = html => {
	const dates = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	let ptags = html.match(/<p>.*?<\/p>/gm)
	ptags = ptags.map(t => t.replace(/<p>/, '').replace(/<\/p>/, ''));
	const dateIndex = ptags.findIndex(t => 
		dates.find(d => t.includes(d))
	);
	return {
		name: ptags[dateIndex + 1],
		words : ptags[dateIndex + 2]
	}
}