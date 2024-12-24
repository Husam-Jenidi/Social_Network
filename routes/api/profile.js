const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
//Load Validation
const validateProfileInput = require('../../validation/profile')

const validateExperienceInput = require('../../validation/experience')
const validateEducationInput = require('../../validation/education')

//Load Profile Model
const Profile = require('../../models/Profile')

//Load User Model
const User = require('../../models/User')

//@route   GET api/profile/test
//@desc    Tests profile route
//@access  Public

router.get('/test', (req, res) => res.json({ msg: "Profile works" }));

//@route   GET api/profile
//@desc    Get Current users profile
//@access  Private
router.get('/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const errors = {}
        Profile.findOne({ user: req.user.id })
            .populate('user', ['name', 'avatar'])
            .then(profile => {
                if (!profile) {
                    errors.noprofile = "There is no profile for this user"
                    return res.status(404).json(errors)
                }
                res.json(profile)
            })
            .catch(err => res.status(404).json(err))
    })


//@route   GET api/profile/all  
//@desc    Get all profiles
//@access  Prublic - 

router.get('/all', (req, res) => {
    const errors = {};
    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if (!profiles) {
                errors.noprofile = "There are no profiles"
                res.status(404).json(errors)
            }
            res.json(profiles)
        })
        .catch(err => res.status(404).json("There are no profiles"))
})




//@route   GET api/profile/handle/:handle  this is only the backend rout, for the user it will be /profile/:handle
//@desc    GET profile by handle
//@access  Prublic - that means you can show profiles without being signed in

router.get('/handle/:handle', (req, res) => {
    const errors = {};
    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = "There is no profile for this user"
                res.status(404).json(errors)
            }
            res.json(profile)
        })
        .catch(err => res.status(404).json(err))
})



//@route   GET api/profile/user/:user_id  
//@desc    GET profile by user
//@access  Prublic - that means you can show profiles without being signed in

router.get('/user/:user_id', (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = "There is no profile for this user"
                res.status(404).json(errors)
            }
            res.json(profile)
        })
        .catch(err => res.status(400).json({ profile: 'There is no profile for this user' }))
})




//@route   Post api/profile
//@desc    Create or Update user profile
//@access  Private
router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { errors, isValid } = validateProfileInput(req.body);
        // Check Validation
        if (!isValid) {
            return res.status(400).json(errors)
        }
        //Get fields
        const profileFields = {}
        profileFields.user = req.user.id;
        if (req.body.handle) profileFields.handle = req.body.handle
        if (req.body.website) profileFields.website = req.body.website
        if (req.body.company) profileFields.company = req.body.company
        if (req.body.bio) profileFields.bio = req.body.bio
        if (req.body.status) profileFields.status = req.body.status
        if (req.body.githubUsername) profileFields.githubUsername = req.body.githubUsername

        //Skills -Split into array (it will come as a coma seperated values)
        if (typeof req.body.skills !== 'undefined') {
            profileFields.skills = req.body.skills.split(',');
        }
        //social- since inside the schema its an object of values
        profileFields.social = {};
        if (req.body.youtube) profileFields.social.youtube = req.body.youtube
        if (req.body.twitter) profileFields.social.twitter = req.body.twitter
        if (req.body.facebook) profileFields.social.facebook = req.body.facebook
        if (req.body.linkedIn) profileFields.social.linkedIn = req.body.linkedIn
        if (req.body.instagram) profileFields.social.instagram = req.body.instagram

        Profile.findOne({ user: req.user.id })

            .then(profile => {
                if (profile) {
                    //Update the profile since we already have a profile
                    Profile.findOneAndUpdate(//this method rinds the profile and update it the first argument is the condition and the second one is the fields to update and the third on is an option that tells Mongoose to return the updated document rather than the original document.
                        { user: req.user.id },
                        { $set: profileFields },
                        { new: true }
                    )
                        .then(profile => res.json(profile))
                }
                else {

                    //Create the profile 
                    //Check if handle exists 
                    Profile.findOne({ handle: profileFields.handle })
                        .then(profile => {
                            if (profile) {
                                errors.handle = "That handle already exists"
                                res.status(404).json(errors)
                            }
                            //Save profile
                            new Profile(profileFields).save().then(profile => res.json(profile))
                        })
                }
            })
    })


//@route   POST api/profile/experience  
//@desc    Add experience to profile
//@access  Private  

router.post(
    '/experience',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { errors, isValid } = validateExperienceInput(req.body);
        // Check Validation
        if (!isValid) {
            return res.status(400).json(errors)
        }
        Profile.findOne({ user: req.user.id })
            .then(profile => {
                const newExp = {
                    title: req.body.title,
                    company: req.body.company,
                    location: req.body.location,
                    from: req.body.from,
                    to: req.body.to,
                    current: req.body.current,
                    description: req.body.description
                }
                //Add to experience array

                profile.experience.unshift(newExp) //unshift to be added on top not at the end of the array
                profile.save()
                    .then(profile => res.json(profile))
            }
            )
    })


//@route   POST api/profile/experience  
//@desc    Add experience to profile
//@access  Private  

router.post(
    '/education',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { errors, isValid } = validateEducationInput(req.body);
        // Check Validation
        if (!isValid) {
            return res.status(400).json(errors)
        }
        Profile.findOne({ user: req.user.id })
            .then(profile => {
                const newEdu = {
                    school: req.body.school,
                    degree: req.body.degree,
                    fieldofstudy: req.body.fieldofstudy,
                    from: req.body.from,
                    to: req.body.to,
                    current: req.body.current,
                    description: req.body.description
                }
                //Add to experience array

                profile.education.unshift(newEdu) //unshift to be added on top not at the end of the array
                profile.save()
                    .then(profile => res.json(profile))
            }
            )
    })




//@route   DELETE api/profile/experience/:exp_id  
//@desc    Delete experience from profile
//@access  Private  

router.delete(
    '/experience/:exp_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            .then(profile => {
                //Get remove index
                const removeIndex = profile.experience
                    .map(item => item.id)
                    .indexOf(req.params.exp_id)

                //splice out of array
                profile.experience.splice(removeIndex, 1)

                //Save
                profile.save().then(profile => res.json(profile))
            })
            .catch(err => res.json(404).json(err))
    })


//@route   DELETE api/profile/education/:edu_id  
//@desc    Delete education from profile
//@access  Private  

router.delete(
    '/education/:edu_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            .then(profile => {
                //Get remove index
                const removeIndex = profile.education
                    .map(item => item.id)
                    .indexOf(req.params.edu_id)

                //splice out of array
                profile.education.splice(removeIndex, 1)

                //Save
                profile.save().then(profile => res.json(profile))
            })
            .catch(err => res.json(404).json(err))
    })

//@route   DELETE api/profile
//@desc    Delete user and profile
//@access  Private  
router.delete(
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOneAndDelete({ user: req.user.id })
            .then(() => {
                //we need to make sure the following promise is returned so it will be waited,
                //also we can do something like await Profile.findOneAndDelete({ user: req.user.id }) and await User.findOneAndDelete({ _id: req.user.id }) inside a try catch block
                return User.findOneAndDelete({ _id: req.user.id })
            })
            .then(() => res.json({ success: true }))

    })


module.exports = router;