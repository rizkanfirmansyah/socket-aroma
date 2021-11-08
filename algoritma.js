let name = 'Ikhsan Muhammad';
let as = '';
let dataname = name.split(" ");

dataname.forEach(value => {
    as += value.charAt(0);
});

console.log(name)
console.log(as);
