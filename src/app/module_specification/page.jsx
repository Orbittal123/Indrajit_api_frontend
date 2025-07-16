"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import Header1 from "@/components/Header";

const apiBase = "http://10.5.0.20:5501/api/module-specifications";

const ModuleTable = () => {
  const [modules, setModules] = useState([]);
  const [modalData, setModalData] = useState({ id: null, module_code: "", cell_count: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [noOfModules, setNoOfModules] = useState("");

  const fetchData = async () => {
    try {
      const res = await axios.get(apiBase);
      setModules(res.data);
    } catch {
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch modules",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: 'bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800',
        },
        buttonsStyling: false,
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this module?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: 'bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700',
        cancelButton: 'bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 ml-2',
      },
      buttonsStyling: false,
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${apiBase}/${id}`);
        Swal.fire("Deleted!", "Module deleted successfully.", "success");
        fetchData();
      } catch {
        Swal.fire("Error!", "Failed to delete module", "error");
      }
    }
  };

  const openModal = (item = { sr_no: null, module_code: "", cell_count: "" }) => {
    setModalData({
      id: item.sr_no || null,
      module_code: item.module_code || "",
      cell_count: item.cell_count || "",
    });
    setIsEditing(!!item.sr_no);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalData({ id: null, module_code: "", cell_count: "" });
  };

  const saveData = async () => {
    const { module_code, cell_count, id } = modalData;

    if (!module_code || !cell_count || isNaN(cell_count)) {
      return Swal.fire("Validation", "All fields are required and valid", "warning");
    }

    try {
      if (isEditing) {
        await axios.put(`${apiBase}/${id}`, { module_code, cell_count });
        Swal.fire("Updated!", "Module updated successfully", "success");
      } else {
        await axios.post(apiBase, { module_code, cell_count });
        Swal.fire("Saved!", "Module added successfully", "success");
      }

      closeModal();
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong";
      Swal.fire("Error!", msg, "error");
    }
  };

  const selectModule = async (e) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;

    try {
      await axios.put("http://10.5.0.20:5501/api/update-module-count", {
        no_of_modules: selectedValue,
      });
      Swal.fire("Updated!", `Module count updated to ${selectedValue}`, "success");
      fetchData();
    } catch {
      Swal.fire("Error!", "Failed to update module count", "error");
    }
  };

  const fetchModuleCount = async () => {
    try {
      const res = await axios.get("http://10.5.0.20:5501/api/get-module-count");
      if (res.data && res.data.no_of_modules) {
        setNoOfModules(res.data.no_of_modules.toString());
      }
    } catch {
      Swal.fire("Error!", "Failed to fetch module count", "error");
    }
  };

  useEffect(() => {
    fetchModuleCount();
  }, []);

  return (
    <>
      <Header1 sidebarOpen={undefined} setSidebarOpen={() => {}} />
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Module Specifications</h2>

          <div className="flex items-center gap-4">
            <select
              className="border border-gray-300 rounded px-3 py-2"
              onChange={selectModule}
              value={noOfModules}
            >
              <option value="" disabled>
                Select Number of Modules to Run
              </option>
              {[1, 2].map((num) => (
                <option key={num} value={num.toString()}>
                  {num}
                </option>
              ))}
            </select>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => openModal()}
            >
              + Create
            </button>
          </div>
        </div>

        <div className="overflow-x-auto shadow rounded border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-700">Module Type</th>
                <th className="px-6 py-3 font-medium text-gray-700">Cell Count</th>
                <th className="px-6 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((mod) => (
                <tr key={mod.sr_no} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{mod.module_code}</td>
                  <td className="px-6 py-3">{mod.cell_count}</td>
                  <td className="px-6 py-3 flex gap-2">
                    <button className="text-yellow-600 hover:text-yellow-800" onClick={() => openModal(mod)}>
                      <FaEdit />
                    </button>
                    <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(mod.sr_no)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {modules.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">{isEditing ? "Edit Module" : "Create Module"}</h3>
              <label className="block text-sm mb-1">Module Type</label>
              <input
                type="text"
                className="w-full mb-3 p-2 border rounded"
                placeholder="Module Type"
                value={modalData.module_code}
                onChange={(e) => setModalData({ ...modalData, module_code: e.target.value })}
              />
              <label className="block text-sm mb-1">Cell Count</label>
              <input
                type="number"
                className="w-full mb-3 p-2 border rounded"
                placeholder="Cell Count"
                value={modalData.cell_count}
                onChange={(e) => setModalData({ ...modalData, cell_count: e.target.value })}
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={saveData}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ModuleTable;
