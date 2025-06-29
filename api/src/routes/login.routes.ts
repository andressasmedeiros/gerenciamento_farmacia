import { Router } from "express";
import LoginController from "../controllers/LoginController";

const loginRouter = Router();

const loginController = new LoginController();
/**
 * @swagger
 * tags:
 *   name: Login
 *   description: Autenticação e menus baseados no perfil do usuário
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autentica usuário e retorna token JWT
 *     tags: [Login]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@example.com"
 *               password:
 *                 type: string
 *                 example: "senha123"
 *     responses:
 *       200:
 *         description: Token JWT gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Erro de validação nos dados enviados (email ou senha inválidos)
 *       401:
 *         description: Usuário e/ou senha incorreta
 *       500:
 *         description: Erro interno do servidor
 */

loginRouter.post("/", loginController.create)

/**
 * @swagger
 * /login/validate:
 *   get:
 *     summary: Valida token JWT enviado no header Authorization
 *     tags: [Login]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: Token inválido ou ausente
 */

loginRouter.get("/validate", loginController.validate)

/**
 * @swagger
 * /login/menu:
 *   get:
 *     summary: Retorna o menu personalizado baseado no perfil do usuário (ADMIN, BRANCH, DRIVER)
 *     tags: [Login]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Menu do usuário autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   label:
 *                     type: string
 *                     example: "Usuário"
 *                   icon:
 *                     type: string
 *                     example: "pi pi-user"
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         label:
 *                           type: string
 *                           example: "Cadastrar"
 *                         icon:
 *                           type: string
 *                           example: "pi pi-user-plus"
 *                         url:
 *                           type: string
 *                           example: "/user"
 *       401:
 *         description: Token inválido ou ausente
 */
loginRouter.get("/menu", loginController.menu)

export default loginRouter;
