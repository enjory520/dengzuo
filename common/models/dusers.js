module.exports = function (DUsers) {


  var loopback = require('loopback');
  var crypto = require('crypto');

  [
    'create',
    'updateAttributes'

  ].forEach(function (temp) {
      console.log('添加前置 :' + temp);
      DUsers.beforeRemote(temp, function (context, model, next) {
        context.args.data.type = 'member';
        next();
      });

    })

  DUsers.beforeRemote('prototype.__create__comments',
    function (context, model, next) {

      var userAccessToken = context.req.accessToken;
      if (!userAccessToken)
        next(new Error("非法访问"));

      var queuingid = context.req.body.queuingid;

      console.log(queuingid);
      if (!queuingid)
        next(new Error("请输入您的排队ID！"));

      var queuing = loopback.getModel("queuing");

      next();

    }
  )

  DUsers.beforeRemote('find',
    function (context, model, next) {
      //context.args.filter = '{"where":{"type":"resadmin"},"include":"resturants"}';
      if (context.args.filter) {
        var filter = JSON.parse(context.args.filter);
        filter.include = 'resturants';
        context.args.filter = JSON.stringify(filter);
      }
      next();

    }
  )

  DUsers.create_queuings = function (id, resid, peopelnum, callback) {

    var resturant = loopback.getModel("resturant");

    resturant.findById(resid, function (err, instance) {
      var table = instance.tables;
      console.log(table.max);
      console.log(table.min);
    })
  }

  DUsers.change_password = function (id, oldpassword, newpassword, callback) {

    DUsers.findById(id, function (err, instance) {
      if (err)
        return callback(err);
      if(!(instance.type == 'resadmin' || instance.type == 'resmember')){
        //if (!(instance.hasPassword(oldpassword).result))
        //  return callback(null,false,'原始密码不正确！');
        instance.hasPassword(oldpassword, function (err, is) {
          console.log(is);
          if(err)
            return callback(err);
          if(is){
            instance.updateAttributes({password: newpassword}, function (err,ins) {
              if(err)
                return callback(err);
              callback(null,true,'修改成功！');
            })
          }else{
            callback(null,false,'原始密码不正确！');
          }

        })
        return;
      }
      instance.updateAttributes({password: newpassword}, function (err,ins) {
        if(err)
          return callback(err);
        callback(null,true,'修改成功！');
      })
    })
  }
  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function randString(size) {
    var result = '';
    var allChar = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    size = size || 1;
    while (size--) {
      result += allChar.charAt(rand(0, allChar.length - 1));
    }

    return result;
  }

  function sha1(str) {
    return crypto.createHash('sha1').update(str).digest('hex');
  }

  function randS() {
    return sha1(randString(20) + new Date());
  }

  DUsers.findPassword = function(uemail,cb){
    console.log(uemail);
    DUsers.findOne({where:{email:uemail}},function(err,model){
      if(err)
        return cb(err);
      
      if(!model || model.length == 0)
        return cb(null,false,'邮箱不存在！');
      var strkey = randS()
      model.resetPwVlidation = strkey;
      DUsers.upsert(model,function(err,model) {
        if(err)
          return cb(err);
        var mail = loopback.getModel('Email');
      //console.log(mail)
        mail.send({
          from:"等座 <postmaster@abcgame.top>",
          to: uemail, // list of receivers
          subject: "重置您的密码", // Subject line
          text: "点击下面的链接来重置您的密码！", // plaintext body
          html: "<p>点击下面的链接来重置您的密码！</p><a href='"+"http://192.168.1.9/#/access/reset/"+strkey+"'>点击重置</a>" // html body
        },function(err,msg){
          if(err)
            return cb(err);
          console.log(msg);
          cb(null,true,"成功！");
        })
          
      });
    })

  }

  DUsers.findPasswordRs = function(id,pw,cb){

    DUsers.findOne({where:{resetPwVlidation:id}},function(err,model) {
      if(!model || model.length == 0)
        return cb(null,false,'验证错误');
      model.password = pw;
      model.resetPwVlidation = null;
      DUsers.upsert(model,function(err) {
        if(err)
          return cb(err);
        cb(null,true,'重置密码成功！');
      });
    })

  }
  DUsers.remoteMethod("change_password", {
    accepts: [
      {arg: 'id', type: 'string', required: true},
      {arg: "oldpassword", type: "string", required: true},
      {arg: "newpassword", type: "string", required: true}
    ],
    description: "修改密码",
    http: {path: '/change_password'},
    returns: [{arg: 'states', type: 'Boolean'}, {arg: 'msg', type: 'string'}]
  })


  DUsers.remoteMethod("findPassword", {
    accepts: [
      {arg: 'email', type: 'string', required: true}
    ],
    description: "找回密码",
    http: {path: '/findPassword'},
    returns: [{arg: 'states', type: 'Boolean'}, {arg: 'message', type: 'string'}]
  })


  DUsers.remoteMethod("create_queuings", {
    accepts: [
      {arg: 'id', type: 'string', required: true},
      {arg: "resid", type: "string", required: true},
      {arg: "peoplenum", type: "number", required: true}
    ],
    description: "用户加入排队",
    http: {path: '/create_queuings'},
    returns: {arg: 'greeting', type: 'number'}
  })

  DUsers.remoteMethod("findPasswordRs", {
    accepts: [
      {arg: 'ids', type: 'string', required: true},
      {arg: 'pw', type: 'string', required: true}
    ],
    description: "找回重置密码",
    http: {path: '/findPasswordRs'},
    returns: [{arg: 'states', type: 'Boolean'}, {arg: 'message', type: 'string'}]
  })


};
