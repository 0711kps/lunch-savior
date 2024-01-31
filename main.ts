import { Application, Router } from 'https://deno.land/x/oak@v12.6.1/mod.ts'
//import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
//import data from "./data.json" assert { type: "json" };

const router = new Router();
router
  .post('/api/v1/random_restaurants', ctx => {
    console.log("TODO: handle slack's request")
    ctx.response.status = 200
  })

const app = new Application();
//app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());
//app.use(router.allowedMethods());

await app.listen({ port: 8000 });
