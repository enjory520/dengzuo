'use strict';

var baseEmail = '@qq.com';

/* Controllers */

angular.module('app.controllers', ['pascalprecht.translate', 'ngCookies'])
  .controller('AppCtrl', ['$scope', '$translate', '$localStorage', '$window', 'LoopBackAuth', '$state',
    function ($scope, $translate, $localStorage, $window, LoopBackAuth, $state) {
      // add 'ie' classes to html
      var isIE = !!navigator.userAgent.match(/MSIE/i);
      isIE && angular.element($window.document.body).addClass('ie');
      isSmartDevice($window) && angular.element($window.document.body).addClass('smart');

      // config
      $scope.app = {
        name: '餐厅等座系统',
        version: '1.0',
        // for chart colors
        color: {
          primary: '#7266ba',
          info: '#23b7e5',
          success: '#27c24c',
          warning: '#fad733',
          danger: '#f05050',
          light: '#e8eff0',
          dark: '#3a3f51',
          black: '#1c2b36'
        },
        settings: {
          themeID: 1,
          navbarHeaderColor: 'bg-black',
          navbarCollapseColor: 'bg-white-only',
          asideColor: 'bg-black',
          headerFixed: true,
          asideFixed: true,
          asideFolded: false
        }
      }

      // save settings to local storage
      if (angular.isDefined($localStorage.settings)) {
        $scope.app.settings = $localStorage.settings;
      } else {
        $localStorage.settings = $scope.app.settings;
      }
      $scope.$watch('app.settings', function () {
        $localStorage.settings = $scope.app.settings;
      }, true);

      // angular translate
      $scope.lang = {isopen: false};
      $scope.langs = {en: 'English', de_DE: 'German', it_IT: 'Italian'};
      $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "English";
      $scope.setLang = function (langKey, $event) {
        // set the current lang
        $scope.selectLang = $scope.langs[langKey];
        // You can change the language during runtime
        $translate.use(langKey);
        $scope.lang.isopen = !$scope.lang.isopen;
      };

      function isSmartDevice($window) {
        // Adapted from http://www.detectmobilebrowsers.com
        var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
        // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
        return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
      }

      //console.log(LoopBackAuth)
      var userstringdata = LoopBackAuth.currentUserData;
      //alert(userstringdata);
      if(typeof userstringdata === 'string'){
        try {
          $scope.Auser = JSON.parse(userstringdata);
        }
        catch (e) {
          console.log(e);
        }
      }

      $scope.logout = function () {
        LoopBackAuth.clearUser();
        LoopBackAuth.clearStorage();
        $state.go('access.signin');
      }

    }])

  // signin controller
  .controller('SigninFormController', ['$scope', 'Dusers', '$state', function ($scope, Dusers, $state) {

    if (Dusers.isAuthenticated()) {
      $state.go('app.res.list');
      return;
    }
    $scope.user = {};
    $scope.authError = null;
    $scope.login = function () {
      $scope.authError = null;
      Dusers.login($scope.credentials, function (res) {
        console.log(res);

        if (res.user.type == 'admin') {
          //console.log($scope.user);
          $scope.$emit('UserDataChange', res.user);
          $state.go('app.res.list')
        } else {
          $scope.authError = '您没有权限！';
        }
      }, function (err) {
        $scope.authError = '登录失败！请检查您的邮箱帐号密码！';
      })
    };
  }])

  .controller('FindPassCtrl', ['$scope', 'Dusers',function ($scope,dusers) {
    $scope.findpassword = function(){
      $scope.sending = '邮件发送中...';
      $scope.reset.$invalid = true;
      dusers.findPassword({email:$scope.email},function(rest) {
        if(rest.states == true){
          $scope.isCollapsed = false;
        }else{
          alert(rest.message);
        }
        $scope.sending = '发送';
        $scope.reset.$invalid = false;
      })
    }
  }])

  .controller('ResetPassCtrl', ['$scope','Dusers','$stateParams',function ($scope,dusers, $stateParams) {

    $scope.resetPW = function(){
      //console.log(dusers)
      dusers.findPasswordRs({ids:$stateParams.id,pw:$scope.pw},function(rest) {
        if(rest.states == true){
          $scope.isCollapsed = false;
        }else{
          alert(rest.message);
        }
      })
    }
    
  }])
