
function update_tasks_ui( model, now ){
    if( model.config.showTasks && model.data.tasks.dataDownloaded ){
        $("#date-travel-weather").removeClass( "col").addClass("col-8");
        if( model.data.tasks.nextRebuildUiTime < now ){
            set_tasks_into_ui( model );
            model.data.tasks.nextRebuildUiTime = now_plus_seconds( model.runtimeConfig.tasks.updateEvery );
        }
        let countDown = generate_next_download_count_down_values( model.data.tasks.nextDownloadDataTime, model.runtimeConfig.tasks.updateEvery );
        set_next_download_count_down_elements( "tasks-update", countDown );
        $(".task-element").removeClass( "d-none");
    }else{
        $(".task-element").addClass( "d-none");
        $("#date-travel-weather").removeClass( "col-8").addClass("col");
    }
}

function set_tasks_into_ui( model ){
    let groupLists =  '';
    let now = clock.get_Date();
    let groupCounter = 0;
    let sortedTasks = new Map([...model.data.tasks.todo.entries()].sort());
    for (const [groupName, groupsTasks] of sortedTasks ){
        let taskHtml = '';
        groupsTasks.forEach( function( task ){
            taskHtml += '<tr class="task-group-'+ groupCounter + ' h3"><td>' + task.daysSinceAssigned + '</td><td> ' +task.name+'</td></tr>';
        });
        groupLists +=  '<div class="row border-top pb-2">' +
                        '<div class="col">' +
                            '<span class="display-4">'+ groupName +'</span>' +
                            '<table>' +
                                taskHtml +
                            '</table>' +
                        '</div>' +
                    '</div>';
        groupCounter++;
    }
    $('#tasks').html( groupLists );
}

function update_model_with_tasks( model, date ){
    if( model.config.showTasks && model.data.tasks.nextDownloadDataTime < date ){
         download_tasks( model );
         model.data.tasks.nextDownloadDataTime = now_plus_seconds( date, model.runtimeConfig.tasks.updateEvery );
         model.data.tasks.lastUpdatedTime = clock.get_Date();
    }
}

function download_tasks( model ){
    let urlToGet = '';
    let todoListId = model.runtimeConfig.tasks.todoListId;

    if(model.config.debugging){
        urlToGet = 'data-for-running-locally/trello-list-' + todoListId + '.json'
    }else{
        urlToGet = "https://api.trello.com/1/lists/"
                    + todoListId
                    +"/cards?key=" + model.secrets.trello.key
                    +"&token=" + model.secrets.trello.token
                    +"&fields=name,dateLastActivity,labels"
    }

    try {
        let data =  get_remote_data( urlToGet );
        model.data.tasks.todo = set_tasks_on_model_from_remote_data( data );
        model.data.tasks.dataDownloaded = true;
    } catch (e) {
        log_error( "Unable to retrieve tasks from: '" + urlToGet +
                    "' I got back: '" + e.statusText +"'");
    }
}

function set_tasks_on_model_from_remote_data( data ){
    let tasks = new Map();
    let now = clock.get_Date();

    function compute_group_if_absent( groupName, tasks ){
        let group = tasks.get(groupName)
        if( !group ){
            group = [];
            tasks.set(groupName, group);
        }
        return group;
    }

    $(data).each(function( index, it ){
        let task = {}
        task.name = it.name;

        let dateTime = (date_from_string(it.dateLastActivity)).getTime();
        let diffInMillis = new Date(now.getTime() - dateTime);
        task.daysSinceAssigned = Math.floor( diffInMillis/1000/60/60/24 );

        let group;
        if( it.labels.length > 0 ){
            let label = it.labels[0].name;
            group = compute_group_if_absent( label, tasks )
        }else{
            group = compute_group_if_absent( 'Unassigned', tasks )
        }
        group.push( task );
    });
    return tasks;
}
