import React, { useState, useEffect } from "react";
import styles from "../style";
import FeedbackList from "./admin/FeedbackList";
import api from "../lib/api";

const AdminPage = () => {
  const [tools, setTools] = useState([]);
  const [newTool, setNewTool] = useState({
    toolName: "",
    versions: "",
    commands: { linux: "", macos: "", windows: "" },
    sourceType: "manual", // Default sourceType
    sourceIdentifier: "",
    latestVersion: "", // Although not directly editable, include for consistency
  });
  const [editingTool, setEditingTool] = useState(null);
  const [error, setError] = useState("");
  const [updateStatus, setUpdateStatus] = useState(""); // For update feedback
  const [installAudit, setInstallAudit] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await api.get("/tools");
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
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newTool,
        versions: String(newTool.versions || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      };

      if (editingTool) {
        await api.put(`/tools/${editingTool._id}`, payload);
      } else {
        await api.post("/tools", payload);
      }
      fetchTools();
      setNewTool({ // Reset form including new fields
        toolName: "",
        versions: "",
        commands: { linux: "", macos: "", windows: "" },
        sourceType: "manual",
        sourceIdentifier: "",
        latestVersion: "",
      });
      setEditingTool(null);
    } catch (error) {
      console.error("Error saving tool:", error);
      setError("Failed to save tool");
    }
  };

  const handleEdit = (tool) => {
    setEditingTool(tool);
    // Ensure all fields, including new ones, are populated when editing
    setNewTool({
      toolName: tool.toolName || "",
      versions: tool.versions ? tool.versions.join(",") : "",
      commands: tool.commands || { linux: "", macos: "", windows: "" },
      sourceType: tool.sourceType || "manual",
      sourceIdentifier: tool.sourceIdentifier || "",
      latestVersion: tool.latestVersion || "", // Include latestVersion if present
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tools/${id}`);
      fetchTools();
    } catch (error) {
      console.error("Error deleting tool:", error);
      setError("Failed to delete tool");
    }
  };

  // Function to trigger the backend update script
  const handleCheckForUpdates = async () => {
    setUpdateStatus("Initiating version check...");
    setError(""); // Clear previous errors
    try {
      const response = await api.post("/tools/update-versions");
      setUpdateStatus(response.data.message || "Update process started. Check server logs for details.");
      // Optionally, refetch tools after a delay to see updates, though the script runs async
      // setTimeout(fetchTools, 5000); // Example: Refetch after 5 seconds
    } catch (error) {
      console.error("Error triggering update check:", error);
      const errorMessage = error.response?.data?.message || "Failed to start update process.";
      setError(errorMessage);
      setUpdateStatus(""); // Clear status message on error
    }
  };

  const fetchInstallAudit = async () => {
    setAuditLoading(true);
    try {
      const response = await api.get("/tools/install-sessions/audit", {
        params: { limit: 20 },
      });
      setInstallAudit(response.data?.sessions || []);
    } catch (auditError) {
      console.error("Error loading install audit:", auditError);
      setError("Failed to fetch install audit logs");
    } finally {
      setAuditLoading(false);
    }
  };

  return (
    <div
      className={`${styles.flexCenter} ${styles.marginY} ${styles.padding} flex-col bg-black-gradient-2 rounded-2xl shadow-lg`}
    >
      <h2 className={`${styles.heading2} text-white mb-8`}>Admin Dashboard</h2>
      {error && (
        <p className="text-red-300 mt-2" role="alert" aria-live="assertive">{error}</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg mt-5 bg-white p-8 rounded-lg shadow-md"
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {editingTool ? "Edit Tool" : "Add New Tool"}
        </h3>
        <label htmlFor="toolName" className="block text-sm font-semibold text-gray-700 mb-1">Tool Name</label>
        <input
          id="toolName"
          type="text"
          name="toolName"
          value={newTool.toolName}
          onChange={handleInputChange}
          placeholder="Tool Name"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
          required
        />
        <label htmlFor="versions" className="block text-sm font-semibold text-gray-700 mb-1">Versions</label>
        <input
          id="versions"
          type="text"
          name="versions"
          value={newTool.versions}
          onChange={handleInputChange}
          placeholder="Versions (comma-separated)"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
        />
        <label htmlFor="commandLinux" className="block text-sm font-semibold text-gray-700 mb-1">Linux Command</label>
        <input
          id="commandLinux"
          type="text"
          name="commands.linux"
          value={newTool.commands.linux}
          onChange={handleInputChange}
          placeholder="Linux Command"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
          required
        />
        <label htmlFor="commandMacos" className="block text-sm font-semibold text-gray-700 mb-1">macOS Command</label>
        <input
          id="commandMacos"
          type="text"
          name="commands.macos"
          value={newTool.commands.macos}
          onChange={handleInputChange}
          placeholder="macOS Command"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
          required
        />
        <label htmlFor="commandWindows" className="block text-sm font-semibold text-gray-700 mb-1">Windows Command</label>
        <input
          id="commandWindows"
          type="text"
          name="commands.windows"
          value={newTool.commands.windows}
          onChange={handleInputChange}
          placeholder="Windows Command"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
      required
    />
    {/* Source Type Dropdown */}
    <label htmlFor="sourceType" className="block text-sm font-semibold text-gray-700 mb-1">Source Type</label>
    <select
      id="sourceType"
      name="sourceType"
      value={newTool.sourceType}
      onChange={handleInputChange}
      className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
    >
      <option value="manual">Manual</option>
      <option value="npm">NPM</option>
      <option value="pypi">PyPI</option>
      <option value="github">GitHub Releases</option>
      <option value="homebrew">Homebrew</option>
      <option value="winget">Winget</option>
    </select>
    {/* Source Identifier Input */}
    <label htmlFor="sourceIdentifier" className="block text-sm font-semibold text-gray-700 mb-1">Source Identifier</label>
    <input
      id="sourceIdentifier"
      type="text"
      name="sourceIdentifier"
      value={newTool.sourceIdentifier}
      onChange={handleInputChange}
      placeholder="Source Identifier (e.g., package name, URL)"
      className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
      // Conditionally required if sourceType is not 'manual'
      required={newTool.sourceType !== 'manual'}
    />

    <button
      type="submit"
      className="focus-ring w-full p-3 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {editingTool ? "Update Tool" : "Add Tool"}
        </button>
      </form>

      {/* Add a button to trigger the update check */}
      <div className="w-full max-w-lg mt-5">
        <button
          type="button"
          onClick={handleCheckForUpdates} // Attach the handler
          className="focus-ring w-full p-3 text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Check All Tools for Updates
        </button>
        {updateStatus && <p className="text-green-300 mt-2" role="status" aria-live="polite">{updateStatus}</p>}

        <button
          type="button"
          onClick={fetchInstallAudit}
          className="focus-ring w-full p-3 mt-3 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          {auditLoading ? "Loading Install Audit..." : "Load Install Audit Logs"}
        </button>

        {installAudit.length > 0 && (
          <div className="mt-3 bg-black/30 rounded-md p-3 text-sm text-white max-h-72 overflow-auto">
            {installAudit.map((entry) => (
              <div key={entry.token} className="border-b border-white/10 py-2">
                <p>Token: {entry.token}</p>
                <p>Status: {entry.status || 'pending'}</p>
                <p>OS: {entry.os || 'unknown'}</p>
                <p>Created: {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'N/A'}</p>
                <p>Events: {Array.isArray(entry.events) ? entry.events.length : 0}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full mt-10">
        <h3 className={`${styles.heading3} text-white`}>Existing Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {tools.map((tool) => (
            <div
              key={tool._id}
              className="bg-black-gradient-2 p-5 rounded-lg shadow-lg"
            >
              <h4 className="text-lg font-semibold text-white">
                {tool.toolName}
              </h4>
              <p className="text-sm text-gray-200 mt-1">
                Versions: {tool.versions ? tool.versions.join(", ") : 'N/A'}
              </p>
              {/* Display new fields */}
              <p className="text-xs text-gray-300 mt-1">
                Source: {tool.sourceType || 'manual'} ({tool.sourceIdentifier || 'N/A'})
              </p>
              {tool.latestVersion && (
                <p className="text-xs text-yellow-300 mt-1">
                  Latest Detected: {tool.latestVersion}
                </p>
              )}
              <div className="flex mt-3 space-x-2">
                <button
                  onClick={() => handleEdit(tool)}
                  className="focus-ring px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tool._id)}
                  className="focus-ring px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
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
