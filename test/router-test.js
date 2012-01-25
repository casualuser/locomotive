var vows = require('vows');
var assert = require('assert');
var util = require('util');
var Router = require('locomotive/router');
var Route = require('locomotive/route');
var dynamicHelpers = require('locomotive/helpers/dynamic');


/* MockLocomotive */

function MockLocomotive() {
  var self = this;
  this._routes = {};
  this._routes._find = function(controller, action) {
    var key = controller + '#' + action;
    return self._routes[key];
  }
}

/* MockExpress */

function MockExpress() {
  this._routes = [];
  this._helpers = {};
  this._dynamicHelpers = {};
}

MockExpress.prototype.get = function(path, fn) {
  this._routes.push({ method: 'GET', path: path, fn: fn });
}

MockExpress.prototype.post = function(path, fn) {
  this._routes.push({ method: 'POST', path: path, fn: fn });
}

MockExpress.prototype.put = function(path, fn) {
  this._routes.push({ method: 'PUT', path: path, fn: fn });
}

MockExpress.prototype.del = function(path, fn) {
  this._routes.push({ method: 'DELETE', path: path, fn: fn });
}

MockExpress.prototype.helpers = function(obj) {
  for (var method in obj) {
    this._helpers[method] = obj[method];
  }
}

MockExpress.prototype.dynamicHelpers = function(obj) {
  for (var method in obj) {
    this._dynamicHelpers[method] = obj[method];
  }
}

MockExpress.prototype.reset = function() {
  this._routes = [];
  this._helpers = {};
  this._dynamicHelpers = {};
}

/* MockRequest */

function MockRequest() {
}

/* MockResponse */

function MockResponse() {
}


function intializedRouter() {
  var router = new Router();
  var http = new MockExpress();
  function handle(controller, action) {
    return function() {
      return { controller: controller, action: action };
    };
  }
  
  router.init(http, { handle: handle });
  return router;
}


vows.describe('Router').addBatch({
  
  'router with root route': {
    topic: function() {
      var router = intializedRouter()
      router.root('pages#main');
      return router;
    },
    
    'should create route': function (router) {
      var route = router._find('PagesController', 'main');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/');
    },
    'should mount route': function (router) {
      assert.lengthOf(router._http._routes, 1);
      assert.equal(router._http._routes[0].method, 'GET');
      assert.equal(router._http._routes[0].path, '/');
      assert.equal(router._http._routes[0].fn().controller, 'PagesController');
      assert.equal(router._http._routes[0].fn().action, 'main');
    },
  },
  
  'router with match route given shorthand': {
    topic: function() {
      var router = intializedRouter()
      router.match('songs/:title', 'songs#show');
      return router;
    },
    
    'should create route': function (router) {
      var route = router._find('SongsController', 'show');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/songs/:title');
    },
    'should mount route': function (router) {
      assert.lengthOf(router._http._routes, 1);
      assert.equal(router._http._routes[0].method, 'GET');
      assert.equal(router._http._routes[0].path, '/songs/:title');
      assert.equal(router._http._routes[0].fn().controller, 'SongsController');
      assert.equal(router._http._routes[0].fn().action, 'show');
    },
  },
  
  'router with match route given controller and action options': {
    topic: function() {
      var router = intializedRouter()
      router.match('bands', { controller: 'bands', action: 'list' });
      return router;
    },
    
    'should create route': function (router) {
      var route = router._find('BandsController', 'list');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/bands');
    },
    'should mount route': function (router) {
      assert.lengthOf(router._http._routes, 1);
      assert.equal(router._http._routes[0].method, 'GET');
      assert.equal(router._http._routes[0].path, '/bands');
      assert.equal(router._http._routes[0].fn().controller, 'BandsController');
      assert.equal(router._http._routes[0].fn().action, 'list');
    },
  },
  
  'router with match route given shorthand and via option': {
    topic: function() {
      var router = intializedRouter()
      router.match('bands', 'bands#create', { via: 'post' });
      return router;
    },
    
    'should create route': function (router) {
      var route = router._find('BandsController', 'create');
      assert.equal(route.method, 'post');
      assert.equal(route.pattern, '/bands');
    },
    'should mount route': function (router) {
      assert.lengthOf(router._http._routes, 1);
      assert.equal(router._http._routes[0].method, 'POST');
      assert.equal(router._http._routes[0].path, '/bands');
      assert.equal(router._http._routes[0].fn().controller, 'BandsController');
      assert.equal(router._http._routes[0].fn().action, 'create');
    },
  },
  
  'router with match route given controller, action, and via options': {
    topic: function() {
      var router = intializedRouter()
      router.match('bands', { controller: 'bands', action: 'create', via: 'post' });
      return router;
    },
    
    'should create route': function (router) {
      var route = router._find('BandsController', 'create');
      assert.equal(route.method, 'post');
      assert.equal(route.pattern, '/bands');
    },
    'should mount route': function (router) {
      assert.lengthOf(router._http._routes, 1);
      assert.equal(router._http._routes[0].method, 'POST');
      assert.equal(router._http._routes[0].path, '/bands');
      assert.equal(router._http._routes[0].fn().controller, 'BandsController');
      assert.equal(router._http._routes[0].fn().action, 'create');
    },
  },
  
  'router with match route specified with a preceding slash': {
    topic: function() {
      var router = intializedRouter()
      router.match('/songs/:title', 'songs#show');
      return router;
    },
    
    'should create route': function (router) {
      var route = router._find('SongsController', 'show');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/songs/:title');
    },
    'should mount route': function (router) {
      assert.lengthOf(router._http._routes, 1);
      assert.equal(router._http._routes[0].method, 'GET');
      assert.equal(router._http._routes[0].path, '/songs/:title');
      assert.equal(router._http._routes[0].fn().controller, 'SongsController');
      assert.equal(router._http._routes[0].fn().action, 'show');
    },
  },
  
  'router with match route that declares helpers': {
    topic: function() {
      var router = intializedRouter()
      router.match('songs', 'songs#list', { as: 'songs' });
      return router;
    },
    
    'should declare routing helpers': function (router) {
      assert.isFunction(router._express._helpers.songsPath);
      assert.isFunction(router._express._dynamicHelpers.songsURL);
      var songsURL = router._express._dynamicHelpers.songsURL({}, {});
      assert.isFunction(songsURL);
    },
  },
  
  'router with resource route': {
    topic: function() {
      var router = intializedRouter()
      router.resource('profile');
      return router;
    },
    
    'should mount six routes': function (router) {
      assert.lengthOf(router._http._routes, 6);
    },
    'should create route to new action': function (router) {
      var route = router._find('ProfileController', 'new');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/profile/new');
    },
    'should mount route to new action at GET /resource/new': function (router) {
      assert.equal(router._http._routes[0].method, 'GET');
      assert.equal(router._http._routes[0].path, '/profile/new');
      assert.equal(router._http._routes[0].fn().controller, 'ProfileController');
      assert.equal(router._http._routes[0].fn().action, 'new');
    },
    'should create route to create action': function (router) {
      var route = router._find('ProfileController', 'create');
      assert.equal(route.method, 'post');
      assert.equal(route.pattern, '/profile');
    },
    'should mount route to create action at POST /resource': function (router) {
      assert.equal(router._http._routes[1].method, 'POST');
      assert.equal(router._http._routes[1].path, '/profile');
      assert.equal(router._http._routes[1].fn().controller, 'ProfileController');
      assert.equal(router._http._routes[1].fn().action, 'create');
    },
    'should create route to show action': function (router) {
      var route = router._find('ProfileController', 'show');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/profile.:format?');
    },
    'should mount route to show action at GET /resource': function (router) {
      assert.equal(router._http._routes[2].method, 'GET');
      assert.equal(router._http._routes[2].path, '/profile.:format?');
      assert.equal(router._http._routes[2].fn().controller, 'ProfileController');
      assert.equal(router._http._routes[2].fn().action, 'show');
    },
    'should create route to edit action': function (router) {
      var route = router._find('ProfileController', 'edit');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/profile/edit');
    },
    'should mount route to edit action at GET /resource/edit': function (router) {
      assert.equal(router._http._routes[3].method, 'GET');
      assert.equal(router._http._routes[3].path, '/profile/edit');
      assert.equal(router._http._routes[3].fn().controller, 'ProfileController');
      assert.equal(router._http._routes[3].fn().action, 'edit');
    },
    'should create route to update action': function (router) {
      var route = router._find('ProfileController', 'update');
      assert.equal(route.method, 'put');
      assert.equal(route.pattern, '/profile');
    },
    'should mount route to update action at PUT /resource': function (router) {
      assert.equal(router._http._routes[4].method, 'PUT');
      assert.equal(router._http._routes[4].path, '/profile');
      assert.equal(router._http._routes[4].fn().controller, 'ProfileController');
      assert.equal(router._http._routes[4].fn().action, 'update');
    },
    'should create route to destroy action': function (router) {
      var route = router._find('ProfileController', 'destroy');
      assert.equal(route.method, 'del');
      assert.equal(route.pattern, '/profile');
    },
    'should mount route to destroy action at DELETE /resource': function (router) {
      assert.equal(router._http._routes[5].method, 'DELETE');
      assert.equal(router._http._routes[5].path, '/profile');
      assert.equal(router._http._routes[5].fn().controller, 'ProfileController');
      assert.equal(router._http._routes[5].fn().action, 'destroy');
    },
    'should declare routing helpers': function (router) {
      assert.isFunction(router._express._helpers.profilePath);
      assert.isFunction(router._express._helpers.newProfilePath);
      assert.isFunction(router._express._helpers.editProfilePath);
      
      assert.isFunction(router._express._dynamicHelpers.profileURL);
      assert.isFunction(router._express._dynamicHelpers.newProfileURL);
      assert.isFunction(router._express._dynamicHelpers.editProfileURL);
    },
  },
  
  'router with resources route': {
    topic: function() {
      var router = intializedRouter()
      router.resources('bands');
      return router;
    },
    
    'should mount seven routes': function (router) {
      assert.lengthOf(router._http._routes, 7);
    },
    'should create route to index action': function (router) {
      var route = router._find('BandsController', 'index');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/bands');
    },
    'should mount route to index action at GET /resources': function (router) {
      assert.equal(router._http._routes[0].method, 'GET');
      assert.equal(router._http._routes[0].path, '/bands');
      assert.equal(router._http._routes[0].fn().controller, 'BandsController');
      assert.equal(router._http._routes[0].fn().action, 'index');
    },
    'should create route to new action': function (router) {
      var route = router._find('BandsController', 'new');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/bands/new');
    },
    'should mount route to new action at GET /resources/new': function (router) {
      assert.equal(router._http._routes[1].method, 'GET');
      assert.equal(router._http._routes[1].path, '/bands/new');
      assert.equal(router._http._routes[1].fn().controller, 'BandsController');
      assert.equal(router._http._routes[1].fn().action, 'new');
    },
    'should create route to create action': function (router) {
      var route = router._find('BandsController', 'create');
      assert.equal(route.method, 'post');
      assert.equal(route.pattern, '/bands');
    },
    'should mount route to create action at POST /resources': function (router) {
      assert.equal(router._http._routes[2].method, 'POST');
      assert.equal(router._http._routes[2].path, '/bands');
      assert.equal(router._http._routes[2].fn().controller, 'BandsController');
      assert.equal(router._http._routes[2].fn().action, 'create');
    },
    'should create route to show action': function (router) {
      var route = router._find('BandsController', 'show');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/bands/:id.:format?');
    },
    'should mount route to show action at GET /resources/1234': function (router) {
      assert.equal(router._http._routes[3].method, 'GET');
      assert.equal(router._http._routes[3].path, '/bands/:id.:format?');
      assert.equal(router._http._routes[3].fn().controller, 'BandsController');
      assert.equal(router._http._routes[3].fn().action, 'show');
    },
    'should create route to edit action': function (router) {
      var route = router._find('BandsController', 'edit');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/bands/:id/edit');
    },
    'should mount route to edit action at GET /resources/1234/edit': function (router) {
      assert.equal(router._http._routes[4].method, 'GET');
      assert.equal(router._http._routes[4].path, '/bands/:id/edit');
      assert.equal(router._http._routes[4].fn().controller, 'BandsController');
      assert.equal(router._http._routes[4].fn().action, 'edit');
    },
    'should create route to update action': function (router) {
      var route = router._find('BandsController', 'update');
      assert.equal(route.method, 'put');
      assert.equal(route.pattern, '/bands/:id');
    },
    'should mount route to update action at PUT /resources/1234': function (router) {
      assert.equal(router._http._routes[5].method, 'PUT');
      assert.equal(router._http._routes[5].path, '/bands/:id');
      assert.equal(router._http._routes[5].fn().controller, 'BandsController');
      assert.equal(router._http._routes[5].fn().action, 'update');
    },
    'should create route to destroy action': function (router) {
      var route = router._find('BandsController', 'destroy');
      assert.equal(route.method, 'del');
      assert.equal(route.pattern, '/bands/:id');
    },
    'should mount route to destroy action at DELETE /resources/1234': function (router) {
      assert.equal(router._http._routes[6].method, 'DELETE');
      assert.equal(router._http._routes[6].path, '/bands/:id');
      assert.equal(router._http._routes[6].fn().controller, 'BandsController');
      assert.equal(router._http._routes[6].fn().action, 'destroy');
    },
    'should declare routing helpers': function (router) {
      assert.isFunction(router._express._helpers.bandsPath);
      assert.isFunction(router._express._helpers.bandPath);
      assert.isFunction(router._express._helpers.newBandPath);
      assert.isFunction(router._express._helpers.editBandPath);
      
      assert.isFunction(router._express._dynamicHelpers.bandsURL);
      assert.isFunction(router._express._dynamicHelpers.bandURL);
      assert.isFunction(router._express._dynamicHelpers.newBandURL);
      assert.isFunction(router._express._dynamicHelpers.editBandURL);
    },
  },
  
  'router with resource nested under resource': {
    topic: function() {
      var router = intializedRouter()
      router.resource('account', function() {
        this.resource('password');
      });
      return router;
    },
    
    'should mount twelve routes': function (router) {
      assert.lengthOf(router._http._routes, 12);
    },
    'should create route to sub-resource new action': function (router) {
      var route = router._find('PasswordController', 'new');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/account/password/new');
    },
    'should mount route to sub-resource new action at GET /resource/sub-resource/new': function (router) {
      assert.equal(router._http._routes[6].method, 'GET');
      assert.equal(router._http._routes[6].path, '/account/password/new');
      assert.equal(router._http._routes[6].fn().controller, 'PasswordController');
      assert.equal(router._http._routes[6].fn().action, 'new');
    },
    'should create route to sub-resource create action': function (router) {
      var route = router._find('PasswordController', 'create');
      assert.equal(route.method, 'post');
      assert.equal(route.pattern, '/account/password');
    },
    'should mount route to sub-resource create action at POST /resource/sub-resource': function (router) {
      assert.equal(router._http._routes[7].method, 'POST');
      assert.equal(router._http._routes[7].path, '/account/password');
      assert.equal(router._http._routes[7].fn().controller, 'PasswordController');
      assert.equal(router._http._routes[7].fn().action, 'create');
    },
    'should create route to sub-resource show action': function (router) {
      var route = router._find('PasswordController', 'show');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/account/password.:format?');
    },
    'should mount route to sub-resource show action at GET /resource/sub-resource': function (router) {
      assert.equal(router._http._routes[8].method, 'GET');
      assert.equal(router._http._routes[8].path, '/account/password.:format?');
      assert.equal(router._http._routes[8].fn().controller, 'PasswordController');
      assert.equal(router._http._routes[8].fn().action, 'show');
    },
    'should create route to sub-resource edit action': function (router) {
      var route = router._find('PasswordController', 'edit');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/account/password/edit');
    },
    'should mount route to sub-resource edit action at GET /resource/sub-resource/edit': function (router) {
      assert.equal(router._http._routes[9].method, 'GET');
      assert.equal(router._http._routes[9].path, '/account/password/edit');
      assert.equal(router._http._routes[9].fn().controller, 'PasswordController');
      assert.equal(router._http._routes[9].fn().action, 'edit');
    },
    'should create route to sub-resource update action': function (router) {
      var route = router._find('PasswordController', 'update');
      assert.equal(route.method, 'put');
      assert.equal(route.pattern, '/account/password');
    },
    'should mount route to sub-resource update action at PUT /resource/sub-resource': function (router) {
      assert.equal(router._http._routes[10].method, 'PUT');
      assert.equal(router._http._routes[10].path, '/account/password');
      assert.equal(router._http._routes[10].fn().controller, 'PasswordController');
      assert.equal(router._http._routes[10].fn().action, 'update');
    },
    'should create route to sub-resource destroy action': function (router) {
      var route = router._find('PasswordController', 'destroy');
      assert.equal(route.method, 'del');
      assert.equal(route.pattern, '/account/password');
    },
    'should mount route to sub-resource destroy action at DELETE /resource/sub-resource': function (router) {
      assert.equal(router._http._routes[11].method, 'DELETE');
      assert.equal(router._http._routes[11].path, '/account/password');
      assert.equal(router._http._routes[11].fn().controller, 'PasswordController');
      assert.equal(router._http._routes[11].fn().action, 'destroy');
    },
    'should declare routing helpers': function (router) {
      assert.lengthOf(Object.keys(router._express._helpers), 6);
      assert.lengthOf(Object.keys(router._express._dynamicHelpers), 6);
      
      assert.isFunction(router._express._helpers.accountPath);
      assert.isFunction(router._express._helpers.newAccountPath);
      assert.isFunction(router._express._helpers.editAccountPath);
      assert.isFunction(router._express._helpers.accountPasswordPath);
      assert.isFunction(router._express._helpers.newAccountPasswordPath);
      assert.isFunction(router._express._helpers.editAccountPasswordPath);
      
      assert.isFunction(router._express._dynamicHelpers.accountURL);
      assert.isFunction(router._express._dynamicHelpers.newAccountURL);
      assert.isFunction(router._express._dynamicHelpers.editAccountURL);
      assert.isFunction(router._express._dynamicHelpers.accountPasswordURL);
      assert.isFunction(router._express._dynamicHelpers.newAccountPasswordURL);
      assert.isFunction(router._express._dynamicHelpers.editAccountPasswordURL);
      
      // FIXME: Sub-resource routing helpers need to be declared properly and return correct paths.
    },
  },
  
  'router with resources nested under resource': {
    topic: function() {
      var router = intializedRouter()
      router.resource('settings', function() {
        this.resources('accounts');
      });
      return router;
    },
    
    'should mount fourteen routes': function (router) {
      assert.lengthOf(router._http._routes, 13);
    },
    'should create route to sub-resources index action': function (router) {
      var route = router._find('AccountsController', 'index');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/settings/accounts');
    },
    'should mount route to sub-resources index action at GET /resource/sub-resources': function (router) {
      assert.equal(router._http._routes[6].method, 'GET');
      assert.equal(router._http._routes[6].path, '/settings/accounts');
      assert.equal(router._http._routes[6].fn().controller, 'AccountsController');
      assert.equal(router._http._routes[6].fn().action, 'index');
    },
    'should create route to sub-resources new action': function (router) {
      var route = router._find('AccountsController', 'new');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/settings/accounts/new');
    },
    'should mount route to sub-resources new action at GET /resource/sub-resources/new': function (router) {
      assert.equal(router._http._routes[7].method, 'GET');
      assert.equal(router._http._routes[7].path, '/settings/accounts/new');
      assert.equal(router._http._routes[7].fn().controller, 'AccountsController');
      assert.equal(router._http._routes[7].fn().action, 'new');
    },
    'should create route to sub-resources create action': function (router) {
      var route = router._find('AccountsController', 'create');
      assert.equal(route.method, 'post');
      assert.equal(route.pattern, '/settings/accounts');
    },
    'should mount route to sub-resources create action at POST /resource/sub-resources': function (router) {
      assert.equal(router._http._routes[8].method, 'POST');
      assert.equal(router._http._routes[8].path, '/settings/accounts');
      assert.equal(router._http._routes[8].fn().controller, 'AccountsController');
      assert.equal(router._http._routes[8].fn().action, 'create');
    },
    'should create route to sub-resources show action': function (router) {
      var route = router._find('AccountsController', 'show');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/settings/accounts/:id.:format?');
    },
    'should mount route to sub-resources show action at GET /resource/sub-resources/5678': function (router) {
      assert.equal(router._http._routes[9].method, 'GET');
      assert.equal(router._http._routes[9].path, '/settings/accounts/:id.:format?');
      assert.equal(router._http._routes[9].fn().controller, 'AccountsController');
      assert.equal(router._http._routes[9].fn().action, 'show');
    },
    'should create route to sub-resources edit action': function (router) {
      var route = router._find('AccountsController', 'edit');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/settings/accounts/:id/edit');
    },
    'should mount route to sub-resources edit action at GET /resource/sub-resources/5678/edit': function (router) {
      assert.equal(router._http._routes[10].method, 'GET');
      assert.equal(router._http._routes[10].path, '/settings/accounts/:id/edit');
      assert.equal(router._http._routes[10].fn().controller, 'AccountsController');
      assert.equal(router._http._routes[10].fn().action, 'edit');
    },
    'should create route to sub-resources update action': function (router) {
      var route = router._find('AccountsController', 'update');
      assert.equal(route.method, 'put');
      assert.equal(route.pattern, '/settings/accounts/:id');
    },
    'should mount route to sub-resources update action at PUT /resource/sub-resources/5678': function (router) {
      assert.equal(router._http._routes[11].method, 'PUT');
      assert.equal(router._http._routes[11].path, '/settings/accounts/:id');
      assert.equal(router._http._routes[11].fn().controller, 'AccountsController');
      assert.equal(router._http._routes[11].fn().action, 'update');
    },
    'should create route to destroy action': function (router) {
      var route = router._find('AccountsController', 'destroy');
      assert.equal(route.method, 'del');
      assert.equal(route.pattern, '/settings/accounts/:id');
    },
    'should mount route to destroy action at DELETE /resource/sub-resources/1234': function (router) {
      assert.equal(router._http._routes[12].method, 'DELETE');
      assert.equal(router._http._routes[12].path, '/settings/accounts/:id');
      assert.equal(router._http._routes[12].fn().controller, 'AccountsController');
      assert.equal(router._http._routes[12].fn().action, 'destroy');
    },
    'should declare routing helpers': function (router) {
      assert.lengthOf(Object.keys(router._express._helpers), 7);
      assert.lengthOf(Object.keys(router._express._dynamicHelpers), 7);
      
      assert.isFunction(router._express._helpers.settingsPath);
      assert.isFunction(router._express._helpers.newSettingsPath);
      assert.isFunction(router._express._helpers.editSettingsPath);
      assert.isFunction(router._express._helpers.settingsAccountsPath);
      assert.isFunction(router._express._helpers.settingsAccountPath);
      assert.isFunction(router._express._helpers.newSettingsAccountPath);
      assert.isFunction(router._express._helpers.editSettingsAccountPath);
      
      assert.isFunction(router._express._dynamicHelpers.settingsURL);
      assert.isFunction(router._express._dynamicHelpers.newSettingsURL);
      assert.isFunction(router._express._dynamicHelpers.editSettingsURL);
      assert.isFunction(router._express._dynamicHelpers.settingsAccountsURL);
      assert.isFunction(router._express._dynamicHelpers.settingsAccountURL);
      assert.isFunction(router._express._dynamicHelpers.newSettingsAccountURL);
      assert.isFunction(router._express._dynamicHelpers.editSettingsAccountURL);
    },
  },
  
  'router with resource nested under resources': {
    topic: function() {
      var router = intializedRouter()
      router.resources('bands', function() {
        this.resource('bio');
      });
      return router;
    },
    
    'should mount thirteen routes': function (router) {
      assert.lengthOf(router._http._routes, 13);
    },
    'should create route to sub-resource new action': function (router) {
      var route = router._find('BioController', 'new');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/bands/:bandID/bio/new');
    },
    'should mount route to sub-resource new action at GET /resources/1234/sub-resource/new': function (router) {
      assert.equal(router._http._routes[7].method, 'GET');
      assert.equal(router._http._routes[7].path, '/bands/:bandID/bio/new');
      assert.equal(router._http._routes[7].fn().controller, 'BioController');
      assert.equal(router._http._routes[7].fn().action, 'new');
    },
    'should create route to sub-resource create action': function (router) {
      var route = router._find('BioController', 'create');
      assert.equal(route.method, 'post');
      assert.equal(route.pattern, '/bands/:bandID/bio');
    },
    'should mount route to sub-resource create action at POST /resources/1234/sub-resource': function (router) {
      assert.equal(router._http._routes[8].method, 'POST');
      assert.equal(router._http._routes[8].path, '/bands/:bandID/bio');
      assert.equal(router._http._routes[8].fn().controller, 'BioController');
      assert.equal(router._http._routes[8].fn().action, 'create');
    },
    'should create route to sub-resource show action': function (router) {
      var route = router._find('BioController', 'show');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/bands/:bandID/bio.:format?');
    },
    'should mount route to sub-resource show action at GET /resources/1234/sub-resource': function (router) {
      assert.equal(router._http._routes[9].method, 'GET');
      assert.equal(router._http._routes[9].path, '/bands/:bandID/bio.:format?');
      assert.equal(router._http._routes[9].fn().controller, 'BioController');
      assert.equal(router._http._routes[9].fn().action, 'show');
    },
    'should create route to sub-resource edit action': function (router) {
      var route = router._find('BioController', 'edit');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/bands/:bandID/bio/edit');
    },
    'should mount route to sub-resource edit action at GET /resources/1234/sub-resource/edit': function (router) {
      assert.equal(router._http._routes[10].method, 'GET');
      assert.equal(router._http._routes[10].path, '/bands/:bandID/bio/edit');
      assert.equal(router._http._routes[10].fn().controller, 'BioController');
      assert.equal(router._http._routes[10].fn().action, 'edit');
    },
    'should create route to sub-resource update action': function (router) {
      var route = router._find('BioController', 'update');
      assert.equal(route.method, 'put');
      assert.equal(route.pattern, '/bands/:bandID/bio');
    },
    'should mount route to sub-resource update action at PUT /resources/1234/sub-resource': function (router) {
      assert.equal(router._http._routes[11].method, 'PUT');
      assert.equal(router._http._routes[11].path, '/bands/:bandID/bio');
      assert.equal(router._http._routes[11].fn().controller, 'BioController');
      assert.equal(router._http._routes[11].fn().action, 'update');
    },
    'should create route to sub-resource destroy action': function (router) {
      var route = router._find('BioController', 'destroy');
      assert.equal(route.method, 'del');
      assert.equal(route.pattern, '/bands/:bandID/bio');
    },
    'should mount route to sub-resource destroy action at DELETE /resources/1234/sub-resource': function (router) {
      assert.equal(router._http._routes[12].method, 'DELETE');
      assert.equal(router._http._routes[12].path, '/bands/:bandID/bio');
      assert.equal(router._http._routes[12].fn().controller, 'BioController');
      assert.equal(router._http._routes[12].fn().action, 'destroy');
    },
    'should declare routing helpers': function (router) {
      assert.lengthOf(Object.keys(router._express._helpers), 7);
      assert.lengthOf(Object.keys(router._express._dynamicHelpers), 7);
      
      assert.isFunction(router._express._helpers.bandsPath);
      assert.isFunction(router._express._helpers.bandPath);
      assert.isFunction(router._express._helpers.newBandPath);
      assert.isFunction(router._express._helpers.editBandPath);
      assert.isFunction(router._express._helpers.bandBioPath);
      assert.isFunction(router._express._helpers.newBandBioPath);
      assert.isFunction(router._express._helpers.editBandBioPath);
      
      assert.isFunction(router._express._dynamicHelpers.bandsURL);
      assert.isFunction(router._express._dynamicHelpers.bandURL);
      assert.isFunction(router._express._dynamicHelpers.newBandURL);
      assert.isFunction(router._express._dynamicHelpers.editBandURL);
      assert.isFunction(router._express._dynamicHelpers.bandBioURL);
      assert.isFunction(router._express._dynamicHelpers.newBandBioURL);
      assert.isFunction(router._express._dynamicHelpers.editBandBioURL);
    },
  },
  
  'router with resources nested under resources': {
    topic: function() {
      var router = intializedRouter()
      router.resources('bands', function() {
        this.resources('albums');
      });
      return router;
    },
    
    'should mount fourteen routes': function (router) {
      assert.lengthOf(router._http._routes, 14);
    },
    'should create route to sub-resources index action': function (router) {
      var route = router._find('AlbumsController', 'index');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/bands/:bandID/albums');
    },
    'should mount route to sub-resources index action at GET /resources/1234/sub-resources': function (router) {
      assert.equal(router._http._routes[7].method, 'GET');
      assert.equal(router._http._routes[7].path, '/bands/:bandID/albums');
      assert.equal(router._http._routes[7].fn().controller, 'AlbumsController');
      assert.equal(router._http._routes[7].fn().action, 'index');
    },
    'should create route to sub-resources new action': function (router) {
      var route = router._find('AlbumsController', 'new');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/bands/:bandID/albums/new');
    },
    'should mount route to sub-resources new action at GET /resources/1234/sub-resources/new': function (router) {
      assert.equal(router._http._routes[8].method, 'GET');
      assert.equal(router._http._routes[8].path, '/bands/:bandID/albums/new');
      assert.equal(router._http._routes[8].fn().controller, 'AlbumsController');
      assert.equal(router._http._routes[8].fn().action, 'new');
    },
    'should create route to sub-resources create action': function (router) {
      var route = router._find('AlbumsController', 'create');
      assert.equal(route.method, 'post');
      assert.equal(route.pattern, '/bands/:bandID/albums');
    },
    'should mount route to sub-resources create action at POST /resources/1234/sub-resources': function (router) {
      assert.equal(router._http._routes[9].method, 'POST');
      assert.equal(router._http._routes[9].path, '/bands/:bandID/albums');
      assert.equal(router._http._routes[9].fn().controller, 'AlbumsController');
      assert.equal(router._http._routes[9].fn().action, 'create');
    },
    'should create route to sub-resources show action': function (router) {
      var route = router._find('AlbumsController', 'show');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/bands/:bandID/albums/:id.:format?');
    },
    'should mount route to sub-resources show action at GET /resources/1234/sub-resources/5678': function (router) {
      assert.equal(router._http._routes[10].method, 'GET');
      assert.equal(router._http._routes[10].path, '/bands/:bandID/albums/:id.:format?');
      assert.equal(router._http._routes[10].fn().controller, 'AlbumsController');
      assert.equal(router._http._routes[10].fn().action, 'show');
    },
    'should create route to sub-resources edit action': function (router) {
      var route = router._find('AlbumsController', 'edit');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/bands/:bandID/albums/:id/edit');
    },
    'should mount route to sub-resources edit action at GET /resources/1234/sub-resources/5678/edit': function (router) {
      assert.equal(router._http._routes[11].method, 'GET');
      assert.equal(router._http._routes[11].path, '/bands/:bandID/albums/:id/edit');
      assert.equal(router._http._routes[11].fn().controller, 'AlbumsController');
      assert.equal(router._http._routes[11].fn().action, 'edit');
    },
    'should create route to sub-resources update action': function (router) {
      var route = router._find('AlbumsController', 'update');
      assert.equal(route.method, 'put');
      assert.equal(route.pattern, '/bands/:bandID/albums/:id');
    },
    'should mount route to sub-resources update action at PUT /resources/1234/sub-resources/5678': function (router) {
      assert.equal(router._http._routes[12].method, 'PUT');
      assert.equal(router._http._routes[12].path, '/bands/:bandID/albums/:id');
      assert.equal(router._http._routes[12].fn().controller, 'AlbumsController');
      assert.equal(router._http._routes[12].fn().action, 'update');
    },
    'should create route to destroy action': function (router) {
      var route = router._find('AlbumsController', 'destroy');
      assert.equal(route.method, 'del');
      assert.equal(route.pattern, '/bands/:bandID/albums/:id');
    },
    'should mount route to destroy action at DELETE /resources/1234/sub-resources/1234': function (router) {
      assert.equal(router._http._routes[13].method, 'DELETE');
      assert.equal(router._http._routes[13].path, '/bands/:bandID/albums/:id');
      assert.equal(router._http._routes[13].fn().controller, 'AlbumsController');
      assert.equal(router._http._routes[13].fn().action, 'destroy');
    },
    'should declare routing helpers': function (router) {
      assert.lengthOf(Object.keys(router._express._helpers), 8);
      assert.lengthOf(Object.keys(router._express._dynamicHelpers), 8);
      
      assert.isFunction(router._express._helpers.bandsPath);
      assert.isFunction(router._express._helpers.bandPath);
      assert.isFunction(router._express._helpers.newBandPath);
      assert.isFunction(router._express._helpers.editBandPath);
      assert.isFunction(router._express._helpers.bandAlbumsPath);
      assert.isFunction(router._express._helpers.bandAlbumPath);
      assert.isFunction(router._express._helpers.newBandAlbumPath);
      assert.isFunction(router._express._helpers.editBandAlbumPath);
      
      assert.isFunction(router._express._dynamicHelpers.bandsURL);
      assert.isFunction(router._express._dynamicHelpers.bandURL);
      assert.isFunction(router._express._dynamicHelpers.newBandURL);
      assert.isFunction(router._express._dynamicHelpers.editBandURL);
      assert.isFunction(router._express._dynamicHelpers.bandAlbumsURL);
      assert.isFunction(router._express._dynamicHelpers.bandAlbumURL);
      assert.isFunction(router._express._dynamicHelpers.newBandAlbumURL);
      assert.isFunction(router._express._dynamicHelpers.editBandAlbumURL);
      
      // FIXME: Sub-resource routing helpers need to be declared properly and return correct paths.
    },
  },
  
  // TODO: Ensure test coverage of match declared under namespace.
  // TODO: Ensure test coverage for resource nested under resources and vice-versa.
  
  'router with resources route in a namespace': {
    topic: function() {
      var router = intializedRouter();
      router.namespace('admin', function() {
        router.resources('posts');
      });
      return router;
    },
    
    'should mount seven routes': function (router) {
      assert.lengthOf(router._http._routes, 7);
    },
    'should create route to index action': function (router) {
      var route = router._find('Admin::PostsController', 'index');
      assert.equal(route.method, 'get');
      assert.equal(route.pattern, '/admin/posts');
    },
    'should mount route to index action at GET /resources': function (router) {
      assert.equal(router._http._routes[0].method, 'GET');
      assert.equal(router._http._routes[0].path, '/admin/posts');
      assert.equal(router._http._routes[0].fn().controller, 'Admin::PostsController');
      assert.equal(router._http._routes[0].fn().action, 'index');
    },
    'should declare routing helpers': function (router) {
      // FIXME: Ensure that namespaced routing return correct paths.
      
      assert.isFunction(router._express._helpers.adminPostsPath);
      assert.isFunction(router._express._helpers.adminPostPath);
      assert.isFunction(router._express._helpers.newAdminPostPath);
      assert.isFunction(router._express._helpers.editAdminPostPath);
      
      assert.isFunction(router._express._dynamicHelpers.adminPostsURL);
      assert.isFunction(router._express._dynamicHelpers.adminPostURL);
      assert.isFunction(router._express._dynamicHelpers.newAdminPostURL);
      assert.isFunction(router._express._dynamicHelpers.editAdminPostURL);
    },
  },
  
  'routing helpers for patterns without a placeholder': {
    topic: function() {
      var router = intializedRouter()
      router.match('songs', 'songs#index', { as: 'songs' });
      return router;
    },
    
    'should generate correct paths': function (router) {
      // setup app and urlFor helper
      var app = new MockLocomotive();
      app._routes['SongsController#index'] = new Route('get', '/songs');
      var req = new MockRequest();
      req.headers = { 'host': 'www.example.com' };
      req.locomotive = app;
      var res = new MockResponse();
      
      var context = {};
      for (var key in dynamicHelpers) {
        context.urlFor = dynamicHelpers.urlFor.call(this, req, res);
      }
      // end setup
      
      assert.isFunction(router._express._helpers.songsPath);
      var songsPath = router._express._helpers.songsPath.bind(context)
      assert.equal(songsPath(), '/songs');
      
      assert.isFunction(router._express._dynamicHelpers.songsURL);
      var songsURL = router._express._dynamicHelpers.songsURL(req, res).bind(context);
      assert.isFunction(songsURL);
      assert.equal(songsURL(), 'http://www.example.com/songs');
    },
  },
  
  'routing helpers for patterns with a placeholder': {
    topic: function() {
      var router = intializedRouter()
      router.match('songs/:id', 'songs#show', { as: 'song' });
      return router;
    },
    
    'should generate correct paths': function (router) {
      // setup app and urlFor helper
      var app = new MockLocomotive();
      app._routes['SongsController#show'] = new Route('get', '/songs/:id');
      var req = new MockRequest();
      req.headers = { 'host': 'www.example.com' };
      req.locomotive = app;
      var res = new MockResponse();
      
      var context = {};
      for (var key in dynamicHelpers) {
        context.urlFor = dynamicHelpers.urlFor.call(this, req, res);
      }
      // end setup
      
      assert.isFunction(router._express._helpers.songPath);
      var songPath = router._express._helpers.songPath.bind(context)
      assert.equal(songPath(7), '/songs/7');
      assert.equal(songPath('mr-jones'), '/songs/mr-jones');
      assert.equal(songPath({ id: 101 }), '/songs/101');
      
      assert.isFunction(router._express._dynamicHelpers.songURL);
      var songURL = router._express._dynamicHelpers.songURL(req, res).bind(context);
      assert.isFunction(songURL);
      assert.equal(songURL(7), 'http://www.example.com/songs/7');
      assert.equal(songURL('mr-jones'), 'http://www.example.com/songs/mr-jones');
      assert.equal(songURL({ id: 101 }), 'http://www.example.com/songs/101');
    },
  },
  
}).export(module);
