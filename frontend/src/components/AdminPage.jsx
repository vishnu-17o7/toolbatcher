import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../style";
import FeedbackList from "./admin/FeedbackList";

const AdminPage = () => {
  const [tools, setTools] = useState([]);
  const [newTool, setNewTool] = useState({
    toolName: "",
    versions: "",
    commands: { linux: "", macos: "", windows: "" },
  });
  const [editingTool, setEditingTool] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/tools");
      setTools(response.data);
    } catch (error) {
      console.error("Error fetching tools:", error);
      setError("Failed to fetch tools");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setNewTool((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setNewTool((prev) => ({
        ...prev,
        [name]: name === "versions" ? value.split(",") : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTool) {
        await axios.put(
          `http://localhost:3002/api/tools/${editingTool._id}`,
          newTool
        );
      } else {
        await axios.post("http://localhost:3002/api/tools", newTool);
      }
      fetchTools();
      setNewTool({
        toolName: "",
        versions: "",
        commands: { linux: "", macos: "", windows: "" },
      });
      setEditingTool(null);
    } catch (error) {
      console.error("Error saving tool:", error);
      setError("Failed to save tool");
    }
  };

  const handleEdit = (tool) => {
    setEditingTool(tool);
    setNewTool({
      ...tool,
      versions: tool.versions.join(","),
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3002/api/tools/${id}`);
      fetchTools();
    } catch (error) {
      console.error("Error deleting tool:", error);
      setError("Failed to delete tool");
    }
  };

  return (
    <div
      className={`${styles.flexCenter} ${styles.marginY} ${styles.padding} flex-col bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-lg`}
    >
      <h2 className={`${styles.heading2} text-white mb-8`}>Admin Dashboard</h2>
      {error && <p className="text-red-500 mt-2">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg mt-5 bg-white p-8 rounded-lg shadow-md"
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {editingTool ? "Edit Tool" : "Add New Tool"}
        </h3>
        <input
          type="text"
          name="toolName"
          value={newTool.toolName}
          onChange={handleInputChange}
          placeholder="Tool Name"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
          required
        />
        <input
          type="text"
          name="versions"
          value={newTool.versions}
          onChange={handleInputChange}
          placeholder="Versions (comma-separated)"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
        />
        <input
          type="text"
          name="commands.linux"
          value={newTool.commands.linux}
          onChange={handleInputChange}
          placeholder="Linux Command"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
          required
        />
        <input
          type="text"
          name="commands.macos"
          value={newTool.commands.macos}
          onChange={handleInputChange}
          placeholder="macOS Command"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
          required
        />
        <input
          type="text"
          name="commands.windows"
          value={newTool.commands.windows}
          onChange={handleInputChange}
          placeholder="Windows Command"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
          required
        />

        <button
          type="submit"
          className="w-full p-3 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
        >
          {editingTool ? "Update Tool" : "Add Tool"}
        </button>
      </form>

      <div className="w-full mt-10">
        <h3 className={`${styles.heading3} text-white`}>Existing Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {tools.map((tool) => (
            <div
              key={tool._id}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 rounded-lg shadow-lg"
            >
              <h4 className="text-lg font-semibold text-white">
                {tool.toolName}
              </h4>
              <p className="text-sm text-gray-200 mt-1">
                Versions: {tool.versions.join(", ")}
              </p>
              <div className="flex mt-3 space-x-2">
                <button
                  onClick={() => handleEdit(tool)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tool._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FeedbackList />
    </div>
  );
};

export default AdminPage;
