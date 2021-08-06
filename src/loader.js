const Loader = {};

Loader.loadImage = async function(src) {
    let ret = new Image();
    return new Promise(function (res,rejec) {
        ret.onload = function() {res(ret)};
        ret.src = src;
        ret.onerror = function(e) {
            rejec(e);
        }
    });
}