/**
 *  Class to create Activity summaries
 */

class SummaryReport extends PublisersGroup{
  
  /**
   * Summary for publisher collection activity
   * @param {collection} publishers: Publisher collection to get the activity
   * @param {date} fistDate: first date to consider in the summary report. Included
   * @param {date} lastDate: last date to consider in the summary report. Included
   */

  constructor (publishers, firstDate, lastDate, name="Report", byBethelDate=false, inactiveMonths=6) { 
    super (publishers);
    let tm0 = new Date().getTime();
    this.firstDate = firstDate;
    this.lastDate = lastDate;
    this.name = name;
    this.byBethelDate=byBethelDate;
    this.inactiveMonths = inactiveMonths;

    let tm_all = (new Date().getTime()-tm0)/1000;
    Logger.log("Summary report loaded in " +tm_all +' scs.');
  }


  /**
   * Get totals summary from given reports
   * @param {collection} reports: reports collection to get the summary
   */
  getTotals(reports){
    const totals = {
      'totalReports': 0,
      'placements': 0,
      'videoShowings': 0,
      'hours': 0,
      'returnVisits': 0,
      'bibleStudies': 0,
      'credits': 0
    }

    let lashoras = Array();
    Object.values(reports).forEach(report => {
      lashoras.push(report.hours)
      totals.totalReports ++;
      totals.placements += report.placements;
      totals.videoShowings += report.videoShowings;
      totals.hours += report.hours;
      totals.returnVisits += report.returnVisits;
      totals.bibleStudies += report.bibleStudies;

      // add credits
      let publishers = Object.fromEntries(Object.entries(this.publishers).filter(
        ([uuid, publisher]) => {
          return uuid == report.publisher;
        })
      );

      let credits = this.getCredits(this.firstDate, this.lastDate);
      
      Object.values(credits).forEach(credit => {
        let firstReportDate = getFirstMonthDate(report.reportDate)
        let lastReportDate = getLastMonthDate(report.reportDate)
        if (credit.creditDate.getTime() >= firstReportDate.getTime() && 
            credit.creditDate <= lastReportDate.getTime()) {
              totals.credits += credit.hours;
        }        
      });
    });

    return totals;
  }


  /**
   * Function to convert total summary to average summary
   * @param {object} totals: totals object to convert
   */
  getAverages(totals){
    return {
      'totalReports': totals.totalReports,
      'placements': totals.placements / totals.totalReports,
      'videoShowings': totals.videoShowings / totals.totalReports,
      'hours': totals.hours / totals.totalReports,
      'returnVisits': totals.returnVisits / totals.totalReports,
      'bibleStudies': totals.bibleStudies / totals.totalReports
    }
  }


  /**
   * Function to get individual summary from given publishers
   * @param {collection} publishers: collection of publishers to get the summary
   */
  getIndividuals() {
    const individuals = {}
    Object.values(this.publishers).forEach(
      publisher => {    
        individuals[publisher.uuid] = {
          'publisher': publisher,
          'reportsSummary': this.getGroupedReportsSummary(publisher.reports)
        }
      }
    );

    return individuals;
  }

  /**
   * Get summary of a collection of reports
   * @param {collection} publishers: collection of publishers to get the summary
   */
  getReportsSummary (reports){
    const totals = this.getTotals(reports);
    return {
      'totals': totals,
      'averages': this.getAverages(totals),
      'reports': reports
    }
  }

  getGroupedReportsSummary(reports) {
    return {
        "all": this.getReportsSummary(reports),
        "publishers": this.getReportsSummary(this.filterPublisherReports(reports)),
        "auxiliaryPioneers": this.getReportsSummary(this.filterAuxiliaryPioneerReports(reports)),
        "regularPioneers": this.getReportsSummary(this.filterRegularPioneerReports(reports)),
        "unknownPioneers": this.getReportsSummary(this.filterPublisherReports(reports).filter(report=> report.hours>0))
      }
  }

  /**
   * Get summary
   */
  getSummary () {
    let kk = this
    const reports = this.getReports(this.firstDate, this.lastDate);
    const summary = {      
      "activity": this.getActivitiesSummary(),
      "appointments": {
        'all': this.getAppointmentsSummary(false, true),
        'news': this.getAppointmentsSummary(true, true),
      },
      "reportsSummary": this.getGroupedReportsSummary(reports),
      "individuals": this.getIndividuals(),
    }
    return summary;
  }

  /**
   * Get grouped summary by appointment
   */
  getGroupedSummary() {
    let allSummary = new SummaryReport(
      this.publishers,
      this.firstDate,
      this.lastDate,
      'All summary',
      this.byBethelDate,
      this.inactiveMonths
    );

    let eldersSummary = new SummaryReport(
      this.getElders(),
      this.firstDate,
      this.lastDate,
      'Elders summary',
      this.byBethelDate,
      this.inactiveMonths
    );

    let ministerialServantsSummary = new SummaryReport(
      this.getMinisterialServants(),
      this.firstDate,
      this.lastDate,
      'Ministerial servants summary',
      this.byBethelDate,
      this.inactiveMonths
    );

    let regularPioneersSummary = new SummaryReport(
      this.getRegularPioneers(),
      this.firstDate,
      this.lastDate,
      'Regular pioneers summary',
      this.byBethelDate,
      this.inactiveMonths
    );

    let uninmersedPublishersSummary = new SummaryReport(
      this.getUninmersedPublishers(),
      this.firstDate,
      this.lastDate,
      'Uninmersed publishers summary',
      this.byBethelDate,
      this.inactiveMonths
    );

    let kk = this
    return {      
      "all": allSummary.getSummary(),
      "elders": eldersSummary.getSummary(),
      "ministerialServants": ministerialServantsSummary.getSummary(),
      "regularPioneers": regularPioneersSummary.getSummary(),
      "uninmersed": uninmersedPublishersSummary.getSummary(),
    }
  }
  

  /**
   * Get Appointments summary
   * @param {boolean} onlyCurrent: true if only want current status, false for everyone in the period
   * @param {boolean} onlyNew: Boolean to filter only new istatus on period
   */
  getAppointmentsSummary(onlyNew=false, onlyCurrent=false) {

    let firstDate = this.firstDate;
    let lastDate = this.lastDate;

    // Default dates
    if (typeof firstDate === 'undefined') {
      firstDate = new Date ("1/1/1890");       
    }
    
    if (typeof lastDate === 'undefined') {
      lastDate = new Date ("1/1/2100");
    }

    // Get grouped publishers by appointment
    let publisherOnes = this.getPublishers(firstDate, lastDate, onlyNew, onlyCurrent);
    let inmersedOnes = this.getInmersedPublishers(firstDate, lastDate, onlyNew, onlyCurrent);
    let regularPioneers = this.getRegularPioneers(firstDate, lastDate, onlyNew, onlyCurrent);
    let elders = this.getElders(firstDate, lastDate, onlyNew, onlyCurrent);
    let ministerialServants = this.getMinisterialServants(firstDate, lastDate, onlyNew, onlyCurrent);
    let bethelMembers = this.getMissionaries(firstDate, lastDate, onlyNew, onlyCurrent);
    let constructionMembers = this.getConstructionMembers(firstDate, lastDate, onlyNew, onlyCurrent);
    let anointedOnes = this.getAnointedOnes(firstDate, lastDate, onlyNew, onlyCurrent);
    let auxiliaryPioneers = this.getAuxiliaryPioneers(firstDate, lastDate, onlyNew, onlyCurrent);
    let specialPioneers = this.getSpecialPioneers(firstDate, lastDate, onlyNew, onlyCurrent);
    let missionaryOnes = this.getMissionaries(firstDate, lastDate, onlyNew, onlyCurrent);
    
    // Add appointment dates to each publisher

    if (!onlyNew) {
      firstDate = new Date ("1/1/1890");    
    }

    regularPioneers = Object.values(regularPioneers).map(publisher => {
      const dates = getDatesList(firstDate, lastDate).filter(date => {
        return publisher.wasNewRegularPioneerOnDates(getFirstMonthDate(date),getLastMonthDate(date));
      }); 
      publisher.regularPioneerDates = dates;
      return publisher;
    });

    publisherOnes = Object.values(publisherOnes).map(publisher => {
      const dates = getDatesList(firstDate, lastDate).filter(date => {
        return publisher.wasNewPublisherOnDates(getFirstMonthDate(date),getLastMonthDate(date));
      }); 
      publisher.publisherDates = dates;
      return publisher;
    });
    
    inmersedOnes = Object.values(inmersedOnes).map(publisher => {
      const dates = getDatesList(firstDate, lastDate).filter(date => {
        return publisher.wasNewInmersedOnDates(getFirstMonthDate(date),getLastMonthDate(date));
      }); 
      publisher.inmersedDates = dates;
      return publisher;
    });

    specialPioneers = Object.values(specialPioneers).map(publisher => {
      const dates = getDatesList(firstDate, lastDate).filter(date => {
        return publisher.wasNewSpecialPioneerOnDates(getFirstMonthDate(date),getLastMonthDate(date));
      }); 
      publisher.specialPioneerDates = dates;
      return publisher;
    });

    missionaryOnes = Object.values(missionaryOnes).map(publisher => {
      const dates = getDatesList(firstDate, lastDate).filter(date => {
        return publisher.wasNewMissionaryOnDates(getFirstMonthDate(date),getLastMonthDate(date));
      }); 
      publisher.missionaryDates = dates;
      return publisher;
    });


    auxiliaryPioneers = Object.values(auxiliaryPioneers).map(publisher => {
      // auxiliary piooner is diferent, it's considered as apointment each month in this privilege
      const dates = getDatesList(firstDate, lastDate).filter(date => {
        return publisher.serveAsAuxiliaryPioneerOnDates(getFirstMonthDate(date),getLastMonthDate(date));
      }); 
      publisher.auxiliaryPioneerDates = dates;
      return publisher;
    });

    elders = Object.values(elders).map(publisher => {
      const dates = getDatesList(firstDate, lastDate).filter(date => {
        return publisher.wasNewElderOnDates(getFirstMonthDate(date),getLastMonthDate(date));
      }); 
      publisher.elderDates = dates;
      return publisher;
    });
    
    ministerialServants = Object.values(ministerialServants).map(publisher => {
      const dates = getDatesList(firstDate, lastDate).filter(date => {
        return publisher.wasNewMinisterialServantOnDates(getFirstMonthDate(date),getLastMonthDate(date));
      }); 
      publisher.ministerialServantDates = dates;
      return publisher;
    });

    anointedOnes = Object.values(anointedOnes).map(publisher => {
      const dates = getDatesList(firstDate, lastDate).filter(date => {
        return publisher.wasNewAnointedOnDates(getFirstMonthDate(date),getLastMonthDate(date));
      }); 
      publisher.anointedDates = dates;
      return publisher;
    });

    bethelMembers = Object.values(bethelMembers).map(publisher => {
      const dates = getDatesList(firstDate, lastDate).filter(date => {
        return publisher.wasNewBethelMemberOnDates(getFirstMonthDate(date),getLastMonthDate(date));
      }); 
      publisher.bethelMemberDates = dates;
      return publisher;
    }); 

    
    constructionMembers = Object.values(constructionMembers).map(publisher => {
      const dates = getDatesList(firstDate, lastDate).filter(date => {
        return publisher.wasNewConstructionMemberOnDates(getFirstMonthDate(date),getLastMonthDate(date));
      }); 
      publisher.constructionMemberDates = dates;
      return publisher;
    });
    
    return {
      "publishers": publisherOnes,

      "inmersed": inmersedOnes.sort((a,b) => {
        return b.inmersedDates[0].getTime() - a.inmersedDates[0].getTime();
      }),

      "auxiliaryPioneers": auxiliaryPioneers.sort((a,b) => {
        return b.auxiliaryPioneerDates.length - a.auxiliaryPioneerDates.length;
      }),

      "regularPioneers": regularPioneers.sort((a,b) => {
        return b.regularPioneerDates[0].getTime() - a.regularPioneerDates[0].getTime();
      }),

      "elders": elders.sort((a,b) => {
        return a.elderDates[0].getTime() - b.elderDates[0].getTime();
      }),

      "ministerialServants": ministerialServants.sort((a,b) => {
        return b.ministerialServantDates[0].getTime() - a.ministerialServantDates[0].getTime();
      }),

      "anointed": anointedOnes.sort((a,b) => {
        return b.anointedDates[0].getTime() - a.anointedDates[0].getTime();
      }),

      "bethelMembers": bethelMembers.sort((a,b) => {
        return b.bethelMemberDates[0].getTime() - a.bethelMemberDates[0].getTime();
      }),
    
      "constructionMembers": constructionMembers.sort((a,b) => {
        return b.constructionMemberDates[0].getTime() - a.constructionMemberDates[0].getTime();
      }),
      
    }
  }


  /**
   * Function to get publishers activity
   * @param {collection} publishers: collection of publishers to get the summary
   */
  getActivitiesSummary() { 
    const irregulars = Object.values(this.getIrregulars(this.firstDate, this.lastDate, true)).sort((a,b) => {
        return b.irregularMonthsCounter - a.irregularMonthsCounter;
    });

    const inactives = Object.values(this.getInactives(this.firstDate, this.lastDate, false, true)).sort((a,b) => {
        return b.inactiveDates[0].getTime() - a.inactiveDates[0].getTime();
    });
    
    const newInactives = Object.values(this.getInactives(this.firstDate, this.lastDate, true, true)).sort((a,b) => {
        return b.inactiveDates[0].getTime() - a.inactiveDates[0].getTime();
    });

    const newReactives = Object.values(this.getReactivedOnes(this.firstDate, this.lastDate, true, true)).sort((a,b) => {
        return b.inactiveDates[0].getTime() - a.inactiveDates[0].getTime();
    });
    
    const actives = this.getActivePublishers(this.firstDate, this.lastDate);

    return {
      "activePublishers":actives,
      "irregulars": irregulars,
      "inactives": inactives,
      "news": {
        "reactived": newReactives,
        "inactives": newInactives
      }
    }
  }

}
