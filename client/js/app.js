'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('app', [
    'ngAnimate',
    'ngCookies',
    'ngStorage',
    'ui.router',
    'ui.bootstrap',
    'ui.load',
    'ui.jq',
    'ui.validate',
    'pascalprecht.translate',
    'app.filters',
    'app.directives',
    'app.controllers',
    'lbServices',
    'angularFileUpload',
    'ez.confirm',
    'app.ResAdminCtrl',
    'app.ResCtrl',
    'app.MyCtrl'
  ])
    .run(
    ['$rootScope', '$state', '$stateParams','$http',
      function ($rootScope, $state, $stateParams,$http) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        function cb() {
          if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(false);
          }
          if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
          }

          navigator.geolocation.getCurrentPosition(function (position) {
            //alert(JSON.stringify(position));
            var thisposition = {lat: position.coords.latitude, lng: position.coords.longitude};
            //var thisposition = {lat: 26.028301, lng: 119.385497};
            window.localStorage.setItem('position',JSON.stringify(thisposition));

            $http({
              method: 'GET',
              url: 'http://api.map.baidu.com/geocoder/v2/?ak=GvWq7sXfwsu4o736LZBQ1kYr&output=json&location=' + position.coords.latitude + "," + position.coords.longitude
            }).then(function (response) {
              //
              var address = {
                city:response.data.result.addressComponent.city,
                province:response.data.result.addressComponent.province,
                district:response.data.result.addressComponent.district,
                detail:response.data.result.addressComponent.street + response.data.result.addressComponent.street_number
              }
              //alert(JSON.stringify(address));
              window.localStorage.setItem('address',JSON.stringify(address));

            })
          });
        }

        document.addEventListener("deviceready", cb, false);
        // body...
      }]
  )
    .config(
    ['$stateProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', 'LoopBackResourceProvider',
      function ($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, LoopBackResourceProvider) {

        // lazy controller, directive and service
        app.controller = $controllerProvider.register;
        app.directive = $compileProvider.directive;
        app.filter = $filterProvider.register;
        app.factory = $provide.factory;
        app.service = $provide.service;
        app.constant = $provide.constant;
        app.value = $provide.value;


        // Use a custom auth header instead of the default 'Authorization'
        //LoopBackResourceProvider.setAuthHeader('X-Access-Token');

        // Change the URL where to access the LoopBack REST API server
        LoopBackResourceProvider.setUrlBase('http://192.168.1.9/api');


        $urlRouterProvider
          .otherwise('/access/signin');


        $stateProvider
          .state('app', {
            abstract: true,
            url: '/app',
            templateUrl: 'tpl/app.html'
          })
          .state('app.res', {
            url: '/res',
            template: '<div ui-view class="fade-in"></div>'
          })
          .state('app.res.list', {
            url: '/list',
            templateUrl: 'tpl/reslist.html'
          })

          .state('app.res.add', {
            url: '/add',
            templateUrl: 'tpl/resadd.html'
          })

          .state('app.res.edit', {
            url: '/edit:id',
            templateUrl: 'tpl/resedit.html'
          })

          .state('app.resadmin', {
            url: '/resadmin',
            template: '<div ui-view class="fade-in"></div>'
          })

          .state('app.resadmin.list', {
            url: '/list',
            templateUrl: 'tpl/resadminlist.html'
          })

          .state('app.resadmin.edit', {
            url: '/edit/:resid/:uid',
            templateUrl: 'tpl/resadminedit.html'
          })

          .state('app.resadmin.add', {
            url: '/add',
            templateUrl: 'tpl/resadminadd.html'
          })

          .state('app.my', {
            url: '/my',
            template: '<div ui-view class="fade-in"></div>'
          })

          .state('app.my.pw', {
            url: '/resetPassword',
            templateUrl: 'tpl/mypw.html'
          })

          .state('access', {
            url: '/access',
            template: '<div ui-view class="fade-in-right-big smooth"></div>'
          })
          .state('access.reset', {
            url: '/reset/:id',
            templateUrl: 'tpl/page_resetpwd.html'
          })
          .state('access.signin', {
            url: '/signin',
            templateUrl: 'tpl/page_signin.html'
          })
          .state('access.forgotpwd', {
            url: '/forgotpwd',
            templateUrl: 'tpl/page_forgotpwd.html'
          })

      }
    ]
  )

    .config(['$translateProvider', function ($translateProvider) {

      // Register a loader for the static files
      // So, the module will search missing translation tables under the specified urls.
      // Those urls are [prefix][langKey][suffix].
      $translateProvider.useStaticFilesLoader({
        prefix: 'l10n/',
        suffix: '.json'
      });

      // Tell the module what language to use by default
      $translateProvider.preferredLanguage('en');

      // Tell the module to store the language in the local storage
      $translateProvider.useLocalStorage();

    }])

  /**
   * jQuery plugin config use ui-jq directive , config the js and css files that required
   * key: function name of the jQuery plugin
   * value: array of the css js file located
   */
    .constant('JQ_CONFIG', {
      easyPieChart: ['js/jquery/charts/easypiechart/jquery.easy-pie-chart.js'],
      sparkline: ['js/jquery/charts/sparkline/jquery.sparkline.min.js'],
      plot: ['js/jquery/charts/flot/jquery.flot.min.js',
        'js/jquery/charts/flot/jquery.flot.resize.js',
        'js/jquery/charts/flot/jquery.flot.tooltip.min.js',
        'js/jquery/charts/flot/jquery.flot.spline.js',
        'js/jquery/charts/flot/jquery.flot.orderBars.js',
        'js/jquery/charts/flot/jquery.flot.pie.min.js'],
      slimScroll: ['js/jquery/slimscroll/jquery.slimscroll.min.js'],
      sortable: ['js/jquery/sortable/jquery.sortable.js'],
      nestable: ['js/jquery/nestable/jquery.nestable.js',
        'js/jquery/nestable/nestable.css'],
      filestyle: ['js/jquery/file/bootstrap-filestyle.min.js'],
      slider: ['js/jquery/slider/bootstrap-slider.js',
        'js/jquery/slider/slider.css'],
      chosen: ['js/jquery/chosen/chosen.jquery.min.js',
        'js/jquery/chosen/chosen.css'],
      TouchSpin: ['js/jquery/spinner/jquery.bootstrap-touchspin.min.js',
        'js/jquery/spinner/jquery.bootstrap-touchspin.css'],
      wysiwyg: ['js/jquery/wysiwyg/bootstrap-wysiwyg.js',
        'js/jquery/wysiwyg/jquery.hotkeys.js'],
      dataTable: ['js/jquery/datatables/jquery.dataTables.min.js',
        'js/jquery/datatables/dataTables.bootstrap.js',
        'js/jquery/datatables/dataTables.bootstrap.css'],
      vectorMap: ['js/jquery/jvectormap/jquery-jvectormap.min.js',
        'js/jquery/jvectormap/jquery-jvectormap-world-mill-en.js',
        'js/jquery/jvectormap/jquery-jvectormap-us-aea-en.js',
        'js/jquery/jvectormap/jquery-jvectormap.css'],
      footable: ['js/jquery/footable/footable.all.min.js',
        'js/jquery/footable/footable.core.css']
    }
  )


    .constant('MODULE_CONFIG', {
      select2: ['js/jquery/select2/select2.css',
        'js/jquery/select2/select2-bootstrap.css',
        'js/jquery/select2/select2.min.js',
        'js/modules/ui-select2.js']
    }
  )
  ;


app.factory('City', ['$http', function ($http) {
  return {
    get: function (ret) {
      $http.get('city.json').success(function (data) {
        ret(data);
      });
    }
  }
}]);

