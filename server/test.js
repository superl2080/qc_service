
const express = require('express');
const wechatHelper = require('../imports/util/wechatHelper');


const router = module.exports.router = express.Router();


router.get('/decrypt', function(req, res, next) {
    console.log('[HTTP] ' + req.hostname + req.originalUrl);
    wechatHelper.Decrypt('olBaEYrkYYjL56ai1Yf3EghucJuomtjv5CoAGsKjuRv4gpnZic7kCdYaXxej7DxxQ143VaKnKe2+Rg15VN3iRjxnlPNnFKXEhfCQrQYMnIBKmLTBO0NYF0qQ8wtlGxkRY/y9ls8pKURNDZErJVenwUnZHShzgHMX2pBDMrzFHIVQUFAG3OAktAXvJJn2JUi/wcy/VTk4lxS3CxREa16nGKhh7idNRY4pcqqbo7bENGEqZrCMi6Dy53PHinfWOVp9JkGpodMmSffegFv+fzrxRNXX+e9ONpe0PQBaUuTus5aGQdKldL3+QJpL1fOTJeWbdx03FcLJiHHpAzVSp35yKs+3mJc0s2HJb+PtMQfEXdMqiVLJrRvn4WzpEeSMmRXOi7MBHFsoeQiCrJ/IhwvjiQ+kie8KL4iLmv783D8Sk6r8KzAk55YDlBczI3b0/iGJjbjXE3d68e2kt0a4865i+w==');
    next();
});

