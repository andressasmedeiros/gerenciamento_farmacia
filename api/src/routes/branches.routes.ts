import { Router } from "express";
import BranchesController from "../controllers/BranchesController";
import authenticate from "../middlewares/authenticate";
import { Permissions } from "../entities/Permission";

const branchesRouter = Router();

const branchesController = new BranchesController();
/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: Rotas para gerenciamento de filiais (branches)
 */
/**
 * @swagger
 * /branches:
 *   get:
 *     summary: Retorna todas as branches com o nome do usuário relacionado
 *     tags: [Branches]
 *     responses:
 *       200:
 *         description: Lista de branches com id e nome do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "João Silva"
 *       500:
 *         description: Erro interno do servidor
 */
branchesRouter.get("/", branchesController.getAll);

/**
 * @swagger
 * /branches/destination:
 *   get:
 *     summary: Retorna todas as branches exceto a branch do usuário autenticado
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []   # se usar JWT, por exemplo
 *     responses:
 *       200:
 *         description: Lista de branches (exceto a do usuário autenticado)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 2
 *                   name:
 *                     type: string
 *                     example: "Maria Souza"
 *       401:
 *         description: Usuário não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
branchesRouter.get("/destination", branchesController.getDestinatioBranches);

/*@swagger
 * /mapa:
 *   get:
 *     summary: Retorna as branches para exibição no mapa
 *     description: Retorna uma lista de filiais (branches) com informações incluindo latitude e longitude para exibir no mapa.
 *     tags:
 *       - Branches
 *     responses:
 *       200:
 *         description: Lista de branches com dados para o mapa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   street:
 *                     type: string
 *                     example: "Rua das Flores"
 *                   number:
 *                     type: string
 *                     example: "123"
 *                   neighborhood:
 *                     type: string
 *                     example: "Centro"
 *                   city:
 *                     type: string
 *                     example: "São Paulo"
 *                   state:
 *                     type: string
 *                     example: "SP"
 *                   complement:
 *                     type: string
 *                     example: "Apto 12"
 *                     nullable: true
 *                   zip_code:
 *                     type: string
 *                     example: "01001-000"
 *                   latitude:
 *                     type: number
 *                     format: double
 *                     example: -23.55052
 *                   longitude:
 *                     type: number
 *                     format: double
 *                     example: -46.633308
 *                   document:
 *                     type: string
 *                     example: "12345678901234"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro interno do servidor"
 * */
branchesRouter.get("/mapa", authenticate([Permissions.MOTORISTA]), branchesController.getBranchesForMap);

/**
 * @swagger
 * /branches/rota:
 *   get:
 *     summary: Obter dados das filiais para o mapa
 *     description: Retorna uma lista de filiais com localização e informações para exibição no mapa. Requer autenticação com permissão MOTORISTA.
 *     tags:
 *       - Branches
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de filiais para o mapa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Filial Exemplo"
 *                   latitude:
 *                     type: number
 *                     format: float
 *                     example: -23.55052
 *                   longitude:
 *                     type: number
 *                     format: float
 *                     example: -46.633308
 *                   address:
 *                     type: string
 *                     example: "Rua Exemplo, 123 - Centro, São Paulo - SP, CEP: 01000-000"
 *       401:
 *         description: Não autorizado - falta de permissão ou token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário não autorizado"
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro interno do servidor"
 */
branchesRouter.post("/rota", authenticate([Permissions.MOTORISTA]), branchesController.postRoute);

export default branchesRouter;
