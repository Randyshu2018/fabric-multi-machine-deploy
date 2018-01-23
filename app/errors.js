var util = require('util');

//Defined a abstract exception that used to be extended by subClasses.
var AbstractError = function (msg, constructor) {
    Error.captureStackTrace(this, constructor || this)
    this.message = msg || 'Error'
}
util.inherits(AbstractError, Error)
AbstractError.prototype.name = 'Abstract Error';

//Not Found Error
var NotFound = function (msg) {
    this.code = 404;
    msg = msg + " is Not Found";
    NotFound.super_.call(this, msg, this.constructor);
}
util.inherits(NotFound, AbstractError);
NotFound.prototype.name = "Not Found Error";

//System Error
var SystemError = function (msg) {
    this.code = 500;
    SystemError.super_.call(this, msg, this.constructor);
}
util.inherits(SystemError, AbstractError);
SystemError.prototype.name = "System Error";

//Database Error
var DatabaseError = function (msg) {
    DatabaseError.super_.call(this, msg, this.constructor);
}
util.inherits(DatabaseError, AbstractError);
DatabaseError.prototype.name = 'Database Error'

module.exports = {
    NotFound: NotFound,
    SystemError: SystemError,
    DatabaseError: DatabaseError
}