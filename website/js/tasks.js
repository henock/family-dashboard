


function set_todo_tasks( interval_in_seconds ) {
    if( familyDashboard.config.tasks ){
        let trelloConfig = familyDashboard.runtimeConfig.trello;
        update_tasks_list(trelloConfig, trelloConfig.todoListId,'todo');
        update_tasks_list(trelloConfig, trelloConfig.inProgressListId,'in-progress' );
        update_tasks_list(trelloConfig, trelloConfig.doneListId,'done' );
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
            var status_id = '#' + statusId;
            $(status_id).html("");
            $(data).each(function(){
                var now = $.now();
                var dateTime = Date.parse(this.dateLastActivity); //new Date( "2020-04-01");
                var diffDate = new Date(now - dateTime);
                var days = Math.floor( diffDate/1000/60/60/24 );
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