
function update_model_with_tasks( model ){
    if( model.data.tasks.nextUpdateTime < new Date() ){
         set_tasks( model );
         model.data.tasks.nextUpdateTime = now_plus_seconds( model.runtimeConfig.tasks.updateEvery );
    }
    return model;
}

function set_tasks( model ){
    let urlToGet = '';
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
    get_remote_data( urlToGet, false, model, function( model2, data ){
        model2.data.tasks.todo = [];
        let now = new Date();
        $(data).each(function( index, it ){
            let dateTime = (new Date(it.dateLastActivity)).getTime();
            let diffInMillis = new Date(now.getTime() - dateTime);

            let task = {}
            task.days = Math.floor( diffInMillis/TWENTY_FOUR_HOURS );
            task.name = it.name;
            if( it.labels.length > 0 ){
                task.label = it.labels[0].name
            }
            model2.data.tasks.todo.push( task );
        });
    }, function( model2, xhr, default_process_error){
        model2.config.showTasks = false;
        default_process_error( xhr );
    });
    return model;
}
