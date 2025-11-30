
import { SYMBOL_PAIRS } from './src/constants/constant';

const symbols = Object.values(SYMBOL_PAIRS);
console.log('Symbols:', symbols);

const params = symbols.map(s => `${s.replace(/_/g, '').toLowerCase()}@bookTicker`);
console.log('Params:', params);

const sub = { method: 'SUBSCRIBE', params, id: 1 };
console.log('Payload:', JSON.stringify(sub));
