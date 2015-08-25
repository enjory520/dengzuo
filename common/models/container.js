module.exports = function(Container) {

  Container.beforeRemote('upload', function (context, model, next) {
    //console.log(context.req);
    next();
  })

};
