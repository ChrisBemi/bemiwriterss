import JSZip from "jszip";
import axios from "axios";
const handleDownloadAllFiles = async (files, subject, name) => {
  const zip = new JSZip();

  try {
    const promises = files.map(async (file) => {
      const url = `${file.downloadURL}`;
      try {
        const response = await axios.get(url, {
          responseType: "arraybuffer",
        });
        if (response.data) {
          zip.file(file.fileName, response.data);
        } else {
          console.error(`Empty response for file ${file.fileName}`);
        }
      } catch (error) {
        console.error(`Error fetching file ${file.fileName}:`, error);
        // Handle error or notify the user
      }
    });

    await Promise.all(promises);

    zip.generateAsync({ type: "blob" }).then((content) => {
      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.setAttribute("download", `${subject}_${name}_assignment_files.zip`);

      // Append the anchor element to the body and trigger the download
      document.body.appendChild(link);
      link.click();

      // Clean up: remove the temporary anchor element
      document.body.removeChild(link);
    });
  } catch (error) {
    console.error("Error creating zip file:", error);
    // Handle zip generation error or notify the user
  }
};
export default handleDownloadAllFiles;
