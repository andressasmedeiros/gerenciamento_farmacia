import { Router } from "express";
import authenticate from "../middlewares/authenticate";
import { Permissions } from "../entities/Permission";
import ProductsController from "../controllers/ProductsController";
import multer from "multer";

const productsRouter = Router();
const upload = multer();

const productsController = new ProductsController();
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Rotas para gerenciamento de produtos
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Products]
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
 *               - amount
 *               - description
 *               - urlCover
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Dipirona"
 *               amount:
 *                 type: integer
 *                 example: 100
 *               description:
 *                 type: string
 *                 example: "Medicamento para dor"
 *               urlCover:
 *                 type: string
 *                 example: "https://exemplo.com/imagem.jpg"
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 amount:
 *                   type: integer
 *                 description:
 *                   type: string
 *                 urlCover:
 *                   type: string
 *                 branch_id:
 *                   type: integer
 *       500:
 *         description: Erro interno do servidor
 */
productsRouter.post("/", authenticate([Permissions.CRIAR_PRODUTO]), productsController.create)

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retorna todos os produtos da filial ou todos (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     description: Retorna os produtos da filial associada ao usuário ou todos se for ADMIN
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   amount:
 *                     type: integer
 *                   description:
 *                     type: string
 *                   avatar:
 *                     type: bytea
 *                   branch:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *       500:
 *         description: Erro interno do servidor
 */
productsRouter.get("/", authenticate([Permissions.PERMISSAO_FILIAL]), productsController.getAll)

/**
 * @swagger
 * /products/{id}/avatar:
 *   put:
 *     summary: Atualiza o avatar de um produto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: byte
 *                 example: "data:image/jpeg;base64,...base64string..."
 *     responses:
 *       200:
 *         description: Avatar do produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 amount:
 *                   type: integer
 *                 description:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                   format: byte
 *                 branch_id:
 *                   type: integer
 *       400:
 *         description: Erro de requisição inválida
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
productsRouter.put("/:id", authenticate([Permissions.CRIAR_PRODUTO]), upload.single("avatar"), productsController.updateProduct);

export default productsRouter;
