import { Router } from "express";
import { Restaurant } from "../models/Restaurant";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { category, search, featured, limit = "20", page = "1" } = req.query as Record<string, string>;
    const query: Record<string, unknown> = {};

    if (category) {
      query["$or"] = [
        { cuisine: { $regex: category, $options: "i" } },
        { tags: { $elemMatch: { $regex: category, $options: "i" } } },
        { "menu.title": { $regex: category, $options: "i" } },
      ];
    }
    if (search) {
      query["$or"] = [
        { name: { $regex: search, $options: "i" } },
        { cuisine: { $regex: search, $options: "i" } },
        { "menu.items.name": { $regex: search, $options: "i" } },
      ];
    }
    if (featured === "true") query["isFeatured"] = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [restaurants, total] = await Promise.all([
      Restaurant.find(query).skip(skip).limit(parseInt(limit)).lean(),
      Restaurant.countDocuments(query),
    ]);

    res.json({ restaurants, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params["id"]).lean();
    if (!restaurant) { res.status(404).json({ error: "Restaurant not found" }); return; }
    res.json({ restaurant });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Failed to fetch restaurant" });
  }
});

export default router;
