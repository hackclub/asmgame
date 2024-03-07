var definitions = `
la { # load the A register into the accumulator
    IBS:la # use the in-built instruction la
}
lb { # load the B register into the accumulator
    IBS:lb
}`;
const commentRegex = /\s*#.*/g; // probably terribly slow to use this GIGANTIC chain of regexes
const firstJsonRegex = /([a-zA-Z]+)\s*?{/g;
const secondJsonRegex = /[ ]+([a-zA-Z]+[:]?[a-zA-Z]*)/g;
const thirdJsonRegex = /("[a-zA-Z]+"),\n\]/g;
const forthJsonRegex = /\]\n"([a-zA-Z]+)"/g;
const fifthJsonRegex = /,\n([a-zA-Z]+):/g;
const sixthJsonRegex = /",\n]/g;
const seventhJsonRegex = /\]"([a-zA-Z]+)"/g;
const eighthJsonRegex = /^([^"][a-zA-Z]+): \[$/gm;
definitions = definitions.replaceAll(commentRegex,"");
definitions = definitions.replaceAll(firstJsonRegex,'"$1": [');
definitions = definitions.replaceAll("}", "]");
definitions = definitions.replaceAll(secondJsonRegex, '"$1",');
definitions = definitions.replaceAll(thirdJsonRegex, '$1\n]');
definitions = definitions.replaceAll(forthJsonRegex, '],\n$1');
definitions = `{
    ${definitions}
}`;
console.log(definitions);
definitions = definitions.replaceAll(fifthJsonRegex, ',\n"$1":');
definitions = definitions.replaceAll(sixthJsonRegex, '"\n]')
definitions = definitions.replaceAll(seventhJsonRegex, '],\n$1');
definitions = definitions.replaceAll(eighthJsonRegex, '"$1": [');
