const threeDGraphics = {};
threeDGraphics.initGL = function(canv) {
    let gl = canv.getContext("webgl");
    if(!gl) {
        gl = canv.getContext("experimental-webgl");
        if(!gl) {
            console.log("Web-GL is not supported!");
            throw new Error("Web-GL is not supported!");
        }
    }
    console.log("Web-Gl is supported");
    return
}