//############################################################
//    Set of tests that test the test framework itself       #
//############################################################

const testErrorMessage = "This is a test error - testing the test framework!";

function addTwoNumbersTogether(a, b){
    return a+b;
}

function failsToAddTwoNumbersTogether(a, b){
    return a;
}

function throwsException(){
     throw new Error( testErrorMessage );
}

function flipCorrectlyFailingTestAsPassed( result ){
    if( result.passed === false ){
        result.passed = true;
    }
    return result;
}

function dateTimeComparatorTests( allTestResults ){
    function helper( method, comment, aTime, bTime, shouldMatch ){
        let dateA = new Date( aTime);
        let dateB = new Date( bTime);
        allTestResults.push(runUnitTest( method, comment, [dateA, dateB], shouldMatch ));
    }

    helper( "dateTimeComparatorExact", "should match two identical dates", 1000000000000, 1000000000000, true );
    helper( "dateTimeComparatorExact", "should fail to match two dates out by 1 milli", 1000000000000, 1000000000001, false );
    helper( "dateTimeComparatorExact", "should fail to match two dates out by 1 milli", 1000000000001, 1000000000000, false );
    helper( "dateTimeComparatorInsensitive", "should match two identical dates", 1000000000000, 1000000000000, true );
    helper( "dateTimeComparatorInsensitive", "should match two dates less than a second apart", 1000000000000, 1000000000999, true );
    helper( "dateTimeComparatorInsensitive", "should match two dates less than a second apart", 1000000000999, 1000000000000, true );
    helper( "dateTimeComparatorInsensitive", "should fail to match two dates just more than a second apart", 1000000001001, 1000000000000, false );
    helper( "dateTimeComparatorInsensitive", "should fail to match two dates just more than a second apart", 1000000000000, 1000000001001, false );
}

function runUnitTestsForTestFramework() {
    var allTestResults = [];

     allTestResults.push(
        addTestGrouping( "Testing the Test Framework itself"));

    dateTimeComparatorTests( allTestResults );

    allTestResults.push(
        runUnitTest( "displayAsTextArea", "should wrap parameter in a text area",
                    ["text"],
                    `<textarea style="width:600px; height:150px; margin:6px;">text</textarea>`,
                    displayAsTextArea ));

    allTestResults.push(
        runUnitTest( "buildLinkToAnchor", "should build an anchor for text with a class",
                    ["text", "aClass"],
                    `<a class="aClass" href="#text">text</a>`,
                    displayAsTextArea ));

    allTestResults.push(
        runUnitTest( "buildLinkToAnchor", "should build an anchor for text",
                    ["text"],
                    `<a  href="#text">text</a>`,
                    displayAsTextArea ));

    allTestResults.push(
        runUnitTest( "addTwoNumbersTogether", "should pass for a passing test",
                    [1, 2], 3));

    allTestResults.push(
        flipCorrectlyFailingTestAsPassed(
            runUnitTest( "failsToAddTwoNumbersTogether", "should fail for a failing test",
                   [1, 2], 3)));

    allTestResults.push(
        runUnitTest( "throwsException", "should pass when expected error is thrown",
                    [], 2, null, null, testErrorMessage));

    allTestResults.push(
            flipCorrectlyFailingTestAsPassed(
                runUnitTest( "throwsException", "should show stack trace when unexpected error is thrown", [], 2)));

    return allTestResults;
}


