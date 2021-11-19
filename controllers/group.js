const PouchDB =  require('pouchdb')
const Plugin =  require('pouchdb-find')

PouchDB.plugin(Plugin)
const {getContact, getContactById} = require('../controllers/contact')
let {connection} = require('../conn')

const postGroup = async (data, cb) => {
	const {name, desc, code} = await data

	const post = await {nama:name, deskripsi:desc, code}
	console.log(post)
	var query = connection.query('INSERT INTO grups SET ?', post, function (error, results, fields) {
	  	if (error) throw error;
	  	cb(results)
	});
}

const putSubGroup = async ({groups, sub_group}, cb) => {
	let post = {grup_id:groups, grup_out_id:sub_group}
	var query = connection.query('INSERT INTO setting_grups SET ?', post, function (error, results, fields) {
	  	if (error) throw error;
	  	console.log(results)
	  	cb(results)
	});
}

const removeGroup = async (data, cb) => {
	const {_id, _rev} = await data
	var query = await connection.query(`DELETE FROM grups WHERE id=${_id}`, function (error, results, fields) {
	  	if (error) throw error;
	  	console.log(results)
	  	cb(results)
	});
}

const removeGroupDetail = async (data, cb) => {
	const {_id, _rev} = data
	console.log(data)
	await dbs.remove(_id, _rev).then((res) => cb(res))
}

const getGroup = async (cb) => {
	var query = connection.query('SELECT * FROM grups', function (error, results, fields) {
	  	if (error) throw error;
	  	console.log(results)
	  	cb(results)
	});
}

const getSettingGroup = async (cb) => {
	var query = connection.query('SELECT * FROM setting_grups', function (error, results, fields) {
	  	if (error) throw error;
	  	console.log(results)
	  	cb(results)
	});
}

const getGroupById = async (id, cb) => {
	await db.get(id).then(async (result) => {
		cb(result)
	})
}

const getGroupsDetails = async (cb) => {
	var query = connection.query('SELECT *,grups.nama AS nama_grup, grup_details.id as g_d_id, grups.id AS g_id, kontaks.id AS k_id FROM grups INNER JOIN grup_details ON grups.id = grup_id INNER JOIN kontaks ON grup_details.kontak_id = kontaks.id', function (error, results, fields) {
	  	if (error) throw error;
	  	console.log(results)
	  	cb(results)
	});
}

const getGroupsDetailsById = async (id,cb) => {
	var query = connection.query(`SELECT *,grups.nama AS nama_grup, grup_details.id as g_d_id, grups.id AS g_id, kontaks.id AS k_id FROM grups INNER JOIN grup_details ON grups.id = grup_id INNER JOIN kontaks ON grup_details.kontak_id = kontaks.id WHERE grups.id = ${id}`, function (error, results, fields) {
	  	if (error) throw error;
	  	console.log(results)
	  	cb(results)
	});
}

const postGroupsDetails = async ({groups, contacts}, cb) => {
	console.log(groups, contacts)
	let post = {kontak_id:contacts, grup_id:groups}
	var query = connection.query('INSERT INTO grup_details SET ?', post, function (error, results, fields) {
	  	if (error) throw error;
	  	console.log(results)
	  	cb(results)
	});
}

const getDetailsGroup = async (cb) => {
	var query = connection.query(`SELECT * FROM grups INNER JOIN setting_grups WHERE grups.id = setting_grups.grup_id ORDER BY grups.id
		`, async function (error, results, fields) {
	  	if (error) throw error;
  		await results.filter((val, index) => {
  			return connection.query(`SELECT * FROM grups WHERE grups.id = ${val.grup_out_id} ORDER BY id`, async (err, res, fields)=> {
  				val['sub'] = await res
  				return val
  			})
  		})

  		await console.log(results)
	});

}

const getDetailsGroupById = async (id, cb) => {
	await dbs.get(id).then(async (result) => {
		cb(result)
	})
}

const getGroupByCode = async (code, cb) => {

	db.find({
        selector: {code: code},
    }).then(async (result) => { 	
		cb(result)   	
    })
}

const removeContactInGroupDetail = async ({groups}, cb) => {
	var query = await connection.query(`DELETE FROM grup_details WHERE id=${groups}`, function (error, results, fields) {
	  	if (error) throw error;
	  	console.log(results)
	  	cb(results)
	});
}




module.exports = {postGroup, getGroupsDetailsById, removeGroup, getGroupByCode, putSubGroup, removeContactInGroupDetail, removeGroupDetail, getDetailsGroupById, getGroup, getGroupsDetails, postGroupsDetails, getDetailsGroup, getGroupById};


