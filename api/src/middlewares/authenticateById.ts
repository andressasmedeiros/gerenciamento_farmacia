import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../entities/Role";
import { AppDataSource } from "../data-source";

const authenticateById = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(" ")[1] ?? "";
            if (!token) {
                console.log("Token não encontrado!");
                res.status(401).json({ message: "Token inválido!" });
                return;
            }

            const payload = jwt.verify(token, process.env.JWT_SECRET ?? "") as any;
            const userIdFromToken = payload.userId;
            const userIdFromParams = +req.params.id;

            const hasPermission = payload.profile === "ADMIN";

            if (!hasPermission && userIdFromToken !== userIdFromParams) {
                res.status(401).json({ message: "Usuário não possui autorização para acessar este recurso!" });
                return;
            }

            next();
        } catch (ex) {
            console.error("Erro ao autenticar usuário:", ex);
            res.status(401).json({ message: "Token inválido!" });
            return;
        }
    };
};

export default authenticateById;
