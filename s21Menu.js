function createS21Menu (ui) {

  var tm0 = new Date().getTime(); 

  ui.createMenu("S21")
  
    .addSubMenu(ui.createMenu('Entradas')
      .addItem('Ordenar hoja', 'formatReports')
      .addItem('Simular entrada', 'onReportEntry')
    )

    .addSubMenu(ui.createMenu('Tarjetas')
      .addItem('Tarjetas selección', 'onGetSelectionS21Cards')
      .addItem('Tarjetas selección PDF', 'onGetSelectionS21CardsPDF')
    ) 

    .addSubMenu(ui.createMenu('Resúmenes')
      .addItem('Grupos', 'onAskPanel')
      .addItem('Actividad', 'onAskPanel')
      .addItem('Promedios', 'onAskPanel')
    )

    .addToUi()
       
  
  var tm_all = (new Date().getTime() - tm0)/1000;
  
  Logger.log("Menu created in " +tm_all +' scs.');
}