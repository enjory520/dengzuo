'use strict';





angular.module('app.ResAdminCtrl', ['pascalprecht.translate', 'ngCookies'])

  .controller('ResAdminListCtrl', ['$scope', 'Resturant', 'EzConfirm', '$state', 'Dusers',
    function ($scope, Resturant, EzConfirm, $state, Dusers) {

      $scope.alerts = [];

      $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
      };


      var init = function () {
        $scope.page = {
          pageCount: 0,
          currentPage: 1,
          prpage: 10
        };

        $scope.dataList = [];
        Dusers.count({where: {type: "resadmin"}}, function (result) {
          $scope.page.pageCount = result.count;
        })

        Dusers.find({filter: {where: {type: "resadmin"}, limit: $scope.page.prpage, skip: 0}}, function (res) {
          $scope.dataList = res;
        })

      }

      $scope.delete = function (rid, ufk) {
        EzConfirm.create({
          heading: '确认删除',
          text: '你确认要删除这个餐厅的餐厅经理吗？',
          cancelBtn: "取消",
          confirmBtn: "确认"
        }).then(function () {
          Resturant.dusers.destroyById({id: rid, fk: ufk}, function () {
            init();
          })
        }, function () {
        });
      };
      $scope.change = function () {
        Dusers.find({
          filter: {
            where: {type: "resadmin"},
            limit: $scope.page.prpage,
            skip: $scope.page.prpage * ($scope.page.currentPage - 1)
          }
        }, function (res) {
          $scope.dataList = res;
        })
      }

      $scope.search = function () {
        $scope.dataList = [];
        Resturant.find({
          filter: {
            where: {
              name: {like: $scope.searchKey}
            }
          }
        }, function (res) {
          for (var i = 0; i < res.length; i++) {
            Dusers.find({
              filter: {
                where: {
                  and: [
                    {type: "resadmin"},
                    {resid: res[i].id}
                  ]
                }
              }
            }, function (res) {
              for (var k = 0; k < res.length; k++) {
                $scope.dataList.push(res[k]);
              }
            })
          }
        })
        Dusers.find({
          filter: {
            where: {
              and: [
                {type: "resadmin"},
                {username: {like: $scope.searchKey}}
              ]
            }
          }
        }, function (users) {
          for (var k = 0; k < users.length; k++) {
            $scope.dataList.push(users[k]);
          }
        })
      }

      $scope.$watch('searchKey', function () {
        if ($scope.searchKey == '') {
          $scope.Paginationisdisabled = false;
          init();
        }
      })

      init();

      $scope.goEdit = function (rid, ufk) {
        $state.go('app.resadmin.edit', {resid: rid,uid:ufk});
      }


    }])

  .
  controller('ResAdminAddCtrl', ['$scope', 'LoopBackAuth', 'Resturant', '$state',
    function ($scope, LoopBackAuth, Resturant, $state) {

      $scope.alerts = [];
      $scope.steps={percent : 0};

      $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
      };

      $scope.searchKey = '';
      $scope.isnotcreate = true;
      $scope.search = function () {
        Resturant.find({
          filter: {
            where: {
              name: {like: $scope.searchKey}
            }
          }
        }, function (res) {
          $scope.dataList = res;
        })
      }

      $scope.change = function (self) {
        $scope.searchKey = self.searchKey;
        if ($scope.searchKey == '') {
          $scope.dataList = [];
        }
      }

      $scope.add = function (id) {
        $scope.id = id;
      }

      $scope.resadmin = {
        email: null,
        username: "",
        password: "",
        nikename: "",
        push: true,
        headpic: "/img/a0.jpg"
      }


      $scope.creatResAdmin = function () {
        $scope.resadmin.email = $scope.resadmin.username + baseEmail;
        $scope.resadmin.nikename = $scope.resadmin.username;

        console.log($scope.resadmin)
        Resturant.dusers.create({id: $scope.id}, $scope.resadmin, function () {
          $scope.alerts.push({
            type: 'success',
            msg: '添加餐厅经理成功！'
          });
          $scope.isnotcreate = false;
          $scope.steps.percent = 100
        }, function (err) {
          var errmsg = '添加餐厅经理失败!';
          if (err.data.error.details.codes.email == 'uniqueness' || err.data.error.details.codes.username == 'uniqueness')
            errmsg = '帐号已经存在！';
          $scope.alerts.push({
            type: 'danger',
            msg: errmsg
          });
        });
      }

      $scope.reload = function () {
        $state.go('app.resadmin.add', {}, {reload: true});
      }


    }])


  .controller('ResAdminEditCtrl', ['$scope', 'Dusers', '$state', '$stateParams',
    function ($scope, Dusers, $state, $stateParams) {
      $scope.alerts = [];

      $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
      };

      console.log($stateParams);

      $scope.change  = function () {

        Dusers.change_password({id:$stateParams.uid,oldpassword:'',newpassword:$scope.resadmin.password},function (ert) {
          if(ert.states){
            $state.go('app.resadmin.list');
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
