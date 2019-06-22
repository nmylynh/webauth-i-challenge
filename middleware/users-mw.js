const userDB = require('../models/users-model');

module.exports = {
    validateUserId: async (req, res, next) => {
        try {
            const { id } = req.params;
            const user = await userDB.findById(id);
    
            user 
            ? next()
            : res.status(400).json({message: "invalid id"});  
            
        } catch(err) {
            res.status(404).json({message: "missing user id"});
        }
    },
    validateUserBody: (req, res, next) => {
        const { username, password } = req.body;
    
        username && password
        ? next()
        : res.status(400).json({message: 'Missing required fields.'})
    }   
}
