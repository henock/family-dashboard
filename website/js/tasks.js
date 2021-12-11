


function set_todo_tasks( interval_in_seconds ) {
    if( familyDashboard.config.showTasks ){
        let trelloKeys = familyDashboard.runtimeConfig.apiKeys.trello;
        let taskLists = familyDashboard.runtimeConfig.tasks;
        update_tasks_list(trelloKeys, taskLists.todoListId,'todo');
        set_refresh_values( "#tasks-update", interval_in_seconds );
    }
}

//TODO - USE COMMON GET METHOD
function update_tasks_list( trelloConfig,  listId, statusId ){
    let urlToGet = '';
    if( is_debug_on()){
        urlToGet = 'test-data/trello-list-' + listId + '.json'
    }else{
        urlToGet = "https://api.trello.com/1/lists/"
                    + listId
                    +"/cards?key=" + trelloConfig.key
                    +"&token=" + trelloConfig.token
                    +"&fields=name,dateLastActivity,labels"
    }
    $.ajax({
        url: urlToGet,
        type: "GET",
        success: function( data ) {
            let status_id = '#' + statusId;
            $(status_id).html("");
            $(data).each(function(){
                let now = $.now();
                let dateTime = Date.parse(this.dateLastActivity); //new Date( "2020-04-01");
                let diffDate = new Date(now - dateTime);
                let days = Math.floor( diffDate/1000/60/60/24 );
                if( this.labels.length > 0 ){
                    $(status_id).append('<li><span class="'+this.labels[0].name+'">[' + days + '] '+this.name+' </span></li>');
                }else{
                    $(status_id).append('<li><span class="no-label">[' + days + '] '+this.name+' </span></li>');
                }
            });
        },
        error: function ( xhr ){
            if( xhr ){
                log_error( xhr.status +' Error calling Trello for '+statusId+ ' ('+xhr.responseText +').');
            }else{
                log_error( ' Error calling Trello for '+statusId+ ' ( Unknown error ).');
            }

        }
    });
}