

function runUnitTestsForUtils(){
    var results = [];
    setDashboardDate(new Date(1000000000000)); // Fix the clock for all time based tests
    results.push(addTestGrouping( "Utility methods tests"));

    results.push( runUnitTest( "padWithLeadingZero", "pads 1 to 01", [1], "01"));
    results.push( runUnitTest( "padWithLeadingZero", "return 01 as 01", [01], "01"));
    results.push( runUnitTest( "padWithLeadingZero", "return 001 as 001", [001], "01"));
    results.push( runUnitTest( "padWithLeadingSpaces", "returns (2, '12') as '12'",
                                       [2,"12"], "12", displayAsTextArea));

    results.push( runUnitTest( "padWithLeadingSpaces", "returns (3, '12') as ' 12'",
                                       [3,"12"], "&nbsp;12", displayAsTextArea));

    results.push( runUnitTest( "padWithLeadingSpaces", "returns (5, '12') as ' 12'",
                                       [5,"12"], "&nbsp;&nbsp;&nbsp;12", displayAsTextArea));

    results.push( runUnitTest( "writeMessage", "No message", [""],
                            `<li  remove-time="1000000005000"><xmp> [02:46:40] </xmp></li>`));

    results.push( runUnitTest( "writeMessage", "message only", ["a message"],
                            `<li  remove-time="1000000005000"><xmp> [02:46:40] a message</xmp></li>`));

    results.push( runUnitTest( "writeMessage", "message only with class", ["a message", "aClass"],
                            `<li class='aClass' remove-time="1000000005000"><xmp> [02:46:40] a message</xmp></li>`));

    results.push( runUnitTest( "writeMessage", "message only with class with and 20 second delay",
                            ["a message", "aClass", 20],
                            `<li class='aClass' remove-time="1000000020000"><xmp> [02:46:40] a message</xmp></li>`));

    results.push( runUnitTest( "writeMessage", "message only with class with and 20 second delay as html",
                            ["a message", "aClass", 20, true],
                            `<li class='aClass' remove-time="1000000020000"> [02:46:40] a message</li>`));

    runningInDebugMode = false;
    results.push( runUnitTest( "logDebug", "logDebug no message when debugMode is false", ["a message"], ``));

    results.push( runUnitTest( "logDebug", "logDebug no message when debugMode is false, even with 20 second delay", ["a message", 20], ``));

    runningInDebugMode = true;
    results.push( runUnitTest( "logDebug", "logDebug message only", ["a message"],
                            `<li class='text-secondary' remove-time="1000000005000"><xmp> [02:46:40] a message</xmp></li>`, displayAsTextArea));

    results.push( runUnitTest( "logDebug", "logDebug message only with 20 second delay", ["a message", 20],
                            `<li class='text-secondary' remove-time="1000000020000"><xmp> [02:46:40] a message</xmp></li>`));

    results.push( runUnitTest( "logInfo", "logInfo message only with html", ["a message <h1>test</h1>"],
                            `<li class='text-info' remove-time="1000000005000"><xmp> [02:46:40] a message <h1>test</h1></xmp></li>`));

    results.push( runUnitTest( "logInfo", "logInfo message only with 20 second delay", ["a message", 20],
                            `<li class='text-info' remove-time="1000000020000"><xmp> [02:46:40] a message</xmp></li>`));

    results.push( runUnitTest( "logWarn", "logWarn message only with html", ["a message <h1>test</h1>"],
                            `<li class='text-warning' remove-time="1000000005000"><xmp> [02:46:40] a message <h1>test</h1></xmp></li>`));

    results.push( runUnitTest( "logWarn", "logWarn message only with 20 second delay", ["a message", 20],
                            `<li class='text-warning' remove-time="1000000020000"><xmp> [02:46:40] a message</xmp></li>`));

    results.push( runUnitTest( "logError", "logError message only", ["a message"],
                            `<li class='text-danger p-1' remove-time="1000000005000"><xmp> [02:46:40] a message</xmp></li>`));

    results.push( runUnitTest( "logError", "logError message only with 20 second delay", ["a message", 20],
                            `<li class='text-danger p-1' remove-time="1000000020000"><xmp> [02:46:40] a message</xmp></li>`));

    return results;
}