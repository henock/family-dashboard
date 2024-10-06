

function runAllTests(){
    var allTestResults = [];
    allTestResults.push.apply(allTestResults, runUnitTestForTestFramework());
    displayTestResults( allTestResults );
}

runAllTests();