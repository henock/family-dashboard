-- Ask the user for the range of dates to be covered.
on getDateRange()
	set today to (current date)
	set d1 to today's short date string
	set d2 to short date string of (today + 6 * days)
	
	set dateRange to text returned of (display dialog "Enter the required date range:" default answer d1 & " - " & d2)
	set dateRangeStart to date (text from word 1 to word 3 of dateRange)
	set dateRangeEnd to date (text from word -3 to word -1 of dateRange)
	set dateRangeEnd's time to days - 1 -- Sets the last date's time to 23:59:59, the last second of the range.
	
	return {dateRangeStart, dateRangeEnd}
end getDateRange

-- Return the start dates and summaries which are in the given date range.
on filterToDateRange(theStartDates, theSummaries, dateRangeStart, dateRangeEnd)
	set {eventDatesInRange, eventSummariesInRange} to {{}, {}}
	repeat with i from 1 to (count theStartDates)
		set thisStartDate to item i of theStartDates
		if (not ((thisStartDate comes before dateRangeStart) or (thisStartDate comes after dateRangeEnd))) then
			set end of eventDatesInRange to thisStartDate
			set end of eventSummariesInRange to item i of theSummaries
		end if
	end repeat
	
	return {eventDatesInRange, eventSummariesInRange}
end filterToDateRange

-- Sort both the start-date and summary lists by start date.
on sortByDate(eventDatesInRange, eventSummariesInRange)
	-- A sort-customisation object for sorting the summary list in parallel with the date list.
	script custom
		property summaries : eventSummariesInRange
		
		on swap(i, j)
			tell item i of my summaries
				set item i of my summaries to item j of my summaries
				set item j of my summaries to it
			end tell
		end swap
	end script
	
	CustomBubbleSort(eventDatesInRange, 1, -1, {slave:custom})
end sortByDate

-- CustomBubbleSort from "A Dose of Sorts" by Nigel Garvey.
-- The number of items to be sorted here is likely to be small.
on CustomBubbleSort(theList, l, r, customiser)
	script o
		property comparer : me
		property slave : me
		property lst : theList
		
		on bsrt(l, r)
			set l2 to l + 1
			repeat with j from r to l2 by -1
				set a to item l of o's lst
				repeat with i from l2 to j
					set b to item i of o's lst
					if (comparer's isGreater(a, b)) then
						set item (i - 1) of o's lst to b
						set item i of o's lst to a
						slave's swap(i - 1, i)
					else
						set a to b
					end if
				end repeat
			end repeat
		end bsrt
		
		-- Default comparison and slave handlers for an ordinary sort.
		on isGreater(a, b)
			(a > b)
		end isGreater
		
		on swap(a, b)
		end swap
	end script
	
	-- Process the input parameters.
	set listLen to (count theList)
	if (listLen > 1) then
		-- Negative and/or transposed range indices.
		if (l < 0) then set l to listLen + l + 1
		if (r < 0) then set r to listLen + r + 1
		if (l > r) then set {l, r} to {r, l}
		
		-- Supplied or default customisation scripts.
		if (customiser's class is record) then set {comparer:o's comparer, slave:o's slave} to (customiser & {comparer:o, slave:o})
		
		-- Do the sort.
		o's bsrt(l, r)
	end if
	
	return -- nothing 
end CustomBubbleSort


on composeEvent(eventDatesInRange, eventSummariesInRange)
	set eventJson to ""
	set delimiter to "," & linefeed
	repeat with i from 1 to (count eventDatesInRange)
		set eventJson to eventJson & "{\"date\":\"" & (date string of item i of eventDatesInRange) & "\", \"description\": \"" & (item i of eventSummariesInRange) & "\"}"
		if i < (count eventDatesInRange) then
			set eventJson to eventJson & delimiter
		end if
	end repeat
	return text of eventJson
end composeEvent


on writeToFile(theData, targetFile) -- (string, file path as string)
	try
		set newfile to targetFile as string
		set myFile to open for access newfile with write permission
		write theData to myFile
		close access myFile
	on error error_message number error_number
		set this_error to "Error: " & error_number & ". " & error_message & return
		display dialog this_error
		try
			close access file myFile
		end try
		return false
	end try
end writeToFile

on deleteFile(theFile)
	tell application "System Events"
		if exists file theFile then
			tell application "Finder"
				delete file theFile
			end tell
		else
			log "File " & theFile & " missing, nothing to delete"
		end if
	end tell
end deleteFile



on main()
	tell application "Calendar" to set {theStartDates, theSummaries} to {start date, summary} of events of calendar "Family"
	
	set {dateRangeStart, dateRangeEnd} to getDateRange()
	
	set {eventDatesInRange, eventSummariesInRange} to filterToDateRange(theStartDates, theSummaries, dateRangeStart, dateRangeEnd)
	
	sortByDate(eventDatesInRange, eventSummariesInRange)
	
	set beforeText to "{\"events\":["
	set afterText to "]}"
	
	set eventsJson to composeEvent(eventDatesInRange, eventSummariesInRange)
	
	set json to beforeText & eventsJson & afterText
	
	set posixPath to "/Users/henock/Desktop/delete_me_3"
	set hfsPath to POSIX file posixPath as string # CONVERTS A POSIX PATH TO AN HFS FILE PATH
	
	deleteFile(hfsPath)
	writeToFile(json, posixPath)
	
end main


on replaceNewLines(oldText)
	set AppleScript's text item delimiters to {return & linefeed, return, linefeed, character id 8233, character id 8232}
	set newText to text items of oldText
	set AppleScript's text item delimiters to {" "}
	set newText to newText as text
	return newText
end replaceNewLines

on replaceChars(this_text, search_string, replacement_string)
	set AppleScript's text item delimiters to the search_string
	set the item_list to every text item of this_text
	set AppleScript's text item delimiters to the replacement_string
	set this_text to the item_list as string
	set AppleScript's text item delimiters to ""
	return this_text
end replaceChars

on getEvents()
	set {dateRangeStart, dateRangeEnd} to getDateRange()
	set counter to 0
	set delimiter to "," & linefeed
	set jsonEvents to {}
	tell application "Calendar"
		tell calendar "Family"
			set allEvents to every event where its start date is greater than or equal to dateRangeStart and end date is less than or equal to dateRangeEnd
			set allEventsCount to (count allEvents)
			repeat with anEvent in allEvents
				set counter to counter + 1
				set eventStartDate to anEvent's start date
				set eventsDesc to anEvent's summary
				set eventsLocation to anEvent's location
				
				set eventJson to "{\"date\":\"" & eventStartDate & "\", \"description\": \"" & eventsDesc & "\", \"location\": \"" & eventsLocation & "\"}" as string
				
				if counter < allEventsCount then
					set eventJson to eventJson & delimiter
				end if
				
				set end of jsonEvents to eventJson
			end repeat
		end tell
	end tell
	return jsonEvents
end getEvents

on main2()
	set beforeText to "{\"events\":["
	set afterText to "]}"
	
	set jsonEvents to getEvents()
	
	set json to beforeText & jsonEvents & afterText
	
	set jsonMinus to replaceNewLines(json)
	
	set posixPath to "/Users/henock/Desktop/delete_me_3"
	set hfsPath to POSIX file posixPath as string # CONVERTS A POSIX PATH TO AN HFS FILE PATH
	
	deleteFile(hfsPath)
	writeToFile(jsonMinus, posixPath)
end main2

main2()



-------------------- Old code -------------
-- -- -- -- -- -- -- START EXAMPLE SCRIPT CODE -- -- -- -- -- -- --
set posixPath to "/Users/henock/Desktop/delete_me_3" # EXAMPLE OF A POSIX PATH 
log "Example POSIX path"
log posixPath

set hfsFilePath to POSIX file posixPath # CONVERTS A POSIX PATH TO AN HFS FILE REFERENCE
log "Example HFS file reference"
log hfsFilePath

set hfsPath to POSIX file posixPath as string # CONVERTS A POSIX PATH TO AN HFS FILE PATH
log "Example HFS path"
log hfsPath

--	set aliasExample to hfsPath as alias
--	log "Example Alias"
--	log aliasExample

set backToPosix to POSIX path of hfsPath # THIS WILL CONVERT AN HFS PATH TO A POSIX PATH
log "Example POSIX path 2"
log backToPosix
-- -- -- -- -- -- -- END EXAMPLE SCRIPT CODE -- -- -- -- -- -- --


--	tell application "TextEdit"
--		activate
--		set thisDocument to make new document with properties {text:txt}
--		-- save thisDocument in file "/Users/henock/Desktop/delete_me_2"
--		close document 1 saving in POSIX file ("/Users/henock/Desktop/delete_me_2")
--	end tell
