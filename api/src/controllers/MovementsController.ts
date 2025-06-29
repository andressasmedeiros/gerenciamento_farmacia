import { Request, Response } from "express";
import jwt from "jsonwebtoken"
import { AppDataSource } from "../data-source";
import { Movements, MovementStatus } from "../entities/Movements";
import { Products } from "../entities/Products";
import { Branches } from "../entities/Branches";
import { User } from "../entities/User";
import LoginController from "./LoginController";
import { Not } from "typeorm";

class MovementsController {
    create = async (req: Request, res: Response) => {
        try {
            let { destinationBranchId, productId, quantity, description } = req.body;

            const movementRepository = AppDataSource.getRepository(Movements);
            const productRepository = AppDataSource.getRepository(Products);
            const branchRepository = AppDataSource.getRepository(Branches);

            const branch = await branchRepository.findOne({ where: { id: destinationBranchId } });
            const product = await productRepository.findOne({ where: { id: productId }, relations: ["branch"] });

            if (!quantity || quantity <= 0) {
                res.status(400).json({ message: "Quantidade inválida." });
                return;
            }

            if (!branch) {
                res.status(400).json({ message: "Filial de destino não encontrada." });
                return;
            }

            if (!product) {
                res.status(400).json({ message: "Produto não encontrado." });
                return;
            }
            console.log(product)
            if (quantity > product.amount) {
                res.status(400).json({ message: "Estoque insuficiente para essa movimentação." });
                return;
            }

            if (destinationBranchId === product.branch.id) {
                res.status(400).json({ message: "A filial de origem não pode ser a mesma que a filial de destino." });
                return;
            }

            product.amount -= quantity;
            await productRepository.save(product);

            const movement = movementRepository.create({ quantity, product, destinationBranches: branch });
            await movementRepository.save(movement);

            res.status(201).json({ id: movement.id, quantity, product_id: product.id, destination_branch_id: branch.id });
            return;

        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    }

    getAll = async (req: Request, res: Response) => {
        try {
            const token = req.headers.authorization?.split(" ")[1] ?? "";
            if (!token) {
                res.status(401).json("Token inválido!");
                return
            }

            const payload = jwt.verify(token, process.env.JWT_SECRET ?? "") as any;
            const userId = payload.userId;

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({
                where: { id: userId },
                relations: ["drivers"]
            });

            const driver = user?.drivers?.[0];

            if (!driver) {
                res.status(401).json("Usuário não é um motorista.");
                return
            }

            const movementRepository = AppDataSource.getRepository(Movements);
            const movements = await movementRepository.find({
                where: [
                    { status: MovementStatus.PENDING },
                    { status: MovementStatus.IN_PROGRESS, driver: { id: driver.id } }
                ],
                order: {
                    createdAt: "DESC"
                },
                relations: ["product.branch.user", "destinationBranches.user", "driver.user"]
            });

            res.status(200).json(movements);
            return;
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    }

    startMovement = async (req: Request, res: Response) => {
        await this.updateMovement(req, res, MovementStatus.IN_PROGRESS, MovementStatus.PENDING);
    }

    endMovement = async (req: Request, res: Response) => {
        await this.updateMovement(req, res, MovementStatus.DELIVERED, MovementStatus.IN_PROGRESS);
    }



    updateMovement = async (
        req: Request,
        res: Response,
        status: MovementStatus,
        previousStatus: MovementStatus
    ) => {
        try {
            const { id } = req.params;

            const movementRepository = AppDataSource.getRepository(Movements);
            const movement = await movementRepository.findOne({
                where: { id: Number(id) },
                relations: ["driver", "product", "destinationBranches"]
            });

            if (!movement) {
                return res.status(404).json({ message: "Movimentação não encontrada." });
            }

            if (movement.status !== previousStatus) {
                return res.status(400).json({ message: "Movimentação não possui o status correto." });
            }

            const token = req.headers.authorization?.split(" ")[1] ?? "";
            if (!token) {
                return res.status(401).json("Token inválido!");
            }

            const payload = jwt.verify(token, process.env.JWT_SECRET ?? "") as any;
            const userId = payload.userId;

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({
                where: { id: userId },
                relations: ["drivers"]
            });

            const driver = user?.drivers;
            if (!driver || driver.length === 0) {
                return res.status(401).json("Usuário não é um motorista.");
            }

            if (status === MovementStatus.IN_PROGRESS) {
                movement.driver = driver[0];
            } else if (status === MovementStatus.DELIVERED) {
                if (movement.driver?.id !== driver[0].id) {
                    return res.status(400).json({ message: "A movimentação não pertence a esse motorista." });
                }
            }

            movement.status = status;
            await movementRepository.save(movement);

            const updatedMovement = await movementRepository.findOne({
                where: { id: movement.id },
                relations: ["driver", "product", "destinationBranches"]
            });


            return res.status(200).json(updatedMovement);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Erro interno no servidor." });
        }
    };

    getInboundMovements = async (req: Request, res: Response) => {
        const movementRepository = AppDataSource.getRepository(Movements);
        const loginController = new LoginController();
        const branchesRepository = AppDataSource.getRepository(Branches);
        const payload = loginController.getPayload(req, res);
        const branch = await branchesRepository.findOne({ where: { user: { id: payload.userId } } });
        if (!branch) {
            res.status(401).json("Movimentação não encontrada.");
            return;
        }
        const branchId = branch.id;

        const movements = await movementRepository.find({
            where: { destinationBranches: { id: branchId } },
            relations: ["product.branch.user", "destinationBranches"],
        });
        res.status(200).json(movements);
        return;
    }

    getOutboundMovements = async (req: Request, res: Response) => {
        const movementRepository = AppDataSource.getRepository(Movements);
        const loginController = new LoginController();
        const branchesRepository = AppDataSource.getRepository(Branches);
        const payload = loginController.getPayload(req, res);
        const branch = await branchesRepository.findOne({ where: { user: { id: payload.userId } } });
        if (!branch) {
            res.status(401).json("Movimentação não encontrada.");
            return;
        }
        const branchId = branch.id;

        const movements = await movementRepository.find({
            where: {
                product: { branch: { id: branchId } },
                destinationBranches: { id: Not(branchId) }
            },
            relations: ["product", "destinationBranches.user"],

        });
        res.status(200).json(movements);
        return;
    }

    getFinishedMovements = async (req: Request, res: Response) => {
        try {
            const movementRepository = AppDataSource.getRepository(Movements);
            const loginController = new LoginController();
            const branchesRepository = AppDataSource.getRepository(Branches);

            const payload = loginController.getPayload(req, res);

            const branch = await branchesRepository.findOne({ where: { user: { id: payload.userId } } });

            if (!branch) {
                res.status(401).json({ message: "Filial não encontrada." });
                return;
            }

            const branchId = branch.id;

            const movements = await movementRepository.find({
                where: {
                    destinationBranches: { id: branchId },
                    status: MovementStatus.DELIVERED
                },
                relations: ["product", "destinationBranches"],
            });

            res.status(200).json(movements);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    };

    finish = async (req: Request, res: Response) => {
        const { id } = req.params;

        const movementRepository = AppDataSource.getRepository(Movements);
        const loginController = new LoginController();
        const branchesRepository = AppDataSource.getRepository(Branches);

        const payload = loginController.getPayload(req, res);

        const branch = await branchesRepository.findOne({ where: { user: { id: payload.userId } } });

        if (!branch) {
            res.status(401).json({ message: "Filial não encontrada." });
            return;
        }

        const branchId = branch.id;
        const movement = await movementRepository.findOne({ where: { id: Number(id) }, relations: ["product", "destinationBranches"] });
        if (!movement) {
            res.status(400).json({ message: "Movimentação não encontrada." });
            return;
        }

        if (movement.status !== MovementStatus.DELIVERED) {
            res.status(400).json({ message: "Movimentação não possui o status correto." });
            return;
        }
        if (movement.destinationBranches.id !== branchId) {
            res.status(400).json({ message: "Movimentação não pertence a essa filial." });
            return;
        }

        const productRepository = AppDataSource.getRepository(Products);
        const product = await productRepository.findOne({ where: { id: movement.product.id } });
        if (!product) {
            res.status(400).json({ message: "Produto não encontrado." });
            return;
        }
        const newProduct = productRepository.create({
            name: product.name,
            amount: movement.quantity,
            description: product.description,
            url_cover: product.url_cover,
            branch: movement.destinationBranches
        });
        await productRepository.save(newProduct);

        movement.status = MovementStatus.FINISHED;
        await movementRepository.save(movement);
        res.status(200).json({ id: movement.id, status: movement.status });
        return;
    }
}

export default MovementsController;