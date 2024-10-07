
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


    let aDate = new Date(2000000000000);

    allTestResults.push(
        runUnitTest( "setDashboardDate", "should set the current clock (dashboard date) to time passed in",
                    [aDate],
                    aDate,
                    displayStringified , dateTimeComparatorExact));


    calculateDateForTest(allTestResults);

    allTestResults.push(
        runUnitTest( "nowPlusSecond", "now+10s",
                    [10],
                    "2001-09-09T01:46:50.000Z",
                    displayStringified , stringifyComparator));

    allTestResults.push(
        runUnitTest( "nowPlusSecond", "now-10s",
                    [-10],
                    "2001-09-09T01:46:30.000Z",
                    displayStringified , stringifyComparator));

     return allTestResults;
}




function calculateDateForTest(allTestResults){

    function helper( comment, params, expected ){
        allTestResults.push( runUnitTest( "calculateDateFor", comment, params, expected, displayStringified, stringifyComparator));
    }
    setDashboardDate(new Date(1000000000000)); // Fix the clock for all time based tests
    helper( "now+2s", ["now+2s"], "2001-09-09T01:46:42.000Z");
    helper( "now+10s", ["now+10s"], "2001-09-09T01:46:50.000Z");
    helper( "now-10s", ["now-10s"], "2001-09-09T01:46:30.000Z");
    helper( "now+1m", ["now+1m"], "2001-09-09T01:47:40.000Z");
    helper( "now-1m", ["now-1m"], "2001-09-09T01:45:40.000Z");
    helper( "now+2h", ["now+2h"], "2001-09-09T03:46:40.000Z");
    helper( "now-1h", ["now-1h"], "2001-09-09T00:46:40.000Z");
    helper( "now+24h", ["now+24h"], "2001-09-10T01:46:40.000Z");
}