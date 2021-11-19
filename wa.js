
// const run = async () => {


// 	const SESSION_FILE_PATH = './session.json';
// // Load the session data if it has been previously saved
// let sessionData;
// let client;
// if(fs.existsSync(SESSION_FILE_PATH)) {
// 	console.log('ada')
//     sessionData = require(SESSION_FILE_PATH);
//     client = await new Client({ session:sessionData, puppeteer: { headless: true, waitUntil: 'networkidle2',
//         timeout: 9999999 }});
// } else {
// 	client = await new Client({puppeteer: { headless: true, waitUntil: 'networkidle2',
//         timeout: 9999999 }});
// }


// 	client.on('authenticated', (session) => {    
// 	    sessionData = session;
// 	    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
// 	        if (err) {
// 	            console.error(err);
// 	        }
// 	    });
// 	});
// 	await client.on('qr', async (qr) => {
// 		await qrcode.toDataURL(qr)
// 		  .then(url => {
// 		      const imageBuffer = Buffer.from(
// 		    url.replace('data:image/png;base64,', ''),
// 		    'base64');
// 		  	fs.writeFileSync('./public/images/qr_code.png', imageBuffer);
// 		  })
// 	});

// 	await client.on('ready', async () => {
// 		putProfile(3,'', async (number)=> {
// 			await client.sendMessage(`${number}@c.us`, 'whatsap sudah siap digunakan')
// 		})
	    
// 	    router.post('/send-bulk', async (req, res, next) => {  
// 			if(req.body.contact != undefined){
// 			    await client.sendMessage(`${req.body.contact}@c.us`, req.body.message);
// 			    return res.send(req.body.contact);
// 		}
// 			else {
// 				return res.send('gagal')
// 			}
// 		})

// 		router.get('/logout', async (req, res, next) => {
// 			client.logout()
// 			putProfile(4,'', (res)=> console.log(res))
// 			fs.unlinkSync('./session.json')
// 			res.redirect('/setting');
// 		})
// 	});

// 	await client.on('message', async msg => {
// 		let reg = msg.body.toLowerCase()
// 		let a = msg.body.split('#')
// 	    if(reg == 'daftar'){
// 	    	verifyContact(msg.from, (res) => {
// 	    		client.sendMessage(msg.from, 'Selamat Anda Sudah Terdaftar')
// 	    	})
// 		}

// 		if(a[0].toLowerCase() == 'daftar' && a[1]){
// 			console.log(a[1], 'a1')
// 			getGroupByCode(a[1], (result) => {
// 				if(result.docs[0] != []){
// 					console.log(result, 'result')
// 					let contacts = msg.from.substr(0, msg.from.length - 5);
// 					postGroupsDetails({groups:result.docs[0]._id, contacts},(res) => {
// 						if(result.docs[0].sub_group && result.docs[0].sub_group.length > 0){
// 							result.docs[0].sub_group.filter(val => {
// 								removeContactInGroupDetail({groups:val._id, contacts}, async ()=> console.log('berhasil'))
// 							})
// 						}
// 					})
// 				}
// 			})
// 		}	

// 	});

// 	await client.initialize();
// }