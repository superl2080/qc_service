'use strict';

import request from 'request';
import xml2js from 'xml2js';
import myXml2js from './myXml2js';
import models from '../../models';

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


const xml2jsParserString = param => {
     return new Promise((resolve, reject) => {
        xml2jsParser.parseString(param.xml, (err, result) => {
            if(err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};


const requestSend = param => {
     return new Promise((resolve, reject) => {
        if( param.option.method == 'POST' ) {
            request.post(param.option, (err, ret, body) => {
                if(err) {
                    return reject(err);
                } else if( ret.statusCode != 200 ) {
                    return reject(new Error('ret not 200'));
                } else {
                    return resolve(body);
                }
            });
        } else {
            request.get(param.option, (err, ret, body) => {
                if(err) {
                    return reject(err);
                } else if( ret.statusCode != 200 ) {
                    return reject(new Error('ret not 200'));
                } else {
                    return resolve(body);
                }
            });
        }
    });
};


module.exports = {

    getJsonFromXml: async param => {
        console.log(__filename + '\n[CALL] getJsonFromXml, param:');
        console.log(param);

        const result = await xml2jsParserString({
            xml: param.xml,
        });

        console.log('[CALLBACK] getJsonFromXml, result:');
        console.log(result);
        return result.xml;
    },

    getXmlFromJson: async param => {
        console.log(__filename + '\n[CALL] getXmlFromJson, param:');
        console.log(param);

        const result = await xml2jsBuilder.buildObject(param.json);

        console.log('[CALLBACK] getXmlFromJson, result:');
        console.log(result);
        return result;
    },

    getXmlFromJsonForceCData: async param => {
        console.log(__filename + '\n[CALL] getXmlFromJsonForceCData, param:');
        console.log(param);

        const result = await xml2jsBuilderForceCData.buildObject(param.json);

        console.log('[CALLBACK] getXmlFromJsonForceCData, result:');
        console.log(result);
        return result;
    },

    getJson: async param => {
        console.log(__filename + '\n[CALL] getJson, param:');
        console.log(param);

        const result = await requestSend({
            option: {
                url: param.url,
            },
        });
        const json = JSON.parse(result);

        console.log('[CALLBACK] getJson, result:');
        console.log(json);
        return json;
    },

    getHtml: async param => {
        console.log(__filename + '\n[CALL] getHtml, param:');
        console.log(param);

        const result = await requestSend({
            option: {
                url: param.url,
            },
        });

        console.log('[CALLBACK] getHtml, result:');
        console.log(result);
        return result;
    },

    postJson: async param => {
        console.log(__filename + '\n[CALL] postJson, param:');
        console.log(param);

        const result = await requestSend({
            option: {
                url: param.url,
                method: 'POST',
                headers: {  
                    'content-type': 'application/json',
                },
                json: param.json,
            },
        });

        console.log('[CALLBACK] postJson, result:');
        console.log(result);
        return result;
    },

    postXml: async param => {
        console.log(__filename + '\n[CALL] postXml, param:');
        console.log(param);

        const xml = await models.utils.request.getXmlFromJson({ json: param.json });
        const result = await requestSend({
            option: {
                url: param.url,
                method: 'POST',
                headers: {  
                    'content-type': 'text/xml;charset=UTF-8',
                },
                body: xml,
            },
        });
        const json = await models.utils.request.getJsonFromXml({ xml: result });

        console.log('[CALLBACK] postXml, result:');
        console.log(json);
        return json;
    },

};

