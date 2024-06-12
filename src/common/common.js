import dayjs from "dayjs";
import myModules from './lib/getModules'

 
export const auto = {
	getIp: myModules.getIp,
	getWifi: myModules.getWifi,

	try: (fun, init)=>{ 
		try{ 
			return fun() 
		}catch(e){ 
			console.log({e}); return init 
		}
	},
	withPromise:(...args)=>{
		return (value)=>{
			const [first, ...other] = args;
			return first 
			? new Promise((resolve)=>void first(value, resolve)).then((res)=>void 
			(other.length ? auto.withPromise(...other)(res) : Promise.resolve(res)))
			: Promise.resolve(value) 
		}
	},
    // 获取限定范围内数值
	range: (min, max)=> Math.floor(Math.random() * (max - min) + min),
    // 将数组分为多组
	group: (array, size) =>{
		const grouped = [];
		for (let i = 0; i < array.length; i += size) {
			grouped.push(array.slice(i, i + size));
		}
		return grouped;
	},

    // 是否是对象
	isObj: (str)=> str?.slice(0, 1) === '{' && str?.slice(-1) === '}',

    // 是否是数组
	isArr: (str)=> str?.slice(0, 1) === '[' && str?.slice(-1) === ']',
  
    // 格式化json字符串
	jsonFormat:(arg, init = {})=>auto.try(()=>(auto.isArr(arg) || auto.isObj(arg)) ? JSON.parse(arg) : init, init),
   
    // uuid
  	uuid:(num = 6)=>(Date.now() + Math.random().toString(36).substring(2)).slice((-1 * num) || -6),

	numberFormat:(value, locale = 'en-GB', options= {})=>new Intl.NumberFormat(locale, options).format(value),

	dateFormat: (day)=> day ? dayjs(day) : dayjs(),

	badge: (count, max = 99) => count > max ? (max + '+') : count,
}


export const assets = {
	platform:{
		douyin: require('../assets/platform/douyin.png'),
		pipix: require('../assets/platform/pipix.png'),
	},
}

export const reset = function (source, excludeKeys) {
	const target = {};
	
	for (const prop in source) {
		if (Object.prototype.hasOwnProperty.call(source, prop) && !excludeKeys.includes(prop)) {
			target[prop] = source[prop];
		}
	}
	
	if (source !== null && typeof Object.getOwnPropertySymbols === "function") {
		const symbols = Object.getOwnPropertySymbols(source);
		for (let i = 0; i < symbols.length; i++) {
			const symbol = symbols[i];
			if (!excludeKeys.includes(symbol) && Object.prototype.propertyIsEnumerable.call(source, symbol)) {
				target[symbol] = source[symbol];
			}
		}
	}
	
	return target;
};


export const regex = {
	mentionRegex: /\B@\S+/g,
	mentionRegex:/\B@\S+/g,
	mentionRegexTester:/^\B@\S+$/g,
	hashtagRegex:/#\S+|\S+#(?!\S)/gm,
	hashtagRegexTester:/^#\S+|\S+#(?!\S)$/gm,
	emailRegex:/(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi,
	emailRegexTester: /^(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/gi,
	urlRegex:/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)|[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
	urlRegexTester: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)|[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gi,
	linkRegex: /(?:="|<)?\b([a-zA-Z]+:\/\/[-A-Z0-9+&@#/%?=~_|[\]()!:,.;]*[-A-Z0-9+&@#/%=~_|[\])])(?=$|\W)/gi,
}