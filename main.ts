import { Application } from 'https://deno.land/x/oak@v12.6.1/mod.ts'
import { interactiveRouter, randomRestaurantRouter } from './routes/index.ts'

const app = new Application();

app.use(randomRestaurantRouter.routes());
app.use(interactiveRouter.routes())

await app.listen({ port: 8000 });
