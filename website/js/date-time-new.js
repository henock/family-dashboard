
const A_SECOND				=  1000;
const A_MINUTE				= A_SECOND * 60;
const FIVE_MINUTES 			= A_MINUTE * 5
const TEN_MINUTES 			= A_MINUTE * 10
const FIFTEEN_MINUTES		= A_MINUTE * 15
const HALF_AN_HOUR 			= A_MINUTE * 30
const AN_HOUR				= A_MINUTE * 60;
const TWELVE_HOURS			= AN_HOUR * 12;
const TWENTY_FOUR_HOURS		= AN_HOUR * 24;


var dashboardDate = new Date();

function setDashboardDate( otherDate ){
    dashboardDate = (otherDate && otherDate instanceof Date? otherDate: new Date());
    return dashboardDate;
}

function nowPlusSecond( seconds ){
    return calculateDateFor( "now+" + seconds + "s" );
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
            multiplier = A_SECOND;
            break;
        case "m":
            multiplier = A_MINUTE;
            break;
        case "h":
            multiplier = AN_HOUR;
            break;
    }

    if( sign === "+"){
        return new Date(dashboardDate.getTime() + (amount * multiplier));
    }else{
        return new Date(dashboardDate.getTime() - (amount * multiplier));
    }
}