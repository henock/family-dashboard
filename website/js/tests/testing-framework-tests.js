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

function runUnitTestsForTestFramework() {

    const DATE_A = new Date(1000000000000);
    const DATE_A_PLUS_1_MILLI = new Date(1000000000001);
    const DATE_A_PLUS_999_MILLIS = new Date(1000000000999);
    const DATE_A_PLUS_1_SECOND_AND_1_MILLI = new Date(1000000001001);

    return runUnitTestSuite({
        groupName: "Testing the Test Framework itself",
        tests: [
            {
                functionUnderTest: "displayAsTextArea",
                comment: "should wrap parameter in a text area",
                parameters: ["text"],
                expectedResult: `<textarea style="width:600px; height:150px; margin:6px;">text</textarea>`,
                displayFormatter: displayAsTextArea
            },
            {
                functionUnderTest: "buildLinkToAnchor",
                comment: "should build an anchor for text with a class",
                parameters: ["text", "aClass"],
                expectedResult: `<a class="aClass" href="#text">text</a>`,
                displayFormatter: displayAsTextArea
            },
            {
                functionUnderTest: "buildLinkToAnchor",
                comment: "should build an anchor for text",
                parameters: ["text"],
                expectedResult: `<a  href="#text">text</a>`,
                displayFormatter: displayAsTextArea
            },
            {
                functionUnderTest: "displayAsTextArea",
                comment: "should wrap parameter in a text area",
                parameters: ["text"],
                expectedResult: `<textarea style="width:600px; height:150px; margin:6px;">text</textarea>`,
                displayFormatter: displayAsTextArea
            },
            {
                functionUnderTest: "buildLinkToAnchor",
                comment: "should build an anchor for text with a class",
                parameters: ["text", "aClass"],
                expectedResult: `<a class="aClass" href="#text">text</a>`,
                displayFormatter: displayAsTextArea
            },
            {
                functionUnderTest: "buildLinkToAnchor",
                comment: "should build an anchor for text",
                parameters: ["text"],
                expectedResult: `<a  href="#text">text</a>`,
                displayFormatter: displayAsTextArea
            },
            {
                functionUnderTest: "dateTimeComparatorExact",
                comment:"should match two identical dates",
                parameters: [ DATE_A,  DATE_A],
                expectedResult: true
            },
            {
                functionUnderTest: "dateTimeComparatorExact",
                comment:"should fail to match two dates out by 1 milli",
                parameters: [ DATE_A, DATE_A_PLUS_1_MILLI],
                expectedResult: false
            },
            {
                functionUnderTest: "dateTimeComparatorExact",
                comment:"should fail to match two dates out by 1 milli",
                parameters: [DATE_A_PLUS_1_MILLI,  DATE_A],
                expectedResult: false
            },
            {
                functionUnderTest: "dateTimeComparatorInsensitive",
                comment:"should match two identical dates",
                parameters: [ DATE_A,  DATE_A],
                expectedResult: true
            },
            {
                functionUnderTest: "dateTimeComparatorInsensitive",
                comment:"should match two dates less than a second apart",
                parameters: [ DATE_A, DATE_A_PLUS_999_MILLIS],
                expectedResult: true
            },
            {
                functionUnderTest: "dateTimeComparatorInsensitive",
                comment:"should match two dates less than a second apart",
                parameters: [DATE_A_PLUS_999_MILLIS,  DATE_A],
                expectedResult: true
            },
            {
                functionUnderTest: "dateTimeComparatorInsensitive",
                comment:"should fail to match two dates just more than a second apart",
                parameters: [DATE_A_PLUS_1_SECOND_AND_1_MILLI,  DATE_A],
                expectedResult: false
            },
            {
                functionUnderTest: "dateTimeComparatorInsensitive",
                comment:"should fail to match two dates just more than a second apart",
                parameters: [ DATE_A, DATE_A_PLUS_1_SECOND_AND_1_MILLI],
                expectedResult: false
            },
            {
                functionUnderTest: "addTwoNumbersTogether",
                comment: "should pass for a passing test",
                parameters: [1, 2],
                expectedResult: 3
            },
            {
                functionUnderTest: "throwsException",
                comment: "should pass when expected error is thrown",
                parameters: [],
                expectedResult: 2,
                displayFormatter: null,
                comparator: null,
                expectedErrorMgs: testErrorMessage
            }
        ]
    });
}


function runUnitTestsForTestFrameworkThatCorrectlyCatchFailingTests() {

    var allTestResults = [];

    allTestResults.push(
        flipCorrectlyFailingTestAsPassed(
            runUnitTest( "failsToAddTwoNumbersTogether", "should fail for a failing test",
                   [1, 2], 3)));

    allTestResults.push(
            flipCorrectlyFailingTestAsPassed(
                runUnitTest( "throwsException", "should show stack trace when unexpected error is thrown", [], 2)));

    return allTestResults;
}


