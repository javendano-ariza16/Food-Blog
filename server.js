var express = require("express");
var app = express();
var path = require("path");
const blog_service = require("./blog-service.js");

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}
//add static middleware
app.use(express.static('public'));

// setup another route to listen on /about
app.get("/", (req, res) => {
    res.redirect("/about");
});

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "views/about.html"));
  });
  
  app.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname, "views/about.html"));
  });

  app.get("/blog",(req,res)=>
  res.send("<h1>TODO: get all posts who have published==true</h1>"));

  app.get("/posts",(req,res)=>
  res.send("<h1>TODO:This route will return a JSON formatted string containing all the posts within the posts.json files</h1>"));

  app.get("/categories",(req,res)=>
  res.send("<h1>TODO:• This route will return a JSON formatted string containing all the categories within the categories.json file</h1>"));

  app.use((req, res) => {
    res.status(404).end('404 PAGE NOT FOUND');
});



  app.get("/")

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);