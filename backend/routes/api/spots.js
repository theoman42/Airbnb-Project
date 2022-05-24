const express = require("express");

const { Spot } = require("../../db/models");
const { setTokenCookie, restoreUser } = require("../../utils/auth");

const router = express.Router();

router.get("/:spotId", async (req, res) => {
  const id = req.params["spotId"];
  const spots = await Spot.findOne({
    where: { id },
  });
  res.json(spots);
});

router.get("/me", restoreUser, async (req, res) => {
  const { user } = req;
  const spots = await Spot.findAll({
    where: { userId: user.id },
  });
  res.json(spots);
  // const spots = await Spot.findAll();
  // res.json(spots);
});

//GET ALL SPOTS OWNED BY THE CURRENT USER *AUTH*

router.get("/", async (req, res) => {
  const spots = await Spot.findAll();
  res.json(spots);
});

router.post("/spots", restoreUser, async (req, res) => {
  const { address, city, state, country, lat, lng, name, descrption, price } =
    req.body;
  const spot = await Spot.create({
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
  });

  return res.json(spot);
});

//CREATE A SPOT *AUTH*

//EDIT A SPOT *AUTH*

router.put("/spots", restoreUser, async (req, res) => {
  const { address, city, state, country, lat, lng, name, descrption, price } =
    req.body;
  const spot = await Spot.create({
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
  });

  return res.json(spot);
});

//DELETE A SPOT *AUTH*

module.exports = router;
