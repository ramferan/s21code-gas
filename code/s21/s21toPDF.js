function encodeDate(yy, mm, dd, hh, ii, ss) {
  var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (yy % 4 == 0 && (yy % 100 != 0 || yy % 400 == 0)) days[1] = 29;
  for (var i = 0; i < mm; i++) dd += days[i];
  yy--;
  return (
    ((((yy * 365 +
      (yy - (yy % 4)) / 4 -
      (yy - (yy % 100)) / 100 +
      (yy - (yy % 400)) / 400 +
      dd -
      693594) *
      24 +
      hh) *
      60 +
      ii) *
      60 +
      ss) /
    86400.0
  );
}

function exportSheetToPDF(spreadsheet, sheet, fileName, folderName, rowsPageBreaks, columnsPageBreaks) {

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const source = sheet.getSheetId().toString();

  rowsPageBreaks = rowsPageBreaks.map(row => [row,row]);
  columnsPageBreaks = [columnsPageBreaks];

  const exportSource = [
    [
      source, // ID de hoja
      0, // Rango: Línea de inicio (0 ~)
      lastRow+1, // Rango: fila final
      0, // Rango: columna de inicio (0 ~)
      lastCol+1, // Rango: Columna final
    ],
  ];


  const exportOptions = [
    0, // Formato de impresión: Mostrar nota 0: Ninguno 1: Sí
    null, // (desconocido)
    1, // Formato de impresión: Mostrar líneas de cuadrícula 0: Sí 1: No
    0, // Encabezado y pie de página: Número de página 0: Ninguno 1: Sí
    0, // Encabezado y pie de página: Título del libro de trabajo 0: Ninguno 1: Sí
    0, // Encabezado y pie de página: Nombre de la hoja 0: Ninguno 1: Sí
    0, // Encabezado y pie de página: Fecha actual 0: Ninguno 1: Sí
    0, // Encabezado y pie de página: Hora actual 0: Ninguno 1: Sí
    1, // Encabezados de filas y columnas: Repetir filas fijas 0: Ninguno 1: Sí
    1, // Encabezados de filas y columnas: Repetir columnas fijas 0: Ninguno 1: Sí
    2, // Orden de impresión de página 1: De arriba a abajo 2: De izquierda a derecha
    1, // (Desconocido)
    null, // (desconocido)
    null, // (desconocido)
    2, // Disposición: Horizontal 1: Izquierda 2: Centro 3: Derecha
    1, // Disposición: Vertical 1: Superior 2: Centro 3: Inferior
  ];

  const exportFormat = [
    "A4", // Tamaño del papel
    1, // Orientación de la página 0: Horizontal 1: Orientación vertical
    6, // Escala 0: Estándar (100%) 1: Ajustar al ancho 2: Ajustar a la altura 3: Ajustar a la página 4: Personalizado 6:Ajustar a saltos de página
    1, // Porcentaje cuando se selecciona 4 (personalizado) en la escala (rango de 0 a 1)
    [
      0.75, // Desplazamiento superior 0,75 pulgadas
      0.75, // Desplazamiento inferior 0,75 pulgadas
      0.25, // Desplazamiento a la izquierda 0,7 pulgadas
      0.25, // Desplazamiento a la derecha 0,7 pulgadas
    ],
  ];
  
  const exportPageBreaks = [
    [
      source, // ID de hoja
      rowsPageBreaks, // filas en las que hay salto. Formato: [[row1,row1], [row2,row2]...]
      columnsPageBreaks  // columnas en las que hay salto. Formato: [ [col1, col2, ...]]
    ]
  ];

  var today = new Date();
  var d = encodeDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    today.getHours(),
    today.getMinutes(),
    today.getSeconds()
  );
  
  var pc = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    0,
    exportSource,
    10000000,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    d,
    null,
    null,
    exportOptions,
    exportFormat,
    null,
    0,
    exportPageBreaks,
    0,
  ];
  

  const ssID = spreadsheet.getId();

  const options = {
    method: "post",
    payload: "a=true&pc=" + JSON.stringify(pc) + "&gf=[]",
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true,
  };

  const esid = (Math.round(Math.random()*10000000));

  const res = UrlFetchApp.fetch(
    "https://docs.google.com/spreadsheets/d/" + ssID + "/pdf?id=" + ssID+"&esid="+esid,
    options
  );

  const resCode = res.getResponseCode();
  if (resCode !== 200) {
    throw new Error(`(${resCode}) ${res.getContentText()}`);
  }

  const blob = res.getBlob();
  
  if (fileName.indexOf ('.pdf') == -1) {
    fileName += '.pdf';
  }
  
  const folder = DriveApp.getFoldersByName(folderName).next(); 
  folder.createFile(blob).setName(fileName);
 
}