"use strict";
exports.__esModule = true;
var platform_browser_1 = require("@angular/platform-browser");
var app_component_1 = require("./app/app.component");
var http_1 = require("@angular/common/http");
var router_1 = require("@angular/router");
var app_routes_1 = require("./app/app.routes");
var toolbar_1 = require("@angular/material/toolbar");
var icon_1 = require("@angular/material/icon");
var button_1 = require("@angular/material/button");
var menu_1 = require("@angular/material/menu");
var core_1 = require("@angular/core");
platform_browser_1.bootstrapApplication(app_component_1.AppComponent, {
    providers: [
        http_1.provideHttpClient(http_1.withFetch()),
        router_1.provideRouter(app_routes_1.routes),
        core_1.importProvidersFrom(toolbar_1.MatToolbarModule, icon_1.MatIconModule, button_1.MatButtonModule, menu_1.MatMenuModule)
    ]
});
