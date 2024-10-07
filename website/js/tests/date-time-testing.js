
const ONE_SECOND = 1000;
const TWO_SECOND = 2 * ONE_SECOND;
const TEN_SECOND = 10 * ONE_SECOND;
const ONE_MIN = 60 * ONE_SECOND;
const TEN_MIN = 10 * ONE_MIN;
const ONE_HOUR = 60 * ONE_MIN;


function runUnitTestsForDateTime(){
    const DATE_A = new Date(1000000000000);
    const DATE_B = new Date(2000000000000);
    setDashboardDate(DATE_A); // Fix the clock for all time based tests

    return runUnitTestSuite({
        groupName: "Date and time functions tests",
        tests: [
            {
                functionUnderTest: "setDashboardDate",
                comment: "should set the current clock (dashboard date) to now",
                parameters: [],
                expectedResult: new Date(),
                displayFormatter: displayStringified,
                comparator: dateTimeComparatorInsensitive,
                afterTest: function(){ setDashboardDate(DATE_A);} //reset the Dashboard Date after the test
            },
            {
                functionUnderTest: "setDashboardDate",
                comment: "should set the current clock (dashboard date) to time passed in",
                parameters: [DATE_B],
                expectedResult: DATE_B,
                displayFormatter: displayStringified,
                comparator: dateTimeComparatorExact,
                afterTest: function(){ setDashboardDate(DATE_A);}  //reset the Dashboard Date after the test
            },
            {
                functionUnderTest: "calculateDateFor",
                comment: "now+2s",
                parameters: ["now+2s"],
                expectedResult: "2001-09-09T01:46:42.000Z",
                displayFormatter: displayStringified,
                comparator: stringifyComparator
            },
            {
                functionUnderTest: "calculateDateFor",
                comment: "now+10s",
                parameters: ["now+10s"],
                expectedResult: "2001-09-09T01:46:50.000Z",
                displayFormatter: displayStringified,
                comparator: stringifyComparator
            },
            {
                functionUnderTest: "calculateDateFor",
                comment: "now-10s",
                parameters: ["now-10s"],
                expectedResult: "2001-09-09T01:46:30.000Z",
                displayFormatter: displayStringified,
                comparator: stringifyComparator
            },
            {
                functionUnderTest: "calculateDateFor",
                comment: "now+1m",
                parameters: ["now+1m"],
                expectedResult: "2001-09-09T01:47:40.000Z",
                displayFormatter: displayStringified,
                comparator: stringifyComparator
            },
            {
                functionUnderTest: "calculateDateFor",
                comment: "now-1m",
                parameters: ["now-1m"],
                expectedResult: "2001-09-09T01:45:40.000Z",
                displayFormatter: displayStringified,
                comparator: stringifyComparator
            },
            {
                functionUnderTest: "calculateDateFor",
                comment: "now+2h",
                parameters: ["now+2h"],
                expectedResult: "2001-09-09T03:46:40.000Z",
                displayFormatter: displayStringified,
                comparator: stringifyComparator
            },
            {
                functionUnderTest: "calculateDateFor",
                comment: "now-1h",
                parameters: ["now-1h"],
                expectedResult: "2001-09-09T00:46:40.000Z",
                displayFormatter: displayStringified,
                comparator: stringifyComparator
            },
            {
                functionUnderTest: "calculateDateFor",
                comment: "now+24h",
                parameters: ["now+24h"],
                expectedResult: "2001-09-10T01:46:40.000Z",
                displayFormatter: displayStringified,
                comparator: stringifyComparator
            },
            {
                functionUnderTest: "nowPlusSecond",
                comment: "now+10s",
                parameters: [10],
                expectedResult: "2001-09-09T01:46:50.000Z",
                displayFormatter: displayStringified ,
                comparator: stringifyComparator
            },
            {
                functionUnderTest: "nowPlusSecond",
                comment: "now-10s",
                parameters: [-10],
                expectedResult: "2001-09-09T01:46:30.000Z",
                displayFormatter: displayStringified,
                comparator: stringifyComparator
            },
            {
                functionUnderTest: "getPaddedTimeSeconds",
                comment: "get time from dashboard",
                parameters: [],
                expectedResult: "02:46:40",
                displayFormatter: displayStringified,
                comparator: stringifyComparator
            },
            {
                functionUnderTest: "getPaddedTimeSeconds",
                comment: "get time from dashboard",
                parameters: [DATE_B],
                expectedResult: "04:33:20",
                displayFormatter: displayStringified,
                comparator: stringifyComparator
            },
            {
                functionUnderTest: "getPaddedTimeMinutes",
                comment: "get time from dashboard",
                parameters: [],
                expectedResult: "02:46",
                displayFormatter: displayStringified,
                comparator: stringifyComparator
            },
            {
                functionUnderTest: "getPaddedTimeMinutes",
                comment: "get time from dashboard",
                parameters: [DATE_B],
                expectedResult: "04:33",
                displayFormatter: displayStringified,
                comparator: stringifyComparator
            }
        ]
    });
}

