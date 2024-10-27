var totalTestCounter = 0;

function stringifyComparator(a, b){
    return JSON.stringify(a) === JSON.stringify(b);
}

function compareHtmlAndVisualise( a, b ){
    return {
        passed: remove_white_space(a) === remove_white_space(b),
        expectedValue: a,
        testedValue:  b
    }
}


function dateTimeComparatorInsensitive(a, b){
    return dateTimeComparatorActual(a, b, true);
}

function dateTimeComparatorExact(a, b){
    return dateTimeComparatorActual(a, b, false);
}

function dateTimeComparatorActual(a, b, ignoreMillis){
    var aTimeStamp = a.getTime();
    var bTimeStamp = b.getTime();
    if( ignoreMillis ){
        let lowerBound = bTimeStamp - 1001;
        let upperBound = bTimeStamp + 1001;
        return lowerBound < aTimeStamp && aTimeStamp < upperBound;
    }else{
        return aTimeStamp === bTimeStamp;
    }
}

function removeWhiteSpace( txt ){
    return txt.replaceAll(' ', '' ).replaceAll('\n', '' );
}

function ignoreSpaceComparator( a, b ) {
    return removeWhiteSpace(a) === removeWhiteSpace(b);
}

function regexComparator(regex, str) {
    regex = new RegExp(regex);
    return  regex.test(str);
}

function addTestGrouping( groupName ){
    return { groupName: groupName, isTestGroup: true };
}

function runUnitTest( functionUnderTest, comment, parameters, expectedResult, displayFormatter, comparator, expectedErrorMgs){
    totalTestCounter += 1;
    var comparator = (comparator ? comparator : function( a, b ){ return a === b });
    var displayFormatter = (displayFormatter ? displayFormatter : displayAsIs);
    var testResult = { id: totalTestCounter,
                       functionUnderTest: functionUnderTest,
                       comment: comment,
                       isTestGroup: false,
                       displayFormatter: displayFormatter,
                       expectedResult: expectedResult,
                       actualResult: "Not set yet!" };

    try{
        testResult.actualResult = window[functionUnderTest].apply(null, parameters);
        testResult.passed = comparator( expectedResult, testResult.actualResult );
    } catch( error ){
        testResult.passed = ( error.message === expectedErrorMgs );
        if(testResult.passed){
            testResult.actualResult = error.message;
        }else{
            testResult.actualResult =  error.stack.replaceAll( "\n", "<br/>");
        }
    }
    return testResult;
}

function runUnitTestSuite( testSuite ){
    var results = [addTestGrouping( testSuite.groupName )];
    testSuite.tests.forEach(function( test ){
        (test.beforeTest ? test.beforeTest(): '');
        results.push(
            runUnitTest( test.functionUnderTest,
                         test.comment,
                         test.parameters,
                         test.expectedResult,
                         test.displayFormatter,
                         test.comparator,
                         test.expectedErrorMgs ));
        (test.afterTest ? test.afterTest() : '');
        });
    return results;
}