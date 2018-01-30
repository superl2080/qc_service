
const cheerio = require('cheerio');


module.exports = {

    getImage: async param => {
        console.log(__filename + '\n[CALL] getImage, param:');
        console.log(param);

        try {
            let mhid = 'vEvEWg26zsMhMHctLdZVOaw';
            if( param.type == 'SCAN' ) {
                mhid = 'skTHBF3tnJ4hMHctLdZVOaI';
            }
            let url = 'https://cli.im/api/qrcode/code?text=' + param.url + '&mhid=' + mhid;

            let apiResult = await this.models.utils.request.getHtml({ url: url });
            let $ = cheerio.load(apiResult);
            apiResult = $('img').attr('src');
            
            if( !apiResult ){
                throw new Error('getImage is error');
            }

            const result = {
                url: 'http:' + apiResult,
            };
            console.log('[CALLBACK] getImage, result:');
            console.log(result);
            return result;

        } catch(err) {
            console.error(__filename + '[CALL] getImage, param:' + JSON.stringify(param) + ', err:' + err.message);
            throw err;
        }

    },

};

