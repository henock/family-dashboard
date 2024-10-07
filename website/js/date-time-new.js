
var dashboardDate = {}

function setDashboardDate( otherDate ){
    dashboardDate = (otherDate && otherDate instanceof Date? otherDate: new Date());
    return dashboardDate;
}

function calculateDateFor( text ){
    var keyLength = 3;
    var amountStart = 4;
    if( text.includes("now")){
        keyLength = 3;
        amountStart = 4;
    }

    let sign = text.substring(keyLength, amountStart);
    let amount = text.substring(amountStart, text.length-1);
    let suffix = text.substring(text.length-1);

    switch( suffix ){
        case "s":
            multiplier = 1000;
            break;
        case "m":
            multiplier = 60000;
            break;
        case "h":
            multiplier = 36000;
            break;
    }

    if( sign === "+"){
        return new Date(new Date().getTime() + (amount * multiplier));
    }else{
        return new Date(new Date().getTime() - (amount * multiplier));
    }
}