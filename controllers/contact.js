const PouchDB =  require('pouchdb');
PouchDB.plugin(require('pouchdb-upsert'));
const moment = require('moment')
var axios = require('axios')

let {connection} = require('../conn');

const postContact = async (data, cb) => {
	const {username, wa_number, address, called, group, validate} = await data
	const post = await {nama:username, nomor:wa_number, alamat:address, sapaan: called, date:new Date(), status:validate == undefined ? true : false}
	if(validate != undefined && validate == true) {
		sendContactVerify(wa_number, async () => {
			var query = connection.query('INSERT INTO kontaks SET ?', post, function (error, results, fields) {
			  	if (error) throw error;
			  	cb(results)
			});
		})
	} else {
		console.log(post)
		var query = connection.query('INSERT INTO kontaks SET ?', post, function (error, results, fields) {
		  	if (error) throw error;
		  	cb(results)
		});
	}
}

const putContact = () => {
	
}

const removeContact = async (data, cb) => {
	const {id, _rev} = data
	console.log(data)
	var query = connection.query(`DELETE FROM kontaks WHERE id=${id}`, function (error, results, fields) {
	  	if (error) throw error;
	  	console.log(results)
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
		  console.log(results)
		  cb(results)
	});
}

const sendContactVerify=async (number, cb)=> {
	await axios.post('http://localhost:7000/wa/send-bulk', {contact:`${number}`, message:'silahkan ketik daftar untuk menverifikasi'}).then(results => cb(results)).catch(err => err)
}

const verifyContact=async(_id, cb)=>{
	let num = _id.substr(0, _id.length - 5);
	console.log(num)
	db.upsert(num, function (doc) {
		if (!doc.status) {
	    doc.status = true;
	  	return doc;
	}
	}).then(function (res) {
	  	cb(res)
	}).catch(async function (err) {
	  	await axios.post('http://localhost:7000/wa/send-bulk', {contact:num, message:'Maaf Anda Belum Terdaftar di sistem kami'}).then(results => cb(results)).catch(err => err)
	})
}

module.exports = {postContact, getContact, getContactById, removeContact, verifyContact};


