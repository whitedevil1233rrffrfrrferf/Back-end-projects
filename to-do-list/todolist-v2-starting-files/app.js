//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require('mongoose');
const _=require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1/todolistDB",{useNewURLParser:true})

const itemsSchema={
  name:String
};
const Item=mongoose.model("Item",itemsSchema)
const item1=new Item({
  name:"welcome to your to do list"
});
const item2=new Item({
  name:"hit + to add a new item"
});
const item3=new Item({
  name:"<-- Hit this to delete an item"
});
const defaultItems=[item1,item2,item3];
// 
// .then(console.log("sucessfully inserted"))
// .catch((err) => {
//   console.log(err);
// })
const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);
app.get("/", function(req, res) {
  Item.find({})
  .then(function (foundItems) {
    if (foundItems.length === 0) {
      /** Insert Items 1,2 & 3 to todolistDB */
      Item.insertMany(defaultItems)
      .then(function(result){
        console.log("inserted");
        })
      .catch(function (err) {
        console.log(err);
        });
        res.redirect("/");
    } else res.render("list", { listTitle:"today", newListItems: foundItems });
  })
  .catch(function (err) {
    console.log(err);
  });
});
app.get("/:customListName",function(req,res){
  const customListName =_.capitalize(req.params.customListName);
 
  List.findOne({name:customListName})
    .then(function(foundList){
        
          if(!foundList){
            const list = new List({
              name:customListName,
              items:defaultItems
            });
          
            list.save();
            res.redirect("/"+customListName)
            console.log("saved");
            
          }
          else{
            res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
          }
    })
    .catch(function(err){});
 
 
  
  
})


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listName==="today"){
  item.save();  
  res.redirect("/")
  }
  else{
    List.findOne({name:listName})
    .then(function(foundlist){
      foundlist.items.push(item)
      foundlist.save()
      res.redirect("/"+listName)
    })
  }
  
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});
app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox
  const listName=req.body.listName
  if (listName==="today"){
    Item.findByIdAndRemove(checkedItemId).then(() => {
    
      res.redirect("/");
      console.log("Deleted");
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(foundList){
      res.redirect("/"+listName)
    })

  }
  
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
