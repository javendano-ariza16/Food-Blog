/*********************************************************************************
* WEB322 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Juan David Avendao Student ID: 165095217 Date: 17/02/2023
*
* Cyclic Web App URL: https://motionless-jay-pullover.cyclic.app
*
* GitHub Repository URL: https://github.com/javendano-ariza16/web322-app
*
********************************************************************************/ 
const Sequelize = require('sequelize');
const { gte } = Sequelize.Op;

var sequelize = new Sequelize('egwpvzbq', 'egwpvzbq', 'gF0GCCSEFjAHiTMVVXO7GRr1lg446ORF', {
    host: 'isilo.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
   });


//Defining the post data model
const Post = sequelize.define("Post",{
    body:Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
});

//Defining the category data model
const Category = sequelize.define("Category", {
    category: Sequelize.STRING,
  });

//Creating the relationship between category and post models

Post.belongsTo(Category, { foreignKey: "category" });



module.exports.initialize = () => {
    return new Promise ((resolve, reject) => {
       sequelize.sync().then(()=>{
        resolve();}).catch(()=>{
        reject("unable to sync the database");
        })
    }) 
};

//Querying all the post

module.exports.getAllPosts = () => {
    return  new Promise((resolve, reject) => {
        Post.findAll()
        .then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject("no results returned");
        })
    })
};

//queryPosts by category

module.exports.getPostsByCategory = (queryCategory) => {
    return  new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                category : queryCategory
            }
        })
        .then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject("no results returned");
        })
    })
  };

module.exports.getPublishedPosts = () => {
    return  new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                published : true
            }
        })
        .then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject("no results returned");
        })
    })
}

module.exports.getCategories = () =>{
    return  new Promise((resolve, reject) => {
        Category.findAll()
        .then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject("no results returned");
        })
    })
}

//addPost(postData) 
module.exports.addPost = function (postData){
    return new Promise((resolve,reject)=>{
        postData.published = (postData.published) ? true : false;


        for(const property in postData){
            if(postData[property]=="")
            postData[property] = null;
        };
        postData.postDate = new Date();
        Post.create(postData).
        then(()=>{
            resolve();
        }).catch((err)=>{reject("Unable to create post");})
    })
}  
   
  

//queryPosts by minDate
module.exports.getPostsByMinDate = (minDateStr) => {
    return  new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                postDate: {
                    [gte]: new Date(minDateStr)
                          }      
            }
        })
        .then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject("no results returned");
        })
    })
  };

//queryPosts by id
    module.exports.getPostById = (queryId) => {
        return  new Promise((resolve, reject) => {
            Post.findAll({
                where:{
                    id: queryId   
                }
            })
            .then((data)=>{
                resolve(data[0]);
            }).catch(()=>{
                reject("no results returned");
            })
        })
      };

//produces posts that are both published and filtered by Category
module.exports.getPublishedPostsByCategory = (queryCategory) => {
    return  new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                category : queryCategory,
                published : true,
            }
        })
        .then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject("no results returned");
        })
    })
  };

//Creating a new category
module.exports.addCategory = (category) => {
    return new Promise((resolve, reject)=>
    {
        for(const property in category){
            if(category[property]=="")
            category[property] = null;
        };
        Category.create(category).
        then(()=>{
            resolve();
        }).catch((err)=>{reject("Unable to create category");})
    }
    )
}

module.exports.deleteCategoryById = (idGiven) => {
    return new Promise((resolve, reject)=>{
        Category.destroy(
            {where: {id:idGiven}}
            ).then(()=>resolve("Destroyed"))
            .catch(()=>reject("Was found an error, can not deleted"));
    })
}

module.exports.deletePostById = (idGiven)=>{
    return new Promise((resolve, reject)=>{
        Post.destroy(
            {where:{id:idGiven}}
        ).then(()=>resolve("Destroyed"))
        .catch(()=>reject("Was found an error, can not deleted"))
    });
}