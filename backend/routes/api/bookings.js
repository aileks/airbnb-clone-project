const express = require('express');
const router = express.Router();

const {
  Spot,
  Review,
  ReviewImage,
  SpotImage,
  Sequelize,
  User,
  Booking,
} = require('../../db/models');

router.get('/current', async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required',
    });
  }

  const resBody = [];
  const userId = req.user.id;
  const bookings = await Booking.findAll({
    where: {
      userId,
    },
    include: [
      {
        model: Spot,
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'description'],
        },
        include: [
          {
            model: SpotImage,
            attributes: ['url'],
            where: {
              preview: true
            }
          }
        ]
      },
    ],
  });

  for (let booking of bookings) {
    booking = booking.toJSON();

    booking.Spot.previewImage = booking.Spot.SpotImages[0].url;
    delete booking.Spot.SpotImages;

    resBody.push(booking);
  }

  res.json({
    Bookings: [...resBody]
  });
});

module.exports = router;
