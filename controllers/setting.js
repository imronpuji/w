const PouchDB =  require('pouchdb')

let {connection} = require('../conn')

const postProfile = async (data, cb) => {
	const {username, wa_number} = await data
	const post = await {nama:username, nomor:wa_number, status:false}
	var query = connection.query('INSERT INTO owner SET ?', post, function (error, results, fields) {
	  	if (error) throw error;
	  	cb(results)
	});
}

const putProfile = async (type, body, cb) => {
	if(type == 1){	
		getProfile(async (result) => {
			const {username, address, wa_number, status, date, _rev} = body
			await db.put({_id:result['doc']._id, _rev, username:username, wa_number:wa_number, address:address, date, status}).then(async (result) => cb(result))	
		})
	} 
	
	if(type == 4){
		getProfile(async (result) => {
			const {wa_number, username, address, status, _rev} = result['doc']
			await db.put({_id:result['doc']._id ,_rev, username:username, wa_number:wa_number, address:address, date:new Date(), status:false}).then(async (result) => cb(result))	
		})
	}

	else {
		getProfile(async (result) => {
			const {wa_number, username, address, status, _rev} = result['doc']
			await db.put({_id:result['doc']._id,_rev, username:username, wa_number:wa_number, address:address, date:new Date(), status:true}).then(async (result) => cb(wa_number))	
		})
	}
}

const removeProfile = async (data, cb) => {
	const {_id, _rev} = data
	console.log(data)
	await db.remove(_id, _rev).then((res) => cb(res))
}

const getProfileById = async (id, cb) => {
	await db.get(id).then(async (result) => {
		cb(result)
	})
}

const getProfile = async (cb) => {
	let query = connection.query('SELECT * FROM owner', function (error, results, fields) {
	  	if (error) throw error;
	  	console.log(results)
	  	cb(results[0])
	});
}

module.exports = {postProfile, getProfile, getProfileById, removeProfile, putProfile};


