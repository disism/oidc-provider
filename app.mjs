import Koa from 'koa';
import views from 'koa-views';
import json from 'koa-json';
import onerror from 'koa-onerror';
import bodyparser from 'koa-bodyparser';
import logger from 'koa-logger';
import serve from 'koa-static';
import mount from 'koa-mount';
import dotenv from 'dotenv';
dotenv.config();

import Provider from 'oidc-provider';
import configuration from './conf/configuration.mjs'


import { dirname } from 'desm';
const __dirname = dirname(import.meta.url);

import index from './routes/index.mjs';
import interaction from "./routes/interaction.mjs";
import users from "./routes/users.mjs";
import cors from "@koa/cors";
import intercept from "./helpers/intercept.mjs";

const app = new Koa();

onerror(app);

app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}));

app.use(json());
app.use(logger());
app.use(cors());

app.use(serve(__dirname + '/public'));

app.use(views(__dirname + '/views', {
  extension: 'pug'
}));

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

const ISSUER = process.env.ISSUER
let adapter;
if (process.env.REDIS_URL) {
  ({ default: adapter } = await import('./adapters/redis.mjs'));
}

const provider = new Provider(ISSUER, {adapter, ...configuration});

const middleware = intercept(provider);
app.use(middleware);

app.use(interaction(provider).routes());
app.use(index(provider).routes());
app.use(users(provider).routes())
app.use(mount('/', provider.app));

app.on('error', (err, ctx) => {
  console.error('api-server errors', err, ctx);
});

export default app