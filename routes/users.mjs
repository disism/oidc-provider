import Router from 'koa-router';
import {validateUserParams} from "../helpers/validate.mjs";
import sha256 from "crypto-js/sha256.js";
import {UserDatabase} from "../controllers/UserController.mjs";
import {database} from "../conf/database.mjs";

export default () => {

  const router = new Router();

  router.get('/users', async (ctx, next) => {
    ctx.body = 'users';
  });

  router.get('/users/create', async (ctx, next) => {
    try {
      return ctx.render('signup', {
        title: 'Start creating your account with your current service provider now!'
      })
    } catch (err) {
      next(err);
    }
  });

  router.post('/users/create', async (ctx, next) => {
    try {
      const {username, password} = ctx.request.body;
      console.log(username, password)
      const validationError = validateUserParams(username, password)
      if (validationError) {
        return ctx.render('signup', {
          title: 'signup',
          error: validationError
        });
      }

      const hashedPassword = await sha256(password).toString();

      const userDatabase = new UserDatabase(database);

      const insertedUser = await userDatabase.insertUser({username, password: hashedPassword});

      if (insertedUser === 'USERNAME_ALREADY_EXISTS') {
        ctx.render('register', {
          error: `Username already exists: ${username}`
        });
      } else {
        console.log('User inserted successfully:', insertedUser);
        ctx.redirect("/login")
      }
    } catch (error) {
      console.error('Error inserting authx:', error);
      next(error);
    }
  })


  return router;
};
