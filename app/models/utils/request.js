
const request = require('request');
const xml2js = require('xml2js');
const myXml2js = require('./myXml2js');

const xml2jsParser = new xml2js.Parser({
  explicitArray: false,
  ignoreAttrs: true,
});
const xml2jsBuilder = new xml2js.Builder({
  rootName: 'xml',
  cdata: true,
  headless: true,
});
const xml2jsBuilderForceCData = new myXml2js.Builder({
  rootName: 'xml',
  cdata: true,
  headless: true,
});


module.exports = {

  getJsonFromXml: async function (param) {

    const result = await this.xml2jsParserString({
      xml: param.xml,
    });

    return result.xml;
  },

  getXmlFromJson: async function (param) {

    const result = await xml2jsBuilder.buildObject(param.json);

    return result;
  },

  getXmlFromJsonForceCData: async function (param) {

    const result = await xml2jsBuilderForceCData.buildObject(param.json);

    return result;
  },

  getJson: async function (param) {
    console.log(__filename + '\n[CALL] getJson, param:');
    console.log(param);

    const result = await this.requestSend({
      option: {
        url: param.url,
      },
    });
    console.log('[CALLBACK] getJson, result:');
    console.log(result);

    const json = result ? JSON.parse(result) : result;

    return json;
  },

  getHtml: async function (param) {
    console.log(__filename + '\n[CALL] getHtml, param:');
    console.log(param);

    const result = await this.requestSend({
      option: {
        url: param.url,
      },
    });

    console.log('[CALLBACK] getHtml, result:');
    console.log(result);
    return result;
  },

  postJson: async function (param) {
    console.log(__filename + '\n[CALL] postJson, param:');
    console.log(param);

    const result = await this.requestSend({
      option: {
        url: param.url,
        method: 'POST',
        headers: {  
          'content-type': 'application/json;charset=UTF-8',
        },
        json: param.json,
      },
    });

    console.log('[CALLBACK] postJson, result:');
    console.log(result);
    return result;
  },

  postXml: async function (param) {
    console.log(__filename + '\n[CALL] postXml, param:');
    console.log(param);

    const xml = await this.getXmlFromJson({ json: param.json });
    const result = await this.requestSend({
      option: {
        url: param.url,
        method: 'POST',
        headers: {  
          'content-type': 'text/xml;charset=UTF-8',
        },
        body: xml,
      },
    });
    console.log('[CALLBACK] postXml, result:');
    console.log(result);
    
    const json = await this.getJsonFromXml({ xml: result });

    return json;
  },

  xml2jsParserString: function (param) {
     return new Promise((resolve, reject) => {
      xml2jsParser.parseString(param.xml, (err, result) => {
        if(err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  requestSend: function (param) {
     return new Promise((resolve, reject) => {
      if( param.option.method === 'POST' ) {
        request.post(param.option, (err, ret, body) => {
          if(err) {
            return reject(err);
          } else if( ret.statusCode !== 200 ) {
            return reject(new Error('ret not 200'));
          } else {
            return resolve(body);
          }
        });
      } else {
        request.get(param.option, (err, ret, body) => {
          if(err) {
            return reject(err);
          } else if( ret.statusCode !== 200 ) {
            return reject(new Error('ret not 200'));
          } else {
            return resolve(body);
          }
        });
      }
    });
  },
  
};

