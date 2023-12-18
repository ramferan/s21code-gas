function getActivityString(activityObject, prefix='- ', separator=': ', detailed=true) {
  let activityString = '';
  activityString += prefix + 'Publicadores activos' + separator + activityObject.activePublishers.length +'\n';
  activityString += prefix + 'Publicadores irregulares' + separator + activityObject.irregulars.length +'\n';
  if (activityObject.irregulars.length >0 && detailed) {
    activityString += '    ' + activityObject.irregulars.join('\n    ') +'\n';
  }
  activityString += prefix + 'Publicadores inactivos' + separator + activityObject.currentInactives.length +'\n';
  if (activityObject.currentInactives.length >0 && detailed) {
    activityString += '    ' + activityObject.currentInactives.join('\n    ') +'\n';
  }
  activityString += prefix + 'Nuevos inactivos en el periodo '+ separator + activityObject.newInactives.length +'\n';
  if (activityObject.newInactives.length >0 && detailed) {
    activityString += '    ' + activityObject.newInactives.join('\n    ') +'\n';
  }
  activityString += prefix + 'Reactivados en el periodo' + separator + activityObject.newReactivedOnes.length+'\n';
  if (activityObject.newReactivedOnes.length>0 && detailed){
    activityString += '    ' + activityObject.newReactivedOnes.join('\n    ') +'\n';
  }
  activityString += prefix + 'Bautizados en el periodo ' + separator + activityObject
  return activityString;
}

function getActivitiesArray(summary, groupName, prefix = '') {
  const stringArray = []
  stringArray.push(
    prefix + 'Actividad ' + groupName +':\n' +
    this.getActivityString(summary.activity)
  );        
  stringArray.push(
    prefix + 'Totales ' + groupName +':\n' +
    this.getRepotsSummaryString(summary.all)
  );  
  stringArray.push(
    prefix + 'Publicadores ' + groupName +':\n' +
    this.getRepotsSummaryString(summary.publishers)
  );      
  stringArray.push(
    prefix + 'Precursores Auxiliares ' + groupName +':\n' +
    this.getRepotsSummaryString(summary.auxiliaryPioneers)
  );      
  stringArray.push(
    prefix + 'Precursores Regulares ' + groupName +':\n' +
    this.getRepotsSummaryString(summary.regularPioneers)
  );  
  return stringArray
}

function getAppointmentDetail(appointmentObject) {
  return appointmentObject.map(appointment => {
        return appointment.name + ' [' +appointment.months.length +']:\n   '+
               appointment.months.join('; ')
      }).join('\n- ')+'\n\n';
}

function getRepotsSummaryString(reportsSummary, prefix = '- ', separator=':\n   '){
  let reportsSumaryString = ''
  reportsSumaryString += prefix + 'Cantidad de informes' +separator;
  reportsSumaryString += reportsSummary.averages.reports +'\n';
  reportsSumaryString += prefix + 'Publicaciones (impresas y electrónicas)' +separator;
  reportsSumaryString += reportsSummary.totals.placements;
  reportsSumaryString += ' [~' + reportsSummary.averages.placements.toFixed(2) +']\n';
  reportsSumaryString += prefix + 'Presentaciones de videos' +separator;
  reportsSumaryString += reportsSummary.totals.videoShowings;
  reportsSumaryString += ' [~' + reportsSummary.averages.videoShowings.toFixed(2) +']\n';
  reportsSumaryString += prefix + 'Horas' +separator;
  reportsSumaryString += reportsSummary.totals.hours;
  reportsSumaryString += ' [~' + reportsSummary.averages.hours.toFixed(2) +']\n';
  reportsSumaryString += prefix + 'Revisitas' +separator;
  reportsSumaryString += reportsSummary.totals.returnVisits;
  reportsSumaryString += ' [~' + reportsSummary.averages.returnVisits.toFixed(2) +']\n';
  reportsSumaryString += prefix + 'Cursos bíblicos' +separator;
  reportsSumaryString += reportsSummary.totals.bibleStudies 
  reportsSumaryString += ' [~' + reportsSummary.averages.bibleStudies.toFixed(2) +']\n';
  return reportsSumaryString;
}

function getAppointmentString(appointmentObject, groupName, prefix = '', detailed=true){
  let appointmentString = ''
  if (appointmentObject.publishers.length>0)  {
    appointmentString += prefix + 'Nuevos publicadores ' + groupName +' [' + appointmentObject.publishers.length +']:\n- ';
    if (detailed) {
      appointmentString += getAppointmentDetail(appointmentObject.publishers);
    }
  }  
  if (appointmentObject.inmersed.length>0)  {
    appointmentString += prefix + 'Nuevos bautismos ' + groupName +' [' + appointmentObject.inmersed.length +']:\n- ';
    if (detailed) {
      appointmentString += getAppointmentDetail(appointmentObject.inmersed);
    }
  }
  if (appointmentObject.regularPioneers.length>0)  {
    appointmentString += prefix + 'Nuevos precursores regulares ' + groupName +' [' + appointmentObject.regularPioneers.length +']:\n- ';
    if (detailed) {
      appointmentString += getAppointmentDetail(appointmentObject.regularPioneers);
    }
  }
  if (appointmentObject.auxiliaryPioneers.length>0)  {
    appointmentString += prefix + 'Diferentes precursores auxiliares ' + groupName +' [' + appointmentObject.auxiliaryPioneers.length +']:\n- ';
    if (detailed) {
      appointmentString += getAppointmentDetail(appointmentObject.auxiliaryPioneers);
    }
  }
  if (appointmentObject.anointed.length>0)  {
    appointmentString += prefix + 'Nuevos ungidos ' + groupName +' [' + appointmentObject.anointed.length +']:\n- ';
    if (detailed) {
      appointmentString += getAppointmentDetail(appointmentObject.anointed);
    }
  }
  if (appointmentObject.bethelMembers.length>0)  {
    appointmentString += prefix + 'Nuevos betelitas ' + groupName +' [' + appointmentObject.bethelMembers.length +']:\n- ';
    if (detailed) {
      appointmentString += getAppointmentDetail(appointmentObject.bethelMembers);
    }
  }
  return appointmentString;
}

function writeResultsTitleRow(titleRow, rangeOut, row, col) {

  const values = rangeOut.getValues();
  const fontSizes = rangeOut.getFontSizes();

  titleRow.forEach(value => {
      values[row][col] = value;
      fontSizes[row][col] = 13;
      col++;
  });
  
  rangeOut.setValues(values);
  rangeOut.setFontSizes(fontSizes);
  rangeOut.setVerticalAlignment("Top");
}

function writeResultsMatrix(matrix, rangeOut, row, col) {

  const values = rangeOut.getValues();
  const fontSizes = rangeOut.getFontSizes();

  matrix.forEach(arrayValues => {
    let rowCol = row;      
    arrayValues.forEach(value => {
      values[rowCol][col] = value;
      fontSizes[rowCol][col] = 11;
      rowCol++;
    })
    col++;
  });

  rangeOut.setValues(values);
  rangeOut.setFontSizes(fontSizes);
  rangeOut.setVerticalAlignment("Top");
}

function writeAllReports (summaryData, rangeOut){
  writeGroupMembers(summaryData, rangeOut, 1, 1);
  writeMissingReports(summaryData, rangeOut, 6, 1);
  writeActivityReport(summaryData, rangeOut, 9, 1);
  writeAppointmentReport(summaryData, rangeOut, 16, 1);
}

function writeAppointmentReport(summaryData, rangeOut, row=1, col=1){

  writeResultsTitleRow(
     ['Informe de nombramientos para el periodo ' + 
      getDateString(summaryData.firstDate) +' a ' + 
      getDateString(summaryData.lastDate) + ':'
     ],
    rangeOut, row, col
  );
  
  const matrixValues = [];  
  
  matrixValues.push(
    [getAppointmentString(summaryData.congregation.appointments, 'Congregación')]
  );
  
  row++;
  matrixValues.push([]);


  Object.entries(summaryData.groups).forEach(([uuid, group]) => {
    matrixValues.push(
      [getAppointmentString(group.appointments, group.name)]
    );
  })
  
  writeResultsMatrix(matrixValues, rangeOut, row, col);
}

function writeGroupMembers(summaryData, rangeOut, row=1, col=1){
  
  writeResultsTitleRow(
     ['Publicadores por grupo ' + 
       getServiceYearString(getServiceYear(summaryData.lastDate))+ ':'
     ],
    rangeOut, row, col
  );

  const matrixValues = [];
  
  row++;
  matrixValues.push([]);
  matrixValues.push([]);


  Object.entries(summaryData.groups).forEach(([uuid, group]) => {
    const activePublishers = group.activity.activePublishers
    const inactivePublishers = group.activity.currentInactives
    matrixValues.push([
      group.name + 
      ' [' + activePublishers.length +
      '+' + inactivePublishers.length +
      ']:\n',

      activePublishers.map(name => {
        return name.split(' [')[0]
      }).sort().join('\n'),
      
      inactivePublishers.map(name => {
        return name.split(' [')[0]
      }).sort().join('\n')
    ])
  });

  writeResultsMatrix(matrixValues, rangeOut, row=1, col=1);
}

function writeMissingReports(summaryData, rangeOut, row=1, col=1){
  writeResultsTitleRow(
    ['Publicadores con informes sin entregar en el periodo ' + 
      getDateString(summaryData.firstDate) +' a ' + 
      getDateString(summaryData.lastDate) + ':'
    ],
    rangeOut, row, col);

  const matrixValues = [];

  matrixValues.push(
    ['Informes pendientes congregación ' + 
      '[' + summaryData.congregation.activity.irregulars.length + ']:\n- ' + 
      summaryData.congregation.activity.irregulars.join('\n- ')
    ]
  );

  row++;
  matrixValues.push([]);
  
  Object.entries(summaryData['groups']).forEach(([uuid, group]) => {
    matrixValues.push(
      ['Informes pendientes del ' + group.name + ' ' +
        '[' + group.activity.irregulars.length + ']:\n- ' + 
        group.activity.irregulars.join('\n-')
      ]
    );
  });

  writeResultsMatrix(matrixValues, rangeOut, row, col);
}

function writeActivityReport(summaryData, rangeOut, row=1, col=1){
  const matrixValues = [];

  writeResultsTitleRow(
    ['Informe de actividad para el periodo ' + 
    getDateString(summaryData.firstDate) +' a ' + 
    getDateString(summaryData.lastDate) + ':'
    ],
    rangeOut, row, col
  );

  matrixValues.push(
    getActivitiesArray(summaryData.congregation, 'congregación')
  );

  row++;
  matrixValues.push([]);

  Object.entries(summaryData.groups).forEach(([uuid, group]) => {
    matrixValues.push(
      getActivitiesArray(group, group.name)
    );
  });
  
  writeResultsMatrix(matrixValues, rangeOut, row, col);
}
