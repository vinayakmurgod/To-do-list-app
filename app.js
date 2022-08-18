
/////////////////////////////// RUN nodeJs /////////////////////

console.log("nodeJs server is running....")

/////////////////////////////// REQUIRE MODULES /////////////////////

const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const ejs = require('ejs');
const mongoose = require("mongoose");
const _ = require('lodash');

/////////////////////////////// CONFIGURE APP /////////////////////

const app = express()
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public/'));
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect('mongodb+srv://admin-python:admin123@aws.q2krl.mongodb.net/ToDoListApp');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("Database connected...!!");
});


/////////////////////////////// DATABASE /////////////////////
// mongodb cheatsheet
// db.dropDatabase() ------ > remove datase
//db.collection.drop() ------ > remove collection ( ex : db.lists.drop() )

////// Schema ////
const itemSchema = new mongoose.Schema({
  name: String
});

const list = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})

////// Model ////
const Item = mongoose.model('Item', itemSchema);
const List = mongoose.model('List', list)

///// Defult Items ////
const item1 = new Item({
  name: "Welcome to do list."
});

const item2 = new Item({
  name: "Hit the '+' button to add a new item."
});

const item3 = new Item({
  name: "Hit check box to delete an item from the list."
});

const item4 = new Item({
  name: "To create new list go to 'lists'"
});

const defultItems = [item1, item2, item3, item4]
/////////////////////////////// GET ROUTE /////////////////////

//// Today Page /////
app.get("/", (req, res) => {

  //// Read today list /////
  Item.find({}, function(err, items) {

    if (items.length === 0) {
      ///// Creat Defult Items ////
      Item.insertMany(defultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Defult Items added successfully");
        }
      });
      res.redirect("/")
    } else {
        ///// Render home page ////
        res.render("list.ejs", {listTitle: 'Today',newItems: items });
      }
  })
});


//// Custom Page /////
app.get("/:customlist", (req, res) => {
  const customList = _.capitalize(req.params.customlist)
  //// Read custom list /////
  List.findOne({name: customList}, function(err, lists) {
    if (!err) {
      if (!lists) {
        ///// Create new list ////cd
        const newList = new List({
          name: customList,
          items: defultItems
        });
        newList.save()
        res.redirect("/" + customList)
        console.log(`New list ${newList.name} created `);

      } else {
        ///// Render custom page ////
        res.render("list.ejs", {listTitle: lists.name, newItems: lists.items});
      }
    }
  });
});


//// About  Page /////
app.get("/info/about", (req, res) => {
  res.render("about");
});


//// Contact  Page/////
app.get("/info/contact", (req, res) => {
  res.render("contact");
});


/////////////////////////////// POST ROUTE /////////////////////

//// Add items /////
app.post("/", (req, res) => {
  ///// Get bodyParser values ////
  const item = req.body.newEntry;
  const listName = req.body.list;

  ///// Create new item ////
  const newItem = new Item({name: item});


  if (listName === "Today") {
    ///// Add  items to Today list ////
    newItem.save();
    res.redirect("/");
  } else {

    List.findOne({name: listName}, function(err, list) {
      ///// Add  items to Custom list ////
      list.items.push(newItem);
      list.save();
      res.redirect("/" + listName)
    });
  }

  if (newItem.length === 0) {
    console.log("no new entry");
  } else {
    console.log('New item ', newItem.name, 'saved! to ' + listName + ' list');
  }

});

//// New list /////
app.post("/customList", (req, res) => {
  const newList = req.body.listName;
  console.log(newList);
  res.redirect("/"+ newList);
});


//// Delete items /////
app.post("/delete", (req, res) => {
  const checkBoxId = req.body.checkBox;
  const currentList = req.body.listName;

  if (currentList === "Today") {
    ///// Delete  items from Today list ////
    Item.deleteOne({_id: checkBoxId}, function(err) {
      if (!err) {
        console.log("Item Id '" + checkBoxId + "' deleted, from " + currentList + "." );
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: currentList
    }, {
      $pull: {
        items: {
          _id: checkBoxId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        console.log("Item Id '" + checkBoxId + "' deleted, from " + currentList + "." );
        res.redirect("/" + currentList)
      }
    });
  }
});


/////////////////////////////// LISTEN PORT /////////////////////

app.listen(port, () => {
  console.log(`App is listening @ port http://localhost:${port}`)
})
