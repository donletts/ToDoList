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

setupDatabaseWithDefaults ();

app.set ( 'view engine', 'ejs' );
app.use ( bodyParser.urlencoded ( {extended: true} ) );
app.use ( express.static ( "public" ) );

app.post ( "/", function (req, res) {
    if (req.body.list === "Work") {
        const newItem = new ToDoItem ( {
            todoItem: req.body.newItem,
            todoType: "work"
        } );
        newItem.save ( (err) => {
            console.log ( "error in work item save: " + err );
            console.log ( "item error: " + newItem );
        } );
        res.redirect ( "/work" );
    } else {
        const newItem = new ToDoItem ( {
            todoItem: req.body.newItem,
        } );
        newItem.save ( (err) => {
            console.log ( "error in work item save: " + err );
            console.log ( "item error: " + newItem );
        } );
        res.redirect ( "/" );
    }
} );

app.get ( "/", function (req, res) {

    const day = date.getDate ();
    ToDoItem.where ( "todoType" ).equals ( "home" ).exec ( (err, homeItems) => {
        if (err) {
            console.log ( "error in get /, find: " + err );
        } else {
            res.render ( "list", {listTitle: "Home List", newItem: homeItems} );
        }
    } );
} );

app.get ( "/work", function (req, res) {
    ToDoItem.where ( "todoType" ).equals ( "work" ).exec ( (err, workItems) => {
        if (err) {
            console.log ( "received error in work mongoose query: " + err );
        } else {
            res.render ( "list", {listTitle: "Work List", newItem: workItems} );
        }
    } );
} );

app.post ( "/work", function (req, res) {
    const newWorkItem = new ToDoItem ( {
        todoItem: req.body.newItem,
        todoType: "work"
    } );
    newWorkItem.save ( (err) => {
        console.log ( "error in work item save: " + err );
        console.log ( "item error: " + newWorkItem );
    } );
    res.redirect ( "/work" );
} );

app.get ( "/about", function (req, res) {
    res.render ( "about" );
} );

app.listen ( port, function () {
    console.log ( "server started on port: " + port );
} );

/////////////////////////////////////////////////////////////////
// Helper Methods
/////////////////////////////////////////////////////////////////

function setupDatabaseWithDefaults () {
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
            console.log ( "got error in find: " + err );
        } else {
            // console.log ( "current items in db: " + todoItems );
            defaultItems.forEach ( (item, index) => {
                if (todoItems.some ( (todoItem) => {
                    return (
                        item.todoItem === todoItem.todoItem
                    );
                } )) {
                    // console.log ("already in db: " + item);
                } else {
                    item.save ( err => {
                        console.log ( "got error in item save: " + err );
                    } );
                    // console.log ("successfully saved item: " + item);
                }
            } );
        }
    } );
// ToDoItem.find((err, items) => {
//    if(err){
//        console.log ("got error in second find: " + err);
//    }
//    else{
//        console.log ("all items in db after defaults: " + items);
//    }
//     // mongoose.connection.close ();
//     // process.exit ();
// });
// const todoItems = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
}
