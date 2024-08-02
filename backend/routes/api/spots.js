const express = require('express');
const router = express.Router();

const { Spot, Review, SpotImage, Sequelize, User } = require('../../db/models');

router.get('/current', async (req, res, next) => {
  const resBody = [];
  const id = req.user.id;
  const userSpots = await Spot.findAll({
    where: {
      ownerId: id,
    },
    include: [
      {
        model: SpotImage,
        where: {
          preview: true,
        },
      },
      {
        model: Review,
        attributes: ['stars'],
      },
    ],
  });

  for (let spot of userSpots) {
    spot = spot.toJSON();
    let totalStars = 0;
    spot.Reviews.forEach(review => {
      totalStars += review.stars;
    });

    const avgRating = totalStars / spot.Reviews.length;
    spot.avgRating = avgRating;

    const previewImages = spot.SpotImages.find(image => image.preview);
    spot.previewImage = previewImages.url;

    delete spot.Reviews;
    delete spot.SpotImages;
    resBody.push(spot);
  }

  res.json({
    Spots: [...resBody]
  });
});

router.get('/:spotId', async (req, res, next) => {
  try {
    const { spotId } = req.params;
    let spot = await Spot.findByPk(spotId, {
      include: [
        {
          model: SpotImage,
        },
        {
          model: Review,
          attributes: ['stars'],
        },
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
      });
    }

    spot = spot.toJSON();

    let totalStars = 0;
    if (spot.Reviews.length) {
      spot.Reviews.forEach(review => {
        totalStars += review.stars;
      });

      const avgRating = totalStars / spot.Reviews.length;
      spot.avgStarRating = avgRating;
    }

    spot.Owner = spot.User;
    spot.numReviews = spot.Reviews.length;
    delete spot.Reviews;
    delete spot.User;

    const {
      id,
      ownerId,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
      createdAt,
      updatedAt,
      numReviews,
      avgStarRating,
      SpotImages,
      Owner,
    } = spot;

    res.json({
      id,
      ownerId,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
      createdAt,
      updatedAt,
      numReviews,
      avgStarRating,
      SpotImages,
      Owner,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const resBody = [];
    const spots = await Spot.findAll({
      include: [
        {
          model: Review,
        },
        {
          model: SpotImage,
        },
      ],
    });

    for (let spot of spots) {
      spot = spot.toJSON();
      let totalStars = 0;
      spot.Reviews.forEach(review => {
        totalStars += review.stars;
      });

      const avgRating = totalStars / spot.Reviews.length;
      spot.avgRating = avgRating;

      const previewImages = spot.SpotImages.find(image => image.preview);
      spot.previewImage = previewImages.url;

      delete spot.Reviews;
      delete spot.SpotImages;
      resBody.push(spot);
    }

    res.json({
      Spots: [...resBody],
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    const newSpot = await Spot.create({
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

    res.status(201).json(newSpot);
  } catch (err) {
    if (err instanceof Sequelize.ValidationError) {
      res.status(400).json({
        message: err.message,
      });
    }
  }
});

module.exports = router;
