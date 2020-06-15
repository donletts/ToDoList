const express = require ( "express" );
const bodyParser = require ( "body-parser" );
const ejs = require ( "ejs" );
const date = require ( __dirname + "/date.js" );
const mongoose = require ( "mongoose" );

// Express Listening port
const port = 3000;

// Mongo Url
const mongoUrl = "mongodb://localhost:27017";

// Database Name
const dbName = "toDoListDB";

const mongoClient = new mongoose.connect (
    mongoUrl + "/" + dbName,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
);

const toDoListSchema = new mongoose.Schema ( {
    todoItem: String,
    date: {
        type: Date,
        default: Date.now
    },
    isDone: {
        type: Boolean,
        default: false
    },
    todoType: {
        type: String,
        enum: ["work", "home"],
        default: "home"
    }
} );

const ToDoItem = mongoose.model ( "ToDoItem", toDoListSchema );

const app = express ();

// Default Todo items
const buyFood = new ToDoItem ( {
    todoItem: "Buy Food"
} );
const cookFood = new ToDoItem ( {
    todoItem: "Cook Food"
} );
const eatFood = new ToDoItem ( {
    todoItem: "Eat Food"
} );

const defaultItems = [buyFood, cookFood, eatFood];

// set up database with defaults if not already set up
ToDoItem.find ( function (err, todoItems) {
    if (err) {
        console.log ( err );
    } else {
        console.log ( todoItems );
        todoItems.forEach ( (item, index) => {
            if(defaultItems.some ( (defaultItem) => {
                return (item.todoItem === defaultItem.todoItem);
            } )){

            }
            else {
                todoItems
            }
        } );
    }
    // mongoose.connection.close ();
    // process.exit ();
} );


// const todoItems = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.set ( 'view engine', 'ejs' );
app.use ( bodyParser.urlencoded ( {extended: true} ) );
app.use ( express.static ( "public" ) );

app.post ( "/", function (req, res) {
    if (req.body.list === "Work") {
        workItems.push ( req.body.newItem );
        res.redirect ( "/work" );
    } else {
        todoItems.push ( req.body.newItem );
        res.redirect ( "/" );
    }
} );

app.get ( "/", function (req, res) {

    const day = date.getDate ();

    res.render ( "list", {listTitle: day, newItem: todoItems} );
} );

app.get ( "/work", function (req, res) {
    res.render ( "list", {listTitle: "Work List", newItem: workItems} );
} );

app.post ( "/work", function (req, res) {
    workItems.push ( req.body.newItem );
    res.redirect ( "/work" );
} );

app.get ( "/about", function (req, res) {
    res.render ( "about" );
} );

app.listen ( port, function () {
    console.log ( "server started on port: " + port );
} );