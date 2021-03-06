const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

//User model
const User = require('../../models/User');

// @route   POST api/users
// @des     Register user
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required')
    .not()
    .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a valid password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });
      //for encryption
      const salt = await bcrypt.genSalt(10);
      //continued
      user.password = await bcrypt.hash(password, salt);
      //save the user after request is successful 
      await user.save();

      const payload = {
          user: {
            id: user.id
          } 
        };
        //JSON Web token
        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            { expiresIn: 360000},
            (err, token) => {
                if(err) throw err;
                res.json({ token });
            });
      } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
