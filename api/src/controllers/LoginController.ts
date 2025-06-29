import { User } from "../entities/User";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { AppDataSource } from "../data-source";
import PayloadJwt from "../classes/PayloadJwt";

class LoginController {

  private userRepository = AppDataSource.getRepository(User);

  create = async (req: Request, res: Response) => {
    try {
      let { email, password } = req.body;

      const erros = [];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        erros.push("Email inválido.");
      }
      if (!password || password.length < 6 || password.length > 20) {
        erros.push("A senha não pode estar vazia e deve conter entre 6 e 20 caracteres.");
      }
      if (erros.length > 0) {
        res.status(400).json({ message: erros.join(" ") });
        return;
      }

      const user = await this.userRepository.findOne({
        where: { email },
        relations: ["roles", "roles.permissions"],
        select: {
          id: true,
          email: true,
          passwordHash: true,
          profile: true,
          name: true,
          avatar: true,
          roles: {
            id: true,
            description: true,
            permissions: {
              id: true,
              description: true,
            },
          },
        },
      });

      if (!user) {
        res.status(401).json("Usuário e/ou senha incorreta.");
        return;
      }

      const valido = await bcrypt.compare(password, user.passwordHash);
      if (valido) {
        const chaveSecretaJwt = process.env.JWT_SECRET ?? "";

        const payload = {
          email: user.email,
          userId: user.id,
          profile: user.profile,
          roles: user.roles.map((role) => role.description),
        } as PayloadJwt;

        const token = await jwt.sign(payload, chaveSecretaJwt, { expiresIn: "1h" });

        res.status(200).json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            profile: user.profile,
            avatar: user.avatar ? user.avatar.toString("base64") : null,
          },
        });
      } else {
        res.status(401).json("Usuário e/ou senha incorreta.");
        return;
      }
    } catch (error) {
      console.error("Erro ao autenticar usuário:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
      return;
    }
  };

  validate = async (req: Request, res: Response) => {
    let payload = this.getPayload(req, res);
    if (!payload) {
      return;
    }

    res.status(200).json();
    return;
  }

  getPayload = (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1] ?? ""
      if (!token) {
        res.status(401).json("Token inválido!")
        return;
      }

      return jwt.verify(token, process.env.JWT_SECRET ?? "") as any
    } catch (error) {
      res.status(401).json("Token inválido!")
      return;
    }
  }

  menu = async (req: Request, res: Response) => {
    let payload = this.getPayload(req, res);
    if (!payload) {
      return;
    }

    const profile = payload.profile;

    let items: { label: string; icon: string; items: { label: string; icon: string; url: string }[]; }[] = []
    if ("ADMIN" === profile) {
      items = [
        {
          label: 'Usuário',
          icon: 'pi pi-user',
          items: [
            {
              label: 'Cadastrar',
              icon: 'pi pi-user-plus',
              url: '/user'
            },
            {
              label: 'Gerenciar',
              icon: 'pi pi-users',
              url: '/users'
            },
          ]
        },
        {
          label: 'Produtos',
          icon: 'pi pi-box',
          items: [
            {
              label: 'Estoque',
              icon: 'pi pi-warehouse',
              url: '/products'
            },
            {
              label: 'Cadastrar',
              icon: 'pi pi-cart-plus',
              url: '/product'
            }
          ]
        }
      ]
    } else if ("BRANCH" === profile) {
      items = [
        {
          label: 'Movimentação',
          icon: 'pi pi-arrow-right-arrow-left',
          items: [
            {
              label: 'Cadastrar',
              icon: 'pi pi-plus',
              url: '/movement'
            },
            {
              label: 'Listar',
              icon: 'pi pi-truck',
              url: '/movements'
            },
          ]
        },
        {
          label: 'Produtos',
          icon: 'pi pi-box',
          items: [
            {
              label: 'Estoque',
              icon: 'pi pi-warehouse',
              url: '/products'
            },
            {
              label: 'Entrada',
              icon: 'pi pi-cart-arrow-down',
              url: '/products/received'
            }
          ]
        }
      ]
    } else if ("DRIVER" === profile) {
      items = [
        {
          label: 'Movimentação',
          icon: 'pi pi-arrow-right-arrow-left',
          items: [
            {
              label: 'Entregas',
              icon: 'pi pi-truck',
              url: '/movements'
            },
          ]
        },
      ]
    }
    res.status(200).json(items);
    return;
  }
}


export default LoginController;