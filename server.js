/*********************************************************************************
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Juan David Avendao Student ID: 165095217 Date: 19/03/2023
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
const stripJs = require('strip-js');
var app = express();
var path = require("path");
var exphbs = require("express-handlebars")
const blog_service = require("./blog-service.js");
const authData = require("./auth-service.js");
const clientSessions = require("client-sessions");



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

app.use(express.urlencoded({extended: true}));

app.engine(
	'.hbs',
	exphbs.engine({
		extname: '.hbs',
		helpers: {
			navLink: function (url, options){
        return '<li' +
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
       },
			equal: function (lvalue, rvalue, options) {
				if (arguments.length < 3)
					throw new Error('Handlebars Helper equal needs 2 parameters');
				if (lvalue != rvalue) {
					return options.inverse(this);
				} else {
					return options.fn(this);
				}
			},
			safeHTML: function (context) {
				return stripJs(context);
			},
      formatDate: function(dateObj){
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
       }
		},
	}),
);
app.set('view engine', '.hbs');

app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
 });



 app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "bogWeb322", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

//helper middleware function 
function ensureLogin (req,res,next)  {
  if (!(req.session.user)) {
      res.redirect("/login");
  }
  else {
      next();
  }
};



// setup another route to listen on /about
app.get("/", (req, res) => {
    res.redirect("/blog");
});

app.get("/",  (req, res)=> {
    res.sendFile(path.join(__dirname, "views/about.html"));
  });
  
  app.get("/about", (req, res)=> {
    res.render("about");
  });

  app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{
        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog_service.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog_service.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post1 = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post1 = post1;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blog_service.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});


app.get('/blog/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blog_service.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blog_service.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the post by "id"
      viewData.post1 = await blog_service.getPostById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blog_service.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})
});



  app.get("/posts",ensureLogin, (req, res) => {
    let category = req.query.category;
    let min_date = req.query.minDate;
    if (category){
        blog_service.getPostsByCategory(category).then((dataC) =>
         {
          console.log(dataC.length);
          if(dataC.length>0)
          res.render("posts", {posts:dataC})
          else{res.render("posts", { message: "No Results" })};
         }) // send json data back
        .catch((err) => {
        console.log(err);
        res.render("posts", {message: "no results"});
        })
    }
    else if (min_date) {
        blog_service.getPostsByMinDate(min_date).then((dataD) => {
          if(dataD.length>0)
          res.render("posts", {posts:dataD})
          else{res.render("posts", { message: "No Results" })};
        }) //send json data back
        .catch((err) => {
            console.log(err);
            res.render("posts", {message: "no results"});
        }); 
    } else { // 
        blog_service.getAllPosts()
        .then((data) =>{
          if(data.length>0)
          res.render("posts", {posts:data})
          else{res.render("posts", { message: "No Results" })};;
        })
        .catch((err) =>{
            console.log(err);
            res.render("posts", {message: "no results"});
        })
    }
});

// add post/value route
app.get("/post/:id",ensureLogin, (req, res) =>{
  let id = req.params.id;
  blog_service.getPostById(id)
  .then((dataI) => {res.json(dataI);})
  .catch((err) => {
      console.log(err);
      res.json(err);
  })
});


app.get("/categories", ensureLogin, (req, res) => {
      blog_service.getCategories().then((data) => {
        if(data.length>0)
        res.render("categories", {categories: data});
        else
        res.render("categories",{message:"no results"})
      }).catch((err) => {
        res.render("categories",
        {message: "no results"});
      })
  });

  app.get("/posts/add", ensureLogin, (req, res)=> {
    blog_service.getCategories().
    then((data)=>{res.render("addPost", {categories:data});;
    })
    .catch(()=>{res.render("addPost", {categories: []});})

  });




  app.post("/posts/add",upload.single("featureImage"), (req,res)=>{
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
     function processPost(imageUrl) {
      req.body.featureImage = imageUrl;
      let p1 = {};
      p1.body = req.body.body;
      p1.title = req.body.title;
      p1.postDate = new Date().toISOString().slice(0, 10);
      p1.category = req.body.category;
      p1.featureImage = req.body.featureImage;
      p1.published = req.body.published;
  
      if (p1.title) {
        blog_service.addPost(p1);
      }
      res.redirect('/posts');
    }
  } 
  )

  app.get("/categories/add", ensureLogin, (req, res)=>{
    res.render("addCategory");
  })

  app.post("/categories/add",(req,res)=>{
    let catObj = {};  
    catObj.category = req.body.category;
    console.log(req.body.category);
    if (req.body.category != "") {
      blog_service.addCategory(catObj)
        .then(() => {
          res.redirect("/categories");
        })
        .catch(() => {
          console.log("Some error occured");
        });
    }
  }
  )

  app.get("/categories/delete/:id", ensureLogin, (req,res)=>{
    blog_service.deleteCategoryById(req.params.id)
    .then(()=>{res.redirect("/categories")})
    .catch(res.status(500));
  })
  
  
  app.get("/posts/delete/:id", ensureLogin, (req,res)=>{
    blog_service.deletePostById(req.params.id)
    .then(()=>{res.redirect("/posts")})
    .catch(res.status(500));
  })

  app.get("/login",(req,res) => {
    res.render('login');
  }
  )

  app.get("/register", (req,res)=>{
    res.render("register");
  })


  app.post("/register", (req,res)=>{
    authData.registerUser(req.body)
    .then(() => {
      res.render('register', {successMessage: "User created"})
    })
    .catch((err)=>{
      res.render('register', {errorMessage: err, userName: req.body.userName})
    });
  })

  app.post("/login", (req,res)=>
  {
    req.body.userAgent = req.get('User-Agent');

    authData.checkUser(req.body).then((user) => {
      req.session.user = {
      userName: user.userName,
      email: user.email,
      loginHistory: user.loginHistory
      };
      res.redirect('/posts');
     }).catch((err) =>{
      res.render('login', {errorMessage: err, userName: req.body.userName})
     })
  }
  )

  app.get("/logout", function(req, res) {
    req.session.reset();
    res.redirect("/");
  });

  app.get('/userHistory', ensureLogin, (req,res)=>{
    res.render('userHistory')
  })


  app.use((req, res) => {
    res.status(404).render('404');
  });


// setup http server to listen on HTTP_PORT
blog_service.initialize()
  .then(authData.initialize)
  .then(function () {
    app.listen(HTTP_PORT, function () {
      console.log("app listening on: " + HTTP_PORT)
    });
  }).catch(function (err) {
    console.log("unable to start server: " + err);
  });