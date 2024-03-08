window.onerror = function(event, source, lineno, colno, error) {
    alert("An error occurred: " + error);
}

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
        emulatorRegisters.B = emulatorRegisters.A;
    },
    "wb": ()=>{
        emulatorRegisters.A = emulatorRegisters.B;
    },
    "ma": (value) => {
        emulatorRegisters.A = parseInt(value);
    }
};

const request = new XMLHttpRequest();
request.open('GET', 'puzzles.json', false);
const puzzles = JSON.parse(request.responseText);

var currentPuzzle = parseInt(localStorage.getItem("currentPuzzle") || 0);
document.getElementById('puzzle').innerText = `Puzzle ${currentPuzzle+1}`;
document.getElementById('definitions').value = localStorage.getItem("definitions") || `sw { # Write your swap instruction here!

}`;
document.getElementById('instruction-to-run').value = localStorage.getItem("instruction-to-run") || "sw";
function updatePuzzleDOM() {
    document.getElementById('puzzle').innerText = `Puzzle ${currentPuzzle+1}`;
    document.getElementById('task').innerText = puzzles[currentPuzzle].task;
    document.getElementById('hint').innerText = puzzles[currentPuzzle].hint;
}
updatePuzzleDOM();

var emulatorRegisters = new Proxy({
    A: 0x0,
    B: 0x0,
    "*A": 0x0,
    ACC: 0x0
}, {
    set: function(target, prop, value) {
        target[prop] = value;
        if (prop == "*A") {
            emulatorMemory[emulatorRegisters.A] = value;
        }
    },
    get: function(target, prop) {
        if (prop == "*A") {
            return emulatorMemory[emulatorRegisters.A];
        }
        return target[prop];
    }
});
window.emulatorRegisters = emulatorRegisters; // for debugging
var emulatorMemory = [];
window.emulatorMemory = emulatorMemory; // for debugging

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
    var wrongMemory = [];
    var wrongMemoryValues = [];
    var expectedEndingRegisters = puzzles[currentPuzzle].expectedEndingRegisters;
    var expectedMemory = puzzles[currentPuzzle].expectedMemory;
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
    for (var memory in Object.keys(expectedMemory)) {
        var realMemory = expectedMemory[memory];
        if (emulatorMemory[parseInt(memory, 16)] != realMemory) {
            if (!realMemory || realMemory == "*" || realMemory == undefined) {
                continue;
            }
            correct = false;
            wrongMemory.push(`Memory address ${memory}`);
            wrongMemoryValues.push(emulatorMemory[parseInt(memory, 16)]);
        }
    }
    if (!correct) {
        var wrongText = "";
        for (var i = 0; i < wrongRegisters.length; i++) {
            wrongText += `${wrongRegisters[i]}: ${wrongRegistersValues[i]} (expected ${expectedEndingRegisters[wrongRegisters[i]]})\n`;
        }
        for (var i = 0; i < wrongMemory.length; i++) {
            wrongText += `${wrongMemory[i]}: ${wrongMemoryValues[i]} (expected ${expectedMemory[wrongMemory[i]]})\n`;
        }
        alert(`Your solution is incorrect:\n${wrongText}`);
        return;
    }
    alert("Your solution is correct!");
    currentPuzzle++;
    localStorage.setItem("currentPuzzle", currentPuzzle);
    updatePuzzleDOM();

});

setInterval(()=>{
    localStorage.setItem("definitions", document.getElementById('definitions').value);
    localStorage.setItem("instruction-to-run", document.getElementById('instruction-to-run').value);
}, 1000); // save every second

const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const openModalBtn = document.querySelector(".btn-open");
const closeModalBtn = document.querySelector(".btn-close");
const openModal = function () {
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
    modal.classList.add("visible");
    overlay.classList.add("visible");
};
openModalBtn.addEventListener("click", openModal);
const closeModal = function () {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
    modal.classList.remove("visible");
    overlay.classList.remove("visible");
};
closeModalBtn.addEventListener("click", closeModal);
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("visible")) {
        closeModal();
    }
});