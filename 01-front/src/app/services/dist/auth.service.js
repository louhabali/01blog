"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AuthService = void 0;
// auth.service.ts
var core_1 = require("@angular/core");
var operators_1 = require("rxjs/operators");
var rxjs_1 = require("rxjs"); // <-- Import ReplaySubject
var AuthService = /** @class */ (function () {
    function AuthService(http, router, zone) {
        this.http = http;
        this.router = router;
        this.zone = zone;
        // Signals are still great for your templates
        this.isLoggedIn = core_1.signal(false);
        this.currentUserId = core_1.signal(null);
        this.meUrl = 'http://localhost:8087/users/me';
        // This is the magic: A subject that holds the result of the *one* initial check
        this.authCheckResult$ = new rxjs_1.ReplaySubject(1);
        // Run the check *immediately* when the service is created
        this.runInitialAuthCheck();
    }
    AuthService.prototype.runInitialAuthCheck = function () {
        var _this = this;
        this.http.get('http://localhost:8087/auth/check', { withCredentials: true })
            .subscribe({
            next: function (res) {
                // Update signals
                _this.isLoggedIn.set(res.loggedIn);
                _this.currentUserId.set(res.currentUserId);
                // Broadcast the full result to all waiting subscribers
                _this.authCheckResult$.next(res);
            },
            error: function (err) {
                // If the check fails, we are a guest
                _this.isLoggedIn.set(false);
                _this.currentUserId.set(null);
                // Broadcast the "guest" result
                _this.authCheckResult$.next({ loggedIn: false, role: '', currentUserId: 0 });
            }
        });
    };
    /**
     * This is the new public method everyone will use.
     * It returns an observable that will *immediately* give the
     * cached auth status (or wait for it if the check isn't done).
     */
    AuthService.prototype.getAuthCheckResult = function () {
        return this.authCheckResult$.asObservable();
    };
    // Your checkAuth() is no longer needed, but if you do keep it, 
    // just make it return this.getAuthCheckResult()
    // ... your login/logout methods ...
    // (Make sure login/logout also call this.authCheckResult$.next(...) 
    // to update the cached value!)
    AuthService.prototype.getCurrentUser = function () {
        return this.http.get(this.meUrl, { withCredentials: true });
    };
    AuthService.prototype.isAdmin = function () {
        return this.getCurrentUser().pipe(operators_1.map(function (u) { return !!u && (u.role === 'ADMIN' || u.role === 'ROLE_ADMIN'); }));
    };
    AuthService.prototype.login = function (data) {
        var _this = this;
        return this.http
            .post('http://localhost:8087/auth/login', data, { withCredentials: true })
            .pipe(operators_1.tap(function (d) {
            if (!d.banned) {
                _this.isLoggedIn.set(true);
            }
        }));
    };
    AuthService.prototype.logout = function () {
        var _this = this;
        return this.http
            .post('http://localhost:8087/auth/logout', {}, { withCredentials: true })
            .pipe(operators_1.tap(function () {
            console.log(88888888888888888888888888888888888888);
            _this.isLoggedIn.set(false);
            _this.router.navigate(["/login"]);
        }));
    };
    AuthService = __decorate([
        core_1.Injectable({ providedIn: 'root' })
    ], AuthService);
    return AuthService;
}());
exports.AuthService = AuthService;
