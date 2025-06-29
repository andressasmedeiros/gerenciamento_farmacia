import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { Role } from "../entities/Role"
import { Permission } from "../entities/Permission"
import { AppDataSource } from "../data-source"

const authenticate = (listaPermissoes: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(" ")[1] ?? ""
            if (!token) {
                res.status(401).json("Token inválido!")
                return;
            }

            const payload = jwt.verify(token, process.env.JWT_SECRET ?? "") as any
            const roleRepository = AppDataSource.getRepository(Role);
            const role = await roleRepository.findOne({ where: { description: payload.profile }, relations: ["permissions"] });
            if (!role) {
                res.status(403).json("Perfil inválido!")
                return;
            }

            let hasPermission = false;

            if (role.description == "ADMIN") {
                hasPermission = true;
            }

            if (!hasPermission) {
                role.permissions.map((p: Permission) => {
                    if (listaPermissoes.includes(p.description)) {
                        hasPermission = true;
                    }
                })
            }

            if (!hasPermission) {
                res.status(401).json({ message: "Usuário não possui autorização para acessar este recurso!" })
                return
            }

            next()
        } catch (ex) {
            res.status(500).json("Token inválido!");
            return;
        }
    }
}

export default authenticate