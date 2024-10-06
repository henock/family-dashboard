var totalTestCounter = 0;

function stringifyComparator(a, b){
    return JSON.stringify(a) === JSON.stringify(b);
}

function removeWhiteSpace( txt ){
    return txt.replaceAll(' ', '' ).replaceAll('\n', '' );
}

function ignoreSpaceComparator( a, b ) {
    return removeWhiteSpace(a) === removeWhiteSpace(b);
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