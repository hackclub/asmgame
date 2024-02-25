const internalInstructions = {
    "la": ()=>{
        emulatorRegisters.ACC = emulatorRegisters.A;
    },
    "lb": ()=>{
        emulatorRegisters.ACC = emulatorRegisters.B;
    },
    "ls": ()=>{
        emulatorRegisters.ACC = emulatorRegisters["*A"];
    },
    "sa": ()=>{
        emulatorRegisters.A = emulatorRegisters.ACC;
    },
    "sb": ()=>{
        emulatorRegisters.B = emulatorRegisters.ACC;
    },
    "ss": ()=>{
        emulatorRegisters["*A"] = emulatorRegisters.ACC;
    },
    "wa": ()=>{
        emulatorRegisters.A = emulatorRegisters.B;
    },
    "wb": ()=>{
        emulatorRegisters.B = emulatorRegisters.A;
    },
};

var emulatorRegisters = {
    "A": 0x0,
    "B": 0x0,
    "*A": 0x0,
    "ACC": 0x0
}

var isEscaped = false;
document.getElementById('definitions').addEventListener('keydown', function(e) {
    if (e.key == 'Tab' && !isEscaped) {
      e.preventDefault();
      var start = this.selectionStart;
      var end = this.selectionEnd;
      this.value = this.value.substring(0, start) +
        "    " + this.value.substring(end);
        this.selectionStart =
        this.selectionEnd = start + 4;
    }
    if (e.key == "Escape") {
        isEscaped = true;
        return;
    }
    isEscaped = false;
});
document.getElementById('run').addEventListener('click', ()=>{
    const instruction = document.getElementById('instruction-to-run').value;
    var definitions = document.getElementById('definitions').value+document.getElementById('default-definitions').value;
    const commentRegex = /\s*#.*/g; // probably terribly slow to use this GIGANTIC chain of regexes
    const firstJsonRegex = /([a-zA-Z]+)\s*?{/g;
    const secondJsonRegex = /[ ]+([a-zA-Z]+[:]?[a-zA-Z]*)/g;
    const thirdJsonRegex = /("[a-zA-Z]+"),\n\]/g;
    const forthJsonRegex = /\]\n"([a-zA-Z]+)"/g;
    const fifthJsonRegex = /,\n([a-zA-Z]+):/g;
    const sixthJsonRegex = /",\n]/g;
    definitions = definitions.replaceAll(commentRegex,"");
    definitions = definitions.replaceAll(firstJsonRegex,'"$1": [');
    definitions = definitions.replaceAll("}", "]");
    definitions = definitions.replaceAll(secondJsonRegex, '"$1",');
    definitions = definitions.replaceAll(thirdJsonRegex, '$1\n]');
    definitions = definitions.replaceAll(forthJsonRegex, '],\n$1');
    definitions = `{
        ${definitions}
    }`;
    definitions = definitions.replaceAll(fifthJsonRegex, ',\n"$1":');
    definitions = definitions.replaceAll(sixthJsonRegex, '"\n]')
    definitions = JSON.parse(definitions);
    for (var i = 0; i<definitions.length; i++) {
        const value = definitions[i];
    }
});