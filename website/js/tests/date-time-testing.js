function calculateDateForTest(allTestResults){

    function helper( comment, params, expected ){
        allTestResults.push(
            runUnitTest( "calculateDateFor", comment, params, expected,
                         displayStringified, dateTimeComparatorInsensitive));
    }

    const SECOND = 1000;
    const TWO_SECOND = 2000;
    const TEN_SECOND = 10000;
    const ONE_MIN = 60000;
    const TEN_MIN = 60000;
    const ONE_HOUR = 36000;
    helper( "now+2s", ["now+2s"], new Date(new Date().getTime()+TWO_SECOND));
    helper( "now+10s", ["now+10s"], new Date(new Date().getTime()+TEN_SECOND));
    helper( "now-10s", ["now-10s"], new Date(new Date().getTime()-TEN_SECOND));
    helper( "now+1m", ["now+1m"], new Date(new Date().getTime()+ONE_MIN));
    helper( "now-1m", ["now-1m"], new Date(new Date().getTime()-ONE_MIN));
    helper( "now+2h", ["now+2h"], new Date(new Date().getTime()+ONE_HOUR+ONE_HOUR));
    helper( "now-1h", ["now-1h"], new Date(new Date().getTime()-ONE_HOUR));
    helper( "now+24h", ["now+24h"], new Date(new Date().getTime()+(24*ONE_HOUR)));
}


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

     return allTestResults;
}