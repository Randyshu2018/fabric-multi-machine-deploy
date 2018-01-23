module.exports.isEmpty = function (obj) {
    if (obj == null || obj == undefined || obj == "") {
        return true;
    }
    return false;
}

module.exports.getResponse = function (message, code, data) {
    return {
        "code": code || 200,
        "message": message,
        "data": data
    }
}

module.exports.getErrorMsg = function (message, code) {
    return {
        "code": code || 500,
        "message": message
    }
}
