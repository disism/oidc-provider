import Router from 'koa-router';

export default () => {
  const router = new Router();

  router.get('/', async (ctx, next) => {
    try {
      return ctx.render('index', {
        title: 'OpenID Connect Provider'
      })
    } catch (err) {
      next(err);
    }
  });


  return router;
};
