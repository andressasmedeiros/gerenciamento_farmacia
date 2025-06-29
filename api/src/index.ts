require("dotenv").config();

import "reflect-metadata";
import { AppDataSource } from "./data-source";
import cors from "cors";
import userRouter from "./routes/user.routes";
import { handleError } from "./middlewares/handleError";
import loginRouter from "./routes/login.routes";
import logger from "./config/winston";
import productsRouter from "./routes/products.routes";
import movementsRouter from "./routes/movements.routes";
import branchesRouter from "./routes/branches.routes";
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';


const app = express();

app.use(cors());

app.use(express.json());

app.use("/users", userRouter);
app.use("/login", loginRouter);
app.use("/products", productsRouter);
app.use("/movements", movementsRouter);
app.use("/branches", branchesRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/env", (req, res) => {
  res.json({
    port: process.env.PORT,
    node_env: process.env.NODE_ENV,
  });
});

app.use(handleError);

AppDataSource.initialize()
  .then(() => {
    app.listen(process.env.PORT, () => {
      logger.info(
        `O servidor está rodando em http://localhost:${process.env.PORT}`
      );
    });
  })
  .catch((error) => console.log(error));
