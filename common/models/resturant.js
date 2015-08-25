module.exports = function (Resturant) {

  //var AccessToken = loopback.getModel("AccessToken");

  var loopback = require('loopback');

  function businesstimeV(err) {
    if (typeof this.businesstime.start.h !== 'number') return err();
    if (typeof this.businesstime.start.m !== 'number') return err();
    if (typeof this.businesstime.end.h !== 'number') return err();
    if (typeof this.businesstime.end.m !== 'number') return err();
    if (this.businesstime.start.h > this.businesstime.end.h) return err('开始营业时间必须小于结束营业时间！');
    if (this.businesstime.start.m >= this.businesstime.end.m && this.businesstime.start.h == this.businesstime.end.h) return err('开始营业时间必须小于结束营业时间！');
  }

  Resturant.validate('businesstime', businesstimeV, {message: '请输入正确的营业时间格式！'})


  var DUser = loopback.getModel("dusers");

  [
    'prototype.__create__dusers'

  ]
    .forEach(function (temp) {

      console.log('添加前置：' + temp);
      Resturant.beforeRemote(temp, function (ctx, modelInstance, next) {

        var userAccessToken = ctx.req.accessToken;

        //console.log(userAccessToken);
        if (!userAccessToken)
          return next(new Error("非法访问"));

        DUser.findById(userAccessToken.userId, function (err, ins) {
          if (err) return next(err);

          if (ins.type) {
            switch (ins.type) {
              case 'admin':
                ctx.args.data.type = "resadmin";
                break;
              case 'resadmin':
                ctx.args.data.type = "resmember";
                break;
              default:
                return next(new Error("非法访问"));
            }
            return next();
          } else {
            return next(new Error("非法访问"));
          }
        })

      })

    });

  [
    'prototype.__get__dusers',
    'prototype.__updateById__dusers',
    'prototype.__destroyById__dusers'

  ]
    .forEach(function (temp) {

      console.log('添加前置：' + temp);
      Resturant.beforeRemote(temp, function (ctx, modelInstance, next) {

        var userAccessToken = ctx.req.accessToken;

        //console.log(ctx.args.filter);
        if (!userAccessToken)
          return next(new Error("非法访问"));

        DUser.findById(userAccessToken.userId, function (err, ins) {
          if (err) return next(err);
          if (ins.type) {
            switch (ins.type) {
              case 'admin':
                if (temp === 'prototype.__get__dusers') {
                  ctx.args.filter = '{"where":{"type":"resadmin"}}';
                }
                else {
                  DUser.findById(ctx.args.fk, function (err, douser) {
                    if (err || !douser) {
                      var nexterr = new Error("非法访问");
                      nexterr.statusCode = 400;
                      return next(nexterr);
                    }

                    if (douser.type !== 'resadmin') {
                      var nexterr = new Error('您没有权限操作这个用户！');
                      nexterr.statusCode = 400;
                      return next(nexterr);

                    }
                    next();
                  })
                }
                break;
              case 'resadmin':
                if (temp === 'prototype.__get__dusers') {
                  ctx.args.filter = '{"where":{"type":"resmember"}}';
                } else {
                  DUser.findById(ctx.args.fk, function (err, douser) {
                    if (err || !douser) {
                      var nexterr = new Error("非法访问");
                      nexterr.statusCode = 400;
                      return next(nexterr);
                    }

                    if (douser.type !== 'resmember') {
                      var nexterr = new Error('您没有权限操作这个用户！');
                      nexterr.statusCode = 400;
                      return next(nexterr);

                    }
                    next();
                  })

                }
                break;
              default:
                return next(new Error("非法访问"));
            }
          } else {
            next(new Error("非法访问"));
          }
        })
      });

    });

  ['find', 'findById'].forEach(function (temp) {
    Resturant.beforeRemote(temp, function (ctx, modelInstance, next) {
      if (ctx.args.filter) {
        var filter = JSON.parse(ctx.args.filter);
        filter.include = ['tables'];
        ctx.args.filter = JSON.stringify(filter);

        if(filter.where && filter.where.position && filter.where.position.near && filter.where.position.near.lng){
          if(filter.where.position.near.lng < -180 || filter.where.position.near.lng >180)
            return next(new Error('经度范围必须微-180~180'));

        }
        if(filter.where && filter.where.position && filter.where.position.near && filter.where.position.near.lat) {
          if (filter.where.position.near.lat < -90 || filter.where.position.near.lat > 90)
            return next(new Error('纬度范围必须微-90~90'));
        }

      }

      next();

    })
  })

  Resturant.afterRemote('find',function (ctx,model,next) {

    var count = 0;

    
      //console.log(model);
      try{
        if (ctx.result) {
          var filter = JSON.parse(ctx.args.filter);
          var here = new loopback.GeoPoint(filter.where.position.near);

          ctx.result.forEach(function(temo,i){
            ctx.result[i].distance = here.distanceTo(ctx.result[i].position, {type: 'kilometers'});
            var id = ctx.result[i].id;
            queuing = loopback.getModel("queuing");
            queuing.count({resid:id,isEnter:true},function (err,num) {

              if(err) return next(err);
                
              ctx.result[i].hasenter = num;
              count++;
              if(count >= ctx.result.length*2) next();
            })

            queuing.find(
              {
                where : {
                  resid:id,
                  isEnter:false
                }
              },
              function(err,returnedinstances){
                if(err) return next(err);
                ctx.result[i].queuing = returnedinstances;
                count++;
                if(count >= ctx.result.length*2) next();
              })
          })
        }else{
          next();
        }
      }catch(e){
        next();
      }

  })

};
