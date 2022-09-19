const crypt = require('./encription.js');

module.exports = class {

  constructor(name, pass){

    this.pass = crypt.encrypt(pass);
    this.name = name;
    this.hash = crypt.getHash(name);

  }
}
