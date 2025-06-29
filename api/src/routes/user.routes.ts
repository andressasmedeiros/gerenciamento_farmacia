import { Router } from "express";
import UserController from "../controllers/UserController";
import authenticate from "../middlewares/authenticate";
import { Permissions } from "../entities/Permission";
import authenticateById from "../middlewares/authenticateById";
import multer from "multer";

const userRouter = Router();
const upload = multer();
const userController = new UserController();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento de usuários
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - document
 *               - full_address
 *               - profile
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Maria Silva"
 *               email:
 *                 type: string
 *                 example: "maria@example.com"
 *               password:
 *                 type: string
 *                 example: "senhaSegura123"
 *               document:
 *                 type: string
 *                 example: "123.456.789-00"
 *               full_address:
 *                 type: string
 *                 example: "Rua das Flores, 123"
 *               profile:
 *                 type: string
 *                 enum: [ADMIN, DRIVER, BRANCH]
 *                 example: "DRIVER"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já cadastrado
 *       500:
 *         description: Erro interno do servidor
 */
userRouter.post("/", authenticate([Permissions.CRIAR_USUARIO]), userController.create)

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: profile
 *         schema:
 *           type: string
 *           enum: [ADMIN, DRIVER, BRANCH]
 *         description: Filtrar por perfil
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       400:
 *         description: Perfil inválido
 *       500:
 *         description: Erro interno do servidor
 */
userRouter.get("/", authenticate([Permissions.LISTAR_USUARIO]), userController.getAll)

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       204:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
userRouter.get("/:id", authenticateById(), userController.getById)

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza os dados de um usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               full_address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não permitido
 *       204:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
userRouter.put("/:id", authenticateById(), upload.single("avatar"), userController.putById)

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     summary: Atualiza o status de um usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "INATIVO"
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *       204:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
userRouter.patch("/:id/status", authenticate([Permissions.ATUALIZAR_USUARIO]), userController.patchById)

export default userRouter;
