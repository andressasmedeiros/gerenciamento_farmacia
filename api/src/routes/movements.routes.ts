import { Router } from "express";
import MovementsController from "../controllers/MovementsController";
import authenticate from "../middlewares/authenticate";
import { Permissions } from "../entities/Permission";

const movementsRouter = Router();
const movementsController = new MovementsController();

/**
 * @swagger
 * tags:
 *   name: Movements
 *   description: Gerenciamento de movimentações de produtos entre filiais
 */

/**
 * @swagger
 * /movements:
 *   post:
 *     summary: Cria uma nova movimentação de produto
 *     tags: [Movements]
 *     security:
 *       - bearerAuth: []
 *     description: Permissão necessária: PERMISSAO_FILIAL
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - destinationBranchId
 *               - productId
 *               - quantity
 *               - description
 *             properties:
 *               destinationBranchId:
 *                 type: integer
 *                 example: 2
 *               productId:
 *                 type: integer
 *                 example: 5
 *               quantity:
 *                 type: integer
 *                 example: 10
 *               description:
 *                 type: string
 *                 example: "Movimentação de teste"
 *     responses:
 *       201:
 *         description: Movimentação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 15
 *                 quantity:
 *                   type: integer
 *                   example: 10
 *                 product_id:
 *                   type: integer
 *                   example: 5
 *                 destination_branch_id:
 *                   type: integer
 *                   example: 2
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
 */
movementsRouter.post("/", authenticate([Permissions.PERMISSAO_FILIAL]), movementsController.create);

/**
 * @swagger
 * /movements:
 *   get:
 *     summary: Retorna todas as movimentações
 *     tags: [Movements]
 *     security:
 *       - bearerAuth: []
 *     description: Permissão necessária: FILIAL_MOTORISTA
 *     responses:
 *       200:
 *         description: Lista de movimentações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   quantity:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   product:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                   destinationBranches:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *       500:
 *         description: Erro interno do servidor
 */
movementsRouter.get("/", authenticate([Permissions.FILIAL_MOTORISTA]), movementsController.getAll);

/**
 * @swagger
 * /movements/{id}/start:
 *   patch:
 *     summary: Inicia uma movimentação (status PENDING -> IN_PROGRESS)
 *     tags: [Movements]
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
 *         description: Movimentação atualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 status:
 *                   type: string
 *                   example: "IN_PROGRESS"
 *       400:
 *         description: Status incorreto
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Movimentação não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
movementsRouter.patch("/:id/start", authenticate([Permissions.MOTORISTA, Permissions.PERMISSAO_FILIAL]), movementsController.startMovement);

/**
 * @swagger
 * /movements/{id}/end:
 *   patch:
 *     summary: Finaliza uma movimentação (status IN_PROGRESS -> DELIVERED)
 *     tags: [Movements]
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
 *         description: Movimentação atualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 status:
 *                   type: string
 *                   example: "DELIVERED"
 *       400:
 *         description: Status incorreto
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Movimentação não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
movementsRouter.patch("/:id/end", authenticate([Permissions.MOTORISTA]), movementsController.endMovement);

/**
 * @swagger
 * /movements/inbound:
 *   get:
 *     summary: Lista movimentações inbound
 *     tags: [Movements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de movimentações inbound
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   product:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                   destinationBranches:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *       401:
 *         description: Usuário não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
movementsRouter.get("/inbound", authenticate([Permissions.PERMISSAO_FILIAL]), movementsController.getInboundMovements);

/**
 * @swagger
 * /movements/outbound:
 *   get:
 *     summary: Lista movimentações outbound
 *     tags: [Movements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de movimentações outbound
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   product:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                   destinationBranches:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *       401:
 *         description: Usuário não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
movementsRouter.get("/outbound", authenticate([Permissions.PERMISSAO_FILIAL]), movementsController.getOutboundMovements);

/**
 * @swagger
 * /movements/finished:
 *   get:
 *     summary: Lista movimentações finalizadas
 *     tags: [Movements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de movimentações finalizadas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   product:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *       401:
 *         description: Usuário não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
movementsRouter.get("/finished", authenticate([Permissions.PERMISSAO_FILIAL]), movementsController.getFinishedMovements);

/**
 * @swagger
 * /movements/{id}/finish:
 *   post:
 *     summary: Finaliza movimentação e cria novo produto na filial
 *     tags: [Movements]
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
 *         description: Movimentação finalizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 status:
 *                   type: string
 *                   example: "FINISHED"
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Usuário não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
movementsRouter.post("/:id/finish", authenticate([Permissions.PERMISSAO_FILIAL, Permissions.MOTORISTA]), movementsController.finish);

export default movementsRouter;
