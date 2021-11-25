var express = require('express');
var path = require('path')
var router = express.Router();
var {verifyContact, checkIfContactExist, postContact} = require('../controllers/contact')
var {getGroupByCode, postGroupsDetails, removeContactInGroupDetail, isGroupExist, getGroupsDetailWithId} = require('../controllers/group')
var fs = require('fs')
var qrcode = require('qrcode')
var axios = require('axios')
var { WAConnection, MessageType, ReconnectMode } = require('@adiwajshing/baileys')
__dirname = path.resolve();

const {getProfile, putProfile, postProfile, removeProfile, isApiExist} = require('../controllers/setting')
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.get('/qr', (req, res) => {
    return res.sendFile(__dirname + '/public/images/qr_code.png')
})

router.get('/form/:group_id', (req, res) => {
    return res.send(`<form method="post" action="https://wa.trenbisnis.net/kontak/group">
    		<input placehoder="username" name="username"/>
    		<input type="hidden" name="group" value="${req.params.group_id}"/>
    		<input placehoder="Nomor Wa" name="wa_number"/>
    		<input placehoder="Alamat" name="address"/>
    		<input placehoder="Panggilan" name="called"/>
    		<input placehoder="Panggilan" name="validate" value="true"/>
    		<button>Daftar</button>
    	</form>`)
})



async function run () {
    const conn = new WAConnection() 

    conn.connectOptions = {
    /** fails the connection if no data is received for X seconds */
    maxIdleTimeMs: 10_000,
    /** maximum attempts to connect */
    maxRetries: 10,
    /** max time for the phone to respond to a connectivity test */
    phoneResponseTime: 90_000,
    /** minimum time between new connections */
    connectCooldownMs: 4000,
    /** agent used for WS connections (could be a proxy agent) */
    agent: Agent = undefined,
    /** agent used for fetch requests -- uploading/downloading media */
    fetchAgent: Agent = undefined,
    /** always uses takeover for connecting */
    alwaysUseTakeover: true,
    /** log QR to terminal */
    logQR: true
	} 


   await conn.on ('open', async () => {
	    // save credentials whenever updated
	    console.log (`credentials updated!`)
	    const authInfo = await conn.base64EncodedAuthInfo() // get all the auth info we need to restore this session
	    let user = await conn.user
	    await getProfile(async(result) => {
	    	if(result == undefined){
			    await postProfile({wa_number:user.jid, username:user.name, address:'null', status:true,  subscribe:'daftar', unsubscribe:'stop', session:JSON.stringify(authInfo, null, '\t')}, async (result) => {
				    await console.log(result)
				})
	    	} 
	    })
	   
	})
   	
 	await getProfile(async (result) => {
 		if(result != undefined){
 			await conn.loadAuthInfo(JSON.parse(result.session))
 		}
 	})

    await conn.on('chats-received', async ({ hasNewChats }) => {
        console.log(`you have ${conn.chats.length} chats, new chats available: ${hasNewChats}`)

        const unread = await conn.loadAllUnreadMessages ()
        console.log ("you have " + unread.length + " unread messages")
    })
    // called when WA sends chats
    // this can take up to a few minutes if you have thousands of contacts!
    conn.on('contacts-received', () => {
        console.log('you have ' + Object.keys(conn.contacts).length + ' contacts')
    })

    conn.on('qr', qr => {
    // Now, use the 'qr' string to display in QR UI or send somewhere
    	qrcode.toDataURL(qr)
		  .then(url => {
		      const imageBuffer = Buffer.from(
		    url.replace('data:image/png;base64,', ''),
		    'base64');
		  	fs.writeFileSync('./public/images/qr_code.png', imageBuffer);
		  })
	})

    conn.clearAuthInfo();
    await conn.connect ()
    conn.autoReconnect = ReconnectMode.onConnectionLost
	conn.on("close", async ({ reason, isReconnecting }) => {
	    console.log(  "Disconnected because " + reason + ", reconnecting: " + isReconnecting )
	    if (!isReconnecting && reason == "invalid_session") {
	      	await removeProfile((res) => console.log('profile has been removed'))
	      	await axios.get('http://localhost:7000/start')
	      	conn.clearAuthInfo();
	    }
  	});



    conn.on('chat-update', async chatUpdate => {
        // `chatUpdate` is a partial object, containing the updated properties of the chat
        // received a new message
        if (chatUpdate.messages && chatUpdate.count) {
            const message = chatUpdate.messages.all()[0]

            let reg = message.message.conversation.toLowerCase()
			let a = message.message.conversation.split('#')

			await getProfile((profile) => {
				if(reg == profile.subscribe.toLowerCase()){
			    	verifyContact(message.message.jid, (res) => {
			    		conn.sendMessage(message.message.jid, 'Selamat Anda Sudah Terdaftar')
			    	})
				}

				if(a[0].toLowerCase() == profile.subscribe.toLowerCase() && a[1]){
					getGroupByCode(a[1], async (resultGrup) => {
						if(resultGrup.length > 0){
							let contacts = message.key.remoteJid.substr(0, message.key.remoteJid.length - 15);
							checkIfContactExist(contacts, async (result) => {
								if(result.length == []){
									await postContact({wa_number:contacts, address:a[4], username:a[2], called:a[3]}, async (result) => {
										await postGroupsDetails({groups:resultGrup[0].id, contacts:result.insertId},async (res) => {
											await conn.sendMessage(message.key.remoteJid, `Selamat ${a[3]} ${a[2]} anda sudah Terdaftar di grup ${resultGrup[0]['nama']}`, MessageType.text)
										})
									})
								} else {
									await conn.sendMessage(message.key.remoteJid, `Maaf ${a[3] == undefined ? '' : a[3]} ${a[2]} anda sudah Terdaftar `, MessageType.text)
								}
							})
						} else {
							await conn.sendMessage(message.key.remoteJid, `Maaf ${a[3] == undefined ? '' : a[3]} ${a[2]}  grup tidak ada`, MessageType.text)
						}
					})
				}	

				if(a[0].toLowerCase() == profile.unsubscribe.toLowerCase() && a[1]){
					getGroupByCode(a[1], async (resultGrup) => {
						if(resultGrup.length > 0){
							let contacts = message.key.remoteJid.substr(0, message.key.remoteJid.length - 15);
							checkIfContactExist(contacts, async (result) => {
								if(result.length != []){
									getGroupsDetailWithId({g_id:resultGrup[0].id, c_id:result[0].id}, (result) => {
										if(result[0] != undefined){
											removeContactInGroupDetail({groups:result[0].id}, async (result) => {
												await conn.sendMessage(message.key.remoteJid, `anda sudah berhasil keluar dari grup ${resultGrup[0]['nama']}`, MessageType.text)
											})
										} else {
											conn.sendMessage(message.key.remoteJid, `anda belum terdaftar di grup ${resultGrup[0]['nama']}`, MessageType.text)

										}
									})
								} else {
									await conn.sendMessage(message.key.remoteJid, `Maaf anda Tidak Terdaftar di grup ${resultGrup[0]['nama']}`, MessageType.text)
								}
							})
						} else {
							await conn.sendMessage(message.key.remoteJid, `Maaf  grup tidak ada`, MessageType.text)
						}
					})
				}
			})
		    
        } else console.log (chatUpdate) // see updates (can be archived, pinned etc.)
    })
    router.post('/send', async (req, res, next) => {  
    	getProfile((result) => {
    		if(result == undefined){
    			res.send('gagal')
    		} else {
    			isApiExist(req.body.key, async (res) => {
    				if(res.length > 0){
						if(req.body.contact != undefined){
						    await conn.sendMessage(`${req.body.contact}@s.whatsapp.net`, req.body.message, MessageType.text);
						    return res.send(req.body.contact);
						}
    				} 
    				else {
    					res.send('api key tidak cocok')    					
    				}
    			})
    		}
    	})
	})

	router.post('/send-bulk', async (req, res, next) => {  
		if(req.body.contact != undefined){
		    await conn.sendMessage(`${req.body.contact}@s.whatsapp.net`, req.body.message, MessageType.text);
		    return res.send(req.body.contact);
	}
		else {
			console.log('gagal')
			return res.send('gagal')
		}
	})
}
// run in main file
// connectToWhatsApp ()
// .catch (err => console.log("unexpected error: " + err) ) // catch any errors


module.exports = {router, run};
