module.exports = function (app) {
    var Role = app.models.Role;
    var duser = app.models.dusers;

    function matches(id1, id2) {
        if (id1 === undefined || id1 === null || id1 === '' ||
            id2 === undefined || id2 === null || id2 === '') {
            return false;
        }
        // The id can be a MongoDB ObjectID
        return id1 === id2 || id1.toString() === id2.toString();
    }



    function is(type, modelId, userId, callback) {
        if (!userId)
            return callback(null, false)
        duser.findById(userId, function (err, instance) {
            if (err || !instance) {
                if (callback) callback(err, false);
                return;
            }
            if (!(type instanceof Array)) {
                type = [type];
            }


            for (var i = 0; i < type.length; i++) {

                var temp = type[i];
                var flag = matches(modelId, userId);
                if (typeof temp === 'object' && temp.name) {
                    if (temp.isCheckRes && instance.resid) {
                        flag = matches(instance.resid, modelId);
                    }
                    if (temp.flag)
                        flag = temp.flag;

                    temp = temp.name;
                }

                //console.log("验证权限" + temp + "：" + instance.email);

                if (instance.type === temp && flag) {
                    if (callback) callback(null, true);
                    return;
                }
            }

            if (callback) callback(null, false);

        })
    }


    function reject() {
        process.nextTick(function () {
            if (callback) callback(null, false);
        });
    }


    Role.registerResolver('member', function (role, context, callback) {


        if (!context || !context.modelId)
            return reject();

        var modelId = context.modelId;
        var userId = context.getUserId();

        is('member', modelId, userId, callback);

    });


    Role.registerResolver('resmember', function (role, context, callback) {


        if (!context || !context.modelId)
            return reject();

        var modelId = context.modelId;
        var userId = context.getUserId();

        is([{name: 'resmember', isCheckRes: true}], modelId, userId, callback);

    });


    Role.registerResolver('resadmin', function (role, context, callback) {


        if (!context || !context.model || !context.modelId)
            return reject();

        var modelId = context.modelId;
        var userId = context.getUserId();

        is([{name: 'resadmin', isCheckRes: true}], modelId, userId, callback);

    });

    Role.registerResolver('resadminOrresmember', function (role, context, callback) {

        if (!context)
            return reject();

        var modelId = context.modelId;
        var userId = context.getUserId();

        is([{name: 'resadmin', isCheckRes: true}, {name: 'resmember', isCheckRes: true}], modelId, userId, callback);

    });

    Role.registerResolver('admin', function (role, context, callback) {

        if (!context)
            return reject();


        var userId = context.getUserId();
        is('admin', userId, userId, callback);

    });


    Role.registerResolver('adminOrresadmin', function (role, context, callback) {

        if (!context)
            return reject();


        var userId = context.getUserId();
        var modelId = context.modelId;

        is([{name: 'resadmin', isCheckRes: true}, {
            name: 'admin',
            isCheckRes: false,
            flag: true
        }], modelId, userId, callback);

        
    })

    Role.registerResolver('adminOrresadminWithNoBelong', function (role, context, callback) {

        if (!context)
            return reject();


        var userId = context.getUserId();
        var modelId = context.modelId;

        is([{
            name: 'resadmin',
            isCheckRes: false,
            flag: true
        }, {
            name: 'admin',
            isCheckRes: false,
            flag: true
        }], modelId, userId, callback);

    })
}