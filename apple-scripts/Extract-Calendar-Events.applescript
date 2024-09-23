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

on writeToFile(theData, targetFile)
	try
		set newfile to targetFile as string
		set myFile to open for access newfile with write permission
		write theData to myFile
		close access myFile
	on error error_message number error_number
		set this_error to "Error: " & error_number & ". " & error_message & return
		log this_error
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

on replaceNewLines(oldText)
	set AppleScript's text item delimiters to {return & linefeed, return, linefeed, character id 8233, character id 8232}
	set newText to text items of oldText
	set AppleScript's text item delimiters to {" "}
	set newText to newText as text
	return newText
end replaceNewLines

on getEvents(dateRangeStart, dateRangeEnd)
	--set {dateRangeStart, dateRangeEnd} to getDateRange()
	set counter to 0
	set jsonEvents to {}
	tell application "Calendar"
		tell calendar "Family"
			set allEvents to every event where its start date is greater than or equal to dateRangeStart and end date is less than or equal to dateRangeEnd
			set allEventsCount to (count allEvents)
			repeat with anEvent in allEvents
				set counter to counter + 1
				set eventStartDate to anEvent's start date
				set eventEndDate to anEvent's end date
				set eventsDesc to anEvent's summary
				set eventsLocation to anEvent's location
				
				set dateStamp to short date string of eventStartDate
				set theDay to weekday of eventStartDate
				set startTime to time string of eventStartDate
				set endTime to time string of eventEndDate
				
				set dayOfEvent to day of eventStartDate as number
				
				if dayOfEvent < 10 then
					set dayOfEvent to "0" & dayOfEvent as string
				end if
				
				set monthOfEvent to month of eventStartDate as number
				if monthOfEvent < 10 then
					set monthOfEvent to "0" & monthOfEvent as string
				end if
				
				set eventStartDateTime to (year of eventStartDate) & "-" & monthOfEvent & "-" & dayOfEvent & "T" & startTime & "+00:00"
				
				set eventJson to "{\"startDate\":\"" & eventStartDateTime & "\", \"displayDate\":\"" & theDay & " " & dateStamp & "\", \"startTime\":\"" & startTime & "\", \"endTime\": \"" & endTime & "\", \"description\": \"" & eventsDesc & "\", \"location\": \"" & eventsLocation & "\"}" as string
				
				if counter < allEventsCount then
					set eventJson to eventJson & ","
				end if
				
				set end of jsonEvents to eventJson
			end repeat
		end tell
	end tell
	return jsonEvents
end getEvents

on main()
	set today to (current date)
	set endDate to (today + 27 * days)
	
	set jsonEvents to getEvents(today, endDate)
	
	set json to "{\"events\":[" & jsonEvents & "]}"
	
	set jsonMinusNewLines to replaceNewLines(json)
	
	set outputFilePath to "/Users/henock/projects/family-dashboard/website/data/family-calendar.json"
	set hfsFilePath to POSIX file outputFilePath as string # CONVERTS A POSIX PATH TO AN HFS FILE PATH
	
	deleteFile(hfsFilePath)
	writeToFile(jsonMinusNewLines, outputFilePath)
end main

main()




