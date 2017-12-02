var app1 = document.getElementById('app1');
var app2 = document.getElementById('app2');
var app3 = document.getElementById('app3');
var app4 = document.getElementById('app4');

function demo1start() {
    app1.innerHTML = '';
    var typewriter1 = new Typewriter(app1, {
        loop: false
    });

    var typewriter = new Typewriter(app, {
        loop: false,
        cursor: ''
    });

    typewriter1
        .typeString('Ahoj!')
        .pauseFor(2500)
        .start();

    typewriter
        .pauseFor(10000)
        .typeString('T y p e W r i t e r . . .')
        .start()
}

function demo2start() {
    app2.innerHTML = '';
    var typewriter2 = new Typewriter(app2, {
        loop: true
    });

    typewriter2
        .typeString('Môžem písať stale to isté!')
        .pauseFor(1500)
        .changeSettings({deleteSpeed: 0})
        .deleteAll()
        .start()
}

function demo3start() {
    app3.innerHTML = '';
    var typewriter3 = new Typewriter(app3, {
        loop: false
    });

    typewriter3
        .typeString('Viem niečo napísať a potom to zmazať!')
        .pauseFor(1500)
        .deleteAll()
        .start()
}

function demo4start() {
    app4.innerHTML = '';
    var typewriter4 = new Typewriter(app4, {
        loop: false
    });

    typewriter4
        .typeString('A to všetko viem robiť ')
        .changeSettings({typingSpeed: 10})
        .typeString('veľmi rýchlo, ')
        .changeSettings({typingSpeed: 500})
        .typeString('alebo pomali.')
        .changeSettings({typingSpeed: 80})
        .pauseFor(1000)
        .typeString(' Hoops!')
        .pauseFor(800)
        .deleteChars(9)
        .typeString('y.')
        .pauseFor(5000)
        .deleteAll()
        .start()
}

