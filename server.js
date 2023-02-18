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
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
var express = require("express");
var app = express();
var path = require("path");
const blog_service = require("./blog-service.js");


var HTTP_PORT = process.env.PORT || 8080;
cloudinary.config({
  cloud_name: 'dvnbtindj',
  api_key: '768353363744276',
  api_secret: 'j9Y7fbsWM9rVa7rFmtsgzVwLZ_c',
  secure: true
 });
 

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

const upload = multer(); // no { storage: storage } since we are not using disk storage

//add static middleware
app.use(express.static('public'));

// setup another route to listen on /about
app.get("/", (req, res) => {
    res.redirect("/about");
});

app.get("/",  (req, res)=> {
    res.sendFile(path.join(__dirname, "views/about.html"));
  });
  
  app.get("/about", (req, res)=> {
    res.sendFile(path.join(__dirname, "views/about.html"));
  });

  app.get("/blog",(req,res)=>
  res.send("<h1>TODO: get all posts who have published==true</h1>"));

  app.get("/posts", (req, res) => {
    let category = req.query.category;
    let min_date = req.query.minDate;
    if (category){
        blog_service.getPostsByCategory(category).then((dataC) => {res.json(dataC);}) // send json data back
        .catch((err) => {
        console.log(err);
        res.json(err);
        })
    }
    else if (min_date) {
        blog_service.getPostsByMinDate(min_date).then((dataD) => {res.json(dataD);}) //send json data back
        .catch((err) => {
            console.log(err);
            res.json(err);
        }); 
    } else { // 
        blog_service.getAllPosts()
        .then((data) =>{
            console.log("getAllPosts JSON loaded!");
            res.json(data);
        })
        .catch((err) =>{
            console.log(err);
            res.json(err);
        })
    }
});

// add post/value route
app.get("/post/:id", (req, res) =>{
  let id = req.params.id;
  blog_service.getPostById(id)
  .then((dataI) => {res.json(dataI);})
  .catch((err) => {
      console.log(err);
      res.json(err);
  })
});


    app.get("/categories", (req, res) => {
      blog_service.getCategories().then((data) => {
          res.json({data});
      }).catch((err) => {
          res.json({message: err});
      })
  });

  app.get("/posts/add", (req, res)=> {
    res.sendFile(path.join(__dirname, "views/addPost.html"));
  });



  app.post("/post/add",upload.single("featureImage"), (req,res)=>{
    if(req.file){
      let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream(
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
      };

      async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
      }
      upload(req).then((uploaded)=>{
        processPost(uploaded.url);
      });
     }else{
      processPost("");
     }
     function processPost(imageUrl){
      req.body.featureImage = imageUrl;
      blog_service.addPost(req.body);
      res.redirect("/posts");
      }
     } 
  
  )

  
  app.use((req, res) => {
    res.status(404).end('404 PAGE NOT FOUND');
});


// setup http server to listen on HTTP_PORT
blog_service.initialize().then(()=>{
    console.log("initialize.then");
    app.listen(HTTP_PORT, onHttpStart);
    }).catch(err => {console.log(err);                              
})