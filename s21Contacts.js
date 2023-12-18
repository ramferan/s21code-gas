function onContactEntry(sh, source) {
  const targetRow = sh.getActiveRange().getRow()-2;
  const shValues = sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).getValues();
  const shHeaders = shValues.shift();

  const contactInput = new Contact(
    shValues[targetRow][shHeaders.indexOf('uuid')],
    shValues[targetRow][shHeaders.indexOf('uuid_publisher')],
    shValues[targetRow][shHeaders.indexOf('Marca temporal')],
    shValues[targetRow][shHeaders.indexOf('Nombre del publicador')],
    shValues[targetRow][shHeaders.indexOf('Nombre persona de contacto')],
    shValues[targetRow][shHeaders.indexOf('Datos de conctacto')],
    shValues[targetRow][shHeaders.indexOf('¿Acepta la persona que guardemos los datos que nos proporcionas para que podamos contactar con ella en caso de emergencia?')],
    shValues[targetRow][shHeaders.indexOf('Comentarios')],
  );

  const dataBase = new DataBase(source, 'spreadsheet');
  dataBase.loadData();
  const publisher = dataBase.getPublisherByWords(contactInput.publisherGivenName);

  shValues[targetRow][shHeaders.indexOf('uuid')] = getUuid();

  if (publisher != undefined) {
    shValues[targetRow][shHeaders.indexOf('uuid_publisher')] = publisher.uuid;
    shValues[targetRow][shHeaders.indexOf('nickname')] = publisher.nickname;
  }

  // write worksheet
  shValues.unshift(shHeaders); // add headers
  sh.getRange(1,1,sh.getMaxRows(), sh.getMaxColumns()).setValues(shValues);
}

function onUpdatePublishersWithNoContactData(ss, sh, source) {
  const targetRow = sh.getActiveRange().getRow()-2;
  const s21wb = new S21WorkBook(source);  
  const shValues = sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).getValues();
  const shHeaders = shValues.shift();

  const dataBase = new DataBase(source, 'spreadsheet');
  dataBase.loadData();
  const serviceYear = getServiceYear(new Date())
  const groups = dataBase.getGroupsByServiceYear(serviceYear-1);

}

/**
 * Function to simulate contact entry
 */
function simulateOnContactEntry() {
  const s21source = "1ZQIz_KErldGIGEzSnmCTTCliLr0Us1nVijyFDBp6ipI"; //AzuquecaNorte
  const contactSource = "1eIEcvQcveENyeK8g6NvuTq6Wden_KWz3HvwJm_PaONA"; //AzuquecaNorte

  const ss = SpreadsheetApp.openById(contactSource);
  const sh = ss.getSheetByName("ContactInputs");

  ss.setActiveRange(ss.getRange("b2"));

  onContactEntry(sh, s21source);
}

/**
 * Function to simulate contact entry
 */
function simulateOnUpdatePublishersWithNoContactData() {
  const s21source = "1ZQIz_KErldGIGEzSnmCTTCliLr0Us1nVijyFDBp6ipI"; //AzuquecaNorte
  const contactSource = "1eIEcvQcveENyeK8g6NvuTq6Wden_KWz3HvwJm_PaONA"; //AzuquecaNorte

  const ss = SpreadsheetApp.openById(contactSource);
  const sh = ss.getSheetByName("ContactInputs");

  ss.setActiveRange(ss.getRange("b2"));

  onUpdatePublishersWithNoContactData(ss, sh, s21source);
}