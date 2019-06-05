; (function () {
    'use strict';

    angular.module('example', [
        'ngCookies',
        'ngRoute',
        'ngSanitize',
        'pascalprecht.translate',
        'ui.bootstrap'
    ])
        .provider("configurator", configurator)
        .config(appConfig)
        .run(appRun)
        .constant("config", {
            server: {}
        });

    function configurator() {
        this.$get = ['$http', '$q', 'config',
            function ($http, $q, config) {
                var promise;
                var configurator = this;

                configurator.extendConfig = extend;
                configurator.getConfig = get;

                return configurator;

                function extend() {
                    promise = load()
                        .then(function (settings) {
                            angular.extend(config.server, settings.host);
                            angular.extend(config.server, settings.enrollmentPathes);
                            config.credentialOptions = settings.credentialOptions;
                            return config;
                        });

                    return promise;
                }

                function get() {
                    return promise;
                }

                function load() {
                    var options = {
                        url: "configuration",
                        method: "GET",
                        params: ""
                    };
                    return $http(options)
                        .then(function (response) {
                            return response.data;
                        }, function () {
                            return $q.reject();
                        });
                }
            }
        ];
    }

    appConfig.$inject = ['$httpProvider', '$provide', '$translateProvider'];
    function appConfig($httpProvider, $provide, $translateProvider) {

        //$locationProvider.html5Mode({
        //    enabled: true,
        //    requireBase: false
        //});
        // AG: causes automatic redirect to empty base path, even when <base> tag is specified
        // commented since prevents from running in IIS, TBD: find out how to use it correctly

        $provide.decorator('$log', ['$delegate', '$sanitize', '$window', function($delegate, $sanitize, $window) {
            var traceLevelTypes = {
                all: 0,
                debug: 1,
                log: 2,
                info: 3,
                warn: 4,
                error: 5
            };

            function getTraceLevel(traceLevel) {
                switch(traceLevel) {
                    case "all":
                        return traceLevelTypes.all;
                    case "debug":
                        return traceLevelTypes.debug;
                    case "log":
                        return traceLevelTypes.log;
                    case "info":
                        return traceLevelTypes.info;
                    case "warn":
                        return traceLevelTypes.warn;
                    default:
                        return traceLevelTypes.error;
                }
            }

            /* Using $window instead of $storage since $storage is implemented in the project and assumes that value is JSON*/
            var traceLevel = getTraceLevel($window.localStorage.getItem('cmTraceLevel'));

            return {
                // Error messages will always display regardless of trace level
                error: function() {
                    $delegate.error.apply(null, arguments);
                },
                warn: function() {
                    if (traceLevel <= traceLevelTypes.warn) {
                        $delegate.warn.apply(null, arguments);
                    }
                },
                info: function() {
                    if (traceLevel <= traceLevelTypes.info) {
                        $delegate.info.apply(null, arguments);
                    }
                },
                log: function() {
                    if (traceLevel <= traceLevelTypes.log) {
                        $delegate.log.apply(null, arguments);
                    }
                },
                debug: function() {
                    if (traceLevel <= traceLevelTypes.debug) {
                        $delegate.debug.apply(null, arguments);
                    }
                }
            };
        }]);

        configureHttp($httpProvider);
        configureTranslation($translateProvider);
    }

    function configureHttp($httpProvider) {
        if ($httpProvider.interceptors.indexOf('httpErrorInterceptor') < 0) {
            $httpProvider.interceptors.unshift('httpErrorInterceptor');
        }

        if ($httpProvider.interceptors.indexOf('apiErrorInterceptor') < 0) {
            $httpProvider.interceptors.push('apiErrorInterceptor');
        }
    }
    function configureTranslation(translator) {
        var languages = {
            available: [
                "en",
                "es",
            ],
            aliases: {
                "en-*": "en",
                "es-*": "es",
            },
            default: 'en'
        };

        translator
            .useLocalStorage()
            .registerAvailableLanguageKeys(languages.available, languages.aliases)
            .useStaticFilesLoader({
                prefix: 'langs/',
                suffix: '.json'
            })
            .determinePreferredLanguage(getBrowserLanguage);

        function getBrowserLanguage() {
            var userLang = navigator.language || navigator.userLanguage;

            if (languages.available.indexOf(userLang) < 0
                 && languages.available.indexOf(userLang.split('-')[0]) < 0) {
                userLang = languages.default;
            }
            return userLang;
        }
    }

    appRun.$inject = ['$log', '$rootScope', '$translate', '$window', 'configurator', 'notificationService', 'spinnerService'];
    function appRun($log, $rootScope, $translate, $window, configurator, notificationService, spinnerService) {

        configurator.extendConfig();

        $rootScope.$on('error', onError);
        $rootScope.signout = signout;
        $rootScope.platform = getUserPlatform;
        checkPlatform();
        applyStyle();
        useLang();

        function signout () {
            location.href = "./Account/Signout";
        }

        function onError(event, message, statusCode) {
            spinnerService.stop();
            notificationService.error(message);
        }

        function checkPlatform() {
            var isIE = /*@cc_on!@*/false || !!document.documentMode;
            var isEdge = !isIE && !!window.StyleMedia;
            if(isIE) {
                $rootScope.isIE = true;
            }
            else
                if(isEdge) {
                    $rootScope.isEdge = true;
                }

            if( navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i)
                || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)
                || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)
                || navigator.userAgent.match(/Opera Mini/i) || navigator.userAgent.match(/IEMobile/i)
                || navigator.userAgent.match(/Mobile/i) || navigator.userAgent.match(/iPod/i)
            ) {
                $rootScope.isMobile = true;
            }

            if( navigator.userAgent.match(/Mac/i) || navigator.userAgent.match(/iPod/i)
                || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)
            ) {
                $rootScope.isIOS = true;
            }

        }

        function getUserPlatform() {
            var browser_name = '';
            var isIE = /*@cc_on!@*/false || !!document.documentMode;
            var isEdge = !isIE && !!window.StyleMedia;
            if (navigator.userAgent.indexOf("Chrome") !== -1 && !isEdge) { browser_name = 'chrome'; }
            else if (navigator.userAgent.indexOf("Safari") !== -1 && !isEdge) { browser_name = 'safari'; }
            else if (navigator.userAgent.indexOf("Firefox") !== -1) { browser_name = 'firefox'; }
            else if ((navigator.userAgent.indexOf("MSIE") !== -1) || (!!document.documentMode === true)) { browser_name = 'ie'; }
            else if (isEdge) { browser_name = 'edge'; }
            else { browser_name = 'other'; }
            var _to_check = [];
            if (window.navigator.cpuClass) {
                _to_check.push((window.navigator.cpuClass + "").toLowerCase());
            }
            if (window.navigator.platform) {
                _to_check.push((window.navigator.platform + "").toLowerCase());
            }
            if (navigator.userAgent) {
                _to_check.push((navigator.userAgent + "").toLowerCase());
            }

            var _64bits_signatures = ["x86_64", "x86-64", "Win64", "x64;", "amd64", "AMD64", "WOW64", "x64_64", "ia64", "sparc64", "ppc64", "IRIX64"];
            var _bits = 32, _i, _c;
            outer_loop:
            for (_c = 0; _c < _to_check.length; _c++) {
                for (_i = 0; _i < _64bits_signatures.length; _i++) {
                    if (_to_check[_c].indexOf(_64bits_signatures[_i].toLowerCase()) !== -1) {
                        _bits = 64;
                        break outer_loop;
                    }
                }
            }

            if ((_bits === 32 || _bits === 64) && (browser_name === "chrome" || browser_name === "firefox" || browser_name === "ie" || browser_name === "edge")) {
                return _bits;
            } else {
                return 'other';
            }
        }

        function applyStyle() {
            var styles = {
                black: "black"
            };

            var style = getParameterByName("style");

            if (style && styles[style]) {
                document.body.classList.add(styles[style]);
            }
        }
        function useLang() {
            var lang = getParameterByName("lang");
            var availabelLanguagesKey = $translate.getAvailableLanguageKeys();

            var isExisted = availabelLanguagesKey.some(function (key) { return key === lang; });

            if (lang && isExisted) {
                $translate.use(lang);
            }
        }

        function getParameterByName(name, url) {
            if (!url) {
                url = window.location.href;
            }
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) {
                return null;
            }
            if (!results[2]) {
                return '';
            }
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }
    }
})();