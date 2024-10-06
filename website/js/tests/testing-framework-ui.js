
function displayAsIs( text ) {
    return text;
}

function displayAsTextArea( text ){
    return `<textarea style="width:600px; height:150px; margin:6px;">${text}</textarea>`;
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
        let textClass = (result.passed ? "text-success": "text-danger");
        html += `<li>${ buildLinkToAnchor(result.functionUnderTest, textClass, result.id ) }</li>`;
    });

    return (html += "</ol>");
}

function addHeadingRow( hasFailedTests ){
    return `<tr>
                <th>Test id</th>
                <th>Function under test</th>
                <th>comment</th>
                ${ (hasFailedTests ? "<th>expected</th><th>actual</th>": "")}
            </tr>`;
}

function buildHtmlForTestResults( listOfResults, hasFailedTests ){
    var html = "";
    listOfResults.forEach(function( result ){
        if( result.isTestGroup){
            html += `<tr>
                        <td class="pr-3">${buildLinkToAnchor("Top") }</td>
                        <td colspan="4" class="text-left pb-4 pt-4">${result.groupName}</td>
                     </tr>
                     ${addHeadingRow(hasFailedTests)}
                     `;
        }else{
            let textClass = (result.passed ? "text-success": "text-danger");
            let formattedExpectedResult = result.displayFormatter(result.expectedResult);
            let formattedActualResult   = result.displayFormatter(result.actualResult);
            html += `
                <tr class="${textClass}">
                    <td><a id="${result.id}"/> ${result.id}</td>
                    <td>${result.functionUnderTest}</td>
                    <td>${result.comment}</td>
                    ${( result.passed ? "<td></td>": "<td>"+ formattedExpectedResult +
                                        "</td><td>" + formattedActualResult +"</td>")}
                </tr>
               `;
        }
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
                <td>${ buildLinksToTests(failedTests)}</td>
            </tr>
        </table>
        <table>
            ${buildHtmlForTestResults(allTestResults, failedTests.length > 0 )}
        </table>
        `;

    $("#tests").html( testResultTable );
}
