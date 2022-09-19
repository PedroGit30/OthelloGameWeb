const http = require('http');
const path = require('path');
const url  = require('url');
const fs   = require('fs');
const conf = require('./conf.js');
const manageGame = require('./manageGame');
const game = new manageGame();
const querystring = require('querystring');

const headers = {
    plain: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
    },
    sse: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive'
    }
};

http.createServer((request,response) => {

  switch(request.method) {
    case 'GET':
      getClientFiles(request, response);
      break;
    case 'POST':
      respondsToClient(request, response);
      break;
    default:
      response.writeHead(501); // 501 Not Implemented
      response.end();
  }

}).listen(conf.port);

console.log(`Listening on port ${conf.port}`);

function respondsToClient(request, response){

  const method = url.parse(request.url, true).pathname;
  // console.log(method);

  if(method === null){
    response.writeHead(404); // Not Found
    response.end();
    return;
  }

  let body = '';
  let data;
  request
    .on('data', (chuck) => { body += chuck; })
    .on('end', () => {
           try { data = JSON.parse(body); }
           catch(err) { console.log(err); }
           // console.log(data);
           choseMethod();
    })
    .on('error', (err) => { console.log(err.message); });

  let choseMethod = function(){

    let status = 200;
    let resp = {};

    switch (method) {

      case '/register':
        status = game.addUser(data.nick,data.pass).code;
      break;

      case '/ranking':
        let ranking = game.getRanking();
        resp = ranking.resp;
        status = ranking.code;
      break;

      case '/join':
        let join = game.joinGame(data.group, data.nick, data.pass);
        resp = join.resp;
        status = join.code;
        if(status === 200) game.starTimer(data.nick, data.pass, resp.game, sendEvent);
      break;

      case '/notify':
        let notify = game.processNotify(data.nick, data.pass, data.game, data.move);
        status = notify.code;
        resp = notify.resp;
        if(status === 200) {
          let update = game.update(data.game);
          if(update) sendEvent(update.p1Con, update.p2Con, update.resp);
        }
        game.starTimer(data.nick, data.pass, data.game, sendEvent);
      break;
      case '/leave':
        let leave = game.leave(data.nick, data.pass, data.game);
        status = leave.code;
        if(status === 200) sendEvent(leave.resp.p1Con, leave.resp.p2Con, leave.resp.win);
      break;
      default:
        status = 404;
      }

      if(status === 400) resp = { error: "error on request" };
      else if(status === 401) resp = { error: "User registered with a different password" };
      else if(status === 404) resp = { error: "unknown request" };

      response.writeHead(status, headers.plain);
      response.write(JSON.stringify(resp));
      response.end();
    }
}

function respToUpdate(response, query){

  //verificar nick e game
  // console.log(query);
  let status = 200;
  let resp = game.startGame(query.nick, query.game, response);

  response.writeHead(status, headers.sse);

  if(resp !== null){
    sendEvent( resp.p1Con, resp.p2Con, resp.resp );
  }

}

function sendEvent(r1, r2, json){

  if(r1 === undefined || r2 === undefined || json === undefined) return;

  r1.write('data: '+ JSON.stringify(json) +'\n\n');
  r2.write('data: '+ JSON.stringify(json) +'\n\n');

}

function getClientFiles(request, response){

  const purl = url.parse(request.url);

  if(purl.pathname === '/update'){
    return respToUpdate(response, querystring.parse(purl.query));
  }

  const pathname = getPathname(request, purl);

  if(pathname === null){
    response.writeHead(404); // Not Found
    response.end();
    return;
  }

  const ext = path.extname(pathname);
  const encoding = isText(conf.mediaTypes[ext]) ? "utf8" : null;

  fs.readFile(pathname,encoding,(err,data) => {
    if(err) {
      response.writeHead(404); // Not Found
    } else {
      response.writeHead(200, { 'Content-Type': conf.mediaTypes[ext] });
      response.write(data);
    }
    response.end();
  });
}

function isText(mediaType) {
    return !mediaType.startsWith('image');
}

function getPathname(request, purl) {
    let pathname = path.normalize(conf.documentRoot+purl.pathname);
    if(! pathname.startsWith(conf.documentRoot)) pathname = null;
    if(pathname.endsWith("/")) pathname += conf.defaultIndex;
    return pathname;
}
