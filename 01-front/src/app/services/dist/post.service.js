"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PostService = void 0;
var core_1 = require("@angular/core");
var PostService = /** @class */ (function () {
    function PostService(http) {
        this.http = http;
    }
    PostService.prototype.createPost = function (post) {
        return this.http.post('http://localhost:8087/posts/create', post, { withCredentials: true });
    };
    PostService.prototype.getMyPosts = function () {
        return this.http.get('http://localhost:8087/posts/me', { withCredentials: true });
    };
    PostService.prototype.toggleLike = function (postId, userId) {
        return this.http.post("http://localhost:8087/interactions/like/" + postId + "/like?userId=" + userId, { withCredentials: true });
    };
    PostService = __decorate([
        core_1.Injectable({ providedIn: 'root' })
        // our post services methods and fetching
    ], PostService);
    return PostService;
}());
exports.PostService = PostService;
