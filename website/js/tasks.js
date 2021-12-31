
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
        write_to_console( 'tasks.dataDownloaded=' + model.data.tasks.dataDownloaded );
    }
}

function set_tasks_into_ui( model ){
    let todoElementId = '#todo';
    $(todoElementId).html("");
    model.data.tasks.todo.forEach(function( todo ){
        let now = new Date();
        let dateTime = Date.parse(todo.dateLastActivity); //new Date( "2020-04-01");
        let diffInMillis = new Date(now - dateTime);
        let days = Math.floor( diffInMillis/1000/60/60/24 );
        if( todo.label ){
            $(todoElementId).append('<li><span class="'+todo.label+'">[' + days + '] '+todo.name+' </span></li>');
        }else{
            $(todoElementId).append('<li><span class="no-label">[' + days + '] '+todo.name+' </span></li>');
        }
    });
}

function update_model_with_tasks( model, date ){
    if( model.config.showTasks && model.data.tasks.nextDownloadDataTime < date ){
         download_tasks( model );
         model.data.tasks.nextDownloadDataTime = now_plus_seconds( model.runtimeConfig.tasks.updateEvery );
         model.data.tasks.lastUpdatedTime = new Date();
    }
}

function download_tasks( model ){
    let urlToGet = '';
    let callAsync = model.config.callAsync;
    let todoListId = model.runtimeConfig.tasks.todoListId;
    if(model.config.debugging){
        urlToGet = 'test-data/trello-list-' + todoListId + '.json'
    }else{
        urlToGet = "https://api.trello.com/1/lists/"
                    + todoListId
                    +"/cards?key=" + model.apiKeys.trello.key
                    +"&token=" + model.apiKeys.trello.token
                    +"&fields=name,dateLastActivity,labels"
    }

    get_remote_data( urlToGet, callAsync, model, function( model2, data ){
        model2.data.tasks.todo = [];
        let now = new Date();
        $(data).each(function( index, it ){
            let dateTime = (new Date(it.dateLastActivity)).getTime();
            let diffInMillis = new Date(now.getTime() - dateTime);

            let task = {}
            task.dateLastActivity = it.dateLastActivity;
            task.name = it.name;
            if( it.labels.length > 0 ){
                task.label = it.labels[0].name;
            }
            model2.data.tasks.todo.push( task );
        });
        model2.data.tasks.dataDownloaded = true;
        write_to_console( 'model2.data.tasks.dataDownloaded=true' );
    }, function( model2, xhr, default_process_error){
        default_process_error( xhr );
    });
}
