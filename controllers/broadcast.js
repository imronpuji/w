const PouchDB =  require('pouchdb')
const Plugin =  require('pouchdb-find')
const axios = require('axios')

PouchDB.plugin(Plugin)

const {connection} = require('../conn')
const postBroadcast = async ({groups, messages, url},cb) => {
	
	// await dbs.get(groups).then(async res => {
	// 	if(res.contact != []){
	//     	await axios.post('http://localhost:7000/wa/send-bulk', {contact:res.contact.wa_number, message:messages}).then(results => {}).catch(err => err)	
	// 	} 
	// 	if(res.contact.length > 0) {
	// 	    await res.contact.filter(async(vals) => {
	// 	    	console.log(vals)
	// 	  		await axios.post('http://localhost:7000/wa/send-bulk', {contact:vals.wa_number, message:messages}).then(results => {}).catch(err => err)
	// 	    })
	// 	}
	// })
	// await cb('berhasil')
	console.log(groups)
	var query = connection.query(`
		SELECT * FROM grup_details INNER JOIN kontaks ON kontaks.id = grup_details.kontak_id WHERE grup_details.grup_id = ${groups}
		`, function (error, results, fields) {
		  	if (error) throw error;
		  	results.filter(async(vals) => {
		  		let msg = messages.replace('@nama', vals.nama).replace('@sapaan', vals.sapaan)
		  		

		  		console.log(msg)
		  		await axios.post(`https://${url}/wa/send-bulk`, {contact:vals.nomor, message: `${msg}`}).then(results => {}).catch(err => err)
		    })
		  	cb(results)
	});
}

module.exports = {postBroadcast};

