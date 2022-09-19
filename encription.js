const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const alphaNum = "abcdefghijklmnopqestuvwxzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
const inputEncoding = 'utf8';
const outputEncoding = 'hex';
const fs   = require('fs');
const conf = require('./conf.js');
var key;
loadKey();

function loadKey(){

  const pathname = conf.appFiles;

  fs.readFile(pathname + '/key.txt', "utf8", (err,data) => {
    if(err){
      let newkey = randomKey();
      fs.writeFile(pathname + '/key.txt', newkey, "utf8", () => {});
      key = newkey;
    }
    else{
      key = data;
    }
  } );

}

function randomKey(){
  let key = "";

  for(let i = 0; i < 32; i++){
    key += alphaNum.charAt(Math.floor(Math.random()*61));
  }
  return key;
}

module.exports.encrypt = function(text){

  const iv = new Buffer(crypto.randomBytes(16));
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let crypted = cipher.update(text, inputEncoding, outputEncoding);
  crypted += cipher.final(outputEncoding);
  return `${iv.toString('hex')}:${crypted.toString()}`;

}

module.exports.decrypt = function(text){

  const textParts = text.split(':');

  //extract the IV from the first half of the value
  const IV = new Buffer(textParts.shift(), outputEncoding);

  //extract the encrypted text without the IV
  const encryptedText = new Buffer(textParts.join(':'), outputEncoding);

  //decipher the string
  const decipher = crypto.createDecipheriv(algorithm,key, IV);
  let decrypted = decipher.update(encryptedText, outputEncoding, inputEncoding);
  decrypted += decipher.final(inputEncoding);
  return decrypted.toString();

}

module.exports.getHash = function(input){
  return crypto.createHash('md5').update(input).digest('hex');
}
