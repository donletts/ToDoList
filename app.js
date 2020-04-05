const express = require ( "express" );
const bodyParser = require ( "body-parser" );
const ejs = require ( "ejs" );
const date = require(__dirname + "/date.js");

const port = 3000;

const app = express ();

const todoItems = ["Buy Food","Cook Food","Eat Food"];
const workItems = [];

app.set ( 'view engine', 'ejs' );
app.use ( bodyParser.urlencoded ( {extended: true} ) );
app.use ( express.static("public"));

app.post ( "/", function (req, res) {
    if (req.body.list === "Work")
    {
        workItems.push (req.body.newItem);
        res.redirect("/work");
    }
    else
    {
        todoItems.push (req.body.newItem);
        res.redirect("/");
    }
} );

app.get ( "/", function (req, res) {

    const day = date.getDate();

    res.render ( "list", {listTitle: day, newItem: todoItems} );
} );

app.get("/work", function (req, res) {
    res.render("list", { listTitle: "Work List", newItem: workItems } );
});

app.post("/work", function (req, res) {
    workItems.push(req.body.newItem);
    res.redirect("/work");
});

app.get("/about", function(req, res){
   res.render("about");
});

app.listen ( port, function () {
    console.log ( "server started on port: " + port );
} );