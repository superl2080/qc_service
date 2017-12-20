
const async = require('async');
const wechatHelper = require('imports/util/wechatHelper');


const openNotice = exports.openNotice = (req, res) => {

	async.auto({
	    pre: (callback) => {
	        callback(null, {
	        	req: req,
	        	res: res
	        });
	    },

	    parseXml: ['pre', (result, callback) => {
	    	xml2jsParser.parseString(result.pre.req.body, callback);
	    }],

	    decrypt: ['parseXml', (result, callback) => {
	    	const decryptData = wechatHelper.Decrypt(result.parseXml.xml.Encrypt[0]);
	    	xml2jsParser.parseString(decryptData, callback);
	    }],

	    checkVerifyTicket: ['decrypt', (result, callback) => {
	        if( result.decrypt.xml.InfoType[0] == 'component_verify_ticket' ) {
			    system.updateVerifyTicket(result.decrypt.xml.ComponentVerifyTicket[0], function (err, systemInfo) {
	        		res.send('success');
	        	});
	        }
	    }]

	}, (err, results) => {
		if( !err ) {

		} else {

		}
	});
};


