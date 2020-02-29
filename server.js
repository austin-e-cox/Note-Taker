const express = require("express");
const path = require("path");
const fs = require("fs");

// Sets up the Express App
// =============================================================
const app = express();
const PORT = 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());


// functions
function determineNewId(){
    let chars       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let charLen = chars.length;
    let s = "";
    let length = 8; // 36**8 -- 2.8 trillion possibilities

    for ( let i = 0; i < length; i++ ) {
        s += chars.charAt(Math.floor(Math.random() * charLen));
    }
    return s;
}

// Routes
// =============================================================


// * DELETE `/api/notes/:id` - Should receive a query parameter containing the id of a note to delete. 
//    This means you'll need to find a way to give each note a unique `id` when it's saved.
//    In order to delete a note, you'll need to read all notes from the `db.json` file, remove the note with the given `id` property, and then rewrite the notes to the `db.json` file.
app.delete("/api/notes/:id", function(req,res){
    notes = fs.readFileSync(path.join(__dirname, "db.json"), function (err) {
        if (err) throw err;
    }).toString().split("\n,\n");
    let noteId = req.params.id.toString().trim();
    console.log(`attempting to delete note: ${noteId}`)
    
    let newNotes = [];
    let noteFound = false;

    for (noteStr of notes){
        if (!noteStr)
            break;

        let note = JSON.parse(noteStr);
        if (noteId == note.id)
            noteFound = true;
        else
            newNotes.push(JSON.stringify(note,null,2));
    }
    if (!noteFound){
        res.send(`Could not find note with id: ${noteId}`);
        console.log(`Could not find note with id: ${noteId}`);
        return;
    }
    if (newNotes){
        if (newNotes.length === 0){
            fs.writeFileSync(path.join(__dirname, "db.json"), "", function (err) {
                if (err) throw err;
            });
        }
        else{
            fs.writeFileSync(path.join(__dirname, "db.json"), newNotes.join("\n,\n")+"\n,\n", function (err) {
                if (err) throw err;
            });    
        }
        res.send("Note deleted!");
        console.log(`Note deleted!`);
        return;
    }
    else{
        console.log("EMPTY");
    }
    console.log(newNotes);
})


//* GET `/notes` - Should return the `notes.html` file.
app.get("/notes", function(req, res) {
    res.sendFile(path.join(__dirname, "public/notes.html"));
});
  

// GET /api/notes - Should read the db.json file and return all saved notes as JSON.
app.get("/api/notes", function(req, res) {
    fs.readFile(path.join(__dirname, "db.json"), function(err,data){
        let d = data.toString().split("\n,\n");

        // remove empty lines
        for( var i = 0; i < d.length; i++){ 
            if ( d[i] === "") {
              d.splice(i, 1); 
              i--;
            }
        }
        res.send(d.map(x => JSON.parse(x)));
    });
    //res.sendFile(path.join(__dirname, "db.json"), function (err) {
    //    if (err) throw err;
    //});
});

// POST /api/notes - Should receive a new note to save on the request body, add it to the db.json file, and then return the new note to the client.
app.post("/api/notes", function(req,res){
    let newNote = req.body;
    // console.log(newNote);
    let newId = determineNewId();
    newNote.id = newId;
    fs.appendFile(path.join(__dirname, "db.json"), JSON.stringify(newNote,null,2)+"\n,\n", function (err) {
        if (err) throw err;
        console.log(`Note Saved!\tid: ${newId}`);
    });
    res.json(newNote);
})


// Note: * MUST be defined last, otherwise it hides other possibilities
//* GET `*` - Should return the `index.html` file
app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "public/index.html"));
});


// Start the server to begin listening
// =============================================================
app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });
  