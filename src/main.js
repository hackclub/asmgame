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
    "ma": (value) => {
        emulatorRegisters.A = parseInt(value);
    }
};

const puzzles = [
    {
        task: "Create an instruction to swap the A and B registers",
        hint: "Use the la/lb instructions, the sa/sb instructions, and the wa/wb instructions.",
        startingRegisters: {
            "A": 0x5,
            "B": 0x2,
            "*A": 0x0,
            "ACC": 0x0
        },
        expectedEndingRegisters: {
            "A": 0x2,
            "B": 0x5,
            "*A": "*",
            "ACC": "*"
        }
    },
    {
        task: "Create an instruction to write the value of the A register to the memory address stored in the B register",
        hint: "Use the la instruction, the lb instruction, the sa instruction, and the ss instruction.",
        startingRegisters: {
            "A": 0x5,
            "B": 0x2,
            "*A": 0x0,
            "ACC": 0x0
        },
        expectedEndingRegisters: {
            "A": 0x2,
            "B": "*",
            "*A": 0x5,
            "ACC": "*"
        }
    }
];
var currentPuzzle = parseInt(localStorage.getItem("currentPuzzle") || 0);
document.getElementById('puzzle').innerText = `Puzzle ${currentPuzzle+1}`;
document.getElementById('definitions').value = localStorage.getItem("definitions") || `sw { # Write your swap instruction here!

}`;
function updatePuzzleDOM() {
    document.getElementById('puzzle').innerText = `Puzzle ${currentPuzzle+1}`;
    document.getElementById('task').innerText = puzzles[currentPuzzle].task;
    document.getElementById('hint').innerText = puzzles[currentPuzzle].hint;
}
updatePuzzleDOM();

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
    try {
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
    definitions = definitions.replaceAll(fifthJsonRegex, ',\n"$1":');
    definitions = definitions.replaceAll(sixthJsonRegex, '"\n]')
    definitions = definitions.replaceAll(seventhJsonRegex, '],\n$1');
    definitions = definitions.replaceAll(eighthJsonRegex, '"$1": [');
    definitions = JSON.parse(definitions);
    } catch (e) {
        alert("Invalid code");
        console.log(e);
        console.log(definitions);
        return;
    }
    if (!definitions[instruction]) {
        alert("Invalid start instruction");
        return;
    }
    emulatorRegisters = puzzles[currentPuzzle].startingRegisters;
    function parse(instruction, value) {
        for (var instr = 0; instr < definitions[instruction].length; instr++) {
            const newInstruction = definitions[instruction][instr].replaceAll("%value%", value);
            if (internalInstructions[newInstruction.replace("IBS:", "").split(" ")[0]] && newInstruction.startsWith("IBS:")) {
                internalInstructions[newInstruction.replace("IBS:", "").split(" ")[0]](newInstruction.replace("IBS:", "").split(" ")[1] || "");
            } else {
                if (!definitions[newInstruction.split(" ")[0]]) {
                    alert("Invalid instruction " + newInstruction);
                    return;
                }
                parse(newInstruction, newInstruction.split(" ")[1]);
            }
        }
    }
    parse(instruction);
    var correct = true;
    var wrongRegisters = [];
    var wrongRegistersValues = [];
    var expectedEndingRegisters = puzzles[currentPuzzle].expectedEndingRegisters;
    for (var register in emulatorRegisters) {
        if (emulatorRegisters[register] != expectedEndingRegisters[register]) {
            if (expectedEndingRegisters[register] == "*") {
                continue;
            }
            correct = false;
            wrongRegisters.push(register);
            wrongRegistersValues.push(emulatorRegisters[register]);
        }
    }
    if (!correct) {
        var wrongText = "";
        for (var i = 0; i < wrongRegisters.length; i++) {
            wrongText += `${wrongRegisters[i]}: ${wrongRegistersValues[i]} (expected ${expectedEndingRegisters[wrongRegisters[i]]}\n`;
        }
        alert(`Your solution is incorrect:\n${wrongText})`);
        return;
    }
    alert("Your solution is correct!");
    currentPuzzle++;
    localStorage.setItem("currentPuzzle", currentPuzzle);
    localStorage.setItem("definitions", document.getElementById('definitions').value);
    updatePuzzleDOM();

});