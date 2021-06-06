//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");


const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/articleDB", {useNewUrlParser: true, useFindAndModify: false});


const commentsSchema = {
  name : String,
  commentPost : String

};

const Comment = mongoose.model("Comment", commentsSchema)

const articlesSchema = {
  title: String,
  articlePost: String,
  comment : [commentsSchema]
};

const Article = mongoose.model("Article", articlesSchema);


app.get("/", function(req, res) {

  Article.find({}, function(err, foundItems){
    if(foundItems){
      res.render("home", {posts: foundItems});
    }
  });

});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){

  const  titlePost = req.body.postTitle
  const content = req.body.postBody
  

  const article = new Article({
    title: titlePost,
    articlePost : content
  });
  article.save();
  res.redirect("/");

});

app.post("/addComment", function(req,res){
  const nameInput = req.body.postName;
  const commentInput = req.body.postComment;
  const postTitle = req.body.postTitle;
  const postId = req.body.postId;

  const  comment = new Comment({
    name : nameInput,
    commentPost : commentInput
  });
  comment.save();
  
  Article.findOne({_id:postId}, function(err, foundItems){
    if(foundItems){
      foundItems.comment.push(comment);
      foundItems.save();
      res.redirect("/posts/"+postTitle)

    }
    
  })
  
});

app.get("/posts/:postName", function(req, res){
  const requestedTitle = req.params.postName;

  Article.find({title: requestedTitle}, function(err, foundItems){
    if(foundItems){
      res.render("post", {post:foundItems});
  }

  });
});

app.post("/deleteArticle", function(req, res){
  const checkedItemId = req.body.deleteArticleId;

    Article.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });


});

app.post("/deleteComment", function(req, res){
  const checkedItemId = req.body.checkbox;
  const postTitle = req.body.checkbox2;


 
  Article.findOneAndUpdate({name: postTitle}, {$unset: {comment: {_id: checkedItemId}}}, function(err, foundList){
    if (!err){
      res.redirect("/posts/" + postTitle);
    }

  });

});





app.listen(3000, function() {
  console.log("Server started on port 3000");
});
