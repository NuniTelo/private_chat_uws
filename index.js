const port = 9000;
const uWS = require('uWebSockets.js')

var users_connected = {};
uWS.App().ws('/*', {
  /* Options */
  compression: uWS.SHARED_COMPRESSOR,
  maxPayloadLength: 16 * 1024 * 1024,
  idleTimeout: 0,
  upgrade: (res, req, context) => { //This is the part we get the parameters on the URL so we can register the websocket with id we get later
    const secWebSocketKey = req.getHeader('sec-websocket-key');
    const secWebSocketProtocol = req.getHeader('sec-websocket-protocol');
    const secWebSocketExtensions = req.getHeader('sec-websocket-extensions');
    /* This immediately calls open handler, you must not use res after this call */
    res.upgrade({
          url: req.getUrl() //here we have all the query parameters that we pass down to the open step
        },
        /* Use our copies here */
        secWebSocketKey,
        secWebSocketProtocol,
        secWebSocketExtensions,
        context);
  },
  open: (ws) => {
    let user_id = ws.url.replace('/','') //replace the backslash so we extract only the userID
    ws.id = user_id
    users_connected[ws.id] = ws;
    console.log('Client connected with ID: ', ws.id)
  },
  message: (ws, message, isBinary) => {
    const buffer = Buffer.from(message);
    let parsed_message = JSON.parse(buffer.toString())

    let {
      _send_from, _deliver_id, _message
    } = parsed_message

    if (users_connected[_deliver_id] !== undefined)
      users_connected[_deliver_id].send({sender: _send_from, message: _message})
    else
      console.log('User with id: ' + _deliver_id + ' is not online at this moment!')
  },
  drain: (ws) => {
    console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
  },
  close: (ws, code, message) => {
    delete users_connected[ws.id]
    console.log('WebSocket closed for user with id: ', ws.id);
  }
}).any('/*', (res, req) => {
  res.end('Nothing to see here!');
}).listen(port, (token) => {
  if (token) {
    console.log('Listening to port ' + port);
  } else {
    console.log('Failed to listen to port ' + port);
  }
});