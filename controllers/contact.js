const PouchDB =  require('pouchdb');
PouchDB.plugin(require('pouchdb-upsert'));
const moment = require('moment')
var axios = require('axios')

let {connection} = require('../conn');
var {getGroupsDetailWithContact, editGroupDetails} = require('./group')

const postContact = async (data, cb) => {
	console.log(data)
	const {username, wa_number, address, called, group, validate} = await data
	if(validate == 'true') {
	const post = await {nama:username, nomor:wa_number, alamat:address, sapaan: called, date:new Date(), status:validate}
		sendContactVerify(wa_number, async () => {
			var query = connection.query('INSERT INTO kontaks SET ?', post, function (error, results, fields) {
			  	if (error) throw error;
			  	cb(results)
			});
		})
	} else {
	const post = await {nama:username, nomor:wa_number, alamat:address, sapaan: called, date:new Date(), status:true}

		checkIfContactExist(wa_number, (result) => {
			if(result.length == 0){
				var query = connection.query('INSERT INTO kontaks SET ?', post, function (error, results, fields) {
				  	if (error) throw error;
				  	cb(results)
				});
			} else {
				cb(false)
			}

		})
		
	}
}

const checkIfContactExist = (nomor, cb) => {
	var query = connection.query(`SELECT * FROM kontaks WHERE nomor = "${nomor}"`, function (error, results, fields) {
	  	if (error) throw error;
	  	cb(results)
	});
}

const putContact = () => {
	
}

const removeContact = async (data, cb) => {
	const {id, _rev} = data
	
	var query = connection.query(`DELETE FROM kontaks WHERE id=${id}`, function (error, results, fields) {
	  	if (error) throw error;
	  	
	  	cb(results)
	});
}


const getContactById = async (id, cb) => {
	await db.get(id).then(async (result) => {
		cb(result)
	})
}

const getContact = async (cb) => {
	let query = connection.query('SELECT * FROM kontaks', function (error, results, fields) {
		  if (error) throw error;
		  
		  cb(results)
	});
}

const sendContactVerify=async (number, cb)=> {
	await axios.post('http://localhost:7000/wa/send-bulk', {contact:`${number}`, message:'silahkan ketik daftar untuk menverifikasi'}).then(results => cb(results)).catch(err => err)
}

const verifyContact=async(number, cb)=>{
	await checkIfContactExist(number, async(result) => {
		if(result.length > 0){
			console.log(result)
			await getGroupsDetailWithContact({c_id:result[0]['id']}, async(resGroupDetail) => {
				await resGroupDetail.filter(async val => {
					console.log(val)
					if(val.status_grup == 0){
						await editGroupDetails(val.g_d_id, () => {
							cb('success')
						})
					}
				})
			})
		} else {
			cb('failed')
		}
	})
}


module.exports = {postContact, getContact, getContactById, removeContact, verifyContact, checkIfContactExist};


