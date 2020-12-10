const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost/todolistDB", {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const itemA = new Item({
  name: "Buy Apples"
});

const itemB = new Item({
  name: "Buy Bananas"
});

const itemC = new Item({
  name: "Buy Carrots"
});

const defaultItems = [itemA, itemB, itemC];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res){
  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        } else {
          console.log("Successfully added default items.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", foundItems: foundItems});
    }
  });
});

app.get("/:titleOfList", function(req, res){
  const postURL = _.capitalize(req.params.titleOfList);

  List.findOne({name: postURL}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: postURL,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + postURL);
      } else {
        res.render("list", {listTitle: foundList.name, foundItems: foundList.items});
      }
    }
  });
});




app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Checked item deleted.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      {
      name: listName
    },{
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundList){
      if(!err) {
        res.redirect("/" + listName);
      }
  });
  }
});



app.post("/work", function(req, res){
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
})

app.get("/about", function(req, res){
  res.render("about");
});


app.listen(port, function (){
  console.log("Server started on port " + port);
});
