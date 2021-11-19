var express = require('express');
var router = express.Router();
var {postContact, getContact, removeContact} = require('../controllers/contact')
var {postBroadcast} = require('../controllers/broadcast')
var {postProfile, putProfile, getProfile} = require('../controllers/setting')
var {postCampaign, getCampaign, removeCampaign,removeContentOfCampaign} = require('../controllers/campaign')
var {postGroup, getGroupByCode, putSubGroup, removeContactInGroupDetail, getGroupById, getGroup, getGroupsDetails, postGroupsDetails, getDetailsGroup, removeGroup, removeGroupDetail} = require('../controllers/group')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// contacts
router.get('/kontak', ({body}, res, next) => getContact(async (result) => await res.render('contact', {contacts:result})))
router.post('/kontak', async (req, res, next) => await postContact(req.body, async (val) =>  res.redirect('/kontak')))
router.post('/kontak/group', async (req, res, next) => await postContact(req.body, async (val) =>  {
	await postGroupsDetails({groups:req.body.group, contacts:req.body.wa_number}, async (val)=> {
		await getGroupById(req.body.group, (result) => {
			if(result.sub_group && result.sub_group.length > 0){
				result.sub_group.filter(val => {
					removeContactInGroupDetail({groups:val._id, contacts:req.body.wa_number}, async ()=> console.log('berhasil'))
				})
			}
		})
	})
	
	await res.redirect('/kontak')
}))
router.post('/kontak/delete', async (req, res, next) => await removeContact(req.body, async (val) =>  res.redirect('/kontak')))

// groups
router.get('/group', ({body}, res, next) => getGroup(async (result) => await res.render('group', {groups:result})))
router.post('/group', async (req, res, next) => await postGroup(req.body, async (val) =>  res.redirect('/group')))
router.post('/group/delete', async (req, res, next) => await removeGroup(req.body, async (val) =>  res.redirect('/group')))


// group detail
router.get('/groups/detail', ({body}, res, next) => getGroup(async (result, val) => {
		await getContact(async (contacts) => {
			await getGroupsDetails(async (resGroupsDetail) => {
		 		await res.render('group_detail', {groups:result, contacts, groups_detail:resGroupsDetail})
			})
		})
}))
router.post('/groups/detail', async (req, res, next) => await postGroupsDetails(req.body, async (val) =>  res.redirect('/groups/detail')))
router.post('/group_detail/delete', async (req, res, next) => await removeGroupDetail(req.body, async (val) =>  res.redirect('/groups/detail')))
router.get('/group_detail/contact/:group_detail_id', async (req, res, next) => await removeContactInGroupDetail({groups:req.params.group_detail_id}, async (val) =>  res.redirect('/groups/detail')))


// campaign
router.get('/campaign', ({body}, res, next) => getGroup(async (result) => {
	getCampaign(async (resCampaign) => {
		await res.render('campaign', {groups:result, campaigns:resCampaign})
	})
}))
router.post('/campaign', ({body}, res, next) => postCampaign(body, (result) => res.redirect('/campaign')))
router.post('/campaign/delete', ({body}, res, next) => removeCampaign(body, (result) => res.redirect('/campaign')))
router.get('/campaign/content/delete/:content_id', (req, res, next) => removeContentOfCampaign({campaign:req.params.content_id}, (result) => res.redirect('/campaign')))


// broadcast 

router.get('/broadcast', ({body}, res, next) => getGroupsDetails(async (result) => {
	getCampaign(async (resCampaign) => {
		await res.render('broadcast', {groups:result})
	})
}))
router.post('/broadcast', ({body}, res, next) => postBroadcast(body, (result) => res.redirect('/broadcast')))

// owner

router.get('/setting', (req, res, next) => getProfile((result) =>  res.render('setting', {owner:result})))
router.post('/setting', (req, res, next) => postProfile(req.body, ()=>res.redirect('/setting')))
router.post('/setting/edit', (req, res, next) => putProfile(1, req.body, ()=>res.redirect('/setting')))

// setting group
router.get('/setting/group', async ({body}, res, next) => getGroup(async (result, val) => {
	await getDetailsGroup(async (resGroupsDetail) => {
		console.log(resGroupsDetail)
 		await res.render('setting_group', {groups:result, setting_group:resGroupsDetail})

	})
}))
router.post('/group/sub', async (req, res, next) => await putSubGroup(req.body, async (val) =>  res.redirect('/setting/group')))

// router untuk testing
router.get("/daftar/:code", (req, res) => {
	getGroupByCode(req.params.code, (result) => {
		console.log(result.docs[0])
	})
})

module.exports = router;
