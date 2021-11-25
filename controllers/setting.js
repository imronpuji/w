const PouchDB =  require('pouchdb')

let {connection} = require('../conn')
const uuidAPIKey = require('uuid-apikey');

const postProfile = async (data, cb) => {
	let api_key = await uuidAPIKey.create()

	const {username, wa_number, subscribe, unsubscribe, session} = await data
	const post = await {nama:username, nomor:wa_number, status:true, subscribe:'daftar', unsubscribe:'stop', session, api_key:api_key.apiKey}
	var query = connection.query('INSERT INTO owner SET ?', post, function (error, results, fields) {
	  	if (error) throw error;
	  	cb(results)
	});
}

const putProfile = async (type, body, cb) => {

	if(type == 4){
		const {username, address, wa_number, subscribe, unsubscribe, id} = await body

		
		const post = { nama:username, alamat:'value', nomor:wa_number, status:true, subscribe, unsubscribe} 
		await connection.query(`UPDATE owner SET subscribe='${subscribe}', unsubscribe='${unsubscribe}' WHERE id=${id}`, (err, results, field) => {
			cb(results)
		})
	}

}

const removeProfile = async (cb) => {
	await getProfile(async res => {
		
		if(res != undefined){
			await connection.query(`DELETE FROM owner WHERE id=${res.id}`, (err, results, field) => {
				cb(results)
			})
		}
	})
}

const getProfileById = async (id, cb) => {
	await db.get(id).then(async (result) => {
		cb(result)
	})
}

const getProfile = async (cb) => {
	let query = connection.query('SELECT * FROM owner', function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	cb(results[0])
	});
}

const isApiExist = async (api_key, cb) => {
	let query = connection.query(`SELECT * FROM owner WHERE api_key='${api_key}'`, function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	cb(results)
	});
}

module.exports = {postProfile, getProfile, getProfileById, removeProfile, putProfile, isApiExist};


