
class Collection {

  constructor (){}

  /**
   * Filter collection by field
   * @param {Object} collection - The collection to filter 
   * @param {string} field - The collection field to filter
   * @param {string} value - The field value to filter with 
   */
  filterCollectionByField(collection,field, value) {
    return Object.fromEntries(Object.entries(collection).filter(([uuid,item]) => {
      return item[field] == value;
    }));
  }

  /**
   * Get filtered collection by congregation
   * @param {Object} collection - The collection to filter 
   * @param {string} field - The collection field to filter
   * @param {string} congregation - The congregation uuid to filter with
   */
  filterCollectionByCongregation(collection, congregation) {
    if (typeof(this.congregations[congregation]) === 'undefined') {
      return
    }
    return Object.fromEntries(Object.entries(collection).filter(([uuid, item]) => {
      return this.congregations[congregation].publishers.indexOf(item.uuid) !== -1;
    }));
  }
  
  /**
   * Filter collection by dates
   * @param {Object} collection - The collection to filter 
   * @param {string} field - The collection field to filter
   * @param {Date} firstDate - first date to filter with, included
   * @param {Date} lastDate - last date to filter with, included  
   */
  filterCollectionByFieldDates(collection, field, firstDate, lastDate) {
    return Object.fromEntries(Object.entries(collection).filter(([uuid,item]) => {
      return item[field].getTime() >= firstDate.getTime() &&
             item[field].getTime() <= lastDate.getTime();
    }));
  }
}


class S21WorkBook {
  constructor (publisherspreadsheet) {
    this.spreadsheet = SpreadsheetApp.openById(publisherspreadsheet); 

    // load sheets
    this.congregationsSheet = this.spreadsheet.getSheetByName('congregationsData');
    this.publisherSheet = this.spreadsheet.getSheetByName('publishersData');
    this.groupsSheet = this.spreadsheet.getSheetByName('groupsData');
    this.publisherGroupsSheet = this.spreadsheet.getSheetByName('publishersGroups');
    this.reportsSheet = this.spreadsheet.getSheetByName('reportsData');
    this.actionsSheet = this.spreadsheet.getSheetByName('actionsData');
    this.actionTypesSheet = this.spreadsheet.getSheetByName('actionTypesData');
    this.creditsSheet = this.spreadsheet.getSheetByName('creditsData');
    this.reportGroupsSheet = this.spreadsheet.getSheetByName('Grupos');

    // load data from sheets
    this.congregationsData = this.congregationsSheet.getRange(
      1, 1,
      this.congregationsSheet.getMaxRows(), 
      this.congregationsSheet.getMaxColumns()
    ).getValues(); 
                                                              
    this.publishersData = this.publisherSheet.getRange(
      1, 1,
      this.publisherSheet.getMaxRows(), 
      this.publisherSheet.getMaxColumns()
    ).getValues();
                                                       
    this.groupsData = this.groupsSheet.getRange(
      1, 1,
      this.groupsSheet.getMaxRows(), 
      this.groupsSheet.getMaxColumns()
    ).getValues();             

    this.publishersGroupsData = this.publisherGroupsSheet.getRange(
      1, 1,
      this.publisherGroupsSheet.getMaxRows(), 
      this.publisherGroupsSheet.getMaxColumns()
    ).getValues();

    this.reportsData = this.reportsSheet.getRange(
      1, 1,
      this.reportsSheet.getMaxRows(), 
      this.reportsSheet.getMaxColumns()
    ).getValues();
    
    this.actionsData = this.actionsSheet.getRange(
      1, 1,
      this.actionsSheet.getMaxRows(), 
      this.actionsSheet.getMaxColumns()
    ).getValues()

    this.actionTypesData = this.actionTypesSheet.getRange(
      1, 1,
      this.actionTypesSheet.getMaxRows(), 
      this.actionTypesSheet.getMaxColumns()
    ).getValues();
    
    this.creditsData = this.creditsSheet.getRange(
      1, 1,
      this.creditsSheet.getMaxRows(), 
      this.creditsSheet.getMaxColumns()
    ).getValues();
    
    // load data from sheets. Remember shift(1) removes headers in original data
    this.congregationsHeaders = this.congregationsData.shift(1);  
    this.publishersHeaders = this.publishersData.shift(1); 
    this.groupsHeaders = this.groupsData.shift(1); 
    this.publishersGroupsHeaders = this.publishersGroupsData.shift(1); 
    this.reportsHeaders = this.reportsData.shift(1); 
    this.actionsHeaders= this.actionsData.shift(1); 
    this.actionTypesHeaders = this.actionTypesData.shift(1); 
    this.creditsHeaders = this.creditsData.shift(1); 
  }
}


class PublisersGroup extends Collection{
  constructor(publishers){
    super();
    this.publishers = publishers;
  }


  /**
   * Get publishers who was serving as publisher filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getPublishers(firstDate, lastDate, onlyNew=false, onlyCurrent=false){

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.fromEntries(Object.entries(this.publishers).filter(([uuid,publisher]) => {
      
      let c1= true, c2 = true;
      
      if (onlyNew) {
        c1 = publisher.wasNewPublisherOnDates(firstDate, lastDate);
      }

      if (onlyCurrent) {
        firstDate = lastDate;
      }

      c2 = publisher.serveAsPublisherOnDates(firstDate, lastDate);
    
      return c1 && c2;    
    }));
  }  


  /**
   * Get publishers who was serving as publisher but not as pioneer filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getPlainPublishers(firstDate, lastDate, onlyNew=false, onlyCurrent=false){

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.fromEntries(Object.entries(this.publishers).filter(([uuid,publisher]) => {
      let c1= true, c2 = true;
      
      if (onlyNew) {
        c1 = publisher.wasNewPublisherOnDates(firstDate, lastDate);
      }

      if (onlyCurrent) {
        firstDate = lastDate;
      }

      c2 = publisher.serveAsPublisherOnDates(firstDate, lastDate) &&
          !publisher.serveAsAuxiliaryPioneerOnDates(firstDate, lastDate) && 
          !publisher.serveAsRegularPioneerOnDates(firstDate, lastDate);
    
      return c1 && c2;    
    }));
  }  
  

  /**
   * Get publishers who was serving as uninmersed publisher filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getUninmersedPublishers(firstDate, lastDate, onlyNew=false, onlyCurrent=false){

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.fromEntries(Object.entries(this.publishers).filter(([uuid,publisher]) => {
      let c1= true, c2 = true;

      if (onlyNew) {
        c1= publisher.wasNewPublisherOnDates(firstDate, lastDate);
      } 

      if (onlyCurrent) {
        firstDate = lastDate;
      }
      
      c2 = !publisher.serveAsInmersedOnDates(firstDate, lastDate);

      return c1 && c2;
    }));
  }


  /**
   * Get publishers who was serving as inmersed publisher filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getInmersedPublishers(firstDate, lastDate, onlyNew=false, onlyCurrent=false){

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.fromEntries(Object.entries(this.publishers).filter(([uuid,publisher]) => {
      let c1= true, c2 = true;

      if (onlyNew) {
        c1= publisher.wasNewInmersedOnDates(firstDate, lastDate);
      } 

      if (onlyCurrent) {
        firstDate = lastDate;
      }
      
      c2 = publisher.serveAsInmersedOnDates(firstDate, lastDate);

      return c1 && c2;
    }));
  }


  /**
   * Get publishers who was serving as auxiliar pioneer filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getAuxiliaryPioneers(firstDate, lastDate, onlyNew=false, onlyCurrent=false){

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.fromEntries(Object.entries(this.publishers).filter(([uuid,publisher])=> {

      let c1 = true, c2 = true;

      if (onlyNew) {
        c1 = publisher.wasNewAuxiliaryPioneerOnDates(firstDate, lastDate);
      }
      
      if (onlyCurrent) {
        firstDate = lastDate;
      }
      
      c2 = publisher.serveAsAuxiliaryPioneerOnDates(firstDate, lastDate);

      return c1 && c2;
    }));
  }


  /**
   * Get publishers who was serving as regular pioneer filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getRegularPioneers(firstDate, lastDate, onlyNew=false, onlyCurrent=false){

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.fromEntries(Object.entries(this.publishers).filter(([uuid,publisher]) => {

      let c1 = true, c2 = true;

      if (onlyNew) {
        c1 = publisher.wasNewRegularPioneerOnDates(firstDate, lastDate);
      }
      
      if (onlyCurrent) {
        firstDate = lastDate;
      }

      c2 = publisher.serveAsRegularPioneerOnDates(firstDate, lastDate);
      
      return c1 && c2;
    }));
  }


  /**
   * Get publishers who was serving as ministerial servant filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getMinisterialServants( firstDate, lastDate, onlyNew=false, onlyCurrent=false){

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.fromEntries(Object.entries(this.publishers).filter(([uuid,publisher]) => {

      let c1 = true, c2 = true;

      if (onlyNew) {
        c1 = publisher.wasNewMinisterialServantOnDates(firstDate, lastDate);
      }
      
      if (onlyCurrent) {
        firstDate = lastDate;
      }

      c2 = publisher.serveAsMinisterialServantOnDates(firstDate, lastDate);
      
      return c1 && c2;
    }));
  }


  /**
   * Get publishers who was serving as elder filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getElders(firstDate, lastDate, onlyNew=false, onlyCurrent=false){

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.fromEntries(Object.entries(this.publishers).filter(([uuid,publisher]) => {

      let c1 = true, c2 = true;

      if (onlyNew) {
        c1 = publisher.wasNewElderOnDates(firstDate, lastDate);
      }
      
      if (onlyCurrent) {
        firstDate = lastDate;
      }

      c2 = publisher.serveAsElderOnDates(firstDate, lastDate);
      
      return c1 && c2;
    }));
  }


  /**
   * Get publishers who was serving as annointed filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getAnointedOnes(firstDate, lastDate, onlyNew=false, onlyCurrent=false){

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.fromEntries(Object.entries(this.publishers).filter(([uuid,publisher]) => {

      let c1 = true, c2 = true;

      if (onlyNew) {
        c1 = publisher.wasNewAnointedOnDates(firstDate, lastDate);
      }
      
      if (onlyCurrent) {
        firstDate = lastDate;
      }

      c2 = publisher.serveAsAnointedOnDates(firstDate, lastDate);
      
      return c1 && c2;
    }));
  }


  /**
   * Get publishers who was serving as bethel member filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getBethelMembers(firstDate, lastDate, onlyNew=false, onlyCurrent=false){

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.fromEntries(Object.entries(this.publishers).filter(([uuid,publisher]) => {

      let c1 = true, c2 = true;

      if (onlyNew) {
        c1 = publisher.wasNewBethelMemberOnDates(firstDate, lastDate);
      }
      
      if (onlyCurrent) {
        firstDate = lastDate;
      }

      c2 = publisher.serveAsBethelMemberOnDates(firstDate, lastDate);
      
      return c1 && c2;
    }));
  }


  /**
   * Get publishers who was serving as construction member filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getConstructionMembers(firstDate, lastDate, onlyNew=false, onlyCurrent=false){
    
    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.fromEntries(Object.entries(this.publishers).filter(([uuid,publisher]) => {

      let c1 = true, c2 = true;

      if (onlyNew) {
        c1 = publisher.wasNewConstructionMemberOnDates(firstDate, lastDate);
      }
      
      if (onlyCurrent) {
        firstDate = lastDate;
      }

      c2 = publisher.serveAsConstructionMemberOnDates(firstDate, lastDate);
      
      return c1 && c2;
    }));
  }


  /**
   * Get publishers who was serving as missionary member filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getMissionaries(firstDate, lastDate, onlyNew=false, onlyCurrent=false){
    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.fromEntries(Object.entries(this.publishers).filter(([uuid,publisher]) => {

      let c1 = true, c2 = true;

      if (onlyNew) {
        c1 = publisher.wasNewMissionaryOnDates(firstDate, lastDate);
      }
      
      if (onlyCurrent) {
        firstDate = lastDate;
      }

      c2 = publisher.serveAsMissionaryOnDates(firstDate, lastDate);
      
      return c1 && c2;
    }));
  }


  /**
   * Get publishers who was serving as special pioneer member filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getSpecialPioneers(firstDate, lastDate, onlyNew=false, onlyCurrent=false){
    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.fromEntries(Object.entries(this.publishers).filter(([uuid,publisher]) => {

      let c1 = true, c2 = true;

      if (onlyNew) {
        c1 = publisher.wasNewSpecialPioneerOnDates(firstDate, lastDate);
      }
      
      if (onlyCurrent) {
        firstDate = lastDate;
      }

      c2 = publisher.serveAsSpecialPioneerOnDates(firstDate, lastDate);
      
      return c1 && c2;
    }));
  }


  /**
   * Get irregular publishers filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getIrregulars(firstDate, lastDate, onlyNew=false, onlyCurrent=false) {

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.fromEntries(Object.entries(this.publishers).filter(([uuid,publisher]) => {
      
      if (!publisher.irregularDates){
        return false;
      }

      let c1Dates = ['true'], c2Dates = ['true'], c3Dates = ['true'];
      
      if (onlyNew) {
        c1Dates = publisher.irregularDates.filter(
          date => {
            return date.getTime() >= firstDate.getTime();
          }
        ) 
      }

      if (onlyCurrent) {
        c2Dates = publisher.irregularDates.filter(
          date => {
            return date.getTime() >= firstDate.getTime() &&
                    date.getTime() <= lastDate.getTime();
          }
        )
      }

      c3Dates = publisher.irregularDates;
      
      return c1Dates.length > 0 && c2Dates.length > 0 && c3Dates.length > 0;
    }));
  }


  /**
   * Get inactive publishers filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getInactives(firstDate, lastDate, onlyNew=false, onlyCurrent=false) {

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.fromEntries(Object.entries(this.publishers).filter(([uuid,publisher]) => {
        
        if (!publisher.inactiveDates){
          return false;
        }
        
        let inactiveDates = publisher.inactiveDates;

        if (onlyNew) {
          inactiveDates = inactiveDates.filter(
            date => {
              return date.getTime() >= firstDate.getTime() &&
                     date.getTime() <= lastDate.getTime();
          })
        }

        if(onlyCurrent) {

          let lastReportDate;

          lastReportDate = Object.values(publisher.reports).sort(
            (a,b) => {return b.reportDate.getTime() - a.reportDate.getTime();
          })[0].reportDate;

          inactiveDates = inactiveDates.filter(
            date => {return date.getTime() > lastReportDate.getTime();});
        }
        return inactiveDates.length > 0
      }
    ));
  }


  /**
   * Get active publishers filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getActivePublishers(firstDate, lastDate, onlyNew=false, onlyCurrent=false){

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.values(this.publishers).filter(publisher => {
      let inactives = this.getInactives(firstDate, lastDate, onlyNew=onlyNew, onlyCurrent=onlyCurrent)
      return Object.keys(inactives).indexOf(publisher.uuid) == -1;
    });
  }


  /**
   * Get reactived publishers filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getReactivedOnes(firstDate, lastDate, onlyNew=false, onlyCurrent=false){

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.fromEntries(Object.entries(this.publishers).filter(([uuid,publisher]) => {
      
      if (!publisher.reactivedDates){
        return false;
      }

      let c1Dates = ['true'], c2Dates = ['true'], c3Dates = ['true'];

      if (onlyNew) {
        c1Dates = publisher.reactivedDates.filter(
          date => {
            return date.getTime() >= firstDate.getTime();
          }
        ) 
      }

      if (onlyCurrent) {
        c2Dates = publisher.reactivedDates.filter(
          date => {
            return date.getTime() >= firstDate.getTime() &&
                    date.getTime() <= lastDate.getTime();
          }
        )
      }

      c3Dates = publisher.reactivedDates;

      return c1Dates.length > 0 && c2Dates.length > 0 && c3Dates.length > 0;
    }));
  }


  /**
   * Get all publishers reports filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   * @param {boolean} filtered: true if only want reports within report date
   */
  getReports(firstDate, lastDate, byBethelDate=false) {

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2999");
    }

    const reports = {};
    Object.values(this.publishers).forEach(publisher => {
      Object.entries(publisher.reports).forEach(([uuid, report]) => {

        let isOnDates = false;

        if (byBethelDate){
          isOnDates = report.bethelDate.getTime() >= firstDate.getTime() &&
                      report.bethelDate.getTime() <= lastDate.getTime();

        } else {
          isOnDates = report.reportDate.getTime() >= firstDate.getTime() &&
                      report.reportDate.getTime() <= lastDate.getTime();
        }

        if (isOnDates) {
          reports[uuid] = report;
        } 
      });
    });
    return reports;
  }

  /**
   * Get all publishers credits filtered by date range
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   */
  getCredits(firstDate, lastDate) {

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    const credits = {};
    Object.values(this.publishers).forEach(publisher => {
      Object.entries(publisher.credits).forEach(([uuid, credit]) => {

        let isOnDates = credit.creditDate.getTime() >= firstDate.getTime() &&
                        credit.creditDate.getTime() <= lastDate.getTime()

        if (isOnDates) {
          credits[uuid] = credit;
        } 
      });
    });
    return credits;
  }


  /**
   * Filter publisher reports from reports collection
   * @param {collection} reports: collection of reports to filter
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   */
  filterPublisherReports(reports, firstDate, lastDate) {

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.values(reports).filter(report => {  
      let wasAux = this.publishers[report.publisher].serveAsAuxiliaryPioneerOnDates(
        report.reportDate, report.reportDate);

      let wasReg = this.publishers[report.publisher].serveAsRegularPioneerOnDates(
          report.reportDate, report.reportDate);

      let wasPioneer = wasAux || wasReg;

      let isOnDates = true;
   
      if (this.byBethelDate) {
        isOnDates = report.bethelDate.getTime() >= firstDate.getTime() &&
                    report.bethelDate.getTime() <= lastDate.getTime()
      } else {
        isOnDates = report.reportDate.getTime() >= firstDate.getTime() &&
                    report.reportDate.getTime() <= lastDate.getTime()
      }
    
      return !wasPioneer & isOnDates;
    });
  }
  

  /**
   * Filter auxiliary pioneer reports from reports collection
   * @param {collection} reports: collection of reports to filter
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   */
  filterAuxiliaryPioneerReports(reports, firstDate, lastDate) {

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.values(reports).filter(report => {
      let wasPioneer = this.publishers[report.publisher].serveAsAuxiliaryPioneerOnDates(report.reportDate, report.reportDate);
      
      let isOnDates = true;
      
      if (this.byBethelDate) {
        isOnDates = report.bethelDate.getTime() >= firstDate.getTime() &&
                    report.bethelDate.getTime() <= lastDate.getTime()
      } else {
        isOnDates = report.reportDate.getTime() >= firstDate.getTime() &&
                    report.reportDate.getTime() <= lastDate.getTime()
      }
      
      
      return wasPioneer & isOnDates;
    });
  }

    
  /**
   * Filter regular pioneer reports form reports collection
   * @param {collection} reports: collection of reports to filter
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   */
  filterRegularPioneerReports(reports, firstDate, lastDate) {
    
    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.values(reports).filter(report => {
      let wasPioneer = this.publishers[report.publisher].serveAsRegularPioneerOnDates(report.reportDate, report.reportDate);
      
      let isOnDates = true;

      if (this.byBethelDate) {
        isOnDates = report.bethelDate.getTime() >= firstDate.getTime() &&
                    report.bethelDate.getTime() <= lastDate.getTime()
      } else {
        isOnDates = report.reportDate.getTime() >= firstDate.getTime() &&
                    report.reportDate.getTime() <= lastDate.getTime()
      }
      
      return wasPioneer & isOnDates;
    });
  }


  /**
   * Filter missionary reports from reports collection
   * @param {collection} reports: collection of reports to filter
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   */
  filterSpecialPioneerReports(reports, firstDate, lastDate) {
    
    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.values(reports).filter(report => {
      let wasSpecialPioneer = this.publishers[report.publisher].serveAsSpecialPioneerOnDates(report.reportDate, report.reportDate);
      
      let isOnDates = true;

      if (this.byBethelDate) {
        isOnDates = report.bethelDate.getTime() >= firstDate.getTime() &&
                    report.bethelDate.getTime() <= lastDate.getTime()
      } else {
        isOnDates = report.reportDate.getTime() >= firstDate.getTime() &&
                    report.reportDate.getTime() <= lastDate.getTime()
      }
      
      return wasSpecialPioneer & isOnDates;
    });
  }


  /**
   * Filter missionary reports from reports collection
   * @param {collection} reports: collection of reports to filter
   * @param {Date} firstDate: first date to consider in filter
   * @param {Date} lastDate: first date to consider in filter
   */
  filterRegularMissionaryReports(reports, firstDate, lastDate) {
    
    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1800");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2800");
    }

    return Object.values(reports).filter(report => {
      let wasMissionary = this.publishers[report.publisher].serveAsMissionaryOnDates(report.reportDate, report.reportDate);
      
      let isOnDates = true;

      if (this.byBethelDate) {
        isOnDates = report.bethelDate.getTime() >= firstDate.getTime() &&
                    report.bethelDate.getTime() <= lastDate.getTime()
      } else {
        isOnDates = report.reportDate.getTime() >= firstDate.getTime() &&
                    report.reportDate.getTime() <= lastDate.getTime()
      }
      
      return wasMissionary & isOnDates;
    });
  }
}


class CongregationGroup extends PublisersGroup {
  constructor(uuid, name, serviceYear, overseer, assistant, publishers){
    super (publishers);
    this.uuid = uuid;
    this.name = name;
    this.serviceYear = serviceYear;
    this.overseer = overseer;
    this.assistant = assistant;
  }
}


class Congregation extends PublisersGroup{
  constructor(uuid, number, name, publishers, publishersSpreadsheet) {
    super (publishers);
    this.uuid = uuid;
    this.number = number;
    this.name = name;
    this.publisherspreadsheet = publishersSpreadsheet;
  }
}


class Publisher {
  /**
   * Publisher class
   * @param {string} uuid: publisher unique identifier 
   * @param {string} fullname: Full name
   * @param {string} address: Address
   * @param {string} phone: phone
   * @param {string} movile: cell phone
   * @param {string} nickname: nickname
   * @param {string} email: email
   * @param {date} birthDate: birth date
   * @param {string} gender: 'male' or 'female'
   */
  constructor(uuid, fullname, address, phone, movile, nickname, email, birthDate, gender, words) {
    this.uuid = uuid;
    this.fullname = fullname;
    this.address = address;
    this.phone = phone;
    this.movile = movile;
    this.nickname = nickname;
    this.email = email;
    this.birthDate = birthDate;
    this.gender = gender;
    this.words = words;
  }

  /**
   * Get dates for action status until a given date
   * @param {string} action: action to find
   * @param {boolean} status: action status to find 
   * @param {date} date: the limit date to get the action
   * @param {object} actions: actions collection to look into. Optional for external actions data
   */
  getStatusActionDatesUntilDate(action, status, date, actions) {
    
    if (!actions){
      actions = this.actions;
    }

    return Object.values(actions).filter(act => {
      return act.action == action &&
             act.publisher == this.uuid &&
             act.status == status &&
             act.actionDate.getTime() <= date.getTime();
    }).sort(function(a, b) {
      return a.actionDate.getTime() - b.actionDate.getTime();
    }).map(action =>{
      return action.actionDate;
    });
  }
  
  /**
   * Get dates for action status between a given dates
   * @param {string} action: action to find
   * @param {boolean} status: action status to find 
   * @param {date} firstDate: the limit date to get the action
   * @param {date} lastDate: the limit date to get the action
   * @param {object} actions: actions collection to look into. Optional for external actions data
   */
  getStatusActionDatesBetweenDates(action, status, firstDate, lastDate, actions) {
    
    if (!actions){
      actions = this.actions;
    }

    return Object.values(actions).filter(act => {
      return act.action == action &&
             act.publisher == this.uuid &&
             act.status == status &&
             act.actionDate.getTime() <= lastDate.getTime() &&
             act.actionDate.getTime() >= firstDate.getTime();
    }).sort(function(a, b) {
      return a.actionDate.getTime() - b.actionDate.getTime();
    }).map(action =>{
      return action.actionDate;
    });
  }

  /**
   * Function to check if the publisher has an active action by given dates
   * @param {string} action - uuid action to find
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
   */
  checkActionOnDates(action, firstDate, lastDate, actions) {

    if (!actions){
      actions = this.actions;
    }

    let startDate = this.getStatusActionDatesUntilDate(action, 1, lastDate, actions).pop();
    let endDate = this.getStatusActionDatesUntilDate(action, 0, lastDate, actions).pop();

    startDate = startDate? startDate : new Date("2999.12.31");
    endDate = endDate > startDate? endDate: new Date("2999.12.31");

    return startDate.getTime() < endDate.getTime() &&
           startDate.getTime() <= lastDate.getTime() &&
           endDate.getTime() >= firstDate.getTime();
  }

  /**
   * Function to check if the publisher started an action by given dates
   * @param {string} action - uuid action to find
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
   */
  checkActionStartsOnDates(action, firstDate, lastDate, actions) {

    if (!actions){
      actions = this.actions;
    }
    let startDate = this.getStatusActionDatesUntilDate(action, 1, lastDate, actions).pop();
    startDate = startDate? startDate: new Date("1/12/2999");
    return startDate.getTime() >= firstDate.getTime() &&
           startDate.getTime() <= lastDate.getTime();
  }

  /**
   * Function to get the start date of an action
   * @param {string} action - uuid action to find
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data*/ 
  getStartActionDatesOnDates(action, firstDate, lastDate, actions) {
    if (!actions){
      actions = this.actions;
    }

    let k = this.nickname;
    // for auxiliar pioneer, there is a new action for each month
    if (action == 'buAOoDveycGcZfrhu7L8') {
      let datesList = [];
      const startDates = this.getStatusActionDatesBetweenDates(action, 1, firstDate, lastDate, actions);
      const endDates =  this.getStatusActionDatesBetweenDates(action, 0, firstDate, lastDate, actions);
      for (let i=0; i<startDates.length; i++) {
        const dates = getReportMonthsList(startDates[i],endDates[i]?endDates[i]:lastDate)
        datesList = datesList.concat(dates); 
      }
      return datesList;
    }

    // otherwhise
    return this.getStatusActionDatesBetweenDates(action, 1, firstDate, lastDate, actions);
  }

  /**
   * Function to get the end date of an action
   * @param {string} action - uuid action to find
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data*/ 
  getEndActionDatesOnDates(action, firstDate, lastDate, actions) {
    return this.getStatusActionDatesBetweenDates(action, 0, firstDate, lastDate, actions);
  }

  /**
   * Function to check if the publiher was serving as publisher on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data*/ 
  serveAsPublisherOnDates(firstDate, lastDate, actions) {
    return this.checkActionOnDates("5cwVSeAcE4YlnWv4WRP4", firstDate, lastDate, actions);
  }

  /**
   * Function to check if the publiher was serving as elder on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  serveAsElderOnDates(firstDate, lastDate, actions) {
    return this.checkActionOnDates("hrNKLDKNtdcFmPQJ6zAk", firstDate, lastDate, actions);
  }
  
  /**
   * Function to check if the publiher was serving as ministerial servant on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  serveAsMinisterialServantOnDates(firstDate, lastDate, actions) {
    return this.checkActionOnDates("DJN4C0KUKUXLx3DyJgcN", firstDate, lastDate, actions);
  }

  /**
   * Function to check if the publiher was serving as regular pioneer on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  serveAsRegularPioneerOnDates(firstDate, lastDate, actions) {
    return this.checkActionOnDates("JejW5lMLdMyT7pDN0yAA", firstDate, lastDate, actions);
  }
  
  /**
   * Function to check if the publiher was serving as special pioneer on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  serveAsSpecialPioneerOnDates(firstDate, lastDate, actions) {
    return this.checkActionOnDates("4f5ba3649fa1416499291", firstDate, lastDate, actions);
  }

  /**
   * Function to check if the publiher was serving as missionary on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  serveAsMissionaryOnDates(firstDate, lastDate, actions) {
    return this.checkActionOnDates("0f66b74098ee472aa87b", firstDate, lastDate, actions);
  }

  /**
   * Function to check if the publiher was serving as regular pioneer on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  serveAsRegularPioneerOnDates(firstDate, lastDate, actions) {
    return this.checkActionOnDates("JejW5lMLdMyT7pDN0yAA", firstDate, lastDate, actions);
  }

  /**
   * Function to check if the publiher was serving as auxiliar pioneer on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  serveAsAuxiliaryPioneerOnDates(firstDate, lastDate, actions) {
    return this.checkActionOnDates("buAOoDveycGcZfrhu7L8", firstDate, lastDate, actions);
  }
  
  /**
   * Function to check if the publiher was serving as inmersed publisher on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  serveAsInmersedOnDates(firstDate, lastDate, actions) {
    return this.checkActionOnDates("Lb6Cc5YQ2DDahusoB7eK", firstDate, lastDate, actions);
  }
  
  /**
   * Function to check if the publiher was serving as bethel member on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  serveAsBethelMemberOnDates(firstDate, lastDate, actions) {
    return this.checkActionOnDates("eql2jTAyzPOyV1km4I0P", firstDate, lastDate, actions);
  }
  
  /**
   * Function to check if the publiher was serving as construction member on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  serveAsConstructionMemberOnDates(firstDate, lastDate, actions) {
    return this.checkActionOnDates("f4f0a8d4e81f4ce08f4da192fbf814d4", firstDate, lastDate, actions);
  }
  
  /**
   * Function to check if the publiher was serving as anointed on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  serveAsAnointedOnDates(firstDate, lastDate, actions) {
    return this.checkActionOnDates("kZgvQFCE7nczRFUFPWzR", firstDate, lastDate, actions);
  }
  
  /**
   * Function to check if the publiher was a new as publisher on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  wasNewPublisherOnDates(firstDate, lastDate, actions) {
    return this.checkActionStartsOnDates("5cwVSeAcE4YlnWv4WRP4", firstDate, lastDate, actions);
  }
  
  /**
   * Function to check if the publiher was a new elder on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  wasNewElderOnDates(firstDate, lastDate, actions) {
    return this.checkActionStartsOnDates("hrNKLDKNtdcFmPQJ6zAk", firstDate, lastDate, actions);
  }

  /**
   * Function to check if the publiher was a new ministerial servant on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  wasNewMinisterialServantOnDates(firstDate, lastDate, actions) {
    return this.checkActionStartsOnDates("DJN4C0KUKUXLx3DyJgcN", firstDate, lastDate, actions);
  }

  /**
   * Function to check if the publiher was a new special pioneer on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  wasNewSpecialPioneerOnDates(firstDate, lastDate, actions) {
    return this.checkActionStartsOnDates("4f5ba3649fa1416499291", firstDate, lastDate, actions);
  }


  /**
   * Function to check if the publiher was a new as missionary on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  wasNewMissionaryOnDates(firstDate, lastDate, actions) {
    return this.checkActionStartsOnDates("0f66b74098ee472aa87b", firstDate, lastDate, actions);
  }


  /**
   * Function to check if the publiher was a new regular pioneer on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  wasNewRegularPioneerOnDates(firstDate, lastDate, actions) {
    return this.checkActionStartsOnDates("JejW5lMLdMyT7pDN0yAA", firstDate, lastDate, actions);
  }
  

  /**
   * Function to check if the publiher was a new auxiliary pioneer on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  wasNewAuxiliaryPioneerOnDates(firstDate, lastDate, actions) {
    return this.checkActionStartsOnDates("buAOoDveycGcZfrhu7L8", firstDate, lastDate, actions);
  }


  /**
   * Function to check if the publiher was a new inmersed publisher on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  wasNewInmersedOnDates(firstDate, lastDate, actions) {
    return this.checkActionStartsOnDates("Lb6Cc5YQ2DDahusoB7eK", firstDate, lastDate, actions);
  }
  

  /**
   * Function to check if the publiher was a new bethel member on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  wasNewBethelMemberOnDates(firstDate, lastDate, actions) {
    return this.checkActionStartsOnDates("eql2jTAyzPOyV1km4I0P", firstDate, lastDate, actions);
  }
    

  /**
   * Function to check if the publiher was a new construction member on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  wasNewConstructionMemberOnDates(firstDate, lastDate, actions) {
    return this.checkActionStartsOnDates("f4f0a8d4e81f4ce08f4da192fbf814d4", firstDate, lastDate, actions);
  }
  

  /**
   * Function to check if the publiher was a new anoited on dates
   * @param {Date} firstDate - firstDate to check (included)
   * @param {Date} lastDate - lastDate to check (included)
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  wasNewAnointedOnDates(firstDate, lastDate, actions) {
    return this.checkActionStartsOnDates("kZgvQFCE7nczRFUFPWzR", firstDate, lastDate, actions);
  }


  /**
   * Function to check if the publiher was a new regular pioneer on dates
   * @param {object} actions: actions collection to look into. Optional for external actions data
  */ 
  getInmersedDate(actions){

    if (!actions){
      actions = this.actions;
    }

    // otherwhise
    return this.getStatusActionDatesBetweenDates(
      'Lb6Cc5YQ2DDahusoB7eK', 1,
      new Date('1800.1.1'), 
      new Date('2999.12.31')
    ).slice(-1)[0];
  }
}

class Report {
  constructor(uuid, timeStamp, reportDate, bethelDate, publisher, originalName, monthString,  
  type, activity, placements, videoShowings, hours, returnVisits, bibleStudies, remarks) {
    this.uuid = uuid;
    this.timeStamp = timeStamp;
    this.reportDate = reportDate;
    this.bethelDate = bethelDate;
    this.publisher = publisher;
    this.originalName = originalName;
    this.monthString = monthString;
    this.placements = parseInt(placements)|| 0;
    this.videoShowings = parseInt(videoShowings)|| 0;
    this.hours = parseFloat(hours)|| 0
    this.hours = type == 'Publicador' ? 0.0 : parseFloat(hours);
    this.returnVisits = parseInt(returnVisits)|| 0;
    this.bibleStudies = parseInt(bibleStudies)|| 0;
    this.remarks = remarks;
    this.type = type;
    this.activity = activity
    this.active = activity != '' || this.hours > 0;
    let kk = this;
  }
}

class Action {
  constructor (uuid, publisher, actionDate, action, status){
    this.uuid = uuid;
    this.publisher = publisher;
    this.actionDate = actionDate;
    this.action = action;
    this.status = status;
  }
}

class ActionType {
  constructor (uuid, name){
    this.uuid = uuid;
    this.name = name;
  }
}

class Credit {
  constructor(uuid, publisher, hours, reportDate){
    this.uuid = uuid;
    this.publisher = publisher;
    this.hours = hours;
    this.creditDate = reportDate;
  }
}

class Contact {
  constructor (uuid, publisher, date, publisherGivenName, contactName, contactData, allowed, comments){
    this.uuid = uuid;
    this.publisher = publisher;
    this.date = date;
    this.publisherGivenName = publisherGivenName;
    this.contactName = contactName;
    this.contactData = contactData;
    this.allowed = allowed;
    this.comments = comments;
  }
}

function getS21WorkBook(source){
  return new S21WorkBook(source);
}
