

function runUnitTestsForUtils(){

    setDashboardDate(new Date(1000000000000)); // Fix the clock for all time based tests

    return runUnitTestSuite({
        groupName: "Utility methods tests",
        tests: [
            {
                functionUnderTest: "padWithLeadingZero",
                comment: "pads 1 to 01",
                parameters: [1],
                expectedResult: "01",
            },
            {
                functionUnderTest: "padWithLeadingZero",
                comment: "return 01 as 01",
                parameters: [01],
                expectedResult: "01",
            },
            {
                functionUnderTest: "padWithLeadingZero",
                comment: "return 001 as 001",
                parameters: [001],
                expectedResult: "01",
            },
            {
                functionUnderTest: "padWithLeadingSpaces",
                comment: "returns (2, '12') as '12'",
                parameters: [2,"12"],
                expectedResult: "12",
                displayFormatter: displayAsTextArea
            },
            {
                functionUnderTest: "padWithLeadingSpaces",
                comment: "returns (3, '12') as ' 12'",
                parameters: [3,"12"],
                expectedResult: "&nbsp;12",
                displayFormatter: displayAsTextArea
            },
            {
                functionUnderTest: "padWithLeadingSpaces",
                comment: "returns (5, '12') as ' 12'",
                parameters: [5,"12"],
                expectedResult: "&nbsp;&nbsp;&nbsp;12",
                displayFormatter: displayAsTextArea
            },
            {
                functionUnderTest: "writeMessage",
                comment: "No message",
                parameters: [""],
                expectedResult: `<li  remove-time="1000000005000"><xmp> [02:46:40] </xmp></li>`,
            },
            {
                functionUnderTest: "writeMessage",
                comment: "message only",
                parameters: ["a message"],
                expectedResult: `<li  remove-time="1000000005000"><xmp> [02:46:40] a message</xmp></li>`,
            },
            {
                functionUnderTest: "writeMessage",
                comment: "message only with class",
                parameters: ["a message", "aClass"],
                expectedResult: `<li class='aClass' remove-time="1000000005000"><xmp> [02:46:40] a message</xmp></li>`,
            },
            {
                functionUnderTest: "logDebug",
                comment: "logDebug no message when debugMode is false",
                parameters: ["a message"],
                expectedResult: "",
                beforeTest: function(){runningInDebugMode = false;},
                afterTest: function(){runningInDebugMode = true;}
            },
            {
                functionUnderTest: "logDebug",
                comment: "logDebug no message when debugMode is false, even with 20 second delay",
                parameters: ["a message", 20],
                expectedResult: "",
                beforeTest: function(){runningInDebugMode = false;},
                afterTest: function(){runningInDebugMode = true;}
            },
            {
                functionUnderTest: "logDebug",
                comment: "logDebug message only",
                parameters: ["a message"],
                expectedResult: `<li class='text-secondary' remove-time="1000000005000"><xmp> [02:46:40] a message</xmp></li>`,
                displayFormatter: displayAsTextArea
            },
            {
                functionUnderTest: "logDebug",
                comment: "logDebug message only with 20 second delay",
                parameters: ["a message", 20],
                expectedResult: `<li class='text-secondary' remove-time="1000000020000"><xmp> [02:46:40] a message</xmp></li>`
            },
            {
                functionUnderTest: "logInfo",
                comment: "logInfo message only with html",
                parameters: ["a message <h1>test</h1>"],
                expectedResult: `<li class='text-info' remove-time="1000000005000"><xmp> [02:46:40] a message <h1>test</h1></xmp></li>`
            },
            {
                functionUnderTest: "logInfo",
                comment: "logInfo message only with 20 second delay",
                parameters: ["a message", 20],
                expectedResult: `<li class='text-info' remove-time="1000000020000"><xmp> [02:46:40] a message</xmp></li>`
            },
            {
                functionUnderTest: "logWarn",
                comment: "logWarn message only with html",
                parameters: ["a message <h1>test</h1>"],
                expectedResult: `<li class='text-warning' remove-time="1000000005000"><xmp> [02:46:40] a message <h1>test</h1></xmp></li>`
            },
            {
                functionUnderTest: "logWarn",
                comment: "logWarn message only with 20 second delay",
                parameters: ["a message", 20],
                expectedResult: `<li class='text-warning' remove-time="1000000020000"><xmp> [02:46:40] a message</xmp></li>`
            },
            {
                functionUnderTest: "logError",
                comment: "logError message only",
                parameters: ["a message"],
                expectedResult: `<li class='text-danger p-1' remove-time="1000000005000"><xmp> [02:46:40] a message</xmp></li>`
            },
            {
                functionUnderTest: "logError",
                comment: "logError message only with 20 second delay",
                parameters: ["a message", 20],
                expectedResult: `<li class='text-danger p-1' remove-time="1000000020000"><xmp> [02:46:40] a message</xmp></li>`
            }
        ]
    });
}