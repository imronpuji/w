const axios = require('axios')
const {connection} = require('../conn')
const postBroadcast = async ({groups, messages, url, second},cb) => {
	var query = connection.query(`
		SELECT * FROM grup_details INNER JOIN kontaks ON kontaks.id = grup_details.kontak_id WHERE grup_details.grup_id = ${groups}
		`, function (error, results, fields) {
		  		if (error) throw error;
	  			var i = 0;              
				async function myLoop() {         
	  				await setTimeout(async function() {   
		  				let msg = messages.replace(/@nama/g, results[i].nama).replace(/@sapaan/g, results[i].sapaan)
		  				console.log('heloooooooooooooooooooooooooooooooo')
		  				await axios.post(`https://${url}/wa/send-bulk`, {contact:results[i].nomor, message: `${msg}`}).then(results => {}).catch(err => err)
						i++;                    
						if (i < results.length) {           
						    await myLoop();             
						}                       
					}, second * 1000)
				}

				myLoop()

			})
}

module.exports = {postBroadcast};

