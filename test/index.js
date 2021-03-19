const WebSocket = require('ws');

for(let i = 1200; i< 1400; i++ ) {
    const ws = new WebSocket('ws://localhost:9001/' + i)
    
    let num = i.toString()
    ws.onopen=() =>{
        ws.send(
            JSON.stringify({'channel':num,'message':'lol' + i})
        )
    };
    
}