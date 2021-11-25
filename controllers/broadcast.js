const axios = require('axios')
const {connection} = require('../conn')
const {getProfile} = require('./setting')
const {getGroupById} = require('./group')
const postBroadcast = async ({groups, messages, url, second},cb) => {
	var query = connection.query(`
		SELECT * FROM grup_details INNER JOIN kontaks ON kontaks.id = grup_details.kontak_id WHERE grup_details.grup_id = ${groups} AND grup_details.status_grup='1'
		`, function (error, results, fields) {
		  		if (error) throw error;
		  		getProfile((result) => {
		  			getGroupById(groups, (resultGroup) => {
			  			var i = 0;              
						async function myLoop() {         
			  				await setTimeout(async function() {   
			  					let sapaan = results[i].sapaan == null ? "" : results[i].sapaan
			  					console.log(sapaan, 'sapaannnnnnnnnnnnnnnn')
			  					let msg = messages.replace(/@nama/g, results[i].nama).replace(/@sapaan/g, sapaan).replace(/@unsubscribe/g, result.unsubscribe).replace(/@code/g, resultGroup[0].code).replace(/@grup/g, resultGroup[0].nama)
				  				await axios.post(`http://${url}/wa/send-bulk`, {contact:results[i].nomor, message: `${msg}`}).then(results => {}).catch(err => err)
								i++;                    
								if (i < results.length) {           
								    await myLoop();             
								}                       
							}, second * 1000)
						}
						myLoop()
		  			})
	  			})

			})
}

module.exports = {postBroadcast};

