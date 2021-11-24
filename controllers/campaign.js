const PouchDB =  require('pouchdb')
const Plugin =  require('pouchdb-find')
const {getGroupById} = require('./group')

PouchDB.plugin(Plugin)
let {connection} = require('../conn')

const removeCampaign = async (data, cb) => {
	const {_id, _rev} = data

	await dbs.remove(_id, _rev).then((res) => cb(res))
}

const postCampaign = async ({groups, messages, type, value},cb) => {
	let post = {grup_id:groups, pesan:messages, tipe:type, nilai:value}
	var query = connection.query('INSERT INTO kampanyes SET ?', post, function (error, results, fields) {
	  	if (error) throw error;
	  	cb(results)
	});

}

const isCampaignExistWithGroup = (groups, nilai,tipe, cb) => {
	 let query = connection.query(`SELECT * FROM kampanyes WHERE grup_id='${groups}' AND nilai='${nilai}' AND tipe='${tipe}'`, async function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	await cb(results)
	});	

}

const getCampaign = async (cb) => {
	var query = connection.query('SELECT *, grups.id as g_id, kampanyes.id as k_id FROM kampanyes INNER JOIN grups ON grups.id = kampanyes.grup_id', function (error, results, fields) {
	  	if (error) throw error;
	  	cb(results)
	});

}

const removeContentOfCampaign = async ({campaign}, cb) => {
	var query = connection.query(`DELETE  FROM kampanyes WHERE kampanyes.id = ${campaign}`, function (error, results, fields) {
	  	if (error) throw error;
	  	cb(results)
	});
}

const postCampaignDetail = async ({kontak_id, campaign_id, tipe, status}, cb) => {
	let post = {kontak_id, campaign_id}
	await isCampaignDetailExist(kontak_id, campaign_id, async (result) => {
		if(result.length == 0){
			var query = connection.query('INSERT INTO kampanyes_detail SET ?', post, function (error, results, fields) {
			  	if (error) throw error;
	
			  	cb(results)
			}); 
		}		
	})
}

const isCampaignDetailExist = async (kontak_id,campaign_id, cb) => {
	var query = connection.query(`SELECT * FROM kampanyes_detail INNER JOIN kampanyes WHERE kontak_id='${kontak_id}' AND campaign_id='${campaign_id}'`, async function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	await cb(results)
	});
}



const getCampaignDetailWithContact = async (kontak_id,type, cb) => {
	var query = connection.query(`SELECT * FROM kampanyes_detail INNER JOIN kampanyes ON kampanyes.id = kampanyes_detail.campaign_id WHERE kampanyes_detail.kontak_id='${kontak_id}' AND kampanyes.tipe = '${type}'`, async function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	await cb(results)
	});	
}


module.exports = {removeContentOfCampaign,isCampaignExistWithGroup, getCampaign, postCampaign,removeCampaign, postCampaignDetail, isCampaignDetailExist, getCampaignDetailWithContact};

