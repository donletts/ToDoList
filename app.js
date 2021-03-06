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

app.post ("/home", function(req, res){
   res.redirect(307, "/");
});

app.get("/home", function(req, res){
    res.redirect("/");
})

function DeleteItem (objectId) {
    ToDoItem.deleteOne ( {_id: objectId},
        function (err) {
            if (err) {
                console.log ( err ); // Failure
            } else {
                console.log ( objectId + " deleted" ); // Success
            }
        }
    );
}

function SaveItem ( newItem, itemType ) {
    const newItemObject = new ToDoItem ( {
        todoItem: newItem,
        todoType: itemType
    } );
    newItemObject.save ( (err) => {
        if (err) {
            console.log ( "error in " + itemType + " item save: " + err );
            console.log ( "item error: " + newItemObject );
        }
    } );
}

app.post ( "/", function (req, res) {
    if (req.body.delete) {
        DeleteItem ( req.body.delete );
    } else {
        SaveItem ( req.body.addedItem, "home" );
    }
    res.redirect ( "/" );
} );

app.get ( "/", function (req, res) {

    const day = date.getDate ();
    ToDoItem.where ( "todoType" ).equals ( "home" ).exec ( (err, homeItems) => {
        if (err) {
            console.log ( "error in get /, find: " + err );
        } else {
            res.render ( "list", {listTitle: "Home List", newItems: homeItems} );
        }
    } );
} );

app.get ( "/work", function (req, res) {
    ToDoItem.where ( "todoType" ).equals ( "work" ).exec ( (err, workItems) => {
        if (err) {
            console.log ( "received error in work mongoose query: " + err );
        } else {
            res.render ( "list", {listTitle: "Work List", newItems: workItems} );
        }
    } );
} );

app.post ( "/work", function (req, res) {
    if (req.body.delete) {
        DeleteItem ( req.body.delete );
    } else {
        SaveItem ( req.body.addedItem, "work" );
    }
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
    const welcome = new ToDoItem ( {
        todoItem: "Welcome to your todolist!"
    } );
    const addItem = new ToDoItem ( {
        todoItem: "Hit the + button to add a new item"
    } );
    const deleteItem = new ToDoItem ( {
        todoItem: "<-- Hit this to delete an item."
    } );

    const defaultItems = [welcome, addItem, deleteItem];

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
                        if (err) {
                            console.log ( "got error in item save: " + err );
                        }
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
