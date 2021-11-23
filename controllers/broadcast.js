const axios = require('axios')
const {connection} = require('../conn')
const postBroadcast = async ({groups, messages, url},cb) => {
	var query = connection.query(`
		SELECT * FROM grup_details INNER JOIN kontaks ON kontaks.id = grup_details.kontak_id WHERE grup_details.grup_id = ${groups}
		`, function (error, results, fields) {
		  	if (error) throw error;
		  	results.filter(async(vals) => {
		  		let msg = messages.replace(/@nama/g, vals.nama).replace(/@sapaan/g, vals.sapaan)
		  		await axios.post(`https://${url}/wa/send-bulk`, {contact:vals.nomor, message: `${msg}`}).then(results => {}).catch(err => err)
		    })
		  	cb(results)
	});
}

module.exports = {postBroadcast};

