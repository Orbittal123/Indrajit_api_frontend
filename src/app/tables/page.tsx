"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";
import { useEffect, useState } from 'react';


import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

// export const metadata: Metadata = {
//   title: "Next.js Tables | TailAdmin - Next.js Dashboard Template",
//   description:
//     "This is Next.js Tables page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
// };

const TablesPage = () => {

   const [packageData, setPackageData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const [errorData,seterrorData] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/clw_station_status');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setPackageData(data);
        setFilteredData(data);
        console.log("Fetched data:", data); // Log the fetched data
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  console.log("packgedata" ,packageData);

  const filterData = () => {
    let filtered = packageData;

    if (startDate && !endDate) {
      filtered = filtered.filter(item =>
        new Date(item.v1_end_date) >= new Date(startDate) ||
        new Date(item.v2_end_date) >= new Date(startDate) ||
        new Date(item.welding_end_date) >= new Date(startDate) ||
        new Date(item.fpcb_end_date) >= new Date(startDate)
      );
    } else if (!startDate && endDate) {
      filtered = filtered.filter(item =>
        new Date(item.v1_end_date) <= new Date(endDate) ||
        new Date(item.v2_end_date) <= new Date(endDate) ||
        new Date(item.welding_end_date) <= new Date(endDate) ||
        new Date(item.fpcb_end_date) <= new Date(endDate)
      );
    } else if (startDate && endDate) {
      filtered = filtered.filter(item => {
        const v1EndDate = new Date(item.v1_end_date);
        const v2EndDate = new Date(item.v2_end_date);
        const weldingEndDate = new Date(item.welding_end_date);
        const fpcbEndDate = new Date(item.fpcb_end_date);

        return (
          (v1EndDate >= new Date(startDate) && v1EndDate <= new Date(endDate)) ||
          (v2EndDate >= new Date(startDate) && v2EndDate <= new Date(endDate)) ||
          (weldingEndDate >= new Date(startDate) && weldingEndDate <= new Date(endDate)) ||
          (fpcbEndDate >= new Date(startDate) && fpcbEndDate <= new Date(endDate))
        );
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.module_barcode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset current page to 1 after search
    console.log("Filtered data:", filtered); // Log the filtered data
  };

  const handleSearch = () => {
    filterData();
  };

  const handleRefresh = () => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setFilteredData(packageData);
    setCurrentPage(1); // Reset current page to 1
  };

  const handleButtonClick = async (item, stationName) => {
    const errorCode = item;

    console.log("error code",errorCode);
    
      try {
        const response = await fetch('/api/errordiscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            errorCode,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to send error code');
        }
        const responseData = await response.json(); // Extract response data
        console.log('Response data:', responseData); // Log or handle the response data as needed
        seterrorData(responseData);
      } catch (error) {
        console.error('Error:', error);
        // Handle error
      }
  
    setModalContent({ errorCode, stationName });
    setShowModal(true);
  };
  
  

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  const displayedData = filteredData.slice(
    (currentPage - 1) * entriesToShow,
    currentPage * entriesToShow
  );

  console.log("Displayed data:", displayedData); // Log the displayed data

  console.log("errorData",errorData);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Line 2" />

      <div className="flex flex-col gap-10">
        {/* <TableOne />
        <TableTwo /> */}
{/*         <TableThree /> */}

            <div>
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <div className="flex justify-between mb-4">
            <div className="entries-select">
              <label htmlFor="entries">Show</label>
              <select
                id="entries"
                className="form-select"
                value={entriesToShow}
                onChange={(e) => {
                  setEntriesToShow(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <label htmlFor="entries">entries</label>
            </div>

            <div className="search-input-group">
              <input
                type="date"
                id="startDate"
                className="form-control me-2"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                id="endDate"
                className="form-control me-2"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <button className="btn btn-primary" type="button" onClick={handleSearch}>
                Search
              </button>
            </div>

            <div className="search-input-group">
              <input
                type="text"
                id="searchQuery"
                className="form-control me-2"
                placeholder="Search module barcode"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-primary me-2" type="button" onClick={handleSearch}>
                Search
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={handleRefresh}
              >
                Refresh
              </button>
            </div>
          </div>

          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[2px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                  Sr.No
                </th>
                
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Module Barcode1
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Vision 1
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Vision 2
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Welding
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  FPCB Welding
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((packageItem, key) => (
                <tr key={key}>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                      {key + 1 + (currentPage - 1) * entriesToShow}
                    </h5>
                  </td>
                
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">{packageItem.module_barcode}</p>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <button
                      className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                        packageItem.v1_status === 'OK'
                          ? 'bg-success text-success'
                          : packageItem.v1_status === 'NOT OK'
                          ? 'bg-danger text-danger'
                          : 'bg-warning text-warning'
                      }`}
                      onClick={() => packageItem.v1_status === 'NOT OK' && handleButtonClick(packageItem.v1_error,  'Vision 1')}
                    >
                      {packageItem.v1_status || '-'}
                    </button>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <button
                      className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                        packageItem.v2_status === 'OK'
                          ? 'bg-success text-success'
                          : packageItem.v2_status === 'NOT OK'
                          ? 'bg-danger text-danger'
                          : 'bg-warning text-warning'
                      }`}
                      onClick={() => packageItem.v2_status === 'NOT OK' && handleButtonClick(packageItem.v2_error, 'Vision 2')}
                    >
                      {packageItem.v2_status || '-'}
                    </button>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <button
                      className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                        packageItem.welding_status === 'OK'
                          ? 'bg-success text-success'
                          : packageItem.welding_status === 'NOT OK'
                          ? 'bg-danger text-danger'
                          : 'bg-warning text-warning'
                      }`}
                      onClick={() => packageItem.welding_status === 'NOT OK' && handleButtonClick(packageItem.welding_error, 'Welding')}
                    >
                      {packageItem.welding_status || '-'}
                    </button>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <button
                      className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                        packageItem.fpcb_status === 'OK'
                          ? 'bg-success text-success'
                          : packageItem.fpcb_status === 'NOT OK'
                          ? 'bg-danger text-danger'
                          : 'bg-warning text-warning'
                      }`}
                      onClick={() => packageItem.fpcb_status === 'NOT OK' && handleButtonClick(packageItem.fpcb_error, 'FPCB Welding')}
                    >
                      
                      {packageItem.fpcb_status || '-'}
                    </button>
                  </td>
                </tr>
        
              ))}
            </tbody>

         

          </table>

           <div className="flex justify-between items-center mt-4">
  <p className="text-sm text-gray-600">
    Showing {filteredData.length > 0 ? (currentPage - 1) * entriesToShow + 1 : 0} to{" "}
    {Math.min(currentPage * entriesToShow, filteredData.length)} of {filteredData.length} entries
  </p>

  <div className="flex space-x-2">
    <button
      className="px-3 py-1 border rounded-md"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(currentPage - 1)}
    >
      Previous
    </button>

    {[...Array(Math.ceil(filteredData.length / entriesToShow)).keys()].map((page) => (
      <button
        key={page + 1}
        className={`px-3 py-1 border rounded-md ${currentPage === page + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        onClick={() => setCurrentPage(page + 1)}
      >
        {page + 1}
      </button>
    ))}

    <button
      className="px-3 py-1 border rounded-md"
      disabled={currentPage === Math.ceil(filteredData.length / entriesToShow)}
      onClick={() => setCurrentPage(currentPage + 1)}
    >
      Next
    </button>
  </div>
</div>
        </div>
      </div>

      {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
    <div className="bg-white p-6 rounded shadow-lg w-96 h-128">
      <h2 className="text-xl font-bold mb-4">{modalContent.stationName}</h2>
      {errorData.map((error, index) => (
        <div key={index}>
          <p><strong>Error Code:</strong> {error.error_code}</p>
          <p><strong>Error Description:</strong> {error.error_discription}</p>
        </div>
      ))}
      <button onClick={closeModal} className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4">Close</button>
    </div>
  </div>
)}


    </div>
          <TableOne />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
