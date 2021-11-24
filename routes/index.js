var express = require('express');
var router = express.Router();
var {postContact, getContact, removeContact} = require('../controllers/contact')
var {postBroadcast} = require('../controllers/broadcast')
var {postProfile, putProfile, getProfile} = require('../controllers/setting')
var {postCampaign, getCampaign,getCampaignByGroupId, postCampaignDetail, isCampaignExistWithGroup, getCampaignDetailWithContact, removeCampaign,removeContentOfCampaign, isCampaignDetailexist} = require('../controllers/campaign')
var {postGroup, getGroupByCode, removeSettingGroupById, putSubGroup, getGroupsDetailsById,getSettingGroupById, removeContactInGroupDetail, getGroupById, getGroup, getGroupsDetails, postGroupsDetails, getDetailsGroup, removeGroup, removeGroupDetail} = require('../controllers/group')
var axios = require('axios')
var differenceInMinutes = require('date-fns/differenceInMinutes')
var {calculateDate} = require('../helper/date')
var xlsx =require('node-xlsx')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// contacts
router.get('/kontak', ({body}, res, next) => getContact(async (result) => await res.render('contact', {contacts:result})))
router.post('/kontak', async (req, res, next) => await postContact(req.body, async (val) =>  res.redirect('/kontak')))
router.post('/kontak/group', async (req, res, next) => await postContact(req.body, async (valContact) =>  {
	await postGroupsDetails({groups:req.body.group, contacts:valContact.insertId}, async (val)=> {
		await getSettingGroupById(req.body.group, async (result) => {
			await result.filter(async val => {
				if(val.grup_id != undefined){
					await getGroupsDetailsById(val.grup_out_id, (result)=>{
						result.filter(val => {
							 if(val.nomor == req.body.wa_number){
							 	removeContactInGroupDetail({groups:val.g_d_id}, (res) => {
							 		return res
							 	})
							 	removeContact({id:val.kontak_id}, (res) => {
							 		return res
							 	})
							 }
						})
					})
				}
			}) 
		})
	})
	
	await res.redirect('/kontak')
}))
router.get('/kontak/delete/:id', async (req, res, next) => await removeContact({id:req.params.id}, async (val) =>  res.redirect('/kontak')))

// groups
router.get('/group', (req, res, next) => getGroup(async (result) => await res.render('group', {groups:result, url:req.headers.host})))
router.post('/group', async (req, res, next) => await postGroup(req.body, async (val) =>  res.redirect('/group')))
router.get('/group/delete/:id', async (req, res, next) => await removeGroup({id:req.params.id}, async (val) =>  res.redirect('/group')))


// group detail
router.get('/groups/detail/:id', (req, res, next) => getGroupsDetailsById(req.params.id,async (result, val) => {
		await getContact(async (contacts) => {
			await getGroupById(req.params.id, async (resGroupsDetail) => {
		 		await res.render('group_detail', {groups:resGroupsDetail, contacts, groups_detail:result})
			})
		})
}))
router.post('/groups/detail', async (req, res, next) => {
	if(req.files != null){
		const workSheetsFromBuffer = await xlsx.parse(req.files.file.data);
		console.log(workSheetsFromBuffer)
		const sheet = workSheetsFromBuffer[0].data.filter(val => val.length > 0)
		console.log(sheet)
		await sheet.filter(async (val, index) => {
			if(index != 0){
				await getGroupByCode(val[1], async (result) => {
					console.log(val[2], val[3])
					await postContact({username:val[2], called:val[3], address:val[4], wa_number:val[0]}, async resPostContact => {
						await postGroupsDetails({contacts:resPostContact.insertId, groups:result[0].id, date:new Date(new Date().setMinutes(new Date().getMinutes() + index))}, async () => {
							await res.redirect('back')
						})
					})
				})
			}
		})
	} else {
		postGroupsDetails(req.body, (result) => {
			res.redirect('back')
		})
	}
})
router.post('/group_detail/delete', async (req, res, next) => await removeGroupDetail(req.body, async (val) =>  res.redirect('/groups/detail')))
router.get('/group_detail/contact/:group_detail_id', async (req, res, next) => await removeContactInGroupDetail({groups:req.params.group_detail_id}, async (val) =>  res.redirect('back')))


// campaign
router.get('/campaign/:id', (req, res, next) => getGroupById(req.params.id, async (result) => {
	console.log(result)
	getCampaignByGroupId(result[0].id, async (resCampaign) => {
		await res.render('campaign', {groups:result, campaigns:resCampaign})
	})
}))
router.post('/campaign', ({body}, res, next) => {
	isCampaignExistWithGroup(body.groups, body.value, body.type, async (isCampaignExist) => {
		if(isCampaignExist.length == 0){
			await postCampaign(body, async (resultPostCampaign) => {
				await getGroupsDetailsById((body.groups), async (resGroupsDetail) => {
					await resGroupsDetail.filter(async val => {
						await getCampaignDetailWithContact(val.kontak_id,body.type, async (result) => {
							if(result.length !=  0){
								console.log(result, 'resutllllllllllllllll')
								let sort = await  result.sort((a,b) => (a.nilai > b.nilai) ? 1 : ((b.nilai > a.nilai) ? -1 : 0));
								await sort.filter( async values => {
									if(values.nilai == body.value){
										await res.redirect('back')
									}
								})

								if((body.value - parseInt(sort[sort.length - 1]['nilai'])) < 1){
									await axios.post('http://localhost:7000/wa/send-bulk', {contact:val.nomor, message:body.messages})
									await postCampaignDetail({kontak_id:val.kontak_id, campaign_id:resultPostCampaign.insertId}, () => {
										
									})
								}

								if((body.value - parseInt(sort[sort.length - 1]['nilai'])) > 0){
									await calculateDate(val.g_d_date,  async (distanceMinute, distanceDays) => {
										console.log(distanceMinute)
										if(distanceMinute > body.value && body.type == 'minutes'){
											await axios.post('http://localhost:7000/wa/send-bulk', {contact:val.nomor, message:body.messages})
											await postCampaignDetail({kontak_id:val.kontak_id, campaign_id:resultPostCampaign.insertId}, () => {
												
											})	
										}

										if(distanceDays > body.value && body.type == 'days'){
											await axios.post('http://localhost:7000/wa/send-bulk', {contact:val.nomor, message:body.messages})
											await postCampaignDetail({kontak_id:val.kontak_id, campaign_id:resultPostCampaign.insertId}, () => {
												
											})	
										}
									})
								}

							} else {
								await res.redirect('back')	

							}
						})
					})
				})
			})
		} else {
			await res.redirect('back')
		}
	})
})
router.post('/campaign/delete', ({body}, res, next) => removeCampaign(body, (result) => res.redirect('/campaign')))
router.get('/campaign/content/delete/:content_id', (req, res, next) => removeContentOfCampaign({campaign:req.params.content_id}, (result) => res.redirect('back')))


// broadcast 

router.get('/broadcast', ({body}, res, next) => getGroup(async (result) => {
	getCampaign(async (resCampaign) => {
		await res.render('broadcast', {groups:result})
	})
}))
router.post('/broadcast', async (req, res, next) => {
	if(Array.isArray(req.body.groups)){
		await req.body.groups.filter(val => {
			postBroadcast({groups:val, messages:req.body.messages, url:req.headers.host, second:req.body.second}, (result) => result)
		})
	} else {
		await postBroadcast({groups:req.body.groups, messages:req.body.messages, url:req.headers.host, second:req.body.second}, (result) => result)
	}

	await res.redirect('/broadcast')
})

// owner

router.get('/setting', (req, res, next) => getProfile((result) =>  res.render('setting', {owner:result})))
router.post('/setting', (req, res, next) => postProfile(req.body, ()=>res.redirect('/setting')))
router.post('/setting/edit', (req, res, next) => putProfile(4, req.body, ()=>res.redirect('/setting')))

// setting group
router.get('/setting/group/:group_id', async (req, res, next) => getGroup(async (result, val) => {
	getGroupById(req.params.group_id, (resultGroupId) => {
		getSettingGroupById(resultGroupId[0].id, (resGroupsDetail) => res.render('setting_group', {setting_groups:resGroupsDetail, groups:result, group:resultGroupId[0]}))
	})
}))
router.get('/setting/group/delete/:setting_group_id/:group_id', (req, res, next) => removeSettingGroupById({setting_group_id:req.params.setting_group_id}, (result) =>  res.redirect(`/setting/group/${req.params.group_id}`)))

router.post('/group/sub', async (req, res, next) => await putSubGroup(req.body, async (val) =>  res.redirect('back')))

// router untuk testing
router.get("/daftar/:code", (req, res) => {
	getGroupByCode(req.params.code, (result) => {
		
	})
})

module.exports = router;
