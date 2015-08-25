'use strict';

/* Controllers */



angular.module('app.MyCtrl', ['pascalprecht.translate', 'ngCookies'])

  .controller('MyCtrlPassword', ['$scope','LoopBackAuth','Dusers',
    function ($scope,LoopBackAuth,Dusers) {
      var userstringdata = LoopBackAuth.currentUserData;
      if(typeof userstringdata === 'string'){
        try {
          $scope.Auser = JSON.parse(userstringdata);
          //console.log($scope.Auser);
        }
        catch (e) {
          alert("获取用户数据失败！");
        }
      }



      $scope.alerts = [];
      $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
      };

      $scope.change = function () {
        var uid = $scope.Auser.id;
        Dusers.change_password({id:uid,oldpassword:$scope.admin.oldpassword,newpassword:$scope.admin.newpassword},function (ert) {
          if(ert.states){
            $scope.alerts.push({
              type: 'success',
              msg: '修改成功！'
            });
          }else{
            $scope.alerts.push({
              type: 'danger',
              msg: ert.msg
            });
          }

        }, function () {
          $scope.alerts.push({
            type: 'danger',
            msg: '修改失败！请重新尝试！'
          });
        })
      }

    }])
