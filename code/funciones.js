function doGet() {
    return HtmlService.createTemplateFromFile('html/web').evaluate().setTitle('web S21code');
}

function getHtmlDataFromFile(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}