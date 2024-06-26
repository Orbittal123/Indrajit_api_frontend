// server.js
// server.js
const net = require("net");
const sql = require("mssql");

  const mainDBConfig = {
    user: "admin",
    password: "admin",
    server: "DESKTOP-FKJATC0",
    database: "replus_treceability",
    options: {
    encrypt: false,
    trustServerCertificate: true,
    },
  };
  console.log("Connected to", mainDBConfig);


  const mainDBConfig2 = {
    user: "admin",
    password: "admin",
    server: "OMKAR",
    database: "replus_treceability",
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
  console.log("Connected to", mainDBConfig2);


  function getFormattedDateTime() {
    const curdate = new Date();
    const yr = curdate.getFullYear();
    const month = ("0" + (curdate.getMonth() + 1)).slice(-2);
    const day = ("0" + curdate.getDate()).slice(-2);
    const hours = ("0" + curdate.getHours()).slice(-2);
    const minutes = ("0" + curdate.getMinutes()).slice(-2);
    const seconds = ("0" + curdate.getSeconds()).slice(-2);
    return `${yr}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  const today_date = getFormattedDateTime();
  console.log("today_date::::", today_date);
  

// var curdate = new Date();
// var yr = curdate.getFullYear();
// var month = ("0" + (curdate.getMonth() + 1)).slice(-2);
// var day = ("0" + curdate.getDate()).slice(-2);
// var today_date = yr + "-" + month + "-" + day + " " + curdate.getHours() + ":" + curdate.getMinutes() + ":" + curdate.getSeconds();
// console.log("date", today_date);

var scannedBarcode = "";
const server = net.createServer((socket) => {
  console.log("Client connected");

  socket.on("data", async (data) => {
    var str = data.toString();
    var checker = str.split(/-(.+)/);
    if (checker[0] == "mcode") {
      scannedBarcode = checker[1];
    }
     else {
      if (scannedBarcode.length > 0) {
        //console.log("data", data);
        str = str.replace(/'/g, '"');
        // Add double quotes around keys using a regular expression
        str = str.replace(/(\w+):/g, '"$1":');

        try {
          var jsonObject = JSON.parse(str);
          console.log("jsonObject::",jsonObject);
        } catch (e) {
          console.error("Parsing error:", e);
        }
        await processVision1(jsonObject, scannedBarcode);
        // await processVision2(jsonObject, scannedBarcode);
        // await welding(jsonObject, scannedBarcode);
        // await fpcb(jsonObject, scannedBarcode);
      } 
      else {
        try {
          // console.log("str:",str);
          str = str.replace(/'/g, '"');
          // Add double quotes around keys using a regular expression
          str = str.replace(/(\w+):/g, '"$1":');
          var jsonObject = JSON.parse(str);
          console.log("jsonObject::",jsonObject);
        } catch (e) {
          console.error("Parsing error:", e);
        }
        await processVision2(jsonObject);
        await welding(jsonObject);
        await fpcb(jsonObject);
        // console.log("read mqr code first");
      }
    }
    console.log("scannedBarcode::", scannedBarcode);
  });

  socket.on("end", () => {
    console.log("Client disconnected");
  });
});

const PORT = 4000;

server.listen(PORT, () => {
var scannedBarcode = "";

  console.log(`Server listening on port ${PORT}`);
  console.log("listenscanbarcode", scannedBarcode);
});


// Vision 1
async function processVision1(data, scannedBarcode) {
    console.log("processVision1111111::", data, scannedBarcode);
    let statusToStore = null;
  
    if (data.vision1.OKStatus) {
      statusToStore = "OK";
    } else if (data.vision1.NOKStatus) {
      statusToStore = "NOK";
    }
  
    if (statusToStore) {
      const RFID = data.vision1.RFID;
      const v1error = data.vision1.ERRORStatus;
  
      const mainPool = await sql.connect(mainDBConfig);
      const result = await mainPool.request().query(`SELECT * FROM [replus_treceability].[dbo].[linking_module_RFID] WHERE RFID = '${RFID}'`);
  
      if (result.recordset.length > 0) {
        await mainPool.request().query(`UPDATE [replus_treceability].[dbo].[linking_module_RFID] SET module_barcode = '${scannedBarcode}' WHERE RFID = '${RFID}'`);
          console.log("Data Updated in linking_module_RFID");
      } else {
        await mainPool.request().query(`INSERT INTO [replus_treceability].[dbo].[linking_module_RFID] (RFID, module_barcode) VALUES ('${RFID}', '${scannedBarcode}')`);
          console.log("Data inserted in linking_module_RFID");
      }
  
      const result2 = await mainPool.request().query(`SELECT date_time FROM [replus_treceability].[dbo].[linking_module_RFID] WHERE RFID = '${RFID}'`);
      const dbDate = result2.recordset[0].date_time;
  
      //connecting to mainDBConfig2
      const secondPool = await sql.connect(mainDBConfig2);
      console.log("secondPool:", secondPool);
  
      const queryString = `SELECT * FROM [replus_treceability].[dbo].[cell_sorting] WHERE module_barcode = '${scannedBarcode}'`;
      console.log("secondResult::", queryString);
  
      // const secondPool = await sql.connect(mainDBConfig2);
      const secondResult = await secondPool.request().query(queryString);
      console.log("secondResult_recordset::", secondResult.recordset.length);
  
      if (secondResult.recordset.length > 0) {
        await mainPool.request().query(`INSERT INTO [replus_treceability].[dbo].[clw_station_status] (module_barcode, battery_pack_name, v1_status, v1_error) VALUES ('${scannedBarcode}', '${secondResult.recordset[0].battery_pack_name}', '${statusToStore}', '${v1error}')`);
        console.log("Data inserted into CLW STATION STATUS");
      }
    }
  }
  

/**************  Vision2 ************/
async function processVision2(data) {
  console.log("processVision2::::",data);

  if (data.vision2.OKStatus || data.vision2.NOKStatus) {

    const RFID = data.vision2.RFID;
    const v2_status = data.vision2.OKStatus ? "OK" : "NOK";
    const v2_error = data.vision2.ERRORStatus;

    const mainPool = await sql.connect(mainDBConfig);

    const result = await mainPool.request().query( `SELECT module_barcode, date_time FROM [replus_treceability].[dbo].[linking_module_RFID] WHERE RFID = '${RFID}'`);
    console.log("vision2 Query result::", result);

    if (result.recordset.length > 0) {
     const { module_barcode, date_time: start_date } = result.recordset[0];
      console.log("module_barcode:::", module_barcode);

      await mainPool.request().query(`UPDATE [replus_treceability].[dbo].[linking_module_RFID] SET date_time = GETDATE() WHERE module_barcode = '${module_barcode}'`);

      await mainPool.request().query(`UPDATE [replus_treceability].[dbo].[clw_station_status] SET v2_status = '${v2_status}', v2_error = '${v2_error}' WHERE module_barcode = '${module_barcode}'`);
      console.log("Query Update::", `UPDATE [replus_treceability].[dbo].[clw_station_status] SET v2_status = '${v2_status}', v2_error = '${v2_error}' WHERE module_barcode = '${module_barcode}'`);
      
      console.log("vision2 data udated!");

          /////with date query///
        //   `UPDATE [replus_treceability].[dbo].[clw_station_status] SET v2_status = '${v2_status}', v2_error = '${v2_error}', v2_start_date = '${start_date}', v2_end_date = '${today_date}' WHERE module_barcode = '${scannedBarcode}'`,

          /////with date query///
        // console.log("resultofquery", `INSERT INTO [replus_treceability].[dbo].[clw_station_status] (module_barcode, v2_status, v2_error, v2_start_date, v2_end_date) VALUES ('${scannedBarcode}', '${v2_status}', '${v2_error}', '${start_date}', '${today_date}')`);
    } else {
      console.log(`No module found for RFID: ${RFID}`);
    }
  }
}

/**************  Welding ************/
async function welding(data) {

  if (data.welding.OKStatus || data.welding.NOKStatus) {

    const RFID = data.welding.RFID;
    const welding_status = data.welding.OKStatus ? "OK" : "NOK";
    const welding_error = data.welding.ERRORStatus;

    const mainPool = await sql.connect(mainDBConfig);

    const result = await mainPool.request().query(`SELECT module_barcode, date_time FROM [replus_treceability].[dbo].[linking_module_RFID] WHERE RFID = '${RFID}'`);

    if (result.recordset.length > 0) {
      const { module_barcode, start_date } = result.recordset[0];
      console.log("weldingmodule_barcode:::", module_barcode);

      await mainPool.request().query(`UPDATE [replus_treceability].[dbo].[linking_module_RFID] SET date_time = GETDATE() WHERE module_barcode = '${module_barcode}'`);

      await mainPool.request().query(`UPDATE [replus_treceability].[dbo].[clw_station_status] SET welding_status = '${welding_status}', welding_error = '${welding_error}' WHERE module_barcode = '${module_barcode}'`);
     console.log("resultofquery",`UPDATE [replus_treceability].[dbo].[clw_station_status] SET welding_status = '${welding_status}', welding_error = '${welding_error}' WHERE module_barcode = '${module_barcode}'`,);
     console.log("Welding data udated!");
    } else {
      console.log(`No module found for RFID: ${RFID}`);
    }
  }
}

/**************  FBCB Welding ************/
async function fpcb(data) {

  if (data.fpcb.OKStatus || data.fpcb.NOKStatus) {

    const RFID = data.fpcb.RFID;
    const fpcb_status = data.fpcb.OKStatus ? "OK" : "NOK";
    const fpcb_error = data.fpcb.ERRORStatus;

    const mainPool = await sql.connect(mainDBConfig);

    const result = await mainPool.request().query(`SELECT module_barcode, date_time FROM [replus_treceability].[dbo].[linking_module_RFID] WHERE RFID = '${RFID}'`);

    if (result.recordset.length > 0) {
        const { module_barcode, start_date } = result.recordset[0];
        console.log("FPPCBweldingmodule_barcode:::", module_barcode);

      await mainPool.request().query(`UPDATE [replus_treceability].[dbo].[linking_module_RFID] SET date_time = GETDATE() WHERE module_barcode = '${module_barcode}'`);

    // await mainPool.request().query(`INSERT INTO [replus_treceability].[dbo].[clw_station_status] (module_barcode, fpcb_status, fpcb_error, fpcb_start_date, fpcb_end_date) VALUES ('${scannedBarcode}', '${fpcb_status}', '${fpcb_error}', '${start_date}', '${today_date}')`);

      await mainPool.request().query(`UPDATE [replus_treceability].[dbo].[clw_station_status] SET fpcb_status = '${fpcb_status}', fpcb_error = '${fpcb_error}' WHERE module_barcode = '${module_barcode}'`);
      console.log("resultofquery",  `UPDATE clw_station_status SET fpcb_status = '${fpcb_status}', fpcb_error = '${fpcb_error}', fpcb_start_date = '${start_date}', fpcb_end_date = '${today_date}' WHERE module_barcode = '${module_barcode}'`,
      console.log("FPCB Welding data udated!")
      
    );
    } else {
      console.log(`No module found for RFID: ${RFID}`);
    }
  }
}










// const net = require("net");
// const sql = require("mssql");

// const mainDBConfig = {
//   user: "admin",
//   password: "admin",
//   server: "DESKTOP-FKJATC0",
//   database: "replus_treceability",
//   options: {
//     encrypt: false,
//     trustServerCertificate: true,
//   },
// };
// console.log("Connected to", mainDBConfig);

// const mainDBConfig2 = {
//   user: "admin",
//   password: "admin",
//   server: "OMKAR",
//   database: "replus_treceability",
//   options: {
//     encrypt: false,
//     trustServerCertificate: true,
//   },
// };
// console.log("Connected to", mainDBConfig2);


// function getFormattedDateTime() {
//   const curdate = new Date();
//   const yr = curdate.getFullYear();
//   const month = ("0" + (curdate.getMonth() + 1)).slice(-2);
//   const day = ("0" + curdate.getDate()).slice(-2);
//   const hours = ("0" + curdate.getHours()).slice(-2);
//   const minutes = ("0" + curdate.getMinutes()).slice(-2);
//   const seconds = ("0" + curdate.getSeconds()).slice(-2);
//   return `${yr}-${month}-${day} ${hours}:${minutes}:${seconds}`;
// }

// const today_date = getFormattedDateTime();
// console.log("today_date::", today_date);

// var scannedBarcode = "";
// const server = net.createServer((socket) => {
//   console.log("Client connected");

//   socket.on("data", async (data) => {
//     var str = data.toString();
//     var checker = str.split(/-(.+)/);

//     if (checker[0] == "mcode") {
//       scannedBarcode = checker[1];
//     } else {
//       if (scannedBarcode.length > 0) {
//         str = str.replace(/'/g, '"');
//         str = str.replace(/(\w+):/g, '"$1":');

//         try {
//           var jsonObject = JSON.parse(str);
//           console.log("jsonObject::", jsonObject);
//         } catch (e) {
//           console.error("Parsing error:", e);
//         }
//         await processVision1(jsonObject, scannedBarcode);
//         await processVision2(jsonObject, scannedBarcode);
//         await welding(jsonObject, scannedBarcode);
//         await fpcb(jsonObject, scannedBarcode);
//       } else {
//         console.log("read mqr code first");
//       }
//     }
//     console.log("scannedBarcode::", scannedBarcode);
//   });

//   socket.on("end", () => {
//     console.log("Client disconnected");
//   });
// });

// const PORT = 4000;

// server.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });

// // Vision 1
// async function processVision1(data, scannedBarcode) {
//   console.log("processVision1111111::", data, scannedBarcode);
//   let statusToStore = null;

//   if (data.vision1.OKStatus) {
//     statusToStore = "OK";
//   } else if (data.vision1.NOKStatus) {
//     statusToStore = "NOK";
//   }

//   if (statusToStore) {
//     const RFID = data.vision1.RFID;
//     const v1error = data.vision1.ERRORStatus;

//     const mainPool = await sql.connect(mainDBConfig);
//     const result = await mainPool.request().query(`SELECT * FROM [replus_treceability].[dbo].[linking_module_RFID] WHERE RFID = '${RFID}'`);

//     if (result.recordset.length > 0) {
//       await mainPool.request().query(`UPDATE [replus_treceability].[dbo].[linking_module_RFID] SET module_barcode = '${scannedBarcode}' WHERE RFID = '${RFID}'`);
//         console.log("Data Updated in linking_module_RFID");
//     } else {
//       await mainPool.request().query(`INSERT INTO [replus_treceability].[dbo].[linking_module_RFID] (RFID, module_barcode) VALUES ('${RFID}', '${scannedBarcode}')`);
//         console.log("Data inserted in linking_module_RFID");
//     }

//     const result2 = await mainPool.request().query(`SELECT date_time FROM [replus_treceability].[dbo].[linking_module_RFID] WHERE RFID = '${RFID}'`);
//     const dbDate = result2.recordset[0].date_time;

//     //connecting to mainDBConfig2
//     const secondPool = await sql.connect(mainDBConfig2);
//     console.log("secondPool:", secondPool);

//     const queryString = `SELECT * FROM [replus_treceability].[dbo].[cell_sorting ] WHERE module_barcode = '${scannedBarcode}'`;
//     console.log("secondResult::", queryString);

//     // const secondPool = await sql.connect(mainDBConfig2);
//     const secondResult = await secondPool.request().query(queryString);
//     console.log("secondResult_recordset::", secondResult.recordset.length);

//     if (secondResult.recordset.length > 0) {
//       await mainPool.request().query(`INSERT INTO [replus_treceability].[dbo].[clw_station_status] (module_barcode, battery_pack_name, v1_status, v1_error) VALUES ('${scannedBarcode}', '${secondResult.recordset[0].battery_pack_name}', '${statusToStore}', '${v1error}')`);
//       console.log("Data inserted into CLW STATION STATUS");
//     }
//   }
// }

// // Vision 2
// async function processVision2(data, scannedBarcode) {
//   console.log("processVision222222222::", data, scannedBarcode);
//   if (data.vision2.OKStatus || data.vision2.NOKStatus) {
//     const RFID = data.vision2.RFID;
//     const v2_status = data.vision2.OKStatus ? "OK" : "NOK";
//     const v2_error = data.vision2.ERRORStatus;

//     const mainPool = await sql.connect(mainDBConfig);

//     const result = await mainPool.request().query(`SELECT module_barcode, date_time FROM [replus_treceability].[dbo].[linking_module_RFID] WHERE RFID = '${RFID}'`);

//     if (result.recordset.length > 0) {
//       const { scannedBarcode1, start_date } = result.recordset[0];

//       await mainPool.request().query(`UPDATE [replus_treceability].[dbo].[linking_module_RFID] SET date_time = GETDATE() WHERE module_barcode = '${scannedBarcode1}'`);

//       await mainPool.request().query(`UPDATE [replus_treceability].[dbo].[clw_station_status] SET v2_status = '${v2_status}', v2_error = '${v2_error}' WHERE module_barcode = '${scannedBarcode1}'`);

//       /////with date query///
//       //   `UPDATE [replus_treceability].[dbo].[clw_station_status] SET v2_status = '${v2_status}', v2_error = '${v2_error}', v2_start_date = '${start_date}', v2_end_date = '${today_date}' WHERE module_barcode = '${scannedBarcode}'`,

//       /////with date query///
//       // console.log("resultofquery", `INSERT INTO [replus_treceability].[dbo].[clw_station_status] (module_barcode, v2_status, v2_error, v2_start_date, v2_end_date) VALUES ('${scannedBarcode}', '${v2_status}', '${v2_error}', '${start_date}', '${today_date}')`);
//     } else {
//       console.log(`No module found for RFID: ${RFID}`);
//     }
//   }
// }

// async function welding(data, scannedBarcode) {
//   if (data.welding.OKStatus || data.welding.NOKStatus) {
//     const RFID = data.welding.RFID;
//     const welding_status = data.welding.OKStatus ? "OK" : "NOK";
//     const welding_error = data.welding.ERRORStatus;

//     const mainPool = await sql.connect(mainDBConfig);

//     const result = await mainPool
//       .request()
//       .query(
//         `SELECT module_barcode, date_time FROM [replus_treceability].[dbo].[linking_module_RFID] WHERE RFID = '${RFID}'`,
//       );

//     if (result.recordset.length > 0) {
//       const { scannedBarcode1, start_date } = result.recordset[0];

//       await mainPool
//         .request()
//         .query(
//           `UPDATE [replus_treceability].[dbo].[linking_module_RFID] SET date_time = GETDATE() WHERE module_barcode = '${scannedBarcode1}'`,
//         );

//       // await mainPool
//       //   .request()
//       //   .query(
//       //     `INSERT INTO [replus_treceability].[dbo].[clw_station_status] (module_barcode, welding_status, welding_error, welding_start_date, welding_end_date) VALUES ('${scannedBarcode}', '${welding_status}', '${welding_error}', '${start_date}', '${today_date}')`,
//       //   );

//       await mainPool
//         .request()
//         .query(
//           `UPDATE [replus_treceability].[dbo].[clw_station_status] SET welding_status = '${welding_status}', welding_error = '${welding_error}' WHERE module_barcode = '${scannedBarcode}'`,
//         );
//       console.log("resultofquery", `UPDATE [replus_treceability].[dbo].[clw_station_status] SET welding_status = '${welding_status}', welding_error = '${welding_error}' WHERE module_barcode = '${scannedBarcode}'`);
//     } else {
//       console.log(`No module found for RFID: ${RFID}`);
//     }
//   }
// }

// async function fpcb(data, scannedBarcode) {
//   if (data.fpcb.OKStatus || data.fpcb.NOKStatus) {
//     const RFID = data.fpcb.RFID;
//     const fpcb_status = data.fpcb.OKStatus ? "OK" : "NOK";
//     const fpcb_error = data.fpcb.ERRORStatus;

//     const mainPool = await sql.connect(mainDBConfig);

//     const result = await mainPool
//       .request()
//       .query(
//         `SELECT module_barcode, date_time FROM [replus_treceability].[dbo].[linking_module_RFID] WHERE RFID = '${RFID}'`,
//       );

//     if (result.recordset.length > 0) {
//       const { scannedBarcode1, start_date } = result.recordset[0];

//       await mainPool
//         .request()
//         .query(
//           `UPDATE [replus_treceability].[dbo].[linking_module_RFID] SET date_time = GETDATE() WHERE module_barcode = '${scannedBarcode1}'`,
//         );

//       // await mainPool
//       //   .request()
//       //   .query(
//       //     `INSERT INTO [replus_treceability].[dbo].[clw_station_status] (module_barcode, fpcb_status, fpcb_error, fpcb_start_date, fpcb_end_date) VALUES ('${scannedBarcode}', '${fpcb_status}', '${fpcb_error}', '${start_date}', '${today_date}')`,
//       //   );

//       await mainPool
//         .request()
//         .query(
//           `UPDATE [replus_treceability].[dbo].[clw_station_status] SET fpcb_status = '${fpcb_status}', fpcb_error = '${fpcb_error}' WHERE module_barcode = '${scannedBarcode}'`,
//         );
//       console.log("resultofquery", `UPDATE clw_station_stSET fpcb_status = '${fpcb_status}', fpcb_error = '${fpcb_error}', fpcb_start_date = '${start_date}', fpcb_end_date = '${today_date}' WHERE module_barcode = '${scannedBarcode}'`);
//     } else {
//       console.log(`No module found for RFID: ${RFID}`);
//     }
//   }
// }
