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

function runUnitTestForTestFramework() {
    var allTestResultsHtml = [];

     allTestResultsHtml.push(
        addTestGrouping( "Testing the Test Framework itself"));


    allTestResultsHtml.push(
        runUnitTest( "displayAsTextArea", "should wrap parameter in a text area",
                    ["text"],
                    `<textarea style="width:600px; height:150px; margin:6px;">text</textarea>`,
                    displayAsTextArea ));

    allTestResultsHtml.push(
        runUnitTest( "buildLinkToAnchor", "should build an anchor for text with a class",
                    ["text", "aClass"],
                    `<a class="aClass" href="#text">text</a>`,
                    displayAsTextArea ));

    allTestResultsHtml.push(
        runUnitTest( "buildLinkToAnchor", "should build an anchor for text",
                    ["text"],
                    `<a  href="#text">text</a>`,
                    displayAsTextArea ));

    allTestResultsHtml.push(
        runUnitTest( "addTwoNumbersTogether", "should pass for a passing test",
                    [1, 2], 3));

    allTestResultsHtml.push(
        flipCorrectlyFailingTestAsPassed(
            runUnitTest( "failsToAddTwoNumbersTogether", "should fail for a failing test",
                   [1, 2], 3)));

    allTestResultsHtml.push(
        runUnitTest( "throwsException", "should pass when expected error is thrown",
                    [], 2, null, null, testErrorMessage));

    allTestResultsHtml.push(
            flipCorrectlyFailingTestAsPassed(
                runUnitTest( "throwsException", "should show stack trace when unexpected error is thrown", [], 2)));

    return allTestResultsHtml;
}


