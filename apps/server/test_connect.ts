
const WS_URL = 'wss://stream.binance.com:9443/ws';
// const WS_URL = 'wss://stream.binance.com:443/ws'; // Try standard port too?

const socket = new WebSocket(WS_URL);

socket.onopen = () => {
    console.log('Connected');
    const params = [
        "solusdt@bookTicker", 
        "btcusdt@bookTicker", 
        "ethusdt@bookTicker", 
        "bnbusdt@bookTicker"
    ];
    const sub = { 
        method: 'SUBSCRIBE', 
        params, 
        id: 12345 
    };
    console.log('Sending:', JSON.stringify(sub));
    socket.send(JSON.stringify(sub));
};

socket.onmessage = (evt) => {
    console.log('Message:', evt.data);
    // Close after first message to finish test
    socket.close();
};

socket.onerror = (err) => {
    console.error('Error:', err);
};

socket.onclose = (evt) => {
    console.log(`Closed: ${evt.code} ${evt.reason}`);
};
