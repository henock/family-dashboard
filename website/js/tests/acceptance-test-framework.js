

// Using this one as I don't want JQuery as part of my test suite
function getRemoteDataSimple( urlToGet ){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", urlToGet, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}


function runAcceptanceTest( sectionUnderTest, comment, parameters, expectedResult, displayFormatter, comparator, expectedErrorMgs){
    totalTestCounter += 1;
    var comparator = (comparator ? comparator : function( a, b ){ return a === b });
    var displayFormatter = (displayFormatter ? displayFormatter : displayAsIs);
    var testResult = { id: totalTestCounter,
                       sectionUnderTest: sectionUnderTest,
                       comment: comment,
                       isTestGroup: false,
                       displayFormatter: displayFormatter,
                       expectedResult: expectedResult,
                       actualResult: "Not set yet!" };

    try{
        testResult.actualResult = getRemoteDataSimple( parameters.url );
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


function runAcceptanceTestSuite( testSuite ){
    var results = [addTestGrouping( testSuite.groupName )];
    testSuite.tests.forEach(function( test ){
        (test.beforeTest ? test.beforeTest(): '');
        results.push(
            runAcceptanceTest(  test.sectionUnderTest,
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