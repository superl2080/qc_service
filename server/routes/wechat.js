
const async = require('async');
const xml2js = require('xml2js');
const xml2jsBuilder = new xml2js.Builder();
const xml2jsParser = new xml2js.Parser();
const wechatHelper = require('../../imports/util/wechatHelper');
const systemModel = require('../../imports/models/system');


const openNotice = exports.openNotice = (req, res) => {

	async.auto({
	    pre: (callback) => {
    		console.log('[CALL] openNotice, pre');
	        callback(null, {
	        	req: req,
	        	res: res
	        });
	    },

	    parseXml: ['pre', (result, callback) => {
    		console.log('[CALL] openNotice, parseXml');
	    	xml2jsParser.parseString(result.pre.req.body, callback);
	    }],

	    decrypt: ['parseXml', (result, callback) => {
    		console.log('[CALL] openNotice, decrypt');
	    	const decryptData = wechatHelper.Decrypt(result.parseXml.xml.Encrypt[0]);
	    	xml2jsParser.parseString(decryptData, callback);
	    }],

	    checkVerifyTicket: ['decrypt', (result, callback) => {
    		console.log('[CALL] openNotice, checkVerifyTicket');
	        if( result.decrypt.xml.InfoType[0] == 'component_verify_ticket' ) {
			    systemModel.updateVerifyTicket(result.decrypt.xml.ComponentVerifyTicket[0], callback);
	        }
	    }]

	}, (err, results) => {
		if( !err ) {
    		console.log('[ERROR] openNotice, err:');
    		console.log(err);
		}
    	console.log('[CALLBACK] openNotice');
	    res.send('success');
	});
};


