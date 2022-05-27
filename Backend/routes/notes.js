const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const Note = require("../models/Note");
const router = express.Router();
const { body, validationResult } = require("express-validator");

//ROUTE 1 : Get all the notes using :GET "/api/notes/getUser" . Login required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server error");
  }
});
//ROUTE 2 : Add a new note using : "/api/notes/addNote" . Login required
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be of length 5").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;

      //If there are errors , return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server error");
    }
  }
);

//ROUTE 3 : Update an existing note using  :POST "/api/notes/updateNote" . Login required

router.put("/updatenote/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;
  //Create a newNote object
  try {
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    //Find the Note to be updated and update it

    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server error");
  }
});
//ROUTE 4 : Delete an existing note using  :Delete "/api/notes/deleteNote" . Login required

router.delete("/deletenote/:id", fetchUser, async (req, res) => {
//   const { title, description, tag } = req.body;

  //Find the Note to be updated and update it
  try {
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server error");
  }
});
module.exports = router;
