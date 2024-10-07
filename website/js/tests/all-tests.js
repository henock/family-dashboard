

function runAllTests(){
    var allTestResults = [];
    allTestResults.push.apply(allTestResults, runUnitTestsForTestFramework());
    allTestResults.push.apply(allTestResults, runUnitTestsForUtils());
    allTestResults.push.apply(allTestResults, runUnitTestsForDateTime());
    displayTestResults( allTestResults );
}

runAllTests();