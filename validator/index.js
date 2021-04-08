exports.userSignupValidator = (req, res, next) => {
    req.check('firstName', 'First name is required').notEmpty()
    req.check('lastName', 'Last name is required').notEmpty()
    req.check('email', 'Email must be between 3 to 32 characters')
        .matches(/.+\@.+\..+/)   //checking for email pattern
        .withMessage('Email must contain @')
        .isLength({
            min: 4,
            max: 32
        });
        req.check('password', 'Password is required').notEmpty()
        req.check('password')
        .isLength({min: 6})
        .withMessage('Password must contain at least 6 characters')
        .matches(/\d/)  //regex make sure it matches
        .withMessage("Password must contain a number");
        const errors = req.validationErrors()
        if(errors) {
            const firstError = errors.map(error => error.msg)[0]
            return res.status(400).json({error: firstError});
        }
        //Anythime you're creating a middleware you NEED to have NEXT 
        //This is because it will help move the program along (otherwise it will be halted)
        next();
}