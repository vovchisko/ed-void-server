hashCode = function (s) {
    return (s.split("").reduce(function (a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a
    }, 0) + 2147483647) + 1;
};


let sys_pos = [-68.4375, 26, 26.46875];
let A, B;

let name = 'Amarak';

console.log('SYS:', name, sys_pos);
console.log('...stringify');
console.log('ID v1 :', name + '@' + sys_pos.map(x => x.toFixed(3)).join(':'));
console.log('...round( x * 32 )');
console.log('ID v2 :', name + '@' + sys_pos.map(x => Math.round(x * 32)).join(':'));
console.log('...and hash');
console.log('ID v3 :', hashCode(name + '@' + sys_pos.map(x => Math.round(x * 32)).join(':')));

const dot = require('dot-object');

let rec = {Population: 1000, Va1: 10, x: 8723.123112};
let sys = {something: 15.12837};

dot.copy('Population', 'population', rec, sys);
dot.copy('Va1', 'va1', rec, sys);
dot.copy('something', 'something', rec, sys);
dot.copy('x', 'x', rec, sys, x => Math.floor(x * 100));


console.log(sys);

class Magic {
    constructor() {
        this.name = 'Gunter No!';
        this.changed = false;
        this.test = 1;
        return new Proxy(this, this);
    }

    get(target, prop) {
        //console.log('get', prop);
        return this[prop] || undefined;
    }

    set(target, prop, value) {
        console.log('set', prop, value);
        if (this[prop] !== value || !value) {
            this[prop] = value;
            this.changed = true;
        }
    }
}

let m = new Magic();

delete m.test;

console.log(m);

m.name = 'Gunter No!';

console.log(m);

m.name = 'Gunter Yes!';

console.log(m);




let arr1 = [1,2,3];
let arr2 = arr1.slice(); // NOT SPLICE!!!

console.log(arr1, arr2);
