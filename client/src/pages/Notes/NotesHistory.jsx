import { useEffect, useState } from "react";
import API from "../services/api";

function NotesHistory() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/notes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotes(res.data.notes);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h1>Notes History</h1>

      {notes.map((note) => (
        <div key={note._id}>
          <h3>{note.title}</h3>
          <p>{note.content.substring(0, 200)}...</p>
        </div>
      ))}
    </div>
  );
}

export default NotesHistory;