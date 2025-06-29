import { Request, Response } from "express";
import { Profile, User } from "../entities/User";
import StringUtils from "../utils/StringUtils";
import { AppDataSource } from "../data-source";
import bcrypt from "bcrypt";
import { Drivers } from "../entities/Drivers";
import { Branches } from "../entities/Branches";
import { Role } from "../entities/Role";
import { getCoordinatesFromAddress } from "../utils/geocoding";

class UserController {
  private userRepository = AppDataSource.getRepository(User);
  private driversRepository = AppDataSource.getRepository(Drivers);
  private branchesRepository = AppDataSource.getRepository(Branches);
  private roleRepository = AppDataSource.getRepository(Role);

  create = async (req: Request, res: Response) => {
    try {
      const {
        name, profile, email, password, document, street, number,
        neighborhood, city, state, complement, zip_code, avatar
      } = req.body;

      const erros = [];
      if (!name || name.length < 3 || name.length > 240) erros.push("Nome inválido.");
      if (!this.isValidProfile(profile)) erros.push("Perfil inválido.");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) erros.push("Email inválido.");
      if (!password || password.length < 6 || password.length > 20) erros.push("Senha inválida.");
      if (!document) erros.push("Documento inválido.");
      else if (profile === Profile.DRIVER && !StringUtils.isValidCpf(document)) erros.push("CPF inválido.");
      else if (profile === Profile.BRANCH && !StringUtils.isValidCnpj(document)) erros.push("CNPJ inválido.");

      if (erros.length > 0) {
        res.status(400).json({ message: erros.join(" ") });
        return;
      }

      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({ message: "Email já cadastrado." });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      let avatarBuffer: Buffer | null = null;

      if (avatar && typeof avatar === 'string') {
        const base64Data = avatar.replace(/^data:image\/\w+;base64,/, '');
        avatarBuffer = Buffer.from(base64Data, 'base64');
      }

      const user = this.userRepository.create({
        name,
        email,
        passwordHash,
        profile,
        avatar: avatarBuffer || null,
      });

      if (req.file && req.file.buffer) {
        user.avatar = req.file.buffer;
      }

      await this.userRepository.save(user);

      if (profile === Profile.DRIVER) {
        const driver = this.driversRepository.create({
          document, street, number, neighborhood, city, state, complement, zip_code, user
        });
        await this.driversRepository.save(driver);
        const role = await this.roleRepository.findOne({ where: { description: "DRIVER" } });
        if (role) {
          user.roles = [role];
          await this.userRepository.save(user);
        }
      } else if (profile === Profile.BRANCH) {
        const fullAddress = `${street}, ${number}, ${neighborhood}, ${city}, ${state}, ${zip_code}`;
        const coords = await getCoordinatesFromAddress(fullAddress);
        const branch = this.branchesRepository.create({
          document, street, number, neighborhood, city, state, complement, zip_code,
          latitude: coords?.lat, longitude: coords?.lng, user
        });
        await this.branchesRepository.save(branch);
        const role = await this.roleRepository.findOne({ where: { description: "BRANCH" } });
        if (role) {
          user.roles = [role];
          await this.userRepository.save(user);
        }
      } else if (profile === Profile.ADMIN) {
        const role = await this.roleRepository.findOne({ where: { description: "ADMIN" } });
        if (role) {
          user.roles = [role];
          await this.userRepository.save(user);
        }
      }

      res.status(201).json({
        id: user.id,
        name: user.name,
        profile: user.profile,
        avatar: user.avatar ? user.avatar.toString('base64') : null
      });

    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  };


  isValidProfile = (profile: string) => {
    return Object.values(Profile).includes(profile as Profile);
  };

  getAll = async (req: Request, res: Response) => {
    try {
      const { profile } = req.query;

      if (profile && !Object.values(Profile).includes(profile as Profile)) {
        res.status(400).json({ message: "Perfil inválido." });
        return;
      }

      const users = await this.userRepository.find({
        where: profile ? { profile: profile as Profile } : {},
        select: ["id", "name", "status", "profile", "avatar"],
      });

      const usersWithBase64 = users.map(user => ({
        ...user,
        avatar: user.avatar ? user.avatar.toString('base64') : null
      }));

      res.status(200).json(usersWithBase64);
      return;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
      return;
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const user = await this.userRepository.findOne({
        where: { id: Number(req.params.id) },
        relations: ["drivers", "branches"],
      });

      if (!user) {
        res.status(204).json({});
        return;
      }

      let fullAddress = null;

      if (user.drivers && user.drivers.length > 0) {
        const d = user.drivers[0];
        fullAddress =
          `${d.street}, ${d.number} - ${d.neighborhood}, ${d.city} - ${d.state}, CEP: ${d.zip_code}` +
          (d.complement ? `, ${d.complement}` : "");
      } else if (user.branches) {
        const b = user.branches;
        fullAddress =
          `${b.street}, ${b.number} - ${b.neighborhood}, ${b.city} - ${b.state}, CEP: ${b.zip_code}` +
          (b.complement ? `, ${b.complement}` : "");
      }

      res.status(200).json({
        id: user.id,
        name: user.name,
        status: user.status,
        full_address: fullAddress,
        profile: user.profile,
        avatar: user.avatar ? user.avatar.toString('base64') : null
      });
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
      return;
    }
  };

  putById = async (req: Request, res: Response) => {
    try {
      const {
        name,
        email,
        password,
        id,
        created_at,
        updated_at,
        status,
        profile,
        street,
        number,
        neighborhood,
        city,
        state,
        complement,
        zip_code,
      } = req.body;

      if (id || created_at || updated_at || status || profile) {
        res.status(401).json({
          message: "Não é permitido alterar id, created_at, updated_at, status, profile",
        });
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: Number(req.params.id) },
        relations: ["drivers", "branches"],
      });

      if (!user) {
        res.status(204).json({});
        return;
      }

      if (user.profile === Profile.ADMIN && (street || number || neighborhood || city || state || complement || zip_code)) {
        res.status(400).json({ message: "Administradores não possuem endereço." });
        return;
      }

      user.name = name || user.name;
      user.email = email || user.email;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(password, salt);
      }

      if (req.file && req.file.buffer) {
        user.avatar = req.file.buffer;
      }

      if (user.drivers && user.drivers.length > 0) {
        const driver = user.drivers[0];
        driver.street = street || driver.street;
        driver.number = number || driver.number;
        driver.neighborhood = neighborhood || driver.neighborhood;
        driver.city = city || driver.city;
        driver.state = state || driver.state;
        driver.complement = complement || driver.complement;
        driver.zip_code = zip_code || driver.zip_code;
        await this.driversRepository.save(driver);
      } else if (user.branches) {
        const branch = user.branches;
        branch.street = street || branch.street;
        branch.number = number || branch.number;
        branch.neighborhood = neighborhood || branch.neighborhood;
        branch.city = city || branch.city;
        branch.state = state || branch.state;
        branch.complement = complement || branch.complement;
        branch.zip_code = zip_code || branch.zip_code;
        await this.branchesRepository.save(branch);
      }

      await this.userRepository.save(user);

      let fullAddress = null;
      if (user.drivers && user.drivers.length > 0) {
        const d = user.drivers[0];
        fullAddress =
          `${d.street}, ${d.number} - ${d.neighborhood}, ${d.city} - ${d.state}, CEP: ${d.zip_code}` +
          (d.complement ? `, ${d.complement}` : "");
      } else if (user.branches) {
        const b = user.branches;
        fullAddress =
          `${b.street}, ${b.number} - ${b.neighborhood}, ${b.city} - ${b.state}, CEP: ${b.zip_code}` +
          (b.complement ? `, ${b.complement}` : "");
      }

      res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        full_address: fullAddress,
        avatar: user.avatar ? user.avatar.toString('base64') : null
      });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
      return;
    }
  };

  patchById = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const user = await this.userRepository.findOne({
        where: { id: Number(req.params.id) },
      });

      if (!user) {
        res.status(204).json({});
        return;
      }

      user.status = status;
      await this.userRepository.save(user);

      res.status(200).json({ status: user.status, message: "Status atualizado com sucesso." });
    } catch (error) {
      console.error("Erro ao atualizar status do usuário:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
      return;
    }
  };
}

export default UserController;
