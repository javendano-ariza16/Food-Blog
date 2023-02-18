/*********************************************************************************
* WEB322 – Assignment 03
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
const e = require("express");
const fs = require("fs"); 
var post =[];
var categories = [];

exports.initialize = () => {
    return new Promise ((resolve, reject) => {
        fs.readFile('./data/categories.json', 'utf8',(err,data) => {
            if (err) {
                reject ('unable to read file');
            }
            else {
                categories = JSON.parse(data);
            }
        });

        fs.readFile('./data/post.json', (err,data)=> {
            if (err) {
                reject ('unable to read file');
            }
            else {
                post = JSON.parse(data);
            }
        })
        resolve();
    }) 
};

exports.getAllPosts = () => {
    return  new Promise((resolve, reject) => {
        
       if(post.length === 0) {
        let err = "No results returned";
        reject({message: err});
       }  

    resolve (post);
    })
};

exports.getPublishedPosts = () => {
    return new Promise((resolve,reject) => {
    var publishedPost =[];
    for(let i=0;i<post.length;i++){
        if(post[i].published===true)
        {publishedPost.push(post[i]);}
    }
    if(publishedPost.length===0)
    {
        let err= "no results return "
        reject({message:err});
    }
    resolve(publishedPost);
    })
}

exports.getCategories = () =>{
    return  new Promise((resolve, reject) => {
        
        if(categories.length === 0) {
         let err = "No results returned";
         reject({message: err});
        }  
 
     resolve (categories);
     })
}

//addPost(postData) 
module.exports.addPost = function (postData){
    var promise = new Promise((resolve, reject) =>{
        if (postData.published === undefined) {
            postData.published = false;
        } else postData.published = true;
        
        postData.id = posts.length + 1;
        postData.postDate = ConvertJsonDateString(Date.now());
        postData.category = parseInt(postData.category);
        posts.push(postData);
        // reject("postData is undefined!");
        resolve(postData);
    })
    return promise;
}

//queryPosts by category
module.exports.getPostsByCategory = (category) => {
    console.log('query Post by Category starts!');
    var min_category = 1;
    var max_category = categories.length;
    let query_post_category = [];
    var promise = new Promise((resolve, reject) => { 
        for ( let i = 0; i < posts.length; i++){
            if (posts[i].category == category) query_post_category.push(posts[i]);
        }
        if (category < min_category || category > max_category ) // tell client no result cos category value out of bound
            reject(`No result returned in this query! Hint: Your category value seems out of range! Please choose ${min_category} - ${max_category}!`);
        if (query_post_category.length === 0 ) // tell client no result cos really no query result with correct inputted category value
            reject(`No result returned in this query with your input category value ${category}!`);
        else resolve(query_post_category);
    })
    console.log('query Post by Category ends!');
    return promise;
}

//queryPosts by minDate
module.exports.getPostsByMinDate = (minDateStr) => {
    console.log('query Post by minDate starts');
    var regex = /^[0-9]{4}[\-\/\.][0-9]{1,2}[\-\/\.][0-9]{1,2}$/g; // check the input date format
    let query_post_date = [];
    var promise = new Promise((resolve, reject) => {
        if (regex.test(minDateStr)){
            for ( let i = 0; i < posts.length; i++){
                if (new Date(posts[i].postDate) >= new Date(minDateStr)) query_post_date.push(posts[i]);
            }
            if (query_post_date.length === 0 )
                reject(`No result returned in this query with your input date ${minDateStr}!`); // data input format correct but no result 
            else    
                resolve(query_post_date);
        }else   // wrong format of date
            reject('No result returned! Please enter your query in such date format YYYY-MM-DD OR YYYY.MM.DD e.g. 2020-12-01 , 2020.12.01' );
    });
    console.log('query Post by minDate ends');
    return promise;
}
