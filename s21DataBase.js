class DataBase extends Collection{

  /**
   * Create database from source repository
   * @param {string} source: uuid of repository data
   * @param {string} method: 'spreadsheet' or 'firebase'.
   */
  constructor (source, method="spreadsheet"){
    super ();

    this.source = source;
    this.method = method;

    this.congregations = {};
    this.publishers = {};
    this.reports = {};
    this.groups = {};
    this.actions = {};
    this.actionTypes = {};
    this.credits = {};
  }
  
  /**
   * Load data into collections
   */
  loadData() {

    let tm0 = new Date().getTime(); 

    if (this.method === "firestore") {
      this.getDataFromFirestore();
      console.log('Data has loaded from Google Firestore');
    } 
    
    else if (this.method === 'spreadsheet') {
      this.getDataFromGoogleSheets();
      console.log('Data has loaded from Google Spreadsheet');
    } 

    else {
      console.error('Error to load cogregation database: Method is not recognized');
      return;
    }

    this.removeDuplicatedReports();
    this.removeNullReports();
    this.loadDataToPublishers();
    this.loadActivityDates();
    
    let tm_all = (new Date().getTime()-tm0)/1000;
    Logger.log("Loaded and treated data in " +tm_all +' scs.');
  }

  /***
   * Function to get data from Google Firestore
   */
  getDataFromFirestore () {
    let tm0 = new Date().getTime(); 

    const props = PropertiesService.getScriptProperties();
    const [email, key, projectId] = [
      props.getProperty('client_email'), 
      props.getProperty('private_key'), 
      props.getProperty('project_id')
    ];
    const firestore = FirestoreApp.getFirestore(email, key, projectId);

    // create congregation objects
    firestore.getDocuments("congregations").forEach(doc => {
      let uuid = doc.name.split('/congregations/')[1];
      this.congregations[uuid] = new Congregation(
        uuid,
        doc.fields['number']?.integerValue, 
        doc.fields['name']?.stringValue,
        doc.fields['publishers']?.arrayValue.values.map(val => {return val.stringValue}),
        doc.fields['uuidSpreadsheet']?.stringValue
      );
    });

    // create groups objects
    firestore.getDocuments("groups").forEach(doc => {
      let uuid = doc.name.split('/groups/')[1];
      this.groups[uuid] = new CongregationGroup(
        uuid, 
        doc.fields['name']?.stringValue,
        doc.fields['serviceYear']?.integerValue, 
        doc.fields['overseer']?.stringValue,
        doc.fields['assistant']?.stringValue,
        doc.fields['publishers']?.arrayValue.values.map(val => {return val.stringValue})
      );
    });

    // create publisher objects
    firestore.getDocuments("publishers").forEach(doc => {
      let uuid = doc.name.split('/publishers/')[1];
      this.publishers[uuid] = new Publisher(
        uuid,
        doc.fields['fullname']?.stringValue, 
        doc.fields['address']?.stringValue,
        doc.fields['phone']?.stringValue,
        doc.fields['movile']?.stringValue, 
        doc.fields['nickname']?.stringValue, 
        doc.fields['email']?.stringValue, 
        new Date(doc.fields['birthDate']?.timestampValue), 
        doc.fields['gender']?.stringValue
      );
    });

    // create report objects
    firestore.getDocuments("reports").forEach(doc => {
      let uuid = doc.name.split('/reports/')[1];
      this.reports[uuid] = new Report(
        uuid, 
        new Date(doc.fields['timestamp']?.timestampValue),
        new Date(doc.fields['reportDate']?.timestampValue), 
        new Date(doc.fields['bethelDate']?.timestampValue),
        doc.fields['publisher']?.stringValue,
        doc.fields['originalName']?.stringValue,
        doc.fields['monthString']?.stringValue,  
        doc.fields['placements']?.integerValue,
        doc.fields['videoShowings']?.integerValue, 
        doc.fields['hours']?.integerValue? doc.fields['hours'].integerValue:
                                          doc.fields['hours'].doubleValue,
        doc.fields['returnVisits']?.integerValue,
        doc.fields['bibleStudies']?.integerValue,
        doc.fields['remarks']?.stringValue,
        doc.fields['type']?.booleanValue,
      );
    });

    // create actions objects
    firestore.getDocuments("actions").forEach(doc => {
      let uuid = doc.name.split('/actions/')[1];
      this.actions[uuid] = new Action(
        uuid,
        doc.fields['publisher']?.stringValue,
        new Date(doc.fields['actionDate']?.timestampValue), 
        doc.fields['action']?.stringValue,
        doc.fields['status']?.integerValue
      );
    });

    // create action types objects
    firestore.getDocuments("actionTypes").forEach(doc => {
      let uuid = doc.name.split('/actionTypes/')[1];
      this.actions[uuid] = new ActionType(
        uuid,
        doc.fields['action']?.stringValue,
      );
    });

    // create credits objects
    firestore.getDocuments("credits").forEach(doc => {
      let uuid = doc.name.split('/credits/')[1];
      this.credits[uuid] = new Credit(
        uuid,
        doc.fields['publisher']?.stringValue,
        doc.fields['hours']?.stringValue,
        new Date(doc.fields['creditDate']?.timestampValue)
      );
    });
    
    let tm_all = (new Date().getTime()-tm0)/1000;
  }

  /***
   * Function to get data from Google Sheets
   */
  getDataFromGoogleSheets() {
    
    let tm0 = new Date().getTime(); 
    if (typeof received_vars !== 'undefined') {
      idSheet = variables.id_reports;
    }
    
    let workBook = new S21WorkBook(this.source);   

    // create publisher objects
    workBook.publishersData.forEach(row => {
      this.publishers[row[0]] = new Publisher(
        row[0],
        row[1], 
        row[2],
        row[3],
        row[4], 
        row[5], 
        row[6], 
        new Date(row[7]), 
        row[8],
        row[9]
      );
    });

    // create congregation objects
    workBook.congregationsData.forEach(row => {

      //const congregationPublishers = Object.keys(this.publishers);      

      this.congregations[row[0]] = new Congregation(
        row[0],
        row[1], 
        row[2],
        //congregationPublishers,
        this.publishers,
        row[4],
      );       
    });
    

    // create groups objects
    workBook.groupsData.forEach(
      row => {
        const groupId = row[0];
        const groupPublishers = workBook.publishersGroupsData.filter(
          data => {return data[0] == groupId;}
        ).map(
          data => {return data[1]}
        );

        this.groups[row[0]] = new CongregationGroup(
          row[0],
          row[1], 
          row[2],
          row[3],
          row[4], 
          groupPublishers, 
        );
      }
    );
  

    //create reports object
    workBook.reportsData.forEach(row => {
      this.reports[row[0]] = new Report(
        row[0],
        new Date(row[1]), 
        new Date(row[2]), 
        new Date(row[3]), 
        row[4], 
        row[5], 
        row[6], 
        row[7], 
        row[8], 
        row[9],
        row[10], 
        row[11], 
        row[12], 
        row[13],
      );
    });

    // create actions objects
    workBook.actionsData.forEach(row => {
      this.actions[row[0]] = new Action(
        row[0],
        row[1], 
        new Date(row[2]), 
        row[3],
        row[4]
      );
    });

    // create action types objects
    workBook.actionTypesData.forEach(row => {
      this.actionTypes[row[0]] = new ActionType(
        row[0],
        row[1]
      );
    });

    // create credits objects
    workBook.creditsData.forEach(row => {
      this.credits[row[0]] = new Credit(
        row[0],
        row[1], 
        row[2], 
        new Date(row[3])
      );
    });

    let tm_all = (new Date().getTime()-tm0)/1000;
  }

  /**
   * Load reports, credits and actions to each publisher 
   */
  loadDataToPublishers(){
    Object.values(this.publishers).forEach(
      publisher => {
        publisher.reports = this.filterCollectionByField(this.reports, 'publisher', publisher.uuid);
        publisher.actions = this.filterCollectionByField(this.actions, 'publisher', publisher.uuid);
        publisher.credits = this.filterCollectionByField(this.credits, 'publisher', publisher.uuid);
        publisher.groups = {};

        Object.values(this.groups).forEach(group => {
          if (group.publishers.indexOf(publisher.uuid) !== -1) {
            publisher.groups[group.serviceYear] = group.uuid;
          }
        });

        // Create a fake user if there is no one
        if (Object.values(publisher.reports).length == 0){
            
            let uuid=getUuid();

            publisher.reports[uuid] = new Report(
              uuid,
              new Date('1899.01.31'),
              new Date('1899.01.31'),
              new Date('1899.01.31'),
              publisher.uuid,
              publisher.nickname,
              getS21MonthString(new Date('1899.01.31')),
              0,0,1,0,0,"Informe ficticio, no se dispone del último"
            )
        }
      }
    );
  }


  /**
   * Load activity dates for each publisher
   */
  loadActivityDates() {
    Object.entries(this.publishers).forEach(([uuid, publisher]) => {

      const reportsList = Object.values(publisher.reports).map(
        report => {return report.reportDate.getTime();}
      ).sort((a, b) => {return b - a;});

      publisher.firstReportDate = new Date(reportsList[reportsList.length-1]); 

      const monthsList = getReportMonthsList(
        publisher.firstReportDate,
        this.lastDate
      ).map(date => {
        return date.getTime();
      });

      publisher.irregularDates = [];
      publisher.inactiveDates = [];
      publisher.reactivedDates = [];

      publisher.irregularDates = monthsList.filter(
        time => {
          return reportsList.indexOf(time) == -1 && 
                 time >= publisher.firstReportDate.getTime();
      }).map(
        time => {
          return new Date(time);
        }
      );

      let irregularMonths = 0;
      let deletedMonths = 0;
      let lastDeletedDate = new Date();

      if (publisher.irregularDates.length > 1) {        
        for (let i=1; i<publisher.irregularDates.length; i++) {
          
          let monthDiff = getMonthsDifference(
            publisher.irregularDates[i-1],
            publisher.irregularDates[i]);

          const monthShift = monthDiff - deletedMonths;

          if (monthShift == 1) {
            irregularMonths ++;
          } 
          
          else {
            
            if (irregularMonths >= this.inactiveMonths-1) {
              const reactivedDate = getLastMonthDate(
                getDateShiftDays(
                  lastDeletedDate,
                  2)
              );
              publisher.reactivedDates.push(reactivedDate);
            }
            
            irregularMonths = 0;
            deletedMonths = 0;
          }

          if (irregularMonths == this.inactiveMonths-1) {
            publisher.inactiveDates.push(publisher.irregularDates[i])
          }

          if (irregularMonths >= this.inactiveMonths-1) {            
            lastDeletedDate = publisher.irregularDates[i];
            publisher.irregularDates.splice(i,1);
            i--;
            deletedMonths++;
          }
        }
      }
      
      // compute consecutive irregular months
      publisher.irregularMonthsCounter = 1;
      for (let i = publisher.irregularDates.length-1; i>0; i--) {
        const expectedDate = publisher.irregularDates[i-1];
        const computedDate = getLastMonthDate(
          getDateShiftDays(
            getFirstMonthDate(publisher.irregularDates[i]),
            -2)
        );
        if (computedDate.getTime() == expectedDate.getTime()){
          publisher.irregularMonthsCounter++
        } else {
          break;
        }
      }

      /*
      // Get irregular dates on report period
      if (publisher.irregularDates.length >0) {
        publisher.irregularDatesOnReportPeriod = publisher.irregularDates.filter(
          date => {
            return date.getTime() >= this.firstDate.getTime() &&
                   date.getTime() <= this.lastDate.getTime();
        });
      }
       
      */
       
    });
  }

  /**
   * Remove duplicate reports, remains the last ocurrence
   */
  removeDuplicatedReports(){

    let tm0 = new Date().getTime();

    const toDelete = [];

    const reports = Object.values(this.reports).sort((a,b)=> {
      return a.timeStamp.getTime() - b.timeStamp.getTime();
    }).sort((a,b) => {
      return b.reportDate.getTime() - a.reportDate.getTime();
    }).sort((a,b) => {
      return a.publisher.localeCompare(b.publisher);
    });

    // delete duplicated elements
    for (var i=1; i<reports.length; i++){
      if (reports[i].publisher == reports[i-1].publisher && 
          reports[i].reportDate.getTime() == reports[i-1].reportDate.getTime()
         ) {
        toDelete.push(reports[i-1].uuid);
      }
    }

    toDelete.forEach(uuid => {
      delete this.reports[uuid];
    });

    let tm_all = (new Date().getTime()-tm0)/1000;
  }

  /**
   * Remove reports without hours
   */
  removeNullReports(){
    let tm0 = new Date().getTime();
    this.reports = Object.values(this.reports).filter(
      report => {
        return report.hours || report.active;
      }
    );
    let tm_all = (new Date().getTime()-tm0)/1000;
  }

  /**
   * Function to get Bethel report
   * @param {string} congregation: The congregation uuid to filter with 
   * @param {date} firstDate: first date to consider in the report. Included
   * @param {date} lastDate: last date to consider in the report. Included
   * @param {string} reportName: Report name. Optional
   */
  getCongregationSummary (firstDate, lastDate, reportName='', byBethelDate=false) {
    
    let tm0 = new Date().getTime();

    const serviceYear = getServiceYear(lastDate);
    const groups = this.getGroupsByServiceYear(serviceYear);
    
    let congregationSummary = new SummaryReport(
      this.publishers,
      this.firstDate,
      this.lastDate,
      'All summary',
      this.byBethelDate,
      this.inactiveMonths
    );

    const congregationGroupedSummary =  congregationSummary.getGroupedSummary();
    
    const groupsSummary = {};
    Object.values(groups).forEach(group => {
      const group_publishers = Object.fromEntries(
        Object.entries(this.publishers).filter(([uuid, publisher]) => {
          return Object.values(publisher.groups).indexOf(group.uuid) !== -1;
      })); 
      
      const groupSummary = new SummaryReport(
        group_publishers,
        firstDate,
        lastDate,
        reportName,
        byBethelDate
      );

      groupsSummary[group.uuid] = groupSummary.getGroupedSummary();      
      groupsSummary[group.uuid].name = group.name;
      groupsSummary[group.uuid].overseer = Object.values(this.publishers).filter(publisher => {return publisher.uuid == group.overseer;})[0];
      groupsSummary[group.uuid].assistant = Object.values(this.publishers).filter(publisher => {return publisher.uuid == group.assistant})[0];
      
    });

    let tm_all = (new Date().getTime()-tm0)/1000;

    congregationGroupedSummary['groups'] = groupsSummary;

    return {
      'firstDate': firstDate,
      'lastDate': lastDate,
      'reportName': reportName,
      'congregation': congregationGroupedSummary,
    } 
  }

  /**
   * Function to find a publisher uuid from a received words
   * @param {string} words: String representing the publisher full or nick name
   */
  getPublisherByWords(words){
    let tm0 = new Date().getTime();

    const entryWordsArray = getWordsArray(words, true);

    let ranking = new Map();

    Object.entries(this.publishers).forEach(([uuid, publisher])=> {

      const nWordsArray =  getWordsArray(publisher.nickname, true);
      const fWordsArray =  getWordsArray(publisher.fullname, true);
      const wWordsArray =  getWordsArray(publisher.words, true);
      const publisherWordsArray = nWordsArray.concat(fWordsArray).concat(wWordsArray);

      const coincidences = [... (publisherWordsArray.filter(word => {
        return entryWordsArray.indexOf(word) !== -1
      }))].length;

      if (Array.from(ranking.keys()).indexOf(coincidences) == -1) {
        ranking.set(coincidences, []);
      }

      ranking.get(coincidences).push(publisher);
    });

    const key = Array.from(ranking.keys()).sort((a,b) => {
      return b - a;
    })[0];

    const candidates = ranking.get(key);
    if (candidates.length !== 1) {
      Logger.log(
        `${words} has not identified as known publishers. Candidates were \n 
         ${candidates.map(publisher => {return publisher.fullname + '\n'})}`
      );
      return undefined;
    } 
    let tm_all = (new Date().getTime()-tm0)/1000;
    return candidates[0];
  }

  getGroupsByServiceYear(serviceYear) {
    return Object.fromEntries(Object.entries(this.groups).filter(([uuid, group]) => {
      return group.serviceYear ==  serviceYear;
    }));
  }
}

function getDataBase (ss, method){
  return new DataBase(ss, method)
}

function simulatePublisherByWords(){
  const source = '1ZQIz_KErldGIGEzSnmCTTCliLr0Us1nVijyFDBp6ipI'; //Andrés
  const words = 'Yanet Salazar'
  const db = new DataBase(
    source,
    'spreadsheet')
  db.loadData()
  const publisher = db.getPublisherByWords(words)
  k=1
  
}
