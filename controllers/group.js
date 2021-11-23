const PouchDB =  require('pouchdb')
const Plugin =  require('pouchdb-find')

PouchDB.plugin(Plugin)
const {getContact, getContactById} = require('../controllers/contact')
let {connection} = require('../conn')

const postGroup = async (data, cb) => {
	const {name, desc, code} = await data

	const post = await {nama:name, deskripsi:desc, code}
	var query = connection.query('INSERT INTO grups SET ?', post, function (error, results, fields) {
	  	if (error) throw error;
	  	cb(results)
	});
}

const putSubGroup = async ({groups, sub_group}, cb) => {
	let post = {grup_id:groups, grup_out_id:sub_group}
	var query = connection.query('INSERT INTO setting_grups SET ?', post, function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	cb(results)
	});
}

const removeGroup = async (data, cb) => {
	const {_id, _rev} = await data
	var query = await connection.query(`DELETE FROM grups WHERE id=${_id}`, function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	cb(results)
	});
}

const removeGroupDetail = async (data, cb) => {
	const {_id, _rev} = data
	
	await dbs.remove(_id, _rev).then((res) => cb(res))
}

const getGroup = async (cb) => {
	var query = connection.query('SELECT * FROM grups', function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	cb(results)
	});
}

const getSettingGroup = async (cb) => {
	var query = connection.query('SELECT * FROM setting_grups', function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	cb(results)
	});
}

const removeSettingGroupById = async ({setting_group_id}, cb) => {
	var query = connection.query(`DELETE FROM setting_grups WHERE setting_grups.id = ${setting_group_id}`, function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	cb(results)
	});
}

const getSettingGroupById = async (id, cb) => {
	var query = connection.query(`SELECT *,setting_grups.id as s_g_id, grups.nama, grups.code FROM setting_grups INNER JOIN grups ON setting_grups.grup_id = ${id} WHERE setting_grups.grup_out_id = grups.id`, function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	cb(results)
	});
}

const getGroupById = async (id, cb) => {
	var query = connection.query(`SELECT * FROM grups WHERE grups.id = ${id}`, function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	cb(results)
	});
}

const getGroupsDetails = async (cb) => {
	var query = connection.query('SELECT *, grup_details.date as g_d_date, kontaks.date as k_date, grups.nama AS nama_grup, grup_details.id as g_d_id, grups.id AS g_id, kontaks.id AS k_id FROM grups INNER JOIN grup_details ON grups.id = grup_id INNER JOIN kontaks ON grup_details.kontak_id = kontaks.id', function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	cb(results)
	});
}


const getGroupsDetailWithId = async ({g_id, c_id, }, cb) => {
	var query = connection.query(`SELECT * FROM grup_details WHERE grup_details.grup_id=${g_id} AND grup_details.kontak_id = ${c_id}`, function (error, results, fields) {
	  	if (error) throw error;
	  	cb(results)
	});
}

const getGroupsDetailsById = async (id,cb) => {
	var query = connection.query(`SELECT *,grup_details.date as g_d_date, grups.nama AS nama_grup, grup_details.id as g_d_id, grups.id AS g_id, kontaks.id AS k_id FROM grups INNER JOIN grup_details ON grups.id = grup_id INNER JOIN kontaks ON grup_details.kontak_id = kontaks.id WHERE grups.id = ${id}`, function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	cb(results)
	});
}

const isGroupExist = (id, cb) => {
	var query = connection.query(`SELECT * FROM grups WHERE grups.id = ${id}`, function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	cb(results)
	});
}
const postGroupsDetails = async ({groups, contacts, date}, cb) => {
	
	let post = {kontak_id:contacts, grup_id:`${groups}`, date:date != undefined ? date : new Date()}
	var query = connection.query('INSERT INTO grup_details SET ?', post, function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	cb(results)
	});

}

const getGroupByCode = async (code, cb) => {

	var query = connection.query(`SELECT * FROM grups WHERE code ='${code}'`, function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	cb(results)
	});
}

const removeContactInGroupDetail = async ({groups}, cb) => {
	var query = await connection.query(`DELETE FROM grup_details WHERE id=${groups}`, function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	cb(results)
	});
}




module.exports = {
					postGroup,
				 	getGroupsDetailsById,
				 	removeGroup, 
				 	getGroupByCode, 
				 	putSubGroup, 
				 	removeContactInGroupDetail,
				 	removeGroupDetail, 
				 	getGroup, 
				 	getGroupsDetails, 
				 	postGroupsDetails, 
				 	getGroupById, 
				 	getSettingGroupById,
				 	removeSettingGroupById,
				 	isGroupExist,
				 	getGroupsDetailWithId
				 };


