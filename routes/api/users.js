const express = require('express');
const router = express.Router();
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const keys = require('../../config/keys')
const jwt = require('jsonwebtoken')
const passport = require('passport')


//Load INput Validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')


//Load User Modal
const User = require('../../models/User')

//@route    GET api/users/test
//@desc     Tests users route
//@access   Public

router.get('/test', (req, res) => res.json({ msg: "Users works" }));

//@route    GET api/users/register
//@description  Register user
//@access   Public

router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    //Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }



    User.findOne({ email: req.body.email })

        .then(user => {

            if (user) {
                errors.email = 'Email already exists'
                return res.status(400).json(errors)
            }
            else {
                const avatar = gravatar.url(req.body.email, { //Gravat library:  https://www.npmjs.com/package/gravatar
                    s: '200', //size 
                    r: 'pg', //Rating
                    d: 'mm' //Default
                })
                const newUser = new User(
                    {
                        name: req.body.name,
                        email: req.body.email,
                        avatar,
                        password: req.body.password
                    }
                );

                //hash the password before saving the user into the database
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err))
                    })
                })
            }
        })
})


//@route    GET api/users/login
//@description     Login User / Returning JWT Token
//@access   Public
router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    //Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }


    const email = req.body.email;
    const password = req.body.password;

    //Find user by email
    User.findOne({ email })
        .then(user => {
            //Check for user
            if (!user) {
                errors.email = 'User not found'
                return res.status(404).json(errors)
            }

            // Check Password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        //User Matched
                        const payload = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar
                        } //Create JWT Paylaod

                        //Sign Token
                        jwt.sign(
                            payload,
                            keys.secretOrKey,
                            { expiresIn: 3600 },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                })
                            });
                    }
                    else {
                        errors.password = 'Passoword incorrect'
                        return res.status(400).json(errors)
                    }
                })

        })
})


//@route    GET api/users/current
//@description     Return current user
//@access   Private

router.get('/current',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
        })
    })


module.exports = router;