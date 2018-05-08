let addr = 2870514623897.0;
let arr = [47.8125, 11.40625, -33.53125];

console.log('orig:', addr);
console.log('calc:', arr.map((x)=>{return x.toFixed(5)}).join(':'));

