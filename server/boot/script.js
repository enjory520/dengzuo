module.exports = function (app) {
    var duser = app.models.dusers;
    duser.count({email: "admin@admin.com"}
        , function (err, count) {
            if (err)
                return console.log("正在搜寻是否存在超级管理员！\n.....\n搜寻失败！");
            if (count == 0) {
                duser.create({
                    email: "admin@admin.com",
                    password: "admin123",
                    type: "admin",
                    nikename:"admin",
                    headpic:"http://img1.imgtn.bdimg.com/it/u=4157624878,1158191755&fm=21&gp=0.jpg"
                }, function (err, object) {
                    if (err)
                        console.log("创建超级管理员失败！");
                    else
                        console.log("创建超级管理员成功！");
                })
            }
        })
}