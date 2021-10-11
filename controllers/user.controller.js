const User = require('../models/user.model');
const Joi = require('joi');

module.exports = {
    create_user: async (req,res)=>{

        const userJoiSchema = Joi.object().keys({
            firstname: Joi.string().required().min(3).max(20).messages({'any.required': '"firstname" is required'}),
            lastname: Joi.string().required().min(3).max(20).messages({'any.required': '"lastname" is required'}),
            email: Joi.string().email().required().messages({'any.required': '"email" is required'}),
            age: Joi.number().required().min(18).max(80).messages({'any.required': '"age" is required'})
        });

        let userObj = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            age: req.body.age
        }
        
        const joiRes = await userJoiSchema.validate(userObj);
        if(joiRes.error) {
            res.send({error: joiRes.error.details[0].message});
        } else {
            let user = new User(userObj);
    
            user.save((err,detail)=>{
                if(err) {
                    if(err.name == 'MongoServerError' && err.code == 11000) {
                        res.send({error: 'Email is registered already! Please register with someother id.'});
                    } else {
                        res.send({error: err.message});
                    }
                } else {
                    res.send(detail);
                }
            });
        }
    },
    get_user: async (email)=>{
        let details = await User.find({email:email}).exec();
        return details;
    }
};