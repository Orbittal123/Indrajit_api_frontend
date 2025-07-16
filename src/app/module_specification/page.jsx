"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import Header1 from "@/components/Header";

const apiBase = "http://10.5.0.20:5501/api/module-specifications";
// http://10.5.0.20:5501/api/api/CountAll
const ModuleTable = () => {
  const [modules, setModules] = useState([]);
  const [modalData, setModalData] = useState({ id: null, module_type: "", cell_count: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [noOfModules, setNoOfModules] = useState("")

  const fetchData = async () => {
    try {
      const res = await axios.get(apiBase);
      setModules(res.data);
    } catch {
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch modules",
        icon: "error",
        showConfirmButton: true,
        confirmButtonText: "OK",
        customClass: {
          confirmButton: 'bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800',
        },
        buttonsStyling: false, // required to apply Tailwind styles
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
        confirmButton: 'bg-red-600 text-white font-semibold px-4 py-2 rounded hover:bg-red-700',
        cancelButton: 'bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded hover:bg-gray-400 ml-2',
      },
      buttonsStyling: false,
    });


    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${apiBase}/${id}`);
        Swal.fire({
          title: "Deleted!",
          text: "Module deleted successfully.",
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: 'bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700',
          },
          buttonsStyling: false,
        });

        fetchData();
      } catch {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete module",
          icon: "error",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: 'bg-red-600 text-white font-semibold px-4 py-2 rounded hover:bg-red-700',
          },
          buttonsStyling: false,
        });

      }
    }
  };

  const openModal = (item = { id: null, module_type: "", cell_count: "" }) => {
    setModalData(item);
    setIsEditing(!!item.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalData({ id: null, module_type: "", cell_count: "" });
  };

  const saveData = async () => {
    if (!modalData.module_type || !modalData.cell_count) {
      return Swal.fire({
        title: "Validation",
        text: "All fields are required",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: 'bg-yellow-500 text-white font-semibold px-4 py-2 rounded hover:bg-yellow-600',
        },
        buttonsStyling: false,
      });

    }

    try {
      if (isEditing) {
        await axios.put(`${apiBase}/${modalData.id}`, modalData);
        Swal.fire({
          title: "Updated!",
          text: "Module updated successfully",
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: 'bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700',
          },
          buttonsStyling: false,
        });

      } else {
        await axios.post(apiBase, modalData);
        Swal.fire({
          title: "Saved!",
          text: "Module added successfully",
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: 'bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700',
          },
          buttonsStyling: false,
        });

      }
      closeModal();
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong";
      Swal.fire({
        title: "Error!",
        text: msg,
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: 'bg-red-600 text-white font-semibold px-4 py-2 rounded hover:bg-red-700',
        },
        buttonsStyling: false,
      });

    }
  };


  const selectModule = async (e) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;

    try {
      await axios.put("http://10.5.0.20:5501/api/update-module-count", {
        no_of_modules: selectedValue,
      });
      Swal.fire({
        title: "Updated!",
        text: `Module count updated to ${selectedValue}`,
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: 'bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700',
        },
        buttonsStyling: false,
      });

      fetchData();
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch modules",
        icon: "error",
        showConfirmButton: true,
        confirmButtonText: "OK",
        customClass: {
          confirmButton: 'bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800',
        },
        buttonsStyling: false,
      });



    }
  };


  // Fetch current no_of_modules on mount
  const fetchModuleCount = async () => {
    try {
      const res = await axios.get("http://10.5.0.20:5501/api/get-module-count");
      if (res.data && res.data.no_of_modules) {
        setNoOfModules(res.data.no_of_modules.toString()); // make sure it's string for select value
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch module count",
        icon: "error",
        showConfirmButton: true,
        confirmButtonText: "OK",
        customClass: {
          confirmButton: 'bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800',
        },
        buttonsStyling: false, // required to apply Tailwind styles
      });
    }
  };

  useEffect(() => {
    fetchModuleCount();
  }, []);

  return (
    <>
      <Header1 sidebarOpen={undefined} setSidebarOpen={function (arg0) {
        throw new Error("Function not implemented.");
      }} />
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Module Specifications</h2>

          <div className="flex items-center gap-4">
            {/* Dropdown */}
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

            {/* Create Button */}
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
                <tr key={mod.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{mod.module_type}</td>
                  <td className="px-6 py-3">{mod.cell_count}</td>
                  <td className="px-6 py-3 flex gap-2">
                    <button
                      className="text-yellow-600 hover:text-yellow-800"
                      onClick={() => openModal(mod)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(mod.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {modules.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">{isEditing ? "Edit" : "Create"} Module</h3>
              <input
                type="text"
                className="w-full mb-3 p-2 border rounded"
                placeholder="Module Type"
                value={modalData.module_type}
                onChange={(e) => setModalData({ ...modalData, module_type: e.target.value })}
              />
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
