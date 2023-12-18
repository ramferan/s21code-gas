
class Panel {

  constructor (ss, sh) {
    let kk = this
    this.ss = ss;
    this.sh = sh;
    this.dataBase = new DataBase(ss.getId(), 'spreadsheet');
    this.s21wb = new S21WorkBook(ss.getId());
    this.congregation = this.s21wb.congregationsData[0][0];
    this.dateRange = "B4";
    
    this.colors = {
      softBlue: '#3dbfc6',
      black: '#000000',
      mediumGray: '#b7b7b7',
      lightGray: '#f3f3f3',
      lightGreen: '#edf7e9',
      white: '#ffffff',
      darkred: '#cc0000',
    }
  }


  loadWorksheetData() {
    this.range = this.sh.getRange(
      1, 1,
      this.sh.getMaxRows(), 
      this.sh.getMaxColumns()
    );
  }


  writeGroupPanel(){
    
    this.dataBase.loadData();
    this.dataBase.loadDataToPublishers();
    
    let reportDate = this.sh.getRange("B4").getValue();
    if (reportDate == ""){
      reportDate = getLastMonthDate(getDateShiftDays(getFirstMonthDate(new Date()),-1));
    }

    const summary = this.dataBase.getCongregationSummary(
      this.congregation,
      getFirstMonthDate(reportDate),
      getLastMonthDate(reportDate),
      'Informe de actividad para el periodo'
    );
    
    const shRange = this.sh.getRange(
      1, 1,
      this.sh.getMaxRows(), 
      this.sh.getMaxColumns()
    );
    
    const chekbox = SpreadsheetApp.newDataValidation().requireCheckbox().setAllowInvalid(false).build();


    // Clear sheet
    shRange.clearContent();
    shRange.clearDataValidations();
    shRange.setFontColor(this.colors.black);
    shRange.setFontSize(12);
    shRange.setFontFamily("Barlow");
    shRange.setVerticalAlignment("bottom");
    shRange.setHorizontalAlignment("left");
    shRange.setBackground(this.colors.white);
    shRange.setFontWeight('normal');
    shRange.setBorder(false, false, false, false, false, false);

    const values = shRange.getValues();
    const fontColors = shRange.getFontColors();
    const fontSizes = shRange.getFontSizes();
    const fontWeights = shRange.getFontWeights();
    const dataValidations = shRange.getDataValidations();
    const backgrounds = shRange.getBackgrounds();
    const horizontalAlignments = shRange.getHorizontalAlignments();

    let row = 0;

    values[row][1] = "Informe de Grupos";
    fontSizes[row][1] = 19;
    fontColors[row][1] = this.colors.softBlue;

    row++;
    row++;

    values[row][1] = "Fecha:";
    horizontalAlignments[row][1] = 'left';
    
    row++;

    values[row][1] = reportDate;
    fontSizes[row][1] = 14;
    horizontalAlignments[row][1] = 'right';

    values[row][2] = 'FALSE';
    dataValidations[row][2] = chekbox;
    horizontalAlignments[row][2] = 'center';
    fontColors[row][2] = this.colors.softBlue;

  
    this.sh.getRange(row+1,2,1,1).setBorder(
      false, false, true, false, false, false, 
      this.colors.softBlue, 
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM
    );
    
    const groups = Object.values(summary.congregation.groups);
    const reportRow = 6;
    let inactivesRow = Math.max(...Object.values(groups).map(group => { 
      return group.all.activity.activePublishers.length
    })) +reportRow + 3;

    for (let i=0; i<groups.length; i++) {

      row = reportRow;
      values[reportRow][1+i] = groups[i].name;
      fontSizes[reportRow][1+i] = 15;
      fontColors[reportRow][1+i] = this.colors.softBlue;
      fontWeights[reportRow][1+i] = 'bold';
      
      row++;

      let actives = Object.values(groups[i].all.activity.activePublishers).map(publisher => {return publisher.nickname});
      let irregulars = Object.values(groups[i].all.activity.irregulars).map(publisher => {return publisher.nickname});
      let inactives = Object.values(groups[i].all.activity.inactives).map(publisher => {return publisher.nickname});
      actives = actives.filter(publisher => {return irregulars.indexOf(publisher)==-1});

      let activePublishers = actives.concat(irregulars).concat(inactives);
      
      //add markers for overseer and assistant
      activePublishers = activePublishers.map(nickname => {
        let sufix = '';
        
        if (nickname == groups[i].overseer.nickname) {
          sufix = ' *'
        } else if (nickname == groups[i].assistant.nickname) {
          sufix = ' ^'
        } 
        
        return nickname + sufix; 
      });

      const irregularsLength = row+actives.length;
      const inactivesLength = row+actives.length+irregulars.length-1;

      Object.values(activePublishers).forEach(publisher => {

        values[row][1+i] = publisher;     
        fontColors[row][1+i] = this.colors.black;

        if (row >= irregularsLength) {
          fontColors[row][1+i] = this.colors.darkred;
        } 
        
        if (row == inactivesLength) {
          row = inactivesRow;
        }

        if (row >= inactivesLength) {          
          fontColors[row][1+i] = this.colors.mediumGray;
        }

        row++;
      })
    }

    shRange.setDataValidations(dataValidations);
    shRange.setFontColors(fontColors);
    shRange.setFontSizes(fontSizes);
    shRange.setFontWeights(fontWeights);
    shRange.setBackgrounds(backgrounds);
    shRange.setValues(values);
    shRange.setHorizontalAlignments(horizontalAlignments);

    // call function to check if any publisher is not assigned to a group
    checkPublishers(this.s21wb, this.dataBase, reportDate);
  }


  writeActivityPanel(){
    
    this.dataBase.loadData();
    this.dataBase.loadDataToPublishers();

    let reportDateFrom = this.sh.getRange("B5").getValue();
    if (reportDateFrom == ""){
      reportDateFrom = getFirstMonthDate(getDateShiftDays(getFirstMonthDate(new Date()),-1));
    }

    let reportDateTo = this.sh.getRange("D5").getValue();
    if (reportDateTo == ""){
      reportDateTo = getLastMonthDate(getDateShiftDays(getFirstMonthDate(new Date()),-1));
    }

    const summary = this.dataBase.getCongregationSummary(
      getFirstMonthDate(reportDateFrom),
      getLastMonthDate(reportDateTo),
      'Informe de actividad para el periodo',
      true, //byBethelDate
    );
    
    const shRange = this.sh.getRange(
      1, 1,
      this.sh.getMaxRows(), 
      this.sh.getMaxColumns()
    );
    
    const chekbox = SpreadsheetApp.newDataValidation().requireCheckbox().setAllowInvalid(false).build();

    // Clear sheet
    shRange.clearContent();
    shRange.clearDataValidations();
    shRange.setFontColor(this.colors.black);
    shRange.setFontSize(12);
    shRange.setFontFamily("Barlow");
    shRange.setVerticalAlignment("bottom");
    shRange.setHorizontalAlignment("left");
    shRange.setBackground(this.colors.white);
    shRange.setFontWeight('normal');
    shRange.setBorder(false, false, false, false, false, false);

    const values = shRange.getValues();
    const fontColors = shRange.getFontColors();
    const fontSizes = shRange.getFontSizes();
    const fontWeights = shRange.getFontWeights();
    const dataValidations = shRange.getDataValidations();
    const backgrounds = shRange.getBackgrounds();
    const horizontalAlignments = shRange.getHorizontalAlignments();


    let row = 1;
    
    values[row][1] = "Informe de actividad para el periodo";
    fontColors[row][1] = this.colors.softBlue;
    fontSizes[row][1] = 19;

    row += 2;

    values[row][1] = "Desde:";
    values[row][3] = "Hasta:";

    row++;

    values[row][1] = reportDateFrom;
    values[row][3] = reportDateTo;

    values[row][5] = 'FALSE';
    fontColors[row][5] = this.colors.softBlue;
    dataValidations[row][5] = chekbox;
    
    this.sh.getRange(row+1,2,1,1).setBorder(false, false, true, false, false, false, this.colors.softBlue, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    this.sh.getRange(row+1,4,1,1).setBorder(false, false, true, false, false, false, this.colors.softBlue, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

    fontSizes[row][1] = 14;
    fontSizes[row][3] = 14;

    horizontalAlignments[row][1] = 'right';
    horizontalAlignments[row][3] = 'right';

    row += 2;

    row += this.writeGroupedSummary (values, fontColors, fontSizes, fontWeights, backgrounds, summary.congregation.all.reportsSummary, row);
    
    row += 2;

    let contentString = '';

    values[row][1] = "Total publicadores activos:"; //+ ' ['+ summary.congregation.activity.activePublishers.length + ']';
    fontWeights[row][1] = "bold";
    fontColors[row][1] = this.colors.softBlue;
    row++;
    
    values[row][1] = summary.congregation.all.activity.activePublishers.length + ' al final del periodo.';

    row += 2; 

    //let lastCol = 7;
    let lastCol = 4;
    
    values[row][1] = "Precursores sin aprobar:";
    fontWeights[row][1] = "bold";
    fontColors[row][1] = this.colors.softBlue;
    row++;
    
    contentString = '';
    summary.congregation.all.reportsSummary.unknownPioneers.reports.forEach(report => {
        let publisher = Object.values(this.dataBase.publishers).filter(publisher => {
          return publisher.uuid == report.publisher;
        })[0];
        let sufix = ' [' + getYearMonthDate(report.bethelDate) + ']';
        contentString += publisher.nickname + sufix + ';   ';
    });

    this.sh.getRange(row+1,2,1,lastCol).mergeAcross();
    this.sh.getRange(row+1,2,1,lastCol).setBorder(true, true, true, true, false, false, this.colors.softBlue, SpreadsheetApp.BorderStyle.SOLID);
    this.sh.getRange(row+1,2,1,lastCol).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    values[row][1] = contentString.slice(0, -4);

    row += 2; 
  
    const newInmersed = summary.congregation.all.appointments.news.inmersed.length;

    values[row][1] = "Nuevos bautismos: " + ' ['+ newInmersed + ']:';
    fontWeights[row][1] = "bold";
    fontColors[row][1] = this.colors.softBlue;
    row++;

    contentString = '';
    let months = getMonthsDifference(reportDateFrom, reportDateTo);
    if (newInmersed > 0) {
      summary.congregation.all.appointments.news.inmersed.forEach(publisher => {
        let sufix = ' [' + getYearMonthDate(publisher.inmersedDates[0]) + ']';
        contentString += publisher.nickname + sufix + ';   ';
      });
    }
    this.sh.getRange(row+1,2,1,lastCol).mergeAcross();
    this.sh.getRange(row+1,2,1,lastCol).setBorder(true, true, true, true, false, false, this.colors.softBlue, SpreadsheetApp.BorderStyle.SOLID);
    this.sh.getRange(row+1,2,1,lastCol).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    values[row][1] = contentString.slice(0, -4);
  
  
    row += 2;
  
    const newReactives = summary.congregation.all.activity.news.reactived.length;

    values[row][1] = "Reactivados en el periodo: " + ' ['+ newReactives + ']:';
    fontWeights[row][1] = "bold";
    fontColors[row][1] = this.colors.softBlue;
    row++;

    contentString = '';

    if (newReactives > 0) {
      summary.congregation.all.activity.news.reactived.forEach(publisher => {
        let sufix = ' [' + getYearMonthDate(publisher.reactivedDates[0]) + ']';
        contentString += publisher.nickname + sufix + ';   ';
      });
    }

    this.sh.getRange(row+1,2,1,lastCol).mergeAcross();
    this.sh.getRange(row+1,2,1,lastCol).setBorder(true, true, true, true, false, false, this.colors.softBlue, SpreadsheetApp.BorderStyle.SOLID);
    this.sh.getRange(row+1,2,1,lastCol).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    values[row][1] = contentString.slice(0, -4);


    row += 2;

    values[row][1] = "P. Auxiliares" + ' ['+ summary.congregation.all.appointments.all.auxiliaryPioneers.length + ']:';
    fontWeights[row][1] = "bold";
    fontColors[row][1] = this.colors.softBlue;
    row++;

    contentString = '';
    months = getMonthsDifference(reportDateFrom, reportDateTo);
    summary.congregation.all.appointments.all.auxiliaryPioneers.forEach(publisher => {
      let sufix = '';
      if (months > 1) {
        sufix = ' [' + publisher.auxiliaryPioneerDates.length + ']'
      }
      contentString += publisher.nickname + sufix + ';   ';
    });
    this.sh.getRange(row+1,2,1,lastCol).mergeAcross();
    this.sh.getRange(row+1,2,1,lastCol).setBorder(true, true, true, true, false, false, this.colors.softBlue, SpreadsheetApp.BorderStyle.SOLID);
    this.sh.getRange(row+1,2,1,lastCol).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    values[row][1] = contentString.slice(0, -4);

    if (months > 1) {
      row++;
      values[row][1] = '[n] = número de veces en el periodo';
      fontSizes[row][1] = 10;
    }

    row += 2;

    values[row][1] = "P. Regulares" + ' ['+ summary.congregation.all.appointments.all.regularPioneers.length + ']:';
    fontWeights[row][1] = "bold";
    fontColors[row][1] = this.colors.softBlue;
    row++;

    const newRegularPioneers = summary.congregation.all.appointments.news.regularPioneers.length;
    contentString = '';
    summary.congregation.all.appointments.all.regularPioneers.forEach(publisher => {
      let prefix = '';
      if (summary.congregation.all.appointments.news.regularPioneers.indexOf(publisher) != -1) {
        prefix = ' *'
      } 
      contentString += prefix + publisher.nickname + ' [' + getYearMonthDate(publisher.regularPioneerDates[0]) +'];   ';
    });

    this.sh.getRange(row+1,2,1,lastCol).mergeAcross();
    this.sh.getRange(row+1,2,1,lastCol).setBorder(true, true, true, true, false, false, this.colors.softBlue, SpreadsheetApp.BorderStyle.SOLID);
    this.sh.getRange(row+1,2,1,lastCol).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    values[row][1] = contentString.slice(0, -4);

    if (newRegularPioneers > 0) {
      row++;
      values[row][1] = '* Nuevos precursores en el periodo. Total ' + newRegularPioneers + '.';
      fontSizes[row][1] = 10;
    }

    row += 2;

    values[row][1] = "irregulares" + ' ['+ summary.congregation.all.activity.irregulars.length + ']:';
    fontWeights[row][1] = "bold";
    fontColors[row][1] = this.colors.softBlue;
    row++;

    contentString = '';
    summary.congregation.all.activity.irregulars.forEach(publisher => {
      contentString += publisher.nickname+' ['  + publisher.irregularMonthsCounter +'];   ';
    });
    this.sh.getRange(row+1,2,1,lastCol).mergeAcross();
    this.sh.getRange(row+1,2,1,lastCol).setBorder(true, true, true, true, false, false, this.colors.softBlue, SpreadsheetApp.BorderStyle.SOLID);
    this.sh.getRange(row+1,2,1,lastCol).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    values[row][1] = contentString.slice(0, -4);

    if (summary.congregation.all.activity.irregulars.length > 1) {
      row++;
      values[row][1] = '[n] = número de informes faltantes en el periodo';
      fontSizes[row][1] = 10;
    }

    row += 2;

    values[row][1] = "inactivos" + ' ['+ summary.congregation.all.activity.inactives.length + ']:';
    fontWeights[row][1] = "bold";
    fontColors[row][1] = this.colors.softBlue;
    row++;

    const newInactives = summary.congregation.all.activity.news.inactives.length;
    contentString = '';
    summary.congregation.all.activity.inactives.forEach(publisher => {
      let prefix = '';
      if (summary.congregation.all.activity.news.inactives.indexOf(publisher) != -1) {
        prefix = ' *';
      } 
      let monthString = getYearMonthDate(publisher.inactiveDates[0]);
      let nickname = publisher.nickname;
      contentString += prefix + nickname +  ' [' +  monthString +'];   ';
    });
    
    this.sh.getRange(row+1,2,1,lastCol).mergeAcross();
    this.sh.getRange(row+1,2,1,lastCol).setBorder(true, true, true, true, false, false, this.colors.softBlue, SpreadsheetApp.BorderStyle.SOLID);
    this.sh.getRange(row+1,2,1,lastCol).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    values[row][1] = contentString.slice(0, -4);

    if (summary.congregation.all.activity.irregulars.length > 1) {
      row++;
      values[row][1] = '[aaaa.mm] = fecha del ultimo informe';
      fontSizes[row][1] = 10;
    }
    
    if (newInactives > 0) {
      row++;
      values[row][1] += '* nuevos inactivos en el peridodo. Total ' + newInactives + '.';
    }

    row += 2;

    shRange.setDataValidations(dataValidations);
    shRange.setFontColors(fontColors);
    shRange.setFontSizes(fontSizes);
    shRange.setFontWeights(fontWeights);
    shRange.setBackgrounds(backgrounds);
    shRange.setValues(values);
    shRange.setHorizontalAlignments(horizontalAlignments);

  }


  writeAveragesPanel(){

    this.dataBase.loadData();
    this.dataBase.loadDataToPublishers();

    let reportDateFrom = this.sh.getRange("B5").getValue();
    if (reportDateFrom == ""){
      reportDateFrom = getFirstMonthDate(getDateShiftDays(getFirstMonthDate(new Date()),-1));
    }

    let reportDateTo = this.sh.getRange("D5").getValue();
    if (reportDateTo == ""){
      reportDateTo = getLastMonthDate(getDateShiftDays(getFirstMonthDate(new Date()),-1));
    }

    const summary = this.dataBase.getCongregationSummary(
      this.congregation,
      getFirstMonthDate(reportDateFrom),
      getLastMonthDate(reportDateTo),
      'Informe desglosado para el periodo'
    );
    
    const shRange = this.sh.getRange(
      1, 1,
      this.sh.getMaxRows(), 
      this.sh.getMaxColumns()
    );
    
    const chekbox = SpreadsheetApp.newDataValidation().requireCheckbox().setAllowInvalid(false).build();

    // Clear sheet
    shRange.clearContent();
    shRange.clearDataValidations();
    shRange.setFontColor(this.colors.black);
    shRange.setFontSize(12);
    shRange.setFontFamily("Barlow");
    shRange.setVerticalAlignment("bottom");
    shRange.setHorizontalAlignment("left");
    shRange.setBackground(this.colors.white);
    shRange.setFontWeight('normal');
    shRange.setBorder(false, false, false, false, false, false);

    const values = shRange.getValues();
    const fontColors = shRange.getFontColors();
    const fontSizes = shRange.getFontSizes();
    const fontWeights = shRange.getFontWeights();
    const dataValidations = shRange.getDataValidations();
    const backgrounds = shRange.getBackgrounds();
    const horizontalAlignments = shRange.getHorizontalAlignments();


    let row = 1;
    
    values[row][1] = "Informe de promedios para el periodo";
    fontColors[row][1] = this.colors.softBlue;
    fontSizes[row][1] = 19;

    row++;
    row++;

    values[row][1] = "Desde:";
    values[row][3] = "Hasta:";

    row++;

    values[row][1] = reportDateFrom;
    values[row][3] = reportDateTo;

    values[row][5] = 'FALSE';
    fontColors[row][5] = this.colors.softBlue;
    dataValidations[row][5] = chekbox;
    
    this.sh.getRange(row+1,2,1,1).setBorder(false, false, true, false, false, false, this.colors.softBlue, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    this.sh.getRange(row+1,4,1,1).setBorder(false, false, true, false, false, false, this.colors.softBlue, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

    fontSizes[row][1] = 14;
    fontSizes[row][3] = 14;

    horizontalAlignments[row][1] = 'right';
    horizontalAlignments[row][3] = 'right';

    row+= 4;

    row+= this.writeGroupIndividuals(
      values, fontColors, fontSizes, fontWeights, backgrounds, 
      summary.congregation.elders, 'Ancianos', row, 'publishers'
    );

    row+= this.writeGroupIndividuals(
      values, fontColors, fontSizes, fontWeights, backgrounds, 
      summary.congregation.ministerialServants, 'Siervos Ministeriales', row, 'publishers'
    );

    row+= this.writeGroupIndividuals(
      values, fontColors, fontSizes, fontWeights, backgrounds, 
      summary.congregation.regularPioneers, 'Precursores Regulares', row, 'regularPioneers'
    );

    row+= this.writeGroupIndividuals(
      values, fontColors, fontSizes, fontWeights, backgrounds, 
      summary.congregation.uninmersed, 'Publicadores no bautizados', row, 'publishers'
    );

    // Add groups individuals
    Object.values(summary.congregation.groups).forEach(group => {
      row+= this.writeGroupIndividuals(
          values, fontColors, fontSizes, fontWeights, backgrounds, 
          group.all, group.name, row, 'publishers'
      );
    });

    shRange.setDataValidations(dataValidations);
    shRange.setFontColors(fontColors);
    shRange.setFontSizes(fontSizes);
    shRange.setFontWeights(fontWeights);
    shRange.setBackgrounds(backgrounds);
    shRange.setValues(values);
    shRange.setHorizontalAlignments(horizontalAlignments);
  }


  writeGroupedSummary (values, fontColors, fontSizes, fontWeights, backgrounds, groupedSummary, row) {

    let rowini = row;

    values[row][1] = 'Totales';
    values[row][2] = 'infs.';
    //values[row][3] = 'pubs.';
    //values[row][4] = 'vids.';
    //values[row][5] = 'hrs.';
    //values[row][6] = 'rvs.';
    //values[row][7] = 'cbs.';
    values[row][3] = 'hrs.';
    values[row][4] = 'cbs.';
    
    fontWeights[row][1] = 'bold';
    fontWeights[row][2] = 'bold';
    fontWeights[row][3] = 'bold';
    fontWeights[row][4] = 'bold';
    //fontWeights[row][5] = 'bold';
    //fontWeights[row][6] = 'bold';
    //fontWeights[row][7] = 'bold';
    
    fontColors[row][1] = this.colors.softBlue;
    fontColors[row][2] = this.colors.softBlue;
    fontColors[row][3] = this.colors.softBlue;
    fontColors[row][4] = this.colors.softBlue;
    //fontColors[row][5] = this.colors.softBlue;
    //fontColors[row][6] = this.colors.softBlue;
    //fontColors[row][7] = this.colors.softBlue;

    row++;
    //let lastCol = 7;
    let lastCol = 4;
    this.sh.getRange(row,2,1,lastCol).setBorder(false, false, true, false, false, false, this.colors.softBlue, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

    values[row][1] = "Pubs.";
    values[row][2] = groupedSummary.publishers.totals.totalReports;
    //values[row][3] = groupSummary.publishers.totals.placements;
    //values[row][4] = groupSummary.publishers.totals.videoShowings;
    //values[row][5] = groupSummary.publishers.totals.hours;
    //values[row][6] = groupSummary.publishers.totals.returnVisits;
    //values[row][7] = groupSummary.publishers.totals.bibleStudies;
    values[row][3] = groupedSummary.publishers.totals.hours;
    values[row][4] = groupedSummary.publishers.totals.bibleStudies;
    row++;


    values[row][1] = "P. Aux";
    values[row][2] = groupedSummary.auxiliaryPioneers.totals.totalReports;
    //values[row][3] = groupSummary.auxiliaryPioneers.totals.placements;
    //values[row][4] = groupSummary.auxiliaryPioneers.totals.videoShowings;
    //values[row][5] = groupSummary.auxiliaryPioneers.totals.hours;
    //values[row][6] = groupSummary.auxiliaryPioneers.totals.returnVisits;
    //values[row][7] = groupSummary.auxiliaryPioneers.totals.bibleStudies;
    values[row][3] = groupedSummary.auxiliaryPioneers.totals.hours;
    values[row][4] = groupedSummary.auxiliaryPioneers.totals.bibleStudies;
    

    backgrounds[row][1] = this.colors.lightGray;
    backgrounds[row][2] = this.colors.lightGray;
    backgrounds[row][3] = this.colors.lightGray;
    backgrounds[row][4] = this.colors.lightGray;
    //backgrounds[row][5] = this.colors.lightGray;
    //backgrounds[row][6] = this.colors.lightGray;
    //backgrounds[row][7] = this.colors.lightGray;

    row++;

    values[row][1] = "P. Reg.";
    values[row][2] = groupedSummary.regularPioneers.totals.totalReports;
    //values[row][3] = groupSummary.regularPioneers.totals.placements;
    //values[row][4] = groupSummary.regularPioneers.totals.videoShowings;
    //values[row][5] = groupSummary.regularPioneers.totals.hours;
    //values[row][6] = groupSummary.regularPioneers.totals.returnVisits;
    //values[row][7] = groupSummary.regularPioneers.totals.bibleStudies;
    values[row][3] = groupedSummary.regularPioneers.totals.hours;
    values[row][4] = groupedSummary.regularPioneers.totals.bibleStudies;
    row++;


    this.sh.getRange(row,2,1,lastCol).setBorder(false, false, true, false, false, false, this.colors.softBlue, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    
    
    values[row][1] = "";
    values[row][2] = groupedSummary.all.totals.totalReports;
    //values[row][3] = groupSummary.all.totals.placements;
    //values[row][4] = groupSummary.all.totals.videoShowings;
    //values[row][5] = groupSummary.all.totals.hours;
    //values[row][6] = groupSummary.all.totals.returnVisits;
    //values[row][7] = groupSummary.all.totals.bibleStudies;
    values[row][3] = groupedSummary.all.totals.hours;
    values[row][4] = groupedSummary.all.totals.bibleStudies;

    row += 3;

    values[row][1] = 'Promedios';
    values[row][2] = 'infs.';
    //values[row][3] = 'pubs.';
    //values[row][4] = 'vids.';
    //values[row][5] = 'hrs.';
    //values[row][6] = 'rvs.';
    //values[row][7] = 'cbs.';
    values[row][3] = 'hrs.';
    values[row][4] = 'cbs.';
    
    fontWeights[row][1] = 'bold';
    fontWeights[row][2] = 'bold';
    fontWeights[row][3] = 'bold';
    fontWeights[row][4] = 'bold';
    //fontWeights[row][5] = 'bold';
    //fontWeights[row][6] = 'bold';
    //fontWeights[row][7] = 'bold';
    
    fontColors[row][1] = this.colors.softBlue;
    fontColors[row][2] = this.colors.softBlue;
    fontColors[row][3] = this.colors.softBlue;
    fontColors[row][4] = this.colors.softBlue;
    //fontColors[row][5] = this.colors.softBlue;
    //fontColors[row][6] = this.colors.softBlue;
    //fontColors[row][7] = this.colors.softBlue;

    row++;

    this.sh.getRange(row,2,1,lastCol).setBorder(false, false, true, false, false, false, this.colors.softBlue, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

    values[row][1] = "Pubs.";
    values[row][2] = groupedSummary.publishers.averages.totalReports;
    //values[row][3] = parseFloat(groupSummary.publishers.averages.placements).toFixed(2);
    //values[row][4] = parseFloat(groupSummary.publishers.averages.videoShowings).toFixed(2);
    //values[row][5] = parseFloat(groupSummary.publishers.averages.hours).toFixed(2);
    //values[row][6] = parseFloat(groupSummary.publishers.averages.returnVisits).toFixed(2);
    //values[row][7] = parseFloat(groupSummary.publishers.averages.bibleStudies).toFixed(2);
    values[row][3] = parseFloat(groupedSummary.publishers.averages.hours).toFixed(2);
    values[row][4] = parseFloat(groupedSummary.publishers.averages.bibleStudies).toFixed(2);
    row++;

    values[row][1] = "P. Aux.";
    values[row][2] = groupedSummary.auxiliaryPioneers.averages.totalReports;
    //values[row][3] = parseFloat(groupSummary.auxiliaryPioneers.averages.placements).toFixed(2);
    //values[row][4] = parseFloat(groupSummary.auxiliaryPioneers.averages.videoShowings).toFixed(2);
    //values[row][5] = parseFloat(groupSummary.auxiliaryPioneers.averages.hours).toFixed(2);
    //values[row][6] = parseFloat(groupSummary.auxiliaryPioneers.averages.returnVisits).toFixed(2);
    //values[row][7] = parseFloat(groupSummary.auxiliaryPioneers.averages.bibleStudies).toFixed(2);
    values[row][3] = parseFloat(groupedSummary.auxiliaryPioneers.averages.hours).toFixed(2);
    values[row][4] = parseFloat(groupedSummary.auxiliaryPioneers.averages.bibleStudies).toFixed(2);
    

    backgrounds[row][1] = this.colors.lightGray;
    backgrounds[row][2] = this.colors.lightGray;
    backgrounds[row][3] = this.colors.lightGray;
    backgrounds[row][4] = this.colors.lightGray;
    //backgrounds[row][5] = this.colors.lightGray;
    //backgrounds[row][6] = this.colors.lightGray;
    //backgrounds[row][7] = this.colors.lightGray;
    
    row++;

    values[row][1] = "P. Reg.";
    values[row][2] = groupedSummary.regularPioneers.averages.totalReports;
    //values[row][3] = parseFloat(groupSummary.regularPioneers.averages.placements).toFixed(2);
    //values[row][4] = parseFloat(groupSummary.regularPioneers.averages.videoShowings).toFixed(2);
    //values[row][5] = parseFloat(groupSummary.regularPioneers.averages.hours).toFixed(2);
    //values[row][6] = parseFloat(groupSummary.regularPioneers.averages.returnVisits).toFixed(2);
    //values[row][7] = parseFloat(groupSummary.regularPioneers.averages.bibleStudies).toFixed(2);
    values[row][3] = parseFloat(groupedSummary.regularPioneers.averages.hours).toFixed(2);
    values[row][4] = parseFloat(groupedSummary.regularPioneers.averages.bibleStudies).toFixed(2);
    row++;
    
    this.sh.getRange(row,2,1,lastCol).setBorder(false, false, true, false, false, false, this.colors.softBlue, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
        
    values[row][1] = "";
    values[row][2] = groupedSummary.all.averages.totalReports;
    //values[row][3] = parseFloat(groupSummary.all.averages.placements).toFixed(2);
    //values[row][4] = parseFloat(groupSummary.all.averages.videoShowings).toFixed(2);
    //values[row][5] = parseFloat(groupSummary.all.averages.hours).toFixed(2);
    //values[row][6] = parseFloat(groupSummary.all.averages.returnVisits).toFixed(2);
    //values[row][7] = parseFloat(groupSummary.all.averages.bibleStudies).toFixed(2);
    values[row][3] = parseFloat(groupedSummary.all.averages.hours).toFixed(2);
    values[row][4] = parseFloat(groupedSummary.all.averages.bibleStudies).toFixed(2);
    row++;

    return row - rowini;
  }


  writeGroupIndividuals (values, fontColors, fontSizes, fontWeights, backgrounds, groupedSummary, title, row, groupedBy='publishers') {

    let counter = 0;
    let prefix = '';
    let auxPrefix = false;
    let regPrefix = false;

    values[row][1] = title;
    values[row][2] = 'infs.';
    //values[row][3] = 'pubs.';
    //values[row][4] = 'vids.';
    //values[row][5] = 'hrs.';
    //values[row][6] = 'rvs.';
    //values[row][7] = 'cbs.';
    //values[row][8] = 'P.Aux.';
    values[row][3] = 'hrs.';
    values[row][4] = 'cbs.';
    values[row][5] = 'P.Aux.';
    
    //let lastCol = 8;
    let lastCol = 5;

    this.sh.getRange(row+1,2,1,lastCol).setBorder(false, false, true, false, false, false, this.colors.softBlue, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    
    fontWeights[row][1] = 'bold';
    fontWeights[row][2] = 'bold';
    fontWeights[row][3] = 'bold';
    fontWeights[row][4] = 'bold';
    fontWeights[row][5] = 'bold';
    //fontWeights[row][6] = 'bold';
    //fontWeights[row][7] = 'bold';
    //fontWeights[row][8] = 'bold';
    
    fontColors[row][1] = this.colors.softBlue;
    fontColors[row][2] = this.colors.softBlue;
    fontColors[row][3] = this.colors.softBlue;
    fontColors[row][4] = this.colors.softBlue;
    fontColors[row][5] = this.colors.softBlue;
    //fontColors[row][6] = this.colors.softBlue;
    //fontColors[row][7] = this.colors.softBlue;
    //fontColors[row][8] = this.colors.softBlue;


    if (groupedBy == 'regularPioneers'){
      //values[row][8] = 'Σ horas'; 
      values[row][5] = 'Σ horas';
    }

    row++;

    Object.values(groupedSummary.individuals).forEach(individual => {
      const publisher = individual.publisher;
  
      let summary;

      switch (groupedBy) {
        case 'auxiliaryPioneers':
          summary = individual.reportsSummary.auxiliaryPioneers;
          break;
        case 'regularPioneers':
          summary = individual.reportsSummary.regularPioneers;
          break;
        case 'all':
          summary = individual.reportsSummary.all;
          break;
        default:
          summary = individual.reportsSummary.publishers;
      }
    
      
      if (summary.totals.totalReports == 0 && individual.reportsSummary.regularPioneers.totals.totalReports != 0) {
        if (groupedBy != 'regularPioneer') {
          prefix = '+ ';
          regPrefix = true;
        }
        summary = individual.reportsSummary.regularPioneers;
      }

      if (summary.totals.totalReports == 0 && individual.reportsSummary.auxiliaryPioneers.totals.totalReports != 0) {
        summary = individual.reportsSummary.auxiliaryPioneers;
        prefix = '* ';
        auxPrefix = true;
      }

      values[row][1] = prefix + publisher.nickname;
      values[row][2] = summary.totals.totalReports;
      //values[row][3] = parseFloat(summary.averages.placements).toFixed(2);
      //values[row][4] = parseFloat(summary.averages.videoShowings).toFixed(2);
      //values[row][5] = parseFloat(summary.averages.hours).toFixed(2);
      //values[row][6] = parseFloat(summary.averages.returnVisits).toFixed(2);
      //values[row][7] = parseFloat(summary.averages.bibleStudies).toFixed(2);
      //values[row][8] = individual.reportsSummary.auxiliaryPioneers.reports.length;
      values[row][3] = parseFloat(summary.averages.hours).toFixed(2);
      values[row][4] = parseFloat(summary.averages.bibleStudies).toFixed(2);
      values[row][5] = individual.reportsSummary.auxiliaryPioneers.reports.length;
      
      if (groupedBy == 'regularPioneers'){
        if (summary.totals.credits == 0) {
          //values[row][8] = summary.totals.hours;
          values[row][5] = summary.totals.hours;
        } else {
          //values[row][8] = summary.totals.hours + ' (+' + summary.totals.credits +')';
          values[row][5] = summary.totals.hours + ' (+' + summary.totals.credits +')';
        }
        
      }
    

      if (counter % 2 != 0) {
        backgrounds[row][1] = this.colors.lightGray;
        backgrounds[row][2] = this.colors.lightGray;
        backgrounds[row][3] = this.colors.lightGray;
        backgrounds[row][4] = this.colors.lightGray;
        backgrounds[row][5] = this.colors.lightGray;
        //backgrounds[row][6] = this.colors.lightGray;
        //backgrounds[row][7] = this.colors.lightGray;
        //backgrounds[row][8] = this.colors.lightGray;
      }

      row++;
      counter++;
      prefix = '';
    });

    this.sh.getRange(row,2,1,lastCol).setBorder(false, false, true, false, false, false, this.colors.softBlue, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    values[row][1] = 'Las cifras corresponden al promedio. Sin tener en cuenta los meses de precursorado auxiliar.';
    fontSizes[row][1] = 10;
    row++;

    values[row][1] = 'Entre paréntesis las horas computadas como créditos por otras actividades teocráticas.';
    fontSizes[row][1] = 10;
    row++;

    if (auxPrefix) {
      values[row][1] = '* En estos casos, la media es exclusiva de los meses como P. Aux.'
      fontSizes[row][1] = 10;
      row += 1;
      counter++;
    }

    if (regPrefix) {
      values[row][1] = '+ Precursor regular'
      fontSizes[row][1] = 10;
      row += 1;
      counter++;
    }

    return counter+4;
  }

  updatePanel() {

    switch (this.sh.getName()) {

      case "Grupos":
        this.writeGroupPanel();
        break;

      case "Actividad":
        this.writeActivityPanel();
        break;

      case "Promedios":
        this.writeAveragesPanel();
        break;
    }
  }
}

function onAskPanel(ss, sh) {
  const panel = new Panel (ss, sh);

  panel.updatePanel();
}

function simulateOnAskPanel() {  
  //Azuqueca Norte
  let  s21source = '1ZQIz_KErldGIGEzSnmCTTCliLr0Us1nVijyFDBp6ipI'; //AzuquecaNorte

  const ss = SpreadsheetApp.openById(s21source);
  const sh = ss.getSheetByName("Grupos");

  onAskPanel(ss, sh);
}
