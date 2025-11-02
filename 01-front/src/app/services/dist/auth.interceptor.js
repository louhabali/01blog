"use strict";
exports.__esModule = true;
exports.authInterceptor = void 0;
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
// This is the new functional interceptor
exports.authInterceptor = function (req, next) {
    // Inject the Router
    var router = core_1.inject(router_1.Router);
    return next(req).pipe(operators_1.catchError(function (error) {
        if (error.status === 401) {
            console.log('Interceptor caught 401. Redirecting to login...');
            // Use the robust window.location.href to force redirect
            window.location.href = '/login';
        }
        return rxjs_1.throwError(function () { return error; });
    }));
};
