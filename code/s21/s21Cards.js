class S21Card {

  constructor (ss, sheet_name='s21Out', minRowHeight = 27) {
    this.ss = ss;
    this.minRowHeight = minRowHeight;

    this.shOut = ss.getSheetByName(sheet_name);

    if (!this.shOut) {
      ss.insertSheet(sheet_name);
      this.shOut = ss.getSheetByName(sheet_name);
    }

    this.shTemplate = ss.getSheetByName('s21Template');
    this.templateRows = this.shTemplate.getMaxRows();
    this.templateColumns = this.shTemplate.getMaxColumns();
    this.rangeTemplate = this.shTemplate.getRange(1, 1, this.templateRows,this.templateColumns);
    this.templateValues = this.rangeTemplate.getValues();
    this.templateBackgrounds = this.rangeTemplate.getBackgrounds();
    this.templateFontColors = this.rangeTemplate.getFontColors();
    this.templateFontFamilies = this.rangeTemplate.getFontFamilies();
    this.templateWrapStrategies = this.rangeTemplate.getWrapStrategies();
    this.templateDataValidation = this.rangeTemplate.getDataValidation();

  }

  createPublishersCards (publishers, firstDate, lastDate, reverse=true) {
    const tm0 = new Date().getTime();
    let row = 1;

    this.clearS21OutSheet();

    let firstReportDate = new Date(getServiceYear(firstDate)-1 + ".09.01");
    let lastReportDate = new Date(getServiceYear(lastDate) + ".08.31");
    
    Object.entries(publishers).forEach(([uuid, publisher]) => {  

      const reports = Object.values(publisher.reports).filter(report => {
        return report.reportDate.getTime() >= firstReportDate.getTime() &&
               report.reportDate.getTime() <= lastReportDate.getTime();
      });

      if (reverse) {
        reports.sort((a,b) => {
          return b.reportDate.getTime() - a.reportDate.getTime();
        })
      }

      else { 
        reports.sort((a,b) => {
          return a.reportDate.getTime() - b.reportDate.getTime();
        })
      }
            
      const publisherServiceYear = getServiceYear(reports[reports.length-1].reportDate);
      const firstPublisherDate = new Date(publisherServiceYear-1 + '.09.01');

      const monthsDifference = getMonthsDifference(
        firstPublisherDate, 
        lastReportDate
      )+1;
      
      const months = Math.max(24, monthsDifference);
      const pages = [...Array(Math.ceil(months/24)).keys()];

      let startServiceYear = getServiceYear(reports[0].reportDate);
      let startDate = new Date(startServiceYear-1 + '.09.01');
      pages.forEach(page => {
        let endDate = getFirstMonthDate(getDateShiftDays(startDate, (365*2)-15));
        this.createCard(publisher, startDate, endDate, row, reverse);
        row += this.templateRows;
        startDate = getFirstMonthDate(getDateShiftDays(startDate, -(365*2)+15));
      });
    });
    
    let tm_all = (new Date().getTime()-tm0)/1000;
    Logger.log("Created s21 cards in " +tm_all +' scs.');
  }

  clearS21OutSheet() {
    if (this.shOut.getMaxRows() > 5) {
      this.shOut.deleteRows(
        5, 
        this.shOut.getMaxRows()-5
      );
    }
  } 

  createCard(publisher, firstDate, lastDate, row, reverse=true) {

    reverse = false;
    // normalize dates
    firstDate = getFirstMonthDate(firstDate);
    lastDate = getLastMonthDate(lastDate);

    const reports = Object.values(publisher.reports).filter(report =>{
      return report.reportDate >= firstDate &&
             report.reportDate <= lastDate;
    });

    if (reports.length == 0) {
      return
    }

    const outRange = this.shOut.getRange(row, 1, this.templateRows,this.templateColumns);
    const values = this.templateValues.map(o => [...o]); // to make a deep copy of the values

    const inmersedDate = publisher.getInmersedDate();

    // Publisher data writing
    values[3][3] = publisher.fullname;
    values[4][6] = getDateString(publisher.birthDate);
    values[5][5] = inmersedDate? getDateString(inmersedDate) : '';
    values[4][12] = publisher.gender == 'male';
    values[4][15] = publisher.gender == 'female';
    values[5][12] = !publisher.serveAsAnointedOnDates(firstDate, lastDate);
    values[5][15] = publisher.serveAsAnointedOnDates(firstDate, lastDate);
    values[6][1] = publisher.serveAsElderOnDates(firstDate, lastDate);
    values[6][4] = publisher.serveAsMinisterialServantOnDates(firstDate, lastDate);
    values[6][7] = publisher.serveAsRegularPioneerOnDates(firstDate, lastDate);
    values[6][10] = publisher.serveAsSpecialPioneerOnDates(firstDate, lastDate);
    values[6][13] = publisher.serveAsMissionaryPioneerOnDates(firstDate, lastDate);
    
    if (reverse) {
      values[23][1] = values[23][1] + '\n' + getServiceYearString(getServiceYear(firstDate));
      values[7][1] = values[7][1] + '\n' + getServiceYearString(getServiceYear(getDateShiftDays(firstDate, 13*30)));
    }
    else {
      values[7][1] = values[7][1] + '\n' + getServiceYearString(getServiceYear(firstDate));
      values[23][1] = values[23][1] + '\n' + getServiceYearString(getServiceYear(getDateShiftDays(firstDate, 13*30)));
    }

    values[38][1] = publisher.uuid;
    
    let totals = 0;
    
    let reportDate = firstDate;
    if (reverse) {
      reportDate = lastDate;
    }
        
    let totalsRow = 20;

    let despIni = 8; 

    let extra = reverse ? 0 : 1
    for (let i=0; i<24+extra; i++){
    
      let report = reports.filter(report => {
        return report.reportDate.getTime() == reportDate.getTime();
      })[0];

      // gosh report if needed
      let currentDate = getLastMonthDate(new Date);
      let isFuture = reportDate >= currentDate;

      if (typeof report == 'undefined') {
        report = new Report(
          getUuid(), // uuid
          new Date(), // timestamp
          reportDate,  // reportDate
          reportDate,  // bethelDate
          publisher.uuid, // publisher
          publisher.originalName,  // originalName
          '', // monthString
          '', // type
          '', // activity
          '', // placements
          '', // videoShowings
          '', // hours
          '', // returnVisits
          '', // bibleStudies
          !isFuture ? 'Sin informe' : '' // remarks
        );
      } 
      
      if (i == 12+extra) {
        totalsRow += 16;
        despIni = 24;
        totals = 0;
      } 

      let desp = despIni + getS21MonthShift(report.reportDate.getMonth());

      // data
      let wasAP = publisher.serveAsAuxiliaryPioneerOnDates(report.reportDate, report.reportDate) && !isFuture; 
      let wasRP = publisher.serveAsRegularPioneerOnDates(report.reportDate, report.reportDate) && !isFuture;
      let hours = ((wasAP || wasRP) ? (Number(report.hours) || 0): 0);
      values[desp][1] = toTitleCase(getS21MonthString(report.reportDate));
      values[desp][6] = report.activity;
      values[desp][7] = report.bibleStudies!= 0 ? report.bibleStudies:'';
      values[desp][9] = wasAP;
      values[desp][11] = hours != 0 ? hours : '';
      values[desp][13] = report.remarks;

      // totals
      totals += ((wasAP || wasRP) ? (Number(report.hours) || 0): 0);
      values[totalsRow][11] = totals != 0 ? totals : '';

      let previousDate = reportDate
      if (reverse) {
        reportDate = getLastMonthDate(getDateShiftDays(reportDate,-40));
      }
      else {
        reportDate = getLastMonthDate(getDateShiftDays(reportDate,2));
      } 
    }
    
    outRange.setValues(values);
    this.rangeTemplate.copyTo(
      outRange,
      SpreadsheetApp.CopyPasteType.PASTE_NORMAL,
      false
    );

    // set row heights
    const rowIni = outRange.getRow();
    outRange.setValues(values);
    for (let i =rowIni; i< rowIni + outRange.getNumRows(); i++){      
      this.shOut.setRowHeight(i, this.minRowHeight);
    }
  }

  exportToPDF (fileName, folderName) {

    const multiplesOf = (numbers, number) => numbers.filter(n => !(n % number));

    const rows = [...Array(this.shOut.getMaxRows()+1).keys()];
    const cols = [...Array(this.shOut.getMaxColumns()+1).keys()];
    
    const rowPageBreaks = multiplesOf(rows, this.templateRows); 
    const colPageBreaks = multiplesOf(cols, this.templateColumns);

    exportSheetToPDF(
      this.ss, 
      this.shOut, 
      fileName, 
      folderName, 
      rowPageBreaks, 
      colPageBreaks
    );
  }
}

function onGetSelectionS21CardsPDF(ss, sh, firstDate, lastDate){
  onGetSelectionS21Cards(ss, sh, firstDate, lastDate, exportPDF=true);
}

function onGetSelectionS21Cards(ss, sh, firstDate, lastDate, sheet_name='s21Out', exportPDF=false){
  const yearService = getServiceYear(new Date());

  if(new Date(firstDate).toString() == 'Invalid Date') {
    firstDate = new Date('1899.09.01');
  }

  if (new Date(lastDate).toString() == 'Invalid Date'){
    lastDate = new Date(yearService+'.08.31');
  }

  const publishersNames = [];
  sh.getActiveRangeList().getRanges().forEach(range => {
    range.getValues().forEach(names => {
      names[0].split(';').forEach(name => {
        publishersNames.push(name.trim());
      });
    });
  });

  const dataBase = new DataBase(ss.getId(), 'spreadsheet');
  dataBase.loadData();

  const publishers = publishersNames.map(publisher => {
      return dataBase.getPublisherByWords(publisher);
    }
  ).filter(publisher => {
      return typeof publisher !== 'undefined';
    }
  );
  
  if (publishers.length == 0){
    return;
  }  

  const cardS21 = new S21Card(ss, sheet_name);

  cardS21.createPublishersCards(
    publishers,
    firstDate,
    lastDate
  )

  if (exportPDF) {
    const s21PDFname = 's21 '+ getDateHourString(new Date(),true,'.').replaceAll(':','.');
    const folderName = 's21Outs';
    cardS21.exportToPDF(s21PDFname, folderName);
  }
}

function onGetGroupS21Cards(ss, sh, firstDate, lastDate, sheet_name='s21Out', exportPDF=false){
  const yearService = getServiceYear(new Date());

  if(new Date(firstDate).toString() == 'Invalid Date') {
    firstDate = new Date('1899.09.01');
  }

  if (new Date(lastDate).toString() == 'Invalid Date'){
    lastDate = new Date(yearService+'.08.31');
  }

  const dataBase = new DataBase(ss.getId(), 'spreadsheet');
  dataBase.loadData();

  dataBase.getGroupsByServiceYear(yearService).forEach(group => {
    group.publishers.forEach(pub)
  })
  const publishersNames = [];
  sh.getActiveRangeList().getRanges().forEach(range => {
    range.getValues().forEach(names => {
      names[0].split(';').forEach(name => {
        publishersNames.push(name.trim());
      });
    });
  });


  const publishers = publishersNames.map(publisher => {
      return dataBase.getPublisherByWords(publisher);
    }
  ).filter(publisher => {
      return typeof publisher !== 'undefined';
    }
  );
  
  if (publishers.length == 0){
    return;
  }  

  const cardS21 = new S21Card(ss, sheet_name);

  cardS21.createPublishersCards(
    publishers,
    firstDate,
    lastDate
  )

  if (exportPDF) {
    const s21PDFname = 's21 '+ getDateHourString(new Date(),true,'.').replaceAll(':','.');
    const folderName = 's21Outs';
    cardS21.exportToPDF(s21PDFname, folderName);
  }
}


function onS21SelectorChange(ss, sh){

  const target = sh.getActiveRange();
  const yearService = getServiceYear(new Date());
  const firstDate = new Date('1899.09.01');
  const lastDate = new Date(yearService+'.08.31');

  if (target.getRow() == 4) {
    if (sh.getMaxRows() > 5) {
      sh.deleteRows(5,sh.getMaxRows()-5);
    }
    onGetSelectionS21Cards(ss, sh, firstDate, lastDate, false);
  }
}

function simulateOnS21SelectorChange() {
  const source = '1ZQIz_KErldGIGEzSnmCTTCliLr0Us1nVijyFDBp6ipI'; //AzuquecaNorte
  
  const ss = SpreadsheetApp.openById(source);
  const sh = ss.getSheetByName('s21Out');

  sh.setActiveRange(sh.getRange('d4'));

  onS21SelectorChange(ss, sh)
}

function simulateOnGet21Cards(){
  const source = '1ZQIz_KErldGIGEzSnmCTTCliLr0Us1nVijyFDBp6ipI'; //AzuquecaNorte
  
  const ss = SpreadsheetApp.openById(source);
  const sh = ss.getSheetByName('Actividad');

  const yearService = getServiceYear(new Date());
  const firstDate = new Date('1899.09.01');
  const lastDate = new Date(yearService+'.08.31');

  var rangeList = sh.getRangeList(['b34','b37']);
  rangeList.activate();

  onGetSelectionS21Cards(ss, sh, firstDate, lastDate, false)
}

