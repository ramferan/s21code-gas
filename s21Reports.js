function onReportEntry (target, source){

  var tm0 = new Date().getTime();
  
  const values = target.getSheet().getRange(target.getRow(),1,target.getNumRows(),target.getSheet().getLastColumn()).getValues();
  const headerValues = target.getSheet().getRange(1,1,1,target.getSheet().getLastColumn()).getValues();
  const headers = extractValuesHeaders(headerValues);

  const dataBase = new DataBase(source,'spreadsheet');
  dataBase.loadData();

  for (let i=0; i<target.getNumRows(); i++){
    const report = readReport(values, headers, i);
    const date = getLastMonthDate(new Date(report.monthString.slice(0,7)+".01"));
    const publisher = dataBase.getPublisherByWords(report.originalname);

    report.uuid = report.uuid? report.uuid: getUuid();
    report.reportDate = report.reportDate? report.reportDate: date;
    report.bethelDate = report.reportDate? report.reportDate: date;
    report.publisher = publisher? publisher.uuid : '';
    report.nickname = publisher? publisher.nickname: '';
    report.activity = report.hours > 0 || report.activity != '';
    writeReport (report, values, headers, i)
  }
  
  target.getSheet().getRange(target.getRow(),1,target.getNumRows(),target.getSheet().getLastColumn()).setValues(values);
  Logger.log("Report entry executed in " +(new Date().getTime()-tm0)/1000 +' scs.');
  return report
}

function readReport(values, headers, entryRow){
  return report = {
    'uuid': values[entryRow][headers['uuid']],
    'timestamp': values[entryRow][headers['timestamp']],
    'reportDate': values[entryRow][headers['reportDate']],
    'bethelDate': values[entryRow][headers['bethelDate']],
    'publisher': values[entryRow][headers['publisher']],
    'originalname': values[entryRow][headers['Publicador']],
    'monthString': values[entryRow][headers['Mes de informe']],
    'placements': Number(values[entryRow][headers['Publicaciones (impresas y electrónicas)']]),
    'videoShowings': Number(values[entryRow][headers['Presentaciones de videos']]),
    'hours': Number(values[entryRow][headers['Horas']]),
    'returnVisits': Number(values[entryRow][headers['Revisitas']]),
    'bibleStudies': Number(values[entryRow][headers['Cursos Bíblicos']]),
    'remarks': values[entryRow][headers['Observaciones']], 
    'nickname': values[entryRow][headers['nickname']],
    'type': values[entryRow][headers['Tipo de informe']],
    'activity': values[entryRow][headers['Actividad']],
  }
}

function writeReport(report, values, headers, entryRow){  
  values[entryRow][headers['uuid']] = report.uuid;
  values[entryRow][headers['timestamp']] = report.timestamp;
  values[entryRow][headers['reportDate']] = report.reportDate
  values[entryRow][headers['bethelDate']] = report.bethelDate;
  values[entryRow][headers['publisher']] = report.publisher;
  values[entryRow][headers['originalname']] = report.originalname;
  values[entryRow][headers['monthString']] = report.monthString;
  values[entryRow][headers['placements']] = report.placements;
  values[entryRow][headers['videoShowings']] = report.videoShowings;
  values[entryRow][headers['hours']] = report.hours;
  values[entryRow][headers['returnVisits']] = report.returnVisits;
  values[entryRow][headers['bibleStudies']] = report.bibleStudies;
  values[entryRow][headers['remarks']] = report.remarks;  
  values[entryRow][headers['nickname']] = report.nickname;
  values[entryRow][headers['Tipo de informe']] = report.type;
  values[entryRow][headers['Actividad']] = report.activity;
}

function formatReports(sh){

  const headerValues = sh.getRange(1,1,1,sh.getLastColumn()).getValues()
  const headers = extractValuesHeaders(headerValues);
  const dataRange = sh.getDataRange();

  if (sh.getFilter()) {
    sh.getFilter().remove();
  }

  dataRange.setFontFamily("Barlow");
  dataRange.setFontSize(12); 
  dataRange.createFilter();  

  sh.setFrozenRows(1);
  sh.sort(headers['Marca temporal']+1, false);
}

function simulateOnReportEntry(){

  const source = '1ZQIz_KErldGIGEzSnmCTTCliLr0Us1nVijyFDBp6ipI'; //Azuqueca Norte
  
  const ss = SpreadsheetApp.openById(source);
  const sh = ss.getSheetByName('reportsData');

  const target = sh.getRange('b2');

  const kk = target.getValue();

  onReportEntry(
    target, 
    ss.getId()
  );

  formatReports(
    target.getSheet()
  );
}
