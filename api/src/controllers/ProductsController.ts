import { Products } from "../entities/Products";
import { Request, Response } from "express";
import jwt from "jsonwebtoken"
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Branches } from "../entities/Branches";
import { Role } from "../entities/Role";

class ProductsController {
    create = async (req: Request, res: Response) => {
        try {
            let { name, amount, description, urlCover } = req.body;

            const branch = await this.getBranch(req, res);
            const productsRepository = AppDataSource.getRepository(Products);
            const product = productsRepository.create({ name, amount, description, url_cover: urlCover, branch });
            await productsRepository.save(product);

            res.status(201).json({ id: product.id, name, amount, description, urlCover, branch_id: branch?.id });
            return;
        } catch (error) {
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    }

    private getBranch = async (req: Request, res: Response) => {
        const token = req.headers.authorization?.split(" ")[1] ?? ""
        if (!token) {
            res.status(401).json("Token inválido!")
            return;
        }
        const payload = jwt.verify(token, process.env.JWT_SECRET ?? "") as any
        const userId = payload.userId;
        const branchRepository = AppDataSource.getRepository(Branches);
        const branch = await branchRepository.findOne({ where: { user: { id: userId } } });
        if (!branch) {
            res.status(401).json("Usuário não possui filial cadastrada.")
            return;
        }
        return branch;
    }

    isGetAll = async (req: Request, res: Response) => {
        const token = req.headers.authorization?.split(" ")[1] ?? ""
        if (!token) {
            return false;
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET ?? "") as any
        const roleRepository = AppDataSource.getRepository(Role);
        const role = await roleRepository.findOne({ where: { description: payload.profile } });
        if (!role) {
            return false;
        }
        return role.description == "ADMIN"
    };

    getAll = async (req: Request, res: Response) => {
        try {
            const productsRepository = AppDataSource.getRepository(Products);
            const isGetAll: boolean = await this.isGetAll(req, res);

            if (isGetAll) {
                const products = await productsRepository.find({ relations: ["branch"] });
                res.status(200).json(products);
                return;
            }
            const branch = await this.getBranch(req, res);
            const branchId = branch?.id;
            console.log(branchId)
            const products = await productsRepository.find({
                where: { branch: { id: branchId } },
            });

            res.status(200).json(products);
            return;
        } catch (error) {
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    }
}


export default ProductsController;