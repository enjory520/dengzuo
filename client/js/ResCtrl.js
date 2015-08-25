'use strict';

/* Controllers */


angular.module('app.ResCtrl', ['pascalprecht.translate', 'ngCookies'])

  .controller('ResListCtrl', ['$scope', 'Resturant', 'EzConfirm', '$state',
    function ($scope, Resturant, EzConfirm, $state) {

      var init = function () {
        $scope.page = {
          pageCount: 0,
          currentPage: 1,
          prpage: 10
        };

        $scope.dataList = [];
        Resturant.count({}, function (result) {
          $scope.page.pageCount = result.count;
        })

        Resturant.find({filter: {limit: $scope.page.prpage, skip: 0}}, function (res) {
          $scope.dataList = res;
        })

      }

      $scope.delete = function (rid) {
        EzConfirm.create({heading: '确认删除', text: '你确认要删除这个餐厅吗？', cancelBtn: "取消", confirmBtn: "确认"}).then(function () {
          Resturant.destroyById({id: rid}, function () {
            init();
          })
        }, function () {
        });
      };
      $scope.change = function () {
        Resturant.find({
          filter: {
            limit: $scope.page.prpage,
            skip: $scope.page.prpage * ($scope.page.currentPage - 1)
          }
        }, function (res) {
          $scope.dataList = res;
        })
      }

      $scope.search = function () {
        Resturant.find({
          filter: {
            where: {
              name: {like: $scope.searchKey}
            }
          }
        }, function (res) {
          $scope.dataList = res;
          $scope.Paginationisdisabled = true;
        })
      }

      $scope.$watch('searchKey', function () {
        if ($scope.searchKey == '') {
          $scope.Paginationisdisabled = false;
          init();
        }
      })

      init();

      $scope.goEdit = function (rid) {
        $state.go('app.res.edit', {id: rid});
      }

    }])

  .controller('ResAddCtrl', ['$scope', 'FileUploader', 'LoopBackAuth', 'Resturant', 'City', '$state','BaseUrl',
    function ($scope, FileUploader, LoopBackAuth, Resturant, City, $state,BaseUrl) {

      $scope.steps = {percent: 20, step1: true, step2: false, step3: false, setp4: false, step4isdis: true};

      var uploader = new FileUploader({
        scope: $scope,                          // to automatically update the html. Default: $rootScope
        url: BaseUrl.url+'/api/containers/image/upload?access_token=' + LoopBackAuth.accessTokenId
      });

      // ADDING FILTERS
      uploader.filters.push({
        name: 'filter',
        fn: function (item, options) { // second user filter
          //console.log(item, options)
          var type = ["image/jpeg", "image/gif", "image/bmp", "image/png"];
          for (var i = 0; i < type.length; i++) {
            if (type[i] == item.type)
              return true;
          }
          return false;
        }
      });
      try{
        var myposition = JSON.parse( window.localStorage.getItem('position'));
        var myaddress = JSON.parse( window.localStorage.getItem('address'));
      }catch(e){
        console.log(e);
      }

      if(!myposition)
        myposition={lat: 26.028301, lng: 119.385497};
      if(!myaddress)
        myaddress = {
          city:'北京市',
          province:'北京市',
          district:'东城区',
          detail:'-'
        }

      $scope.resinfo = {
        address: myaddress,
        businesstime: {start: {h: 9, m: 30}, end: {h: 22, m: 0}},
        position: myposition
      };

      //alert(JSON.stringify($scope.resinfo));

      $scope.alerts = [];

      City.get(function (respons) {
        $scope.division = respons;
      });

      $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
      };

      $scope.canSelectFile = false;
      uploader.onSuccessItem = function (item, response, status, headers) {
        //console.info('Success', item,response, status, headers);
        //$scope.$broadcast('uploadCompleted', item);
        console.log(response.result.files.file[0].name);
        $scope.$apply(function () {
          $scope.resinfo.logo = BaseUrl.url+'/api/containers/image/download/' + response.result.files.file[0].name;
        })

      };

      uploader.onWhenAddingFileFailed = function (item, filter, options) {
        $scope.$apply(function () {
          $scope.error = '不支持这个格式的文件！';
          uploader.clearQueue();
        })
      };

      uploader.onAfterAddingFile = function (item) {

        $scope.$apply(function () {
          $scope.canSelectFile = true;
          $scope.error = '';
          uploader.uploadItem(0);
        })
      };

      uploader.onCompleteAll = function () {
        $scope.$apply(function () {
          $scope.canSelectFile = false;
          $scope.error = '';
        })
      };


      $scope.clear = function () {
        uploader.clearQueue();
      }

      $scope.changeT = function (self) {
        if (self.businesstimeS) {
          $scope.resinfo.businesstime.start.h = self.businesstimeS.getHours();
          $scope.resinfo.businesstime.start.m = self.businesstimeS.getMinutes();

        }
        if (self.businesstimeE) {
          $scope.resinfo.businesstime.end.h = self.businesstimeE.getHours();
          $scope.resinfo.businesstime.end.m = self.businesstimeE.getMinutes();
        }

      }

      $scope.uploader = uploader;

      $scope.createRes = function () {
        Resturant.create($scope.resinfo,
          function (res) {
            $scope.steps.step2 = true;
            $scope.resinfo = res;

            var s = new Date();
            s.setHours($scope.resinfo.businesstime.start.h);
            s.setMinutes($scope.resinfo.businesstime.start.m)
            $scope.businesstimeS = s;

            var e = new Date();
            e.setHours($scope.resinfo.businesstime.end.h);
            e.setMinutes($scope.resinfo.businesstime.end.m)
            $scope.businesstimeE = e;

            console.log($scope.resinfo);

          }, function (err) {
            $scope.alerts.push({
              type: 'danger',
              msg: '添加失败！请检查内容是否填写完整！'
            });
          })

      }


      $scope.changeinfo = function () {
        Resturant.prototype$updateAttributes({id: $scope.resinfo.id}, $scope.resinfo);
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
        Resturant.dusers.create({id: $scope.resinfo.id}, $scope.resadmin, function () {
          $scope.alerts.push({
            type: 'success',
            msg: '添加餐厅经理成功！'
          });
          $scope.steps.step4isdis = false;
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
        $state.go('app.res.add', {}, {reload: true});
      }

    }])

  .controller('ResEditCtrl', ['$scope', 'FileUploader', 'LoopBackAuth', 'Resturant', 'City', '$state', '$stateParams','BaseUrl',
    function ($scope, FileUploader, LoopBackAuth, Resturant, City, $state, $stateParams,BaseUrl) {

      if ($stateParams.id) {
        Resturant.findById({id: $stateParams.id}, function (res) {
          $scope.resinfo = res;

          var s = new Date();
          s.setHours($scope.resinfo.businesstime.start.h);
          s.setMinutes($scope.resinfo.businesstime.start.m)
          $scope.businesstimeS = s;

          var e = new Date();
          e.setHours($scope.resinfo.businesstime.end.h);
          e.setMinutes($scope.resinfo.businesstime.end.m)
          $scope.businesstimeE = e;


        })
      } else {
        $state.go('app.res.list');
      }

      var uploader = $scope.uploader = new FileUploader({
        scope: $scope,                          // to automatically update the html. Default: $rootScope
        url: BaseUrl.url+'/api/containers/image/upload?access_token=' + LoopBackAuth.accessTokenId
      });

      // ADDING FILTERS
      uploader.filters.push({
        name: 'filter',
        fn: function (item, options) { // second user filter
          //console.log(item, options)
          var type = ["image/jpeg", "image/gif", "image/bmp", "image/png"];
          for (var i = 0; i < type.length; i++) {
            if (type[i] == item.type)
              return true;
          }
          return false;
        }
      });
      $scope.resinfo = {
        address: {province: '北京市', city: '北京市', district: '东城区', detail: '-'},
        businesstime: {start: {h: 9, m: 30}, end: {h: 22, m: 0}},
        position: {lat: 26.028301, lng: 119.385497}
      };
      $scope.alerts = [];

      City.get(function (respons) {
        $scope.division = respons;
      });

      $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
      };

      $scope.canSelectFile = false;
      uploader.onSuccessItem = function (item, response, status, headers) {
        //console.info('Success', item,response, status, headers);
        //$scope.$broadcast('uploadCompleted', item);
        console.log(response.result.files.file[0].name);
        $scope.$apply(function () {
          $scope.resinfo.logo = BaseUrl.url+'/api/containers/image/download/' + response.result.files.file[0].name;
        })

      };

      uploader.onWhenAddingFileFailed = function (item, filter, options) {
        $scope.$apply(function () {
          $scope.error = '不支持这个格式的文件！';
          uploader.clearQueue();
        })
      };

      uploader.onAfterAddingFile = function (item) {
        $scope.$apply(function () {
          $scope.canSelectFile = true;
          $scope.error = '';
          uploader.uploadItem(0);
        })
      };

      uploader.onCompleteAll = function () {
        $scope.$apply(function () {
          $scope.canSelectFile = false;
          $scope.error = '';
        })
      };


      $scope.clear = function () {
        uploader.clearQueue();
      }

      $scope.changeT = function (self) {
        if (self.businesstimeS) {
          $scope.resinfo.businesstime.start.h = self.businesstimeS.getHours();
          $scope.resinfo.businesstime.start.m = self.businesstimeS.getMinutes();

        }
        if (self.businesstimeE) {
          $scope.resinfo.businesstime.end.h = self.businesstimeE.getHours();
          $scope.resinfo.businesstime.end.m = self.businesstimeE.getMinutes();
        }

      }

      $scope.change = function () {
        Resturant.prototype$updateAttributes({id: $scope.resinfo.id}, $scope.resinfo, function () {
          $state.go('app.res.list');
        });
      }


    }])
