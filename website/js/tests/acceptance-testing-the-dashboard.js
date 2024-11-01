
function runDashboardAcceptanceTests(){
    const DATE_A = new Date(1000000000000);
    setDashboardDate(DATE_A); // Fix the clock for all time based tests

    return runAcceptanceTestSuite({
        groupName: "Acceptance testing the whole dashboard",
        tests: [
            {
                sectionUnderTest: "All sections",
                comment: "Returns all the sections of the dashboard",
                parameters: { url: "/family-dashboard/website/index-new.html?setDashboardDate=" + DATE_A },
                expectedResult:
                    `<!DOCTYPE html>
                     <html lang="en">
                     <head>
                         <meta charset="UTF-8">
                         <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
                         <link rel="stylesheet" href="/family-dashboard/website/css/bootstrap.v4.4.1.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh">
                         <link rel="stylesheet" href="/family-dashboard/website/css/family-dashboard-styles.css">
                         <title>The Zewde Dashboard</title>
                     </head>
                     <body id="main-body">
                         <div id="dashboardDate" value=""></div>
                         <script type="text/javascript" src="/family-dashboard/website/js/jquery-v3.5.0.min.js" crossorigin="anonymous"></script>
                         <script type="text/javascript" src="/family-dashboard/website/js/utils-new.js"></script>
                     </body>
                     </html>`,
                displayFormatter: displayAsIs,
                comparator: ignoreSpaceComparator
            }
        ]
    });
}


function runAllTests(){
    var allTestResults = [];
    allTestResults.push.apply(allTestResults, runDashboardAcceptanceTests());
    allTestResults.push.apply(allTestResults, runDateTimePanelAcceptanceTests());
    displayTestResults( allTestResults );
}

runAllTests();