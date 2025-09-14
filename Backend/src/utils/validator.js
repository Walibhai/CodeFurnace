const validator = require('validator');


const validate = (data)=>{
        const mandatoryFiled = ['firstName','emailId','password'];
        const IsAllowed = mandatoryFiled.every((k)=>Object.keys(data).includes(k));

        if(!IsAllowed)
                throw new Error("Some Field Missing");
        if(!validator.isEmail(data.emailId))    
                throw new Error("Invalid Email");
        if(!validator.isStrongPassword(data.password))
                throw new Error("Weak password");
}
module.exports = validate;