(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["$"] = factory();
	else
		root["$"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/loglevel/lib/loglevel.js":
/*!***********************************************!*\
  !*** ./node_modules/loglevel/lib/loglevel.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*\n* loglevel - https://github.com/pimterry/loglevel\n*\n* Copyright (c) 2013 Tim Perry\n* Licensed under the MIT license.\n*/\n(function (root, definition) {\n    \"use strict\";\n    if (true) {\n        !(__WEBPACK_AMD_DEFINE_FACTORY__ = (definition),\n\t\t\t\t__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?\n\t\t\t\t(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :\n\t\t\t\t__WEBPACK_AMD_DEFINE_FACTORY__),\n\t\t\t\t__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));\n    } else {}\n}(this, function () {\n    \"use strict\";\n\n    // Slightly dubious tricks to cut down minimized file size\n    var noop = function() {};\n    var undefinedType = \"undefined\";\n    var isIE = (typeof window !== undefinedType) && (typeof window.navigator !== undefinedType) && (\n        /Trident\\/|MSIE /.test(window.navigator.userAgent)\n    );\n\n    var logMethods = [\n        \"trace\",\n        \"debug\",\n        \"info\",\n        \"warn\",\n        \"error\"\n    ];\n\n    // Cross-browser bind equivalent that works at least back to IE6\n    function bindMethod(obj, methodName) {\n        var method = obj[methodName];\n        if (typeof method.bind === 'function') {\n            return method.bind(obj);\n        } else {\n            try {\n                return Function.prototype.bind.call(method, obj);\n            } catch (e) {\n                // Missing bind shim or IE8 + Modernizr, fallback to wrapping\n                return function() {\n                    return Function.prototype.apply.apply(method, [obj, arguments]);\n                };\n            }\n        }\n    }\n\n    // Trace() doesn't print the message in IE, so for that case we need to wrap it\n    function traceForIE() {\n        if (console.log) {\n            if (console.log.apply) {\n                console.log.apply(console, arguments);\n            } else {\n                // In old IE, native console methods themselves don't have apply().\n                Function.prototype.apply.apply(console.log, [console, arguments]);\n            }\n        }\n        if (console.trace) console.trace();\n    }\n\n    // Build the best logging method possible for this env\n    // Wherever possible we want to bind, not wrap, to preserve stack traces\n    function realMethod(methodName) {\n        if (methodName === 'debug') {\n            methodName = 'log';\n        }\n\n        if (typeof console === undefinedType) {\n            return false; // No method possible, for now - fixed later by enableLoggingWhenConsoleArrives\n        } else if (methodName === 'trace' && isIE) {\n            return traceForIE;\n        } else if (console[methodName] !== undefined) {\n            return bindMethod(console, methodName);\n        } else if (console.log !== undefined) {\n            return bindMethod(console, 'log');\n        } else {\n            return noop;\n        }\n    }\n\n    // These private functions always need `this` to be set properly\n\n    function replaceLoggingMethods(level, loggerName) {\n        /*jshint validthis:true */\n        for (var i = 0; i < logMethods.length; i++) {\n            var methodName = logMethods[i];\n            this[methodName] = (i < level) ?\n                noop :\n                this.methodFactory(methodName, level, loggerName);\n        }\n\n        // Define log.log as an alias for log.debug\n        this.log = this.debug;\n    }\n\n    // In old IE versions, the console isn't present until you first open it.\n    // We build realMethod() replacements here that regenerate logging methods\n    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {\n        return function () {\n            if (typeof console !== undefinedType) {\n                replaceLoggingMethods.call(this, level, loggerName);\n                this[methodName].apply(this, arguments);\n            }\n        };\n    }\n\n    // By default, we use closely bound real methods wherever possible, and\n    // otherwise we wait for a console to appear, and then try again.\n    function defaultMethodFactory(methodName, level, loggerName) {\n        /*jshint validthis:true */\n        return realMethod(methodName) ||\n               enableLoggingWhenConsoleArrives.apply(this, arguments);\n    }\n\n    function Logger(name, defaultLevel, factory) {\n      var self = this;\n      var currentLevel;\n\n      var storageKey = \"loglevel\";\n      if (typeof name === \"string\") {\n        storageKey += \":\" + name;\n      } else if (typeof name === \"symbol\") {\n        storageKey = undefined;\n      }\n\n      function persistLevelIfPossible(levelNum) {\n          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();\n\n          if (typeof window === undefinedType || !storageKey) return;\n\n          // Use localStorage if available\n          try {\n              window.localStorage[storageKey] = levelName;\n              return;\n          } catch (ignore) {}\n\n          // Use session cookie as fallback\n          try {\n              window.document.cookie =\n                encodeURIComponent(storageKey) + \"=\" + levelName + \";\";\n          } catch (ignore) {}\n      }\n\n      function getPersistedLevel() {\n          var storedLevel;\n\n          if (typeof window === undefinedType || !storageKey) return;\n\n          try {\n              storedLevel = window.localStorage[storageKey];\n          } catch (ignore) {}\n\n          // Fallback to cookies if local storage gives us nothing\n          if (typeof storedLevel === undefinedType) {\n              try {\n                  var cookie = window.document.cookie;\n                  var location = cookie.indexOf(\n                      encodeURIComponent(storageKey) + \"=\");\n                  if (location !== -1) {\n                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];\n                  }\n              } catch (ignore) {}\n          }\n\n          // If the stored level is not valid, treat it as if nothing was stored.\n          if (self.levels[storedLevel] === undefined) {\n              storedLevel = undefined;\n          }\n\n          return storedLevel;\n      }\n\n      /*\n       *\n       * Public logger API - see https://github.com/pimterry/loglevel for details\n       *\n       */\n\n      self.name = name;\n\n      self.levels = { \"TRACE\": 0, \"DEBUG\": 1, \"INFO\": 2, \"WARN\": 3,\n          \"ERROR\": 4, \"SILENT\": 5};\n\n      self.methodFactory = factory || defaultMethodFactory;\n\n      self.getLevel = function () {\n          return currentLevel;\n      };\n\n      self.setLevel = function (level, persist) {\n          if (typeof level === \"string\" && self.levels[level.toUpperCase()] !== undefined) {\n              level = self.levels[level.toUpperCase()];\n          }\n          if (typeof level === \"number\" && level >= 0 && level <= self.levels.SILENT) {\n              currentLevel = level;\n              if (persist !== false) {  // defaults to true\n                  persistLevelIfPossible(level);\n              }\n              replaceLoggingMethods.call(self, level, name);\n              if (typeof console === undefinedType && level < self.levels.SILENT) {\n                  return \"No console available for logging\";\n              }\n          } else {\n              throw \"log.setLevel() called with invalid level: \" + level;\n          }\n      };\n\n      self.setDefaultLevel = function (level) {\n          if (!getPersistedLevel()) {\n              self.setLevel(level, false);\n          }\n      };\n\n      self.enableAll = function(persist) {\n          self.setLevel(self.levels.TRACE, persist);\n      };\n\n      self.disableAll = function(persist) {\n          self.setLevel(self.levels.SILENT, persist);\n      };\n\n      // Initialize with the right level\n      var initialLevel = getPersistedLevel();\n      if (initialLevel == null) {\n          initialLevel = defaultLevel == null ? \"WARN\" : defaultLevel;\n      }\n      self.setLevel(initialLevel, false);\n    }\n\n    /*\n     *\n     * Top-level API\n     *\n     */\n\n    var defaultLogger = new Logger();\n\n    var _loggersByName = {};\n    defaultLogger.getLogger = function getLogger(name) {\n        if ((typeof name !== \"symbol\" && typeof name !== \"string\") || name === \"\") {\n          throw new TypeError(\"You must supply a name when creating a logger.\");\n        }\n\n        var logger = _loggersByName[name];\n        if (!logger) {\n          logger = _loggersByName[name] = new Logger(\n            name, defaultLogger.getLevel(), defaultLogger.methodFactory);\n        }\n        return logger;\n    };\n\n    // Grab the current global log variable in case of overwrite\n    var _log = (typeof window !== undefinedType) ? window.log : undefined;\n    defaultLogger.noConflict = function() {\n        if (typeof window !== undefinedType &&\n               window.log === defaultLogger) {\n            window.log = _log;\n        }\n\n        return defaultLogger;\n    };\n\n    defaultLogger.getLoggers = function getLoggers() {\n        return _loggersByName;\n    };\n\n    // ES6 default export, for compatibility\n    defaultLogger['default'] = defaultLogger;\n\n    return defaultLogger;\n}));\n\n\n//# sourceURL=webpack://$/./node_modules/loglevel/lib/loglevel.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: MoovlahTracker, MoovlahPlayer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _tracking__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tracking */ \"./src/tracking/index.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"MoovlahTracker\", function() { return _tracking__WEBPACK_IMPORTED_MODULE_0__[\"default\"]; });\n\n/* harmony import */ var _player__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./player */ \"./src/player/index.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"MoovlahPlayer\", function() { return _player__WEBPACK_IMPORTED_MODULE_1__[\"default\"]; });\n\n\n\n\n\n//# sourceURL=webpack://$/./src/index.js?");

/***/ }),

/***/ "./src/player/index.js":
/*!*****************************!*\
  !*** ./src/player/index.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return MoovlahPlayer; });\nclass MoovlahPlayer {\n  constructor(opts) {}\n\n}\n;\n\n//# sourceURL=webpack://$/./src/player/index.js?");

/***/ }),

/***/ "./src/tracking/ga_loader.js":
/*!***********************************!*\
  !*** ./src/tracking/ga_loader.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n// Based on Google Analytics JavaScript Tracking Snippet\n// See original @ https://developers.google.com/analytics/devguides/collection/analyticsjs/tracking-snippet-reference\n\n/**\n * Creates a temporary global ga object and lazy loads analytics.js.\n * @function\n * @param {string} Global name of analytics object. Defaults to 'ga'.\n * @param {boolean} Set to true to load the debug version of the analytics.js library.\n * @param {boolean} Set to true to enable trace debugging.\n */\n/* harmony default export */ __webpack_exports__[\"default\"] = (function (name = 'ga', debug = false, trace = false) {\n  // Preserve renaming support and minification\n  return new Promise(function (resolve, reject) {\n    let win = window,\n        doc = document,\n        el = 'script'; // Acts as a pointer to support renaming\n\n    win.GoogleAnalyticsObject || (win.GoogleAnalyticsObject = name); // Ensure analytics.js is not already loaded\n\n    if (win[name] && typeof win[name] === 'function') {\n      resolve(win.GoogleAnalyticsObject);\n    }\n\n    if (trace) {\n      win['ga_debug'] = {\n        trace: true\n      };\n    } // Creates an initial ga() function\n    // The queued commands will be executed once analytics.js loads\n\n\n    win[name] = function () {\n      win[name].q.push(arguments);\n    };\n\n    win[name].q = []; // Sets the time (as an integer) this tag was executed\n    // Used for timing hits\n\n    win[name].l = 1 * new Date(); // Insert script element above the first script element in document\n    // (async + https)\n\n    let first = doc.getElementsByTagName(el)[0];\n    let script = doc.createElement(el);\n    script.src = 'https://www.google-analytics.com/analytics' + (debug ? '_debug.js' : '.js');\n    script.async = true; //if (typeof cb === 'function') script.onload = () => { onLoad(true); }\n\n    script.onload = resolve(win.GoogleAnalyticsObject);\n    script.onerror = reject('error loading GA');\n    first.parentNode.insertBefore(script, first);\n  });\n});\n\n//# sourceURL=webpack://$/./src/tracking/ga_loader.js?");

/***/ }),

/***/ "./src/tracking/index.js":
/*!*******************************!*\
  !*** ./src/tracking/index.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return MoovlahTracker; });\n/* harmony import */ var _ga_loader__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ga_loader */ \"./src/tracking/ga_loader.js\");\n/* harmony import */ var loglevel__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! loglevel */ \"./node_modules/loglevel/lib/loglevel.js\");\n/* harmony import */ var loglevel__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(loglevel__WEBPACK_IMPORTED_MODULE_1__);\n\n\nclass MoovlahTracker {\n  constructor(opts) {\n    this.loglevel = `warn`;\n\n    if (opts.loglevel) {\n      this.loglevel = opts.loglevel;\n    }\n\n    loglevel__WEBPACK_IMPORTED_MODULE_1___default.a.setDefaultLevel(this.loglevel);\n    this.trackers = {\n      'google_analytics': {\n        ids: ['UA-172822330-1']\n      }\n    };\n    this.dimensionsMap = {\n      google_analytics: [``, //GOOGLE STARTS COUNTING AT 1\n      `player_id`, `content_id`, `floating`, `placement_id`, `distribution_id`, `user_id`, `player_type`, `embedtype`, `mute`, `universal_ad_id`, `play_id`, `content_name`, `error_code`, `error_message`, `placement_domain`, `ad_network_id`, `ad_unit_id`, `ad_id`, `ad_query_id`]\n    };\n    this.metricsMap = {\n      google_analytics: [`` //GOOGLE STARTS COUNTING AT 1\n      ]\n    };\n    this.variablesMap = {\n      google_analytics: [`` //GOOGLE STARTS COUNTING AT 1\n      ]\n    };\n    this.dimensions = opts.dimensions || {};\n    this.metrics = opts.metrics || {};\n    this.variables = opts.variables || {};\n    this.player = opts.player;\n    loglevel__WEBPACK_IMPORTED_MODULE_1___default.a.debug('MoovlahTracker', opts, this.dimensions);\n\n    for (let tracker in opts.trackers) {\n      opts.trackers[tracker] = Array.isArray(opts.trackers[tracker]) ? opts.trackers[tracker] : [opts.trackers[tracker]];\n\n      if (this.trackers[tracker]) {\n        opts.trackers[tracker].map(i => {\n          this.trackers.tracker.ids.push(i);\n        });\n      } else {\n        this.trackers[tracker] = {\n          ids: opts.trackers[tracker]\n        };\n      }\n    }\n\n    for (let tracker in this.trackers) {\n      switch (tracker) {\n        case 'google_analytics':\n          Object(_ga_loader__WEBPACK_IMPORTED_MODULE_0__[\"default\"])().then(c => {\n            loglevel__WEBPACK_IMPORTED_MODULE_1___default.a.debug('loading', c);\n            this.trackers[tracker].tracker = this._ga;\n            loglevel__WEBPACK_IMPORTED_MODULE_1___default.a.debug('loaded', this.trackers[tracker].tracker, this.trackers[tracker].ids);\n            this.trackers[tracker].tracker('create', this.trackers[tracker].ids[0], `Moovlah_${tracker}`, {\n              storage: 'none'\n            });\n            /**\n            ALWAYS DO THIS BC EXTRA TRACKERS NOT ADDED UNTIL AFTER CONFIG LOADED\n            if(this.trackers[tracker].ids.length > 1) {\n            */\n\n            loglevel__WEBPACK_IMPORTED_MODULE_1___default.a.debug('wiring up broadcast function');\n            this.trackers[tracker].tracker(this.broadcastGoogleAnalytics.bind(this));\n            /**\n            }\n            */\n\n            this.trackers[tracker].tracker('send', 'pageview', this._gaDimensions);\n          }).catch(err => {\n            loglevel__WEBPACK_IMPORTED_MODULE_1___default.a.error('Error loading GA', err);\n          });\n          break;\n      }\n    }\n  }\n\n  broadcastGoogleAnalytics(tracker) {\n    loglevel__WEBPACK_IMPORTED_MODULE_1___default.a.debug('broadcastGoogleAnalytics', tracker);\n    this.trackers['google_analytics'].originalSendHitTask = tracker.get('sendHitTask');\n    tracker.set('sendHitTask', this.customGaSendHitTask.bind(this));\n  }\n\n  customGaSendHitTask(model) {\n    loglevel__WEBPACK_IMPORTED_MODULE_1___default.a.info('running original send hit task', this.trackers['google_analytics'].ids.length);\n    this.trackers['google_analytics'].originalSendHitTask(model);\n\n    for (let i = 1; i < this.trackers['google_analytics'].ids.length; i++) {\n      loglevel__WEBPACK_IMPORTED_MODULE_1___default.a.info('duplicate sendHitTask duplicate tracking', this.trackers['google_analytics'].ids[i]);\n      const hitPayload = model.get('hitPayload');\n      const trackingId = new RegExp(model.get('trackingId'), 'gi');\n      loglevel__WEBPACK_IMPORTED_MODULE_1___default.a.info('duplicate sendHitTask duplicate tracking original prop', trackingId);\n      model.set('hitPayload', hitPayload.replace(trackingId, this.trackers['google_analytics'].ids[i]), true);\n      this.trackers['google_analytics'].originalSendHitTask(model);\n    }\n  }\n\n  get _ga() {\n    return window[window.GoogleAnalyticsObject];\n  }\n\n  get _gaDimensions() {\n    let dims = {};\n\n    for (let i = 1; i < this.dimensionsMap.google_analytics.length; i++) {\n      //default to `0` so reports don't omit rows on empty data\n      loglevel__WEBPACK_IMPORTED_MODULE_1___default.a.info(`dim`, this.dimensions, i);\n      dims[`dimension${i}`] = this.dimensions[this.dimensionsMap.google_analytics[i]] || `0`;\n      dims[`dimension${i}`] = dims[`dimension${i}`].toString();\n    }\n\n    loglevel__WEBPACK_IMPORTED_MODULE_1___default.a.info('dims', dims);\n    return dims;\n  }\n\n  updateDimensions(dimensions) {\n    for (let dim in dimensions) {\n      this.dimensions[dim] = `${dimensions[dim]}`;\n      /**\n      const dimidx = this.dimensionsMap.google_analytics.indexOf(dim)\n      if(dimidx > 0) {\n        this.dimensions[`dimension${dimidx}`] = dimensions[dim]\n      } else {\n        console.warn(`No dimension index found for ${dim}`, this.dimensionsMap.google_analytics)\n      }\n      */\n    }\n  }\n\n  updateMetrics(metrics) {\n    loglevel__WEBPACK_IMPORTED_MODULE_1___default.a.info(`updateMetrics`, metrics);\n\n    for (let met in metrics) {\n      const metricidx = this.metricMap.google_analytics[met];\n      this.dimensions[`metric${metricidx}`] = metrics[metricidx];\n    }\n  }\n\n  addTracker(trackers) {\n    loglevel__WEBPACK_IMPORTED_MODULE_1___default.a.info(`addTracker`, trackers);\n\n    for (let tracker in trackers) {\n      trackers[tracker] = Array.isArray(trackers[tracker]) ? trackers[tracker] : [trackers[tracker]];\n      loglevel__WEBPACK_IMPORTED_MODULE_1___default.a.info(`addTracker adding tracker`, trackers[tracker]);\n\n      if (this.trackers[tracker]) {\n        trackers[tracker].map(i => {\n          this.trackers.tracker.ids.push(i);\n        });\n      } else {\n        this.trackers[tracker] = {\n          ids: trackers[tracker]\n        };\n      }\n    }\n  }\n\n  updateVariables(vars) {\n    loglevel__WEBPACK_IMPORTED_MODULE_1___default.a.info(`addTracker`, vars);\n\n    for (let v in vars) {\n      const metricidx = this.variableMap.google_analytics[v];\n\n      if (metricidx) {\n        this.variables[metricidx] = vars[v];\n      }\n    }\n  }\n\n  trackEvent(obj) {\n    obj = { ...obj,\n      ...this._gaDimensions\n    };\n\n    for (let tracker in this.trackers) {\n      switch (tracker) {\n        case 'google_analytics':\n          loglevel__WEBPACK_IMPORTED_MODULE_1___default.a.info('tracker', this.trackers[tracker]);\n\n          if (this.trackers[tracker]._gaBeacon) {\n            obj.transport = 'beacon';\n            this.trackers[tracker]._gaBeacon = false;\n          }\n\n          this._ga(`send`, `event`, obj);\n\n          break;\n      }\n    }\n  }\n\n}\n\n//# sourceURL=webpack://$/./src/tracking/index.js?");

/***/ })

/******/ });
});