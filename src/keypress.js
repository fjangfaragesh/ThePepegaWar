const keypressedArray = {};

onkeydown = function(e) {
    keypressedArray[e.code] = true;
}

onkeyup = function(e) {
    keypressedArray[e.code] = false;
}

function isKeyPressed(keyCode) {
    return keypressedArray[keyCode] ? true : false;
}
