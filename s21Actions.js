const source = '1ZQIz_KErldGIGEzSnmCTTCliLr0Us1nVijyFDBp6ipI'

class ActionInput  {
  constructor(
    givenName, actionName, actionDate, statusName, aditionalInfo, fullName, nickName, 
    gender, birthDate, inmersedDate, address, phone, movile, email, hours){
    this.givenName = givenName;
    this.actionName = actionName;
    this.dateAction = new Date(actionDate);
    this.statusName = statusName;
    this.aditionalInfo = aditionalInfo;
    this.fullName = fullName;
    this.nickName = nickName;
    this.gender = gender;
    this.birthDate = birthDate;
    this.inmersedDate = inmersedDate;
    this.address = address;
    this.phone = phone;
    this.movile = movile;
    this.email = email;
    this.hours = hours;
   }

  
  fillData(dataBase) {    
    dataBase.loadData();
    const actionTypes = Object.values(dataBase.actionTypes);    
    const action = actionTypes.filter(action => {
      return action.name.toLowerCase() == this.actionName.toLowerCase()
    })[0];
    
    let publisher;

    if (action.uuid == '5cwVSeAcE4YlnWv4WRP4') {      
      publisher = new Publisher(
        getUuid(),
        this.fullName,
        this.address,
        this.phone,
        this.movile,
        this.nickName,
        this.email,
        this.birthDate,
        this.gender.toLowerCase() == 'masculino' ? 'male' : 'female' 
      )
    } else {
      publisher = dataBase.getPublisherByWords(this.givenName);
    }

    this.status = this.statusName == "Alta"? 1:0;
    this.addEndRow = (this.aditionalInfo == "Solo un mes" && this.status == 1) ? true: false;
    this.publisher = publisher;
    this.action = action;
  }
}

function actionRow(sh, source, targetRow){
  const s21wb = new S21WorkBook(source);  
  const shValues = sh.getRange(1,1,sh.getMaxRows(), sh.getMaxColumns()).getValues();
  const shHeaders = shValues.shift();

  const actionInput = new ActionInput(
    shValues[targetRow][shHeaders.indexOf('Nombre')],
    shValues[targetRow][shHeaders.indexOf('Privilegio')],
    shValues[targetRow][shHeaders.indexOf('Fecha')],
    shValues[targetRow][shHeaders.indexOf('Tipo de acción')],
    shValues[targetRow][shHeaders.indexOf('Marca la casilla si se solicita el precursorado de continuo')],
    shValues[targetRow][shHeaders.indexOf('Nombre Completo')],
    shValues[targetRow][shHeaders.indexOf('Alias')],
    shValues[targetRow][shHeaders.indexOf('Genero')],
    shValues[targetRow][shHeaders.indexOf('Fecha de nacimiento')],
    shValues[targetRow][shHeaders.indexOf('Fecha de bautismo')],
    shValues[targetRow][shHeaders.indexOf('Dirección')],
    shValues[targetRow][shHeaders.indexOf('Teléfono fijo')],
    shValues[targetRow][shHeaders.indexOf('Teléfono móvil')],
    shValues[targetRow][shHeaders.indexOf('Correo electrónico')],
    shValues[targetRow][shHeaders.indexOf('Horas')],
  );

  const dataBase = new DataBase(source, 'spreadsheet');
  actionInput.fillData(dataBase);
  
  if (!actionInput.publisher) {
    return;
  }

  const newRows = actionInput.addEndRow ? 2:1;

  s21wb.actionsSheet.insertRows(2, newRows);

  const actionRange = s21wb.actionsSheet.getRange(
    1,1,
    s21wb.actionsSheet.getMaxRows(), 
    s21wb.actionsSheet.getMaxColumns()
  );  

  const actionValues = actionRange.getValues();  

  actionValues[newRows][s21wb.actionsHeaders.indexOf('uuid')] = getUuid();
  actionValues[newRows][s21wb.actionsHeaders.indexOf('actionDate')] = actionInput.dateAction;
  actionValues[newRows][s21wb.actionsHeaders.indexOf('status')] = actionInput.status;   
  actionValues[newRows][s21wb.actionsHeaders.indexOf('publisher')] = actionInput.publisher.uuid;
  actionValues[newRows][s21wb.actionsHeaders.indexOf('publisherName')] = actionInput.publisher.nickname;
  actionValues[newRows][s21wb.actionsHeaders.indexOf('action')] = actionInput.action.uuid;
  actionValues[newRows][s21wb.actionsHeaders.indexOf('actionName')] = actionInput.action.name;
  
  if (actionInput.addEndRow) {
    actionValues[1][s21wb.actionsHeaders.indexOf('uuid')] = getUuid();
    actionValues[1][s21wb.actionsHeaders.indexOf('actionDate')] = getLastMonthDate(actionInput.dateAction);
    actionValues[1][s21wb.actionsHeaders.indexOf('status')] = 0;   
    actionValues[1][s21wb.actionsHeaders.indexOf('publisher')] = actionInput.publisher.uuid;
    actionValues[1][s21wb.actionsHeaders.indexOf('publisherName')] = actionInput.publisher.nickname;
    actionValues[1][s21wb.actionsHeaders.indexOf('action')] = actionInput.action.uuid;
    actionValues[1][s21wb.actionsHeaders.indexOf('actionName')] = actionInput.action.name;     
  }

  actionRange.setValues(actionValues);

  status = true;

  if (actionInput.action.uuid == '5cwVSeAcE4YlnWv4WRP4') {
    status = createNewPublisherRow(source, actionInput)
  }
  if (!status) {
    console.log('Error al crear el publicador');
    return;
  }

  shValues[targetRow][shHeaders.indexOf('¿Recibida?')] = "TRUE";

  // add headers
  shValues.unshift(shHeaders);
  sh.getRange(1,1,sh.getMaxRows(), sh.getMaxColumns()).setValues(shValues);

}


function addToGroupRow(sh, source, targetRow){
  
  const s21wb = new S21WorkBook(source);  
  const dataBase = new DataBase(source, 'spreadsheet');
  dataBase.loadData();
  
  const shValues = sh.getRange(1,1,sh.getMaxRows(), sh.getMaxColumns()).getValues();
  const shHeaders = shValues.shift();

  const givenName = shValues[targetRow][shHeaders.indexOf('Nombre')];
  const publisher = dataBase.getPublisherByWords(givenName);

  let serviceYear =  shValues[targetRow][shHeaders.indexOf('Año de servicio')]
  const groups = dataBase.getGroupsByServiceYear(serviceYear)
  const group = Object.values(groups).filter(
    a => {
      return a.name.toLowerCase() == shValues[targetRow][shHeaders.indexOf('Grupo')].toLowerCase()
    }
  )[0]

  s21wb.publisherGroupsSheet.insertRows(2, 1);

  const publisherGroupRange = s21wb.publisherGroupsSheet.getRange(1,1,s21wb.publisherGroupsSheet.getMaxRows(), s21wb.publisherGroupsSheet.getMaxColumns());
  const publisherGroupValues = publisherGroupRange.getValues();

  const publisherGroupDate = getLastMonthDate(new Date(shValues[targetRow][shHeaders.indexOf('Fecha')]));

  publisherGroupValues[1][s21wb.publishersGroupsHeaders.indexOf('group_uuid')] = group.uuid;
  publisherGroupValues[1][s21wb.publishersGroupsHeaders.indexOf('publisher_uuid')] = publisher.uuid;
  publisherGroupValues[1][s21wb.publishersGroupsHeaders.indexOf('group_name')] = group.name;
  publisherGroupValues[1][s21wb.publishersGroupsHeaders.indexOf('publisher_name')] = publisher.nickname;
  publisherGroupValues[1][s21wb.publishersGroupsHeaders.indexOf('year')] = serviceYear;

  publisherGroupRange.setValues(publisherGroupValues);

  
  shValues[targetRow][shHeaders.indexOf('¿Recibida?')] = "TRUE";

  // add headers
  shValues.unshift(shHeaders);
  sh.getRange(1,1,sh.getMaxRows(), sh.getMaxColumns()).setValues(shValues);
}


function creditsRow(sh, source, targetRow){
  
  const s21wb = new S21WorkBook(source);  
  const dataBase = new DataBase(source, 'spreadsheet');
  dataBase.loadData();
  
  const shValues = sh.getRange(1,1,sh.getMaxRows(), sh.getMaxColumns()).getValues();
  const shHeaders = shValues.shift();

  const givenName = shValues[targetRow][shHeaders.indexOf('Nombre')];
  const publisher = dataBase.getPublisherByWords(givenName);

  s21wb.creditsSheet.insertRows(2, 1);

  const creditsRange = s21wb.creditsSheet.getRange(1,1,s21wb.creditsSheet.getMaxRows(), s21wb.creditsSheet.getMaxColumns());
  const creditsValues = creditsRange.getValues();

  const creditDate = getLastMonthDate(new Date(shValues[targetRow][shHeaders.indexOf('Fecha')]));

  creditsValues[1][s21wb.creditsHeaders.indexOf('uuid')] = getUuid();
  creditsValues[1][s21wb.creditsHeaders.indexOf('publisher')] = publisher.uuid;
  creditsValues[1][s21wb.creditsHeaders.indexOf('hours')] = shValues[targetRow][shHeaders.indexOf('Horas')];
  creditsValues[1][s21wb.creditsHeaders.indexOf('creditDate')] = getYearMonthDate(creditDate);
  creditsValues[1][s21wb.creditsHeaders.indexOf('nickname')] = publisher.nickname;

  creditsRange.setValues(creditsValues);

  
  shValues[targetRow][shHeaders.indexOf('¿Recibida?')] = "TRUE";

  // add headers
  shValues.unshift(shHeaders);
  sh.getRange(1,1,sh.getMaxRows(), sh.getMaxColumns()).setValues(shValues);
}


function createNewPublisherRow(source, actionInput) {

  const s21wb = new S21WorkBook(source);  
  s21wb.publisherSheet.insertRows(2, 1);
  
  const publisherRange = s21wb.publisherSheet.getRange(
    1,1,
    s21wb.publisherSheet.getMaxRows(), 
    s21wb.publisherSheet.getMaxColumns()
  );  

  const publisherValues = publisherRange.getValues();  

  publisherValues[1][s21wb.publishersHeaders.indexOf('uuid')] = actionInput.publisher.uuid;
  publisherValues[1][s21wb.publishersHeaders.indexOf('fullname')] = actionInput.publisher.fullname;
  publisherValues[1][s21wb.publishersHeaders.indexOf('nickname')] = actionInput.publisher.nickname;
  publisherValues[1][s21wb.publishersHeaders.indexOf('address')] = actionInput.publisher.address;   
  publisherValues[1][s21wb.publishersHeaders.indexOf('phone')] = actionInput.publisher.phone;
  publisherValues[1][s21wb.publishersHeaders.indexOf('movile')] = actionInput.publisher.movile;
  publisherValues[1][s21wb.publishersHeaders.indexOf('email')] = actionInput.publisher.email;
  publisherValues[1][s21wb.publishersHeaders.indexOf('gender')] = actionInput.publisher.gender;
  publisherValues[1][s21wb.publishersHeaders.indexOf('birthDate')] = actionInput.publisher.birthDate;
  publisherValues[1][s21wb.publishersHeaders.indexOf('gender')] = actionInput.publisher.gender;
  
  publisherRange.setValues(publisherValues);

 
  if (typeof actionInput.inmersedDate != 'undefined' && actionInput.inmersedDate != "") {

    s21wb.actionsSheet.insertRows(2, 1);

    const actionRange = s21wb.actionsSheet.getRange(
      1,1,
      s21wb.actionsSheet.getMaxRows(), 
      s21wb.actionsSheet.getMaxColumns()
    );  

    const actionValues = actionRange.getValues(); 
    actionValues[1][s21wb.actionsHeaders.indexOf('uuid')] = getUuid();
    actionValues[1][s21wb.actionsHeaders.indexOf('actionDate')] = actionInput.inmersedDate;
    actionValues[1][s21wb.actionsHeaders.indexOf('status')] = 1;   
    actionValues[1][s21wb.actionsHeaders.indexOf('publisher')] = actionInput.publisher.uuid;
    actionValues[1][s21wb.actionsHeaders.indexOf('publisherName')] = actionInput.publisher.nickname;
    actionValues[1][s21wb.actionsHeaders.indexOf('action')] = 'Lb6Cc5YQ2DDahusoB7eK';
    actionValues[1][s21wb.actionsHeaders.indexOf('actionName')] = 'Bautismo';
    
    actionRange.setValues(actionValues);
  }

  return true;
}


function checkPublishers (s21wb, dataBase, date) {

  dataBase.loadData();

  let currentServiceYear = getServiceYear(date);
  let withoutGroupPublishers = Object.values(dataBase.publishers).filter(publisher => {
    return publisher.groups[currentServiceYear] == undefined;
  });

  if (withoutGroupPublishers.length > 0) {
    let names = Object.values(withoutGroupPublishers).map(publisher => {return publisher.fullname +' - ' + publisher.uuid}).join('\n');
    let ui = SpreadsheetApp.getUi();
    ui.alert(
      'Publicadores sin grupo', 
      'Se han encontrado publicadores que no están asignados a ningún grupo de predicación. Por favor, dalos de alta: \n\n' +
      names, 
      ui.ButtonSet.OK
    );
  }
}


function onActionEntry(ss, sh, source) {

  let targetRow = ss.getActiveRange().getRow()-2;  
  const rowsCount = ss.getActiveRange().getNumRows();
  const range = sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns());
  const values = range.getValues();
  const headers = values[0];

  for (let row=targetRow; row< targetRow + rowsCount; row++) {
    const privilege = values[targetRow+1][headers.indexOf('Privilegio')];
    switch (privilege.toLowerCase()){
      case 'créditos':
        creditsRow(sh, source, row);
        break;
      case 'asignar a grupo':
        addToGroupRow(sh, source,row);
      default:
        actionRow(sh, source, row);
    }
  }

  const column = headers.indexOf('Marca temporal') + 1;
  range.sort({column:column, ascending:false})
}


/**
 * Function to simulate action entry
 */
function simulateOnActionEntry() {

  const s21source = '1ZQIz_KErldGIGEzSnmCTTCliLr0Us1nVijyFDBp6ipI'; //AzuquecaNorte
  const actionSource = "1EgrtrfATJQc8rEMo75Hdjnpfr_-8lhIRQEoTZ1Byebg" //AzuquecaNorte

  const ss = SpreadsheetApp.openById(actionSource);
  const sh = ss.getSheetByName("ActionInputs");

  ss.setActiveRange(ss.getRange("b462"));
  onActionEntry(ss, sh, s21source);
}
