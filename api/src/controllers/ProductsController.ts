import { Products } from "../entities/Products";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { Branches } from "../entities/Branches";
import { Role } from "../entities/Role";

class ProductsController {
    create = async (req: Request, res: Response) => {
        try {
            let { name, amount, description, avatar, branch } = req.body;

            if (avatar && typeof avatar === 'string') {
                const base64Data = avatar.replace(/^data:image\/\w+;base64,/, '');
                avatar = Buffer.from(base64Data, 'base64')
            }

            if (!branch) {
                res.status(400).json({ message: "Filial não encontrada." });
                return
            }

            const branchRepository = AppDataSource.getRepository(Branches);
            const branchEntity = await branchRepository.findOne({ where: { id: branch } });

            if (!branchEntity) {
                res.status(404).json({ message: "Filial não existe." });
                return
            }

            const productsRepository = AppDataSource.getRepository(Products);
            const product = productsRepository.create({ name, amount, description, avatar, branch: branchEntity });

            await productsRepository.save(product);

            res.status(201).json({
                id: product.id,
                name,
                amount,
                description,
                avatar: avatar ? avatar.toString('base64') : null,
                branch_id: branchEntity.id
            });
        } catch (error) {
            console.error("Erro ao criar produto:", error);
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    };


    private getBranch = async (req: Request, res: Response) => {
        const token = req.headers.authorization?.split(" ")[1] ?? "";
        if (!token) {
            res.status(401).json("Token inválido!");
            return;
        }
        const payload = jwt.verify(token, process.env.JWT_SECRET ?? "") as any;
        const userId = payload.userId;
        const branchRepository = AppDataSource.getRepository(Branches);
        const branch = await branchRepository.findOne({ where: { user: { id: userId } } });
        if (!branch) {
            res.status(401).json("Usuário não possui filial cadastrada.");
            return;
        }
        return branch;
    }

    isGetAll = async (req: Request, res: Response) => {
        const token = req.headers.authorization?.split(" ")[1] ?? "";
        if (!token) {
            return false;
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET ?? "") as any;
        const roleRepository = AppDataSource.getRepository(Role);
        const role = await roleRepository.findOne({
            where: { description: payload.profile },
        });
        if (!role) {
            return false;
        }
        return role.description === "ADMIN";
    };

    getAll = async (req: Request, res: Response) => {
        try {
            const productsRepository = AppDataSource.getRepository(Products);
            const isGetAll: boolean = await this.isGetAll(req, res);

            if (isGetAll) {
                const products = await productsRepository.find({
                    relations: ["branch"], order: {
                        createdAt: "DESC"
                    }
                });
                const productsWithBase64 = products.map(product => ({
                    ...product,
                    avatar: product.avatar ? product.avatar.toString('base64') : null
                }));

                res.status(200).json(productsWithBase64);
                return;
            }
            const branch = await this.getBranch(req, res);
            const branchId = branch?.id;
            console.log(branchId);
            const products = await productsRepository.find({
                where: { branch: { id: branchId } }, order: {
                    createdAt: "DESC"
                },
            });

            const productsWithBase64 = products.map(product => ({
                ...product,
                avatar: product.avatar ? product.avatar.toString('base64') : null
            }));

            res.status(200).json(productsWithBase64);
            return;
        } catch (error) {
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    }

    updateProduct = async (req: Request, res: Response) => {
        try {
            const productId = parseInt(req.params.id, 10);
            const { avatar, name } = req.body;

            const productsRepository = AppDataSource.getRepository(Products);
            const product = await productsRepository.findOne({
                where: { id: productId },
            });

            if (!product) {
                res.status(404).json({ message: "Produto não encontrado." });
                return;
            }

            if (name && typeof name === 'string') {
                product.name = name;
            }

            if (avatar && typeof avatar === 'string') {
                const base64Data = avatar.replace(/^data:image\/\w+;base64,/, '');
                product.avatar = Buffer.from(base64Data, 'base64');
            }

            await productsRepository.save(product);

            const productWithBase64 = {
                ...product,
                avatar: product.avatar ? product.avatar.toString('base64') : null, // Converte para base64 se existir
            };

            res.status(200).json({
                message: "Produto atualizado com sucesso.",
                product: productWithBase64,
            });
        } catch (error) {
            console.error("Erro ao atualizar o produto:", error);
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    };
}

export default ProductsController;
