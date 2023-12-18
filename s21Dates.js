function getDateHourString(date, reverse=false, separator='.'){  
  return getDateString(date, reverse, separator) + ' ' +
         date.toLocaleTimeString('en-GB').slice(0,5);    
}

function getDateString(date, reverse=false,separator='.'){
  let dateString = ("0" + date.getDate()).slice(-2) + separator +
                   ("0" + (date.getMonth() + 1)).slice(-2) + separator +
                   date.getFullYear();    

  if (reverse) {
    dateString = dateString.split(separator).reverse().join(separator);
    //date = dateParts[2] + separator + dateParts[1] + separator + dateParts[0]; 
  }  
  return dateString;           
}

function getHourString(date){
  return date.toLocaleTimeString('en-GB').slice(0,5);    
}

function getServiceYear(date){
  return date.getFullYear() + (date.getMonth() >=8? 1:0);
}

function getServiceYearString(serviceYear) {
  return (serviceYear-1) +'-' + serviceYear;
}

function getYearMonthDate(date){
  return date.toISOString().substr(0, 7).replace('-','.');
}

function getS21MonthString(date){
  const monthsNames = [
    'Enero', 
    'Febrero',
    'Marzo', 
    'Abril', 
    'Mayo', 
    'Junio', 
    'julio',
    'Agosto', 
    'Septiembre',
    'Octubre',
    'Noviembre', 
    'Diciembre'
  ];
  const dateMonthName = monthsNames[date.getMonth()].toUpperCase();
  const yearString = dateString = date.toISOString().substr(2,2);
  return dateMonthName + " '" + yearString;
}

function getS21MonthShift(month) {
    return month >= 8 ? month - 8 : month + 4;
}

function getReportDateString(date){
  const dateString = date.toISOString().substr(0, 7).replace('-','.');

  const monthsNames = [
    'Enero', 
    'Febrero',
    'Marzo', 
    'Abril', 
    'Mayo', 
    'Junio', 
    'julio',
    'Agosto', 
    'Septiembre',
    'Octubre',
    'Noviembre', 
    'Diciembre'
  ];
  const dateMonthName = monthsNames[date.getMonth()];
  return dateString + " [" +dateMonthName +"]";
}

function getFirstMonthDate(date) {
    return new Date(date.getFullYear(), date.getMonth(),1);
}

function getLastMonthDate (date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getDateShiftDays (date, shiftDays) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate()+shiftDays);
  return newDate;
}

function getMonthsDifference(dateFrom, dateTo) {
    var months;
    months = (dateTo.getFullYear() - dateFrom.getFullYear()) * 12;
    months -= dateFrom.getMonth();
    months += dateTo.getMonth();
    return months <= 0 ? 0 : months;
}

function getDatesList(dateFrom, dateTo) {
  const listDates = [];

  let df = getLastMonthDate(new Date(dateFrom));
  let dt = getLastMonthDate(new Date(dateTo));
  
  listDates.push(df);    
  while(df.getTime() < dt.getTime()) {
    df = getLastMonthDate(getDateShiftDays(df,1));
    listDates.push(df);    
  }
  return listDates;
  
}

function getReportMonthsList (dateFrom, dateTo){
  return getDatesList(dateFrom, dateTo).map(date => {
    return getLastMonthDate(date)
  });
}