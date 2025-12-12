import { useState } from "react";
import resourceApi from "../api/resourceApi";

function UploadResourcePage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title);

    try {
      const res = await resourceApi.uploadResource(fd);
      alert("Uploaded successfully!");
      console.log(res);
    } catch (err) {
      alert("Upload failed");
      console.log(err);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input
        type="text"
        placeholder="Resource Title"
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button type="submit">Upload</button>
    </form>
  );
}

export default UploadResourcePage;
