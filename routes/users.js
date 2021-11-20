var express = require('express');
var path = require('path')
var router = express.Router();
var {run_wa} = require('../app')
var {verifyContact, checkIfContactExist, postContact} = require('../controllers/contact')
var {getGroupByCode, postGroupsDetails, removeContactInGroupDetail} = require('../controllers/group')
var fs = require('fs')
var qrcode = require('qrcode')
var { WAConnection, MessageType } = require('@adiwajshing/baileys')
__dirname = path.resolve();

const {getProfile, putProfile} = require('../controllers/setting')
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



   await conn.on ('open', () => {
	    // save credentials whenever updated
	    console.log (`credentials updated!`)
	    const authInfo = conn.base64EncodedAuthInfo() // get all the auth info we need to restore this session
	    fs.writeFileSync('./auth_info.json', JSON.stringify(authInfo, null, '\t'))

	})
   	
   	if (fs.existsSync('./auth_info.json')) {
    	await conn.loadAuthInfo ('./auth_info.json') 
	}

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

    await conn.connect ()
    conn.on('chat-update', chatUpdate => {
        // `chatUpdate` is a partial object, containing the updated properties of the chat
        // received a new message
        if (chatUpdate.messages && chatUpdate.count) {
            const message = chatUpdate.messages.all()[0]

            let reg = message.message.conversation.toLowerCase()
			let a = message.message.conversation.split('#')
		    if(reg == 'daftar'){
		    	verifyContact(message.message.jid, (res) => {
		    		conn.sendMessage(message.message.jid, 'Selamat Anda Sudah Terdaftar')
		    	})
			}

			if(a[0].toLowerCase() == 'daftar' && a[1]){
				console.log(a[1], 'a1')
				getGroupByCode(a[1], async (resultGrup) => {
					if(resultGrup[0] != []){
						let contacts = message.key.remoteJid.substr(0, message.key.remoteJid.length - 15);
						checkIfContactExist(contacts, async (result) => {
							if(result.length == []){
								await postContact({wa_number:contacts, address:a[4], username:a[2], called:a[3]}, async (result) => {
									await postGroupsDetails({groups:resultGrup[0].id, contacts:result.insertId},async (res) => {
										// await getSettingGroupById(result[0].id, async (result) => {
										// 	await result.filter(async val => {
										// 		if(val.grup_id != undefined){
										// 			await getGroupsDetailsById(val.grup_out_id, (result)=>{
										// 				result.filter(val => {
										// 					 if(val.nomor == contacts){
										// 					 	removeContactInGroupDetail({groups:val.g_d_id}, (res) => {
										// 					 		return res
										// 					 	})
										// 					 	removeContact({id:val.kontak_id}, (res) => {
										// 					 		return res
										// 					 	})
										// 					 }
										// 				})
										// 			})
										// 		}
										// 	})
										// })
										await conn.sendMessage(message.key.remoteJid, `Selamat ${a[3]} ${a[2]} anda sudah Terdaftar di grup ${resultGrup[0]['nama']}`, MessageType.text)
									})
								})
							} else {
								await conn.sendMessage(message.key.remoteJid, `Maaf ${a[3] == undefined ? '' : a[3]} ${a[2]} anda sudah Terdaftar di grup ${resultGrup[0]['nama']}`, MessageType.text)
							}
						})
					}
				})
			}	
        } else console.log (chatUpdate) // see updates (can be archived, pinned etc.)
    })
    router.get('/send', async (req, res) => {
    	const sentMsg  = await conn.sendMessage('6285846224389@s.whatsapp.net', 'oh hello there', MessageType.text)
    	await res.send('terkirim')
	})

	router.post('/send-bulk', async (req, res, next) => {  
		if(req.body.contact != undefined){
		    await conn.sendMessage(`${req.body.contact}@s.whatsapp.net`, req.body.message, MessageType.text);
		    return res.send(req.body.contact);
	}
		else {
			return res.send('gagal')
		}
	})
}
// run in main file
// connectToWhatsApp ()
// .catch (err => console.log("unexpected error: " + err) ) // catch any errors


module.exports = {router, run};
