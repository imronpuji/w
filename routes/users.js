var express = require('express');
var path = require('path')
var router = express.Router();
var {run_wa} = require('../app')
var {verifyContact} = require('../controllers/contact')
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
    return res.send(`<form method="post" action="http://192.168.1.6:7000/kontak/group">
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
	    maxIdleTimeMs: 60_000,
	    /** maximum attempts to connect */
	    maxRetries: 10,
	    /** max time for the phone to respond to a connectivity test */
	    phoneResponseTime: 15_000,
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
				getGroupByCode(a[1], (result) => {
					if(result.docs[0] != []){
						console.log(result, 'result')
						let contacts = message.message.jid.substr(0, message.message.jid.length - 15);
						postGroupsDetails({groups:result.docs[0]._id, contacts},(res) => {
							if(result.docs[0].sub_group && result.docs[0].sub_group.length > 0){
								result.docs[0].sub_group.filter(val => {
									removeContactInGroupDetail({groups:val._id, contacts}, async ()=> console.log('berhasil'))
								})
							}
						})
					}
				})
			}	
        } else console.log (chatUpdate) // see updates (can be archived, pinned etc.)
    })
    router.get('/send', async (req, res) => {
    	const sentMsg  = await conn.sendMessage ('6285846224389@s.whatsapp.net', 'oh hello there', MessageType.text)
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
