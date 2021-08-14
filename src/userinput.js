const UserInput = {};


UserInput.init = function(handler) {
    onmousedown = function(e) {
        handler(new UserInput.MouseDownMessage(e.clientX,e.clientY, e.button));
    }
    onmouseup = function(e) {
        handler(new UserInput.MouseUpMessage(e.clientX,e.clientY, e.button));
    }
    onmousemove = function(e) {
        handler(new UserInput.MouseMoveMessage(e.clientX,e.clientY, e.movementX, e.movementY));
    }
    onwheel = function(e) {
        handler(new UserInput.MouseWheelMessage(e.clientX,e.clientY, e.deltaY));
    }
    onkeydown = function(e) {
        if (!e.repeat) handler(new UserInput.KeyboardMessage(e.code,"down"));
    }
    onkeyup = function(e) {
        handler(new UserInput.KeyboardMessage(e.code,"up"));
    }
}


UserInput.StatesManager = class {
    constructor() {
        this.keysPressed = {};
        this.mouseButtonsDown = {};
        this.mousePosition = [0,0];
    }
    send(msg) {
        if (msg.type !== "userinput") return;
        if (msg.source === "mouse") {
            if (msg.action === "down") {
                this.mouseButtonsDown[msg.button] = true;
            } else if (msg.action === "up") {
                this.mouseButtonsDown[msg.button] = false;
            } else if (msg.action === "move") {
                this.mousePosition = [msg.x,msg.y];
            }
        } else if (msg.source === "keyboard") {
            this.keysPressed[msg.key] = msg.direction === "down";
        }
    }
    
    isKeyPressed(key) {
        return this.keysPressed[key] ? true : false;
    }
    isMouseButtonDown(button) {
        return this.mouseButtonsDown[button] ? true : false;
    }
    getMousePosition() {
        return this.mousePosition;
    }
}











UserInput.UserInputMessage = class {
    constructor(source) {
        this.type = "userinput";
        this.source = source;
    }
}
UserInput.KeyboardMessage = class extends UserInput.UserInputMessage {
    constructor(key, direction) {
        super("keyboard");
        this.key = key;
        this.direction = direction;
    }
}
UserInput.MouseMessage = class extends UserInput.UserInputMessage {
    constructor(action, x, y) {
        super("mouse");
        this.action = action;
        this.x = x;
        this.y = y;
    }
}
UserInput.MouseMoveMessage = class extends UserInput.MouseMessage {
    constructor(x, y, deltaX, deltaY) {
        super("move",x,y);
        this.deltaX = deltaX;
        this.deltaY = deltaY;
    }
}
UserInput.MouseDownMessage = class extends UserInput.MouseMessage {
    constructor(x, y, button) {
        super("down",x,y);
        this.button = button;
    }
}
UserInput.MouseUpMessage = class extends UserInput.MouseMessage {
    constructor(x, y, button) {
        super("up",x,y);
        this.button = button;
    }
}
UserInput.MouseWheelMessage = class extends UserInput.MouseMessage {
    constructor(x, y, delta) {
        super("wheel",x,y);
        this.delta = delta;
    }
}






