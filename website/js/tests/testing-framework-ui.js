
function displayAsIs( text ) {
    return text;
}

function displayAsTextArea( text ){
    return `<textarea style="width:600px; height:150px; margin:6px;">${text}</textarea>`;
}

function displayStringified( anObject ){
    return JSON.stringify( anObject );
}

function buildLinkToAnchor( text, aClass, anchor ){
    var classText = ( aClass ? `class="${aClass}"`: "");
    if( anchor ){
        return `<a ${classText} href="#${anchor}">${text}</a>`;
    } else {
        return `<a ${classText} href="#${text}">${text}</a>`;
    }
}

function buildLinksToTests( results ){
    var html = "<ol>";
    results.forEach( function( result ){
        const textClass = (result.passed ? "text-success": "text-danger");
        const functionUnderTest = (result.functionUnderTest ? result.functionUnderTest:result.sectionUnderTest)
        html += `<li>${ buildLinkToAnchor(functionUnderTest, textClass, result.id ) }</li>`;
    });

    return (html += "</ol>");
}

function addHeadingRow( hasFailedTests ){
    return `<tr>
                <th>Test id</th>
                <th>Function under test</th>
                <th>Comment</th>
                <th>As text area</th>
                ${ (hasFailedTests ? "<th>Expected</th><th>Actual</th>": "")}
            </tr>`;
}

function buildHtmlForTestGroup(result, hasFailedTests){
    return `<tr>
               <td class="pr-3">${buildLinkToAnchor("Top") }</td>
               <td colspan="4" class="text-left pb-4 pt-4 text-warning h3">${result.groupName}</td>
            </tr>
            ${addHeadingRow(hasFailedTests)}
            `;
}

function toggleToTextArea(event){
    const checkboxId = event.id;
    const id = checkboxId.substr("checkbox-".length);
    if(event.checked){
        document.getElementById("expected-" + id ).classList.add('d-none');
        document.getElementById("actual-" + id ).classList.add('d-none');
        document.getElementById("text-area-expected-" + id ).classList.remove('d-none');
        document.getElementById("text-area-actual-" + id ).classList.remove('d-none');
    }else{
        document.getElementById("text-area-expected-" + id ).classList.add('d-none');
        document.getElementById("text-area-actual-" + id ).classList.add('d-none');
        document.getElementById("expected-" + id ).classList.remove('d-none');
        document.getElementById("actual-" + id ).classList.remove('d-none');
    }
}

function buildHtmlForTests(result){
    const textClass = (result.passed ? "text-success": "text-danger");
    const formattedExpectedResult = result.displayFormatter(result.expectedResult);
    const formattedActualResult   = result.displayFormatter(result.actualResult);
    const expectedResultInTextArea = displayAsTextArea(result.expectedResult);
    const actualResultInTextArea   = displayAsTextArea(result.actualResult);
    return `<tr class="${textClass}">
                <td><a id="${result.id}"/> ${result.id}</td>
                <td>${(result.functionUnderTest ? result.functionUnderTest:result.sectionUnderTest)}</td>
                <td>${result.comment}</td>
                <td><input  class="${( result.passed ? 'd-none' :'')}" type="checkbox" id="checkbox-${result.id}"
                    onchange="toggleToTextArea(this)"/>
                </td>
                <td id="expected-${result.id}">${( result.passed ? "": formattedExpectedResult)}</td>
                <td id="actual-${result.id}">${( result.passed ? "": formattedActualResult)}</td>
                <td class="d-none" id="text-area-expected-${result.id}">${( result.passed ? "": expectedResultInTextArea)}</td>
                <td class="d-none" id="text-area-actual-${result.id}">${( result.passed ? "": actualResultInTextArea)}</td>
            </tr>
           `;
}

function buildHtmlForTestResults( listOfResults, hasFailedTests ){
    var html = "";

    listOfResults.forEach( result => {
        html += result.isTestGroup
                    ? buildHtmlForTestGroup(result,hasFailedTests)
                    : buildHtmlForTests(result);
    });

    return html;
}

function displayTestResults( allTestResults ){
    var passedTests = allTestResults.filter((result) => result.passed === true );
    var failedTests = allTestResults.filter((result) => result.passed === false );

    var testResultTable = `

        <table class="p-2">
            <tr>
                <td colspan="3"><a id="Top"/></td>
            </tr>
            <tr>
                <td colspan="3"><a href="?">Run in normal mode.</a></td>
            </tr>
            <tr>
                <td colspan="3"><a href="?debug=true">Run in debug mode</a></td>
            </tr>
            <tr class="text-success">
                <td class="display-2">Passed</td>
                <td class="display-2">${passedTests.length}</td>
            </tr>
            <tr class="text-danger">
                <td class="display-2">Failed</td>
                <td class="display-2">${failedTests.length}</td>
                <td>${buildLinksToTests(failedTests)}</td>
            </tr>
        </table>
        <table>
            ${buildHtmlForTestResults(allTestResults, failedTests.length > 0 )}
        </table>
        `;

    document.getElementById("tests").innerHTML = testResultTable;
}
