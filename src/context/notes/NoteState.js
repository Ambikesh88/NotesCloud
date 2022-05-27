import NoteContext from  "./noteContext";
import { useState } from "react";

 const NoteState=(props)=>{
     const host = "http://localhost:5000"
  const notesInitial = []
  
  const [notes,setNotes] = useState(notesInitial)

  //Fetch all Notes
  const getNotes=async()=>{
    //Todo API Call
    const response = await fetch(`${host}/api/notes/fetchallnotes `, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        'auth-token' : localStorage.getItem('token')
      },
     
    });
    const json = await response.json();
    console.log(json)
    
       setNotes(json);
 
  }
  



  //Add a Note 

      const addNote=async(title,description,tag)=>{
          //Todo API Call
          const response = await fetch(`${host}/api/notes/addnote`, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'auth-token' : localStorage.getItem('token')
            },
           
            body: JSON.stringify({title,description,tag}) // body data type must match "Content-Type" header
          });
          const note= await response.json(); 
           setNotes(notes.concat(note));
        }
  //Delete a Note
      const deleteNote=async(id)=>{
        const response = await fetch(`${host}/api/notes/deletenote/${id} `, {
        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          'auth-token' : localStorage.getItem('token')
        },
       
      });
      const json= response.json(); 
      console.log(json);
        console.log("Deleting the note with id" + id)
        const newNotes = notes.filter((note)=>{return note._id!==id})
        setNotes(newNotes)
      }

  //Edit a note
       const editNote=async (id,title,description,tag)=>{
           //API CALL
           
            // Default options are marked with *

            const response = await fetch(`${host}/api/notes/updatenote/${id} `, {
              method: 'PUT', // *GET, POST, PUT, DELETE, etc.
              headers: {
                'Content-Type': 'application/json',
                'auth-token' : localStorage.getItem('token')
              },
             
              body: JSON.stringify({title,description,tag}) // body data type must match "Content-Type" header
            });
             // parses JSON response into native JavaScript objects
            const json= response.json(); 
            console.log(json);

            let newnotes = JSON.parse(JSON.stringify(notes));
           //Logic to edit the note
           for (let index=0;index<notes.length;index++)
           {
               const element=newnotes[index];
               if(element._id===id){
                newnotes[index].title=title;
                newnotes[index].description=description;
                newnotes[index].tag = tag;
                break;
               }
           }
           setNotes(newnotes);
       }

return (
    <NoteContext.Provider value ={{notes,addNote,deleteNote,editNote,getNotes}} >
        {props.children}
    </NoteContext.Provider>
)
  
}

export default NoteState;