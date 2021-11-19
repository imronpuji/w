const PouchDB =  require('pouchdb')
const Plugin =  require('pouchdb-find')
const {getGroupById} = require('./group')

PouchDB.plugin(Plugin)
let {connection} = require('../conn')

const removeCampaign = async (data, cb) => {
	const {_id, _rev} = data
	console.log(data)
	await dbs.remove(_id, _rev).then((res) => cb(res))
}

const postCampaign = async ({groups, messages, type, value},cb) => {
	let post = {grup_id:groups, pesan:messages, tipe:type, nilai:value}
	var query = connection.query('INSERT INTO kampanyes SET ?', post, function (error, results, fields) {
	  	if (error) throw error;
	  	console.log(results)
	  	cb(results)
	});

}

const getCampaign = async (cb) => {
	var query = connection.query('SELECT *, grups.id as g_id, kampanyes.id as k_id FROM kampanyes INNER JOIN grups ON grups.id = kampanyes.grup_id', function (error, results, fields) {
	  	if (error) throw error;
	  	console.log(results)
	  	cb(results)
	});

}

const removeContentOfCampaign = async ({campaign}, cb) => {
	var query = connection.query(`DELETE  FROM kampanyes WHERE kampanyes.id = ${campaign}`, function (error, results, fields) {
	  	if (error) throw error;
	  	console.log(results)
	  	cb(results)
	});
}

module.exports = {removeContentOfCampaign, getCampaign, postCampaign,removeCampaign};

