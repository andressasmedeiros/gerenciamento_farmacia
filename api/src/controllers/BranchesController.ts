import { AppDataSource } from "../data-source";
import { Branches } from "../entities/Branches";
import { Request, Response } from "express";
import LoginController from "./LoginController";
import { Movements } from "../entities/Movements";

class BranchesController {
  private branchesRepository = AppDataSource.getRepository(Branches);
  private loginController = new LoginController();

  getAll = async (req: Request, res: Response) => {
    try {
      const movementRepository = AppDataSource.getRepository(Movements);
      const movements = await movementRepository.find({
        relations: [
          "driver",
          "product",
          "product.branch.user",
          "destinationBranches.user",
        ],
      });

      res.status(200).json(movements);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro interno no servidor." });
    }
  };

  getDestinatioBranches = async (req: Request, res: Response) => {
    return this.getBranches(req, res, true);
  };

  getBranches = async (
    req: Request,
    res: Response,
    filterBranches: boolean
  ) => {
    try {
      const branches = await this.branchesRepository.find({
        relations: ["user"],
      });

      let branchesMap = branches.map((b) => ({
        id: b.id,
        userName: b.user.name,
        street: b.street,
        number: b.number,
        neighborhood: b.neighborhood,
        city: b.city,
        state: b.state,
        complement: b.complement,
        zip_code: b.zip_code,
        document: b.document,
        avatar: b.user.avatar ? b.user.avatar.toString("base64") : null,
      }));

      if (filterBranches) {
        const payload = this.loginController.getPayload(req, res);
        const branch = await this.branchesRepository.findOne({
          where: { user: { id: payload.userId } },
        });
        if (!branch) {
          res.status(401).json("Usuário não autorizado.");
          return;
        }
        const branchId = branch.id;
        branchesMap = branchesMap.filter((b) => b.id !== branchId);
      }

      res.status(200).json(branchesMap);
      return;
    } catch (error) {
      console.error("Erro listar filiais:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
      return;
    }
  };

  getBranchesForMap = async (req: Request, res: Response) => {
    try {
      const branches = await this.branchesRepository.find({
        relations: ["user"],
      });

      const mapData = branches.map((b) => ({
        id: b.id,
        name: b.user.name,
        latitude: b.latitude,
        longitude: b.longitude,
        address: `${b.street}, ${b.number} - ${b.neighborhood}, ${b.city} - ${b.state}, CEP: ${b.zip_code}`,
        avatar: b.user.avatar ? b.user.avatar.toString("base64") : null,
      }));

      res.status(200).json(mapData);
    } catch (error) {
      console.error("Erro ao buscar dados para o mapa:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  };

  postRoute = async (req: Request, res: Response) => {
    const { origem, destino } = req.body;

    if (!origem || !destino) {
      res.status(400).json({ error: "Origem e destino são obrigatórios" });
      return;
    }

    try {
      const response = await fetch(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.ORS_API_KEY || "",
          },
          body: JSON.stringify({
            coordinates: [
              [parseFloat(origem.lng), parseFloat(origem.lat)],
              [parseFloat(destino.lng), parseFloat(destino.lat)],
            ],
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        res.status(response.status).json({ error: text });
        return;
      }

      const data = await response.json();
      res.json(data);
      return;
    } catch (error) {
      console.error("Erro no backend ao chamar ORS:", error);
      res.status(500).json({ error: "Erro interno no servidor" });
      return;
    }
  };
}

export default BranchesController;
