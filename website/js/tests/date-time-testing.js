
const ONE_SECOND = 1000;
const TWO_SECOND = 2 * ONE_SECOND;
const TEN_SECOND = 10 * ONE_SECOND;
const ONE_MIN = 60 * ONE_SECOND;
const TEN_MIN = 10 * ONE_MIN;
const ONE_HOUR = 60 * ONE_MIN;


function runUnitTestsForDateTime(){
    var allTestResults = [];

     allTestResults.push(addTestGrouping( "Testing the date and time utilities"));

    allTestResults.push(
        runUnitTest( "setDashboardDate", "should set the current clock (dashboard date) to now",
                    [],
                    new Date(),
                    displayStringified , dateTimeComparatorInsensitive));

    let aDate = new Date(1000000000000);
    allTestResults.push(
        runUnitTest( "setDashboardDate", "should set the current clock (dashboard date) to time passed in",
                    [aDate],
                    aDate,
                    displayStringified , dateTimeComparatorExact));


    calculateDateForTest(allTestResults);

    allTestResults.push(
        runUnitTest( "nowPlusSecond", "now+10s",
                    [10],
                    new Date(new Date().getTime()+TEN_SECOND),
                    displayStringified , dateTimeComparatorInsensitive));

    allTestResults.push(
        runUnitTest( "nowPlusSecond", "now-10s",
                    [-10],
                    new Date(new Date().getTime()-TEN_SECOND),
                    displayStringified , dateTimeComparatorInsensitive));

     return allTestResults;
}




function calculateDateForTest(allTestResults){

    function helper( comment, params, expected ){
        allTestResults.push(
            runUnitTest( "calculateDateFor", comment, params, expected,
                         displayStringified, dateTimeComparatorInsensitive));
    }
    helper( "now+2s", ["now+2s"], new Date(new Date().getTime()+TWO_SECOND));
    helper( "now+10s", ["now+10s"], new Date(new Date().getTime()+TEN_SECOND));
    helper( "now-10s", ["now-10s"], new Date(new Date().getTime()-TEN_SECOND));
    helper( "now+1m", ["now+1m"], new Date(new Date().getTime()+ONE_MIN));
    helper( "now-1m", ["now-1m"], new Date(new Date().getTime()-ONE_MIN));
    helper( "now+2h", ["now+2h"], new Date(new Date().getTime()+ONE_HOUR+ONE_HOUR));
    helper( "now-1h", ["now-1h"], new Date(new Date().getTime()-ONE_HOUR));
    helper( "now+24h", ["now+24h"], new Date(new Date().getTime()+(24*ONE_HOUR)));
}