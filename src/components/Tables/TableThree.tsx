// "use client";

// import { useEffect, useState } from 'react';

// const TableThree = () => {
//   const [packageData, setPackageData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [entriesToShow, setEntriesToShow] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');

//   const [showModal, setShowModal] = useState(false);
//   const [modalContent, setModalContent] = useState(null);

//   const [errorData,seterrorData] = useState("");

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch('/api/clw_station_status');
//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }
//         const data = await response.json();
//         setPackageData(data);
//         setFilteredData(data);
//         console.log("Fetched data:", data); // Log the fetched data
//       } catch (error) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);


//   console.log("packgedata" ,packageData);

//   const filterData = () => {
//     let filtered = packageData;

//     if (startDate && !endDate) {
//       filtered = filtered.filter(item =>
//         new Date(item.v1_end_date) >= new Date(startDate) ||
//         new Date(item.v2_end_date) >= new Date(startDate) ||
//         new Date(item.welding_end_date) >= new Date(startDate) ||
//         new Date(item.fpcb_end_date) >= new Date(startDate)
//       );
//     } else if (!startDate && endDate) {
//       filtered = filtered.filter(item =>
//         new Date(item.v1_end_date) <= new Date(endDate) ||
//         new Date(item.v2_end_date) <= new Date(endDate) ||
//         new Date(item.welding_end_date) <= new Date(endDate) ||
//         new Date(item.fpcb_end_date) <= new Date(endDate)
//       );
//     } else if (startDate && endDate) {
//       filtered = filtered.filter(item => {
//         const v1EndDate = new Date(item.v1_end_date);
//         const v2EndDate = new Date(item.v2_end_date);
//         const weldingEndDate = new Date(item.welding_end_date);
//         const fpcbEndDate = new Date(item.fpcb_end_date);

//         return (
//           (v1EndDate >= new Date(startDate) && v1EndDate <= new Date(endDate)) ||
//           (v2EndDate >= new Date(startDate) && v2EndDate <= new Date(endDate)) ||
//           (weldingEndDate >= new Date(startDate) && weldingEndDate <= new Date(endDate)) ||
//           (fpcbEndDate >= new Date(startDate) && fpcbEndDate <= new Date(endDate))
//         );
//       });
//     }

//     if (searchQuery) {
//       filtered = filtered.filter(item =>
//         item.module_barcode.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     setFilteredData(filtered);
//     setCurrentPage(1); // Reset current page to 1 after search
//     console.log("Filtered data:", filtered); // Log the filtered data
//   };

//   const handleSearch = () => {
//     filterData();
//   };

//   const handleRefresh = () => {
//     setStartDate('');
//     setEndDate('');
//     setSearchQuery('');
//     setFilteredData(packageData);
//     setCurrentPage(1); // Reset current page to 1
//   };

//   const handleButtonClick = async (item, stationName) => {
//     const errorCode = item;

//     console.log("error code",errorCode);
    
//       try {
//         const response = await fetch('/api/errordiscription', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             errorCode,
//           }),
//         });
//         if (!response.ok) {
//           throw new Error('Failed to send error code');
//         }
//         const responseData = await response.json(); // Extract response data
//         console.log('Response data:', responseData); // Log or handle the response data as needed
//         seterrorData(responseData);
//       } catch (error) {
//         console.error('Error:', error);
//         // Handle error
//       }
  
//     setModalContent({ errorCode, stationName });
//     setShowModal(true);
//   };
  
  

//   const closeModal = () => {
//     setShowModal(false);
//     setModalContent(null);
//   };

//   const displayedData = filteredData.slice(
//     (currentPage - 1) * entriesToShow,
//     currentPage * entriesToShow
//   );

//   console.log("Displayed data:", displayedData); // Log the displayed data

//   console.log("errorData",errorData);

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (error) {
//     return <p>Error: {error}</p>;
//   }


//   // Calculate total pages
//   const totalPages = Math.ceil(filteredData.length / entriesToShow);

//   // Generate page numbers for pagination
//   const getPageNumbers = () => {
//     const pages = [];
//     const maxVisiblePages = 5; // Maximum number of visible page buttons
    
//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i);
//       }
//     } else {
//       const halfVisible = Math.floor(maxVisiblePages / 2);
//       let start = Math.max(currentPage - halfVisible, 1);
//       let end = Math.min(start + maxVisiblePages - 1, totalPages);

//       if (end - start + 1 < maxVisiblePages) {
//         start = Math.max(end - maxVisiblePages + 1, 1);
//       }

//       if (start > 1) {
//         pages.push(1);
//         if (start > 2) {
//           pages.push('...');
//         }
//       }

//       for (let i = start; i <= end; i++) {
//         if (i !== 1 && i !== totalPages) {
//           pages.push(i);
//         }
//       }

//       if (end < totalPages) {
//         if (end < totalPages - 1) {
//           pages.push('...');
//         }
//         pages.push(totalPages);
//       }
//     }

//     return pages;
//   };

//   return (
//     <div>
//       <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
//         <div className="max-w-full overflow-x-auto">
//           <div className="flex justify-between mb-4">
//             <div className="entries-select">
//               <label htmlFor="entries">Show</label>
//               <select
//                 id="entries"
//                 className="form-select"
//                 value={entriesToShow}
//                 onChange={(e) => {
//                   setEntriesToShow(Number(e.target.value));
//                   setCurrentPage(1);
//                 }}
//               >
//                 <option value={5}>5</option>
//                 <option value={10}>10</option>
//                 <option value={25}>25</option>
//                 <option value={50}>50</option>
//                 <option value={100}>100</option>
//                 <option value={500}>500</option>
//               </select>
//               <label htmlFor="entries">entries</label>
//             </div>

//             <div className="search-input-group">
//               <input
//                 type="date"
//                 id="startDate"
//                 className="form-control me-2"
//                 placeholder="Start Date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//               />
//               <input
//                 type="date"
//                 id="endDate"
//                 className="form-control me-2"
//                 placeholder="End Date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//               />
//               <button className="btn btn-primary" type="button" onClick={handleSearch}>
//                 Search
//               </button>
//             </div>

//             <div className="search-input-group">
//               <input
//                 type="text"
//                 id="searchQuery"
//                 className="form-control me-2"
//                 placeholder="Search module barcode"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//               <button className="btn btn-primary me-2" type="button" onClick={handleSearch}>
//                 Search
//               </button>
//               <button
//                 className="btn btn-secondary"
//                 type="button"
//                 onClick={handleRefresh}
//               >
//                 Refresh
//               </button>
//             </div>
//           </div>

//           <table className="w-full table-auto">
//             <thead>
//               <tr className="bg-gray-2 text-left dark:bg-meta-4">
//                 <th className="min-w-[2px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
//                   #
//                 </th>
                
//                 <th className="px-4 py-4 font-medium text-black dark:text-white">
//                   Module Barcode
//                 </th>
//                 <th className="px-4 py-4 font-medium text-black dark:text-white">
//                   Vision 1
//                 </th>
//                 <th className="px-4 py-4 font-medium text-black dark:text-white">
//                   Vision 2
//                 </th>
//                 <th className="px-4 py-4 font-medium text-black dark:text-white">
//                   Welding
//                 </th>
//                 <th className="px-4 py-4 font-medium text-black dark:text-white">
//                   FPCB Welding
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {displayedData.map((packageItem, key) => (
//                 <tr key={key}>
//                   <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark xl:pl-11">
//                     <h5 className="font-medium text-black dark:text-white">
//                       {key + 1 + (currentPage - 1) * entriesToShow}
//                     </h5>
//                   </td>
                
//                   <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
//                     <p className="text-black dark:text-white">{packageItem.module_barcode}</p>
//                   </td>
//                   <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
//                     <button
//                       className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
//                         packageItem.v1_status === 'OK'
//                           ? 'bg-success text-success'
//                           : packageItem.v1_status === 'NOT OK'
//                           ? 'bg-danger text-danger'
//                           : 'bg-warning text-warning'
//                       }`}
//                       onClick={() => packageItem.v1_status === 'NOT OK' && handleButtonClick(packageItem.v1_error,  'Vision 1')}
//                     >
//                       {packageItem.v1_status || '-'}
//                     </button>
//                   </td>
//                   <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
//                     <button
//                       className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
//                         packageItem.v2_status === 'OK'
//                           ? 'bg-success text-success'
//                           : packageItem.v2_status === 'NOT OK'
//                           ? 'bg-danger text-danger'
//                           : 'bg-warning text-warning'
//                       }`}
//                       onClick={() => packageItem.v2_status === 'NOT OK' && handleButtonClick(packageItem.v2_error, 'Vision 2')}
//                     >
//                       {packageItem.v2_status || '-'}
//                     </button>
//                   </td>
//                   <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
//                     <button
//                       className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
//                         packageItem.welding_status === 'OK'
//                           ? 'bg-success text-success'
//                           : packageItem.welding_status === 'NOT OK'
//                           ? 'bg-danger text-danger'
//                           : 'bg-warning text-warning'
//                       }`}
//                       onClick={() => packageItem.welding_status === 'NOT OK' && handleButtonClick(packageItem.welding_error, 'Welding')}
//                     >
//                       {packageItem.welding_status || '-'}
//                     </button>
//                   </td>
//                   <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
//                     <button
//                       className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
//                         packageItem.fpcb_status === 'OK'
//                           ? 'bg-success text-success'
//                           : packageItem.fpcb_status === 'NOT OK'
//                           ? 'bg-danger text-danger'
//                           : 'bg-warning text-warning'
//                       }`}
//                       onClick={() => packageItem.fpcb_status === 'NOT OK' && handleButtonClick(packageItem.fpcb_error, 'FPCB Welding')}
//                     >
                      
//                       {packageItem.fpcb_status || '-'}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>


//       {/* Improved Pagination controls */}
//       <div className="flex items-center justify-between mt-4 p-4 bg-white dark:bg-boxdark rounded-sm border border-stroke dark:border-strokedark">
//         <div className="text-sm text-gray-600 dark:text-gray-300">
//           Showing <span className="font-medium">{(currentPage - 1) * entriesToShow + 1}</span> to{' '}
//           <span className="font-medium">{Math.min(currentPage * entriesToShow, filteredData.length)}</span> of{' '}
//           <span className="font-medium">{filteredData.length}</span> entries
//         </div>
        
//         <div className="flex items-center space-x-1">
//           <button
//             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             className={`px-3 py-1 rounded-md border ${
//               currentPage === 1 
//                 ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed' 
//                 : 'bg-white dark:bg-boxdark text-primary dark:text-primary-dark border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-800'
//             }`}
//           >
//             Previous
//           </button>
          
//           {getPageNumbers().map((page, index) => (
//             <button
//               key={index}
//               onClick={() => typeof page === 'number' && setCurrentPage(page)}
//               className={`px-3 py-1 rounded-md border ${
//                 currentPage === page 
//                   ? 'bg-primary dark:bg-primary-dark text-white border-primary dark:border-primary-dark' 
//                   : 'bg-white dark:bg-boxdark border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-800'
//               } ${page === '...' ? 'cursor-default' : 'cursor-pointer'}`}
//               disabled={page === '...'}
//             >
//               {page}
//             </button>
//           ))}
          
//           <button
//             onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//             disabled={currentPage === totalPages}
//             className={`px-3 py-1 rounded-md border ${
//               currentPage === totalPages 
//                 ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed' 
//                 : 'bg-white dark:bg-boxdark text-primary dark:text-primary-dark border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-800'
//             }`}
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       {showModal && (
//   <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
//     <div className="bg-white p-6 rounded shadow-lg w-96 h-128">
//       <h2 className="text-xl font-bold mb-4">{modalContent.stationName}</h2>
//       {errorData.map((error, index) => (
//         <div key={index}>
//           <p><strong>Error Code:</strong> {error.error_code}</p>
//           <p><strong>Error Description:</strong> {error.error_discription}</p>
//         </div>
//       ))}
//       <button onClick={closeModal} className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4">Close</button>
//     </div>
//   </div>
// )}








"use client";

import { useEffect, useState } from 'react';
interface PackageItem {
  module_barcode: string;
  v1_end_date: string;
  v2_end_date: string;
  welding_end_date: string;
  fpcb_end_date: string;
  v1_status: string;
  v1_error: string;
  v2_status: string;
  v2_error: string;
  welding_status: string;
  welding_error: string;
  fpcb_status: string;
  fpcb_error: string;
}


const TableThree = () => {
  const [packageData, setPackageData] = useState<PackageItem[]>([]);
const [filteredData, setFilteredData] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [showModal, setShowModal] = useState(false);
  interface ModalContent {
    errorCode: string;
    stationName: string;
  }
  
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);

  const [errorData, setErrorData] = useState<{ error_code: string; error_discription: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/clw_station_status');
        // if (!response.ok) {
        //   throw new Error('Failed to fetch data');
        // }
        const data = await response.json(); // Extract response data
        setPackageData(data);
        setFilteredData(data);
        console.log("Fetched data:", data); // Log the fetched data
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message); // Safely access the message property
        } else {
          setError('An unknown error occurred'); // Handle non-Error objects
        }
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
        item.module_barcode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset current page to 1 after search
    console.log("Filtered data:", filtered); // Log the filtered data
  };

  const handleSearch = () => {
    filterData();
  };

  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil(filteredData.length / entriesToShow); // Calculate total pages dynamically
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRefresh = () => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setFilteredData(packageData);
    setCurrentPage(1); // Reset current page to 1
  };

  const handleButtonClick = async (item: string, stationName: string) => {
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
        setErrorData(responseData);
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
                  #
                </th>
                
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Module Barcode
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
          <div className="flex justify-between mt-4">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded">
            Previous
          </button>
          <span>Page {currentPage} of {Math.ceil(filteredData.length / entriesToShow)}</span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === Math.ceil(filteredData.length / entriesToShow)} className="px-4 py-2 bg-gray-300 rounded">
            Next
          </button>
        </div>
        </div>
      </div>

      {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
    <div className="bg-white p-6 rounded shadow-lg w-96 h-128">
      <h2 className="text-xl font-bold mb-4">{modalContent?.stationName || 'No Station Name'}</h2>
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
  );
};

export default TableThree;

//     </div>
//   );
// };

// export default TableThree;
