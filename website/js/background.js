


var update_background_count = 0
var update_background_every_seconds = 60;
var change = document.getElementById("main-container");
//var colors = ["#374E46", "#27320D", "#6250C1", "#9594B8", "#3D3D80", "#851F7D", "#042952", "#15242C", "#8A4A5A", "#3E4A41", "#3F561F", "#4C7E1F"];
//var degrees = [94.51554152506534, 287.1388483576243, 177.26260834890698, 194.42521066503983, 177.26260834890698, 149.9062612695598, 350.0594061819226, 7.480021307372748, 39.388682041211034, 29.890333630677617, 159.48928481407586, 239.96065372940942, 342.6281266860184, 342.6281266860184];

function getRandomValueFromArray( array ){
    pos = Math.floor( Math.random() * array.length);
    return array[pos]
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomGradient( backgroundColor ) {
    let randomDegrees = getRandomValueFromArray(backgroundColor.degrees);
    let color1 = getRandomValueFromArray(backgroundColor.colors);
    let color2 = getRandomValueFromArray(backgroundColor.colors);

//    log_warn( 'randomDegrees:' + randomDegrees + ' color1:' + color1  + ' color2:' + color2 );
    return 'linear-gradient('+(randomDegrees)+'deg, '+color1+' 0%, '+color2+' 100%)';
}

function changeBackgroundColors( backgroundColor ) {
    if( update_background_count++ % update_background_every_seconds == 0 ){
        change.style.background = getRandomGradient( backgroundColor );
        update_background_count = 1;
    }
}


