

function runDateTimePanelAcceptanceTests(){
    const DATE_A = new Date(1000000000000);
    setDashboardDate(DATE_A); // Fix the clock for all time based tests

    return runAcceptanceTestSuite({
        groupName: "Acceptance testing the Date and Time Panel",
        tests: [
            {
                sectionUnderTest: "Date and Time",
                comment: "Returns date and time set in the Dashboard Date",
                parameters: { url: "/family-dashboard/website/index-new.html?setDashboardDate=" + DATE_A },
                expectedResult: `.*<body id=\"main-body\">.*<div id=\"dashboardDate\" value=\"\">.*</div>.*</body></html>`,
                displayFormatter: displayAsIs,
                comparator: regexComparator
            }
        ]
    });
}