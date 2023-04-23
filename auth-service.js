var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

var userSchema = new Schema({
  "userName":{
    type: String,
    unique: true
},
  "password": String,
  "email": String,
  "loginHistory":[{
    "dateTime": Date,
    "userAgent":String
  }]
}); 

let User; // to be defined on new connection (see initialize)

module.exports.initialize = () => {
    return new Promise((resolve,reject)=>{
        let db = mongoose.createConnection("mongodb+srv://juandariza16:JUANpro2004@senecaweb322.axhm2up.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});
        db.on('error', (err)=>{
            console.log("db1 error!");
            reject(err);
          });
          
          db.once('open', ()=>{
            console.log("db1 success!");
            User = db.model("users",userSchema);
            resolve();
          });
    })
};


module.exports.registerUser = (userData) =>{
    return new Promise((resolve, reject)=>{
        if(userData.password !== userData.password2){
        reject('Passwords do not match');
        }else{
            bcrypt.hash(userData.password, 10).then(hash=>{ 
                userData.password = hash;
                let newUser = new User(userData);
                newUser.save()
                .then(()=>resolve())
                .catch((err) => {
                    if(err.code === 11000)
                    {
                        reject(`Error creating user: ${err.message}`);
                    }
                });
               })
               .catch(err=>{
                console.log(err); 
                reject("Error encrypting password");
               }); 
        };
    })

}


// This function is for check the username and the password given by the user in our database
// adn also upload a new loginHistory
module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) =>{  
    User.find({ userName: userData.userName}).
    then((users) =>{
        if(users.length === 0){
            reject(`Unable to find user: ${userData.userName}`);
        }else{
            bcrypt.compare(userData.password , users[0].password).then((result) => {
                if(result===true){
                    users[0].loginHistory.push({
                        dateTime:(new Date()).toString(), userAgent: userData.userAgent}
                    )
                    User.updateOne(
                        {userName:users[0].userName},
                        {$set:{loginHistory : users[0].loginHistory}}
                    ).exec()
                    .then(() => {
                        resolve(users[0]);
                      })
                      .catch((err) => {
                        if (err.code === 11000) {
                          reject("Username already taken");
                        } else {
                          reject(`Error creating user: ${err.message}`);
                        }
                      });
                }else{
                    reject(`Incorrect password for user: ${userData.userName}`);
                }

            });
        }    
    })
    .catch((err) => {
        console.log(err);
        reject(`Error finding user: ${userData.userName}`);
      });
})

}


