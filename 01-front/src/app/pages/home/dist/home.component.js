"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.HomeComponent = void 0;
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var common_1 = require("@angular/common");
var router_1 = require("@angular/router");
var time_ago_pipe_1 = require("../../services/time-ago.pipe");
var report_modal_component_1 = require("../report-modal/report-modal.component");
var HomeComponent = /** @class */ (function () {
    function HomeComponent(http, postService, userService, router, route, auth, zone) {
        this.http = http;
        this.postService = postService;
        this.userService = userService;
        this.router = router;
        this.route = route;
        this.auth = auth;
        this.zone = zone;
        this.isDarkMode = false;
        this.posts = [];
        this.newPost = { title: '', content: '', likes: 0 };
        this.currentOffset = 0;
        this.limit = 10;
        this.loading = false;
        this.noMorePosts = false;
        // Error handling
        this.errorResponse = {};
        this.errorMessage = '';
        this.showError = false;
        // Media handling
        this.newMedia = null;
        this.mediaPreviewUrl = null;
        // Report modal
        this.isReportModalOpen = false;
        this.selectedPostId = 0;
        this.selectedReportedUserId = 0;
        // Delete confirmation modal
        this.isDeleteConfirmOpen = false;
        this.postToDelete = null;
    }
    HomeComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.userService.getCurrentUser().subscribe({
            next: function (user) {
                _this.currentUserId = user.id;
                _this.banned = user.enabled;
                if (!_this.banned) {
                    //console.log("aaaaaaaaaaaaaa")
                    _this.auth.logout().subscribe(function () {
                        _this.router.navigate(['/login']);
                        return;
                    });
                }
                _this.fetchPosts();
            },
            error: function (err) {
                if (err.status === 401) {
                    console.log(888);
                    _this.currentUserId = 0; // not logged in
                    _this.fetchPosts();
                }
            }
        });
    };
    HomeComponent.prototype.fetchPosts = function () {
        var _this = this;
        if (this.loading || this.noMorePosts)
            return;
        this.loading = true;
        var idParam = this.currentUserId ? "currentUserId=" + this.currentUserId + "&" : '';
        this.http
            .get("http://localhost:8087/posts/all?" + idParam + "offset=" + this.currentOffset + "&limit=" + this.limit, { withCredentials: true })
            .subscribe({
            next: function (posts) {
                var formatted = posts.map(function (p) { return (__assign(__assign({}, p), { imageUrl: p.imageUrl ? "" + p.imageUrl : null, videoUrl: p.videoUrl ? "" + p.videoUrl : null })); });
                _this.posts = __spreadArrays(_this.posts, formatted);
                console.log("Fetched posts:", formatted);
                if (posts.length < _this.limit) {
                    _this.noMorePosts = true;
                }
                else {
                    _this.currentOffset += _this.limit;
                }
                _this.loading = false;
            },
            error: function (err) {
                console.error('Error loading posts:', err);
                _this.loading = false;
            }
        });
    };
    HomeComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.postsPanel.nativeElement.addEventListener('scroll', function () {
            _this.handleScroll();
        });
    };
    HomeComponent.prototype.handleScroll = function () {
        var element = this.postsPanel.nativeElement;
        var threshold = 200; // pixels before reaching bottom
        var scrollTop = element.scrollTop;
        var scrollHeight = element.scrollHeight;
        var clientHeight = element.clientHeight;
        if (scrollTop + clientHeight >= scrollHeight - threshold && !this.loading && !this.noMorePosts) {
            this.fetchPosts();
        }
    };
    HomeComponent.prototype.onFileSelected = function (event) {
        var _this = this;
        var file = event.target.files[0];
        if (file) {
            this.newMedia = file;
            var reader_1 = new FileReader();
            reader_1.onload = function () { _this.mediaPreviewUrl = reader_1.result; };
            reader_1.readAsDataURL(file);
        }
        else {
            this.cancelMediaPreview();
        }
    };
    HomeComponent.prototype.cancelMediaPreview = function () {
        this.newMedia = null;
        this.mediaPreviewUrl = null;
        if (this.fileUploadInput) {
            this.fileUploadInput.nativeElement.value = '';
        }
    };
    HomeComponent.prototype.submitPost = function () {
        var _this = this;
        if (this.newMedia) {
            var formData = new FormData();
            formData.append("file", this.newMedia);
            this.http.post("http://localhost:8087/api/media/upload", formData, { responseType: 'text', withCredentials: true })
                .subscribe(function (url) { _this.createPost(url); });
        }
        else {
            this.createPost(null);
        }
    };
    HomeComponent.prototype.createPost = function (mediaUrl) {
        // check if user is banned
        var _this = this;
        var postPayload = {
            title: this.newPost.title,
            content: this.newPost.content,
            authorId: this.currentUserId,
            createdAt: new Date()
        };
        if (mediaUrl) {
            if (mediaUrl.endsWith(".mp4"))
                postPayload.videoUrl = mediaUrl;
            else
                postPayload.imageUrl = mediaUrl;
        }
        this.http.post('http://localhost:8087/posts/create', postPayload, { withCredentials: true })
            .subscribe({
            next: function (post) {
                post.authorId = _this.currentUserId;
                post.authorName = post.user.username;
                post.likes = post.likes || 0;
                post.liked = false;
                _this.posts.unshift(post);
                _this.newPost = { title: '', content: '' };
                _this.cancelMediaPreview();
            },
            error: function (err) {
                console.error('Validation error:', err);
                if (err.status === 400) {
                    _this.errorResponse = err.error;
                    if (_this.errorResponse.title && _this.errorResponse.content)
                        _this.errorMessage = 'Title and content are required';
                    else if (_this.errorResponse.title)
                        _this.errorMessage = _this.errorResponse.title;
                    else if (_this.errorResponse.content)
                        _this.errorMessage = _this.errorResponse.content;
                    _this.showError = true;
                    setTimeout(function () { _this.showError = false; }, 2000);
                }
                else if (err.status === 401) {
                    window.location.reload();
                }
                else {
                    console.error('Unexpected error:', err);
                }
            }
        });
    };
    HomeComponent.prototype.toggleLike = function (post) {
        var _this = this;
        if (this.currentUserId == 0) {
            console.log("liked btn");
            this.auth.logout().subscribe();
            return;
        }
        this.postService.toggleLike(post.id, this.currentUserId).subscribe({
            next: function (liked) {
                post.likes += liked ? 1 : -1;
                post.liked = liked;
            },
            error: function (err) {
                if (err.status === 401 || err.status == 403) {
                    _this.auth.logout().subscribe();
                }
                else
                    console.error('Unexpected error:', err);
            }
        });
    };
    // ✅ Delete Confirmation Logic
    HomeComponent.prototype.confirmDelete = function (post) {
        this.postToDelete = post;
        this.isDeleteConfirmOpen = true;
    };
    HomeComponent.prototype.cancelDelete = function () {
        this.postToDelete = null;
        this.isDeleteConfirmOpen = false;
    };
    HomeComponent.prototype.proceedDelete = function () {
        var _this = this;
        if (!this.postToDelete)
            return;
        this.http["delete"]("http://localhost:8087/posts/delete/" + this.postToDelete.id, { withCredentials: true })
            .subscribe({
            next: function () {
                _this.posts = _this.posts.filter(function (p) { return p.id !== _this.postToDelete.id; });
                _this.cancelDelete();
            },
            error: function (err) {
                console.error("Error deleting post", err);
                _this.cancelDelete();
            }
        });
    };
    HomeComponent.prototype.goTopostdetails = function (post) {
        this.router.navigate(["/posts/" + post.id]);
    };
    HomeComponent.prototype.reportPost = function (post) {
        this.isReportModalOpen = true;
        this.selectedPostId = post.id;
        this.selectedReportedUserId = post.authorId;
    };
    HomeComponent.prototype.closeReportModal = function () {
        this.isReportModalOpen = false;
    };
    __decorate([
        core_1.ViewChild('postsPanel')
    ], HomeComponent.prototype, "postsPanel");
    __decorate([
        core_1.ViewChild('fileUploadInput')
    ], HomeComponent.prototype, "fileUploadInput");
    HomeComponent = __decorate([
        core_1.Component({
            selector: 'app-home',
            standalone: true,
            imports: [forms_1.FormsModule, common_1.CommonModule, time_ago_pipe_1.TimeAgoPipe, report_modal_component_1.ReportModalComponent, router_1.RouterModule],
            templateUrl: './home.component.html',
            styleUrls: ['./home.component.css']
        })
    ], HomeComponent);
    return HomeComponent;
}());
exports.HomeComponent = HomeComponent;
