var differenceInMinutes = require('date-fns/differenceInMinutes')
var differenceInBusinessDays = require('date-fns/differenceInBusinessDays')

const calculateDate = (val, cb) => {
	let time = {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second:'2-digit'}

	var tgl = new Date().toLocaleTimeString([], time)
	var tglReg = new Date(val).toLocaleTimeString([], time)

	var tglSplitSlash = tgl.split(',')
	let value = [...tglSplitSlash[0].split('/'),...tglSplitSlash[1].split(':')]
	let res = []
	value.filter(val => res.push(parseInt(val)))

	var tglRegSplitSlash = tglReg.split(',')
	let valueReg = [...tglRegSplitSlash[0].split('/'),...tglRegSplitSlash[1].split(':')]
	let resReg = []
	valueReg.filter(val => resReg.push(parseInt(val)))


	let a = [resReg[2], resReg[0], resReg[1], 7, resReg[4], resReg[5]]
	let b = [res[2], res[0], res[1], res[3], res[4], res[5]]

	var sinceMinuteRegister = differenceInMinutes(
	  	new Date(...b),
	  	new Date(...a)
	)

	var sinceDayRegister = differenceInBusinessDays(
	  	new Date(resReg[2], resReg[0], resReg[1]),
	  	new Date(res[2], res[0], res[1])
	)

	cb(sinceMinuteRegister, sinceDayRegister)
}

module.exports = {calculateDate}


