function load_home_page(){
    $(".tab-bar").css("display", "none")
    $(".editor").css("display", "none")
    $(".home-page").css("display", "flex")
}

function load_editor_page(){
    $(".tab-bar").css("display", "flex")
    $(".editor").css("display", "flex")
    $(".home-page").css("display", "none")
}

function create_tab(title, logo="/static/img/bf-logo.png"){
    let tab_element = $('\
    <div class="tab">\
                <img src="'+logo+'" class="img">\
                <div class="title">'+title+'</div>\
                <div class="close-win-btn btn" id="close_btn">\
                    <img src="/static/img/close.svg">\
                </div>\
    </div>\
    ')
    $(".tab-bar").append(tab_element)
}

var _lines = ()=>{
    return $(".editor .window .code .line")
}

var _nums = ()=>{
    return $(".editor .window .numbers .line")
}

function select_line(line_index){
    let lines = _lines()
    let nums = _nums()
    let line = $(lines.get(line_index))
    let num = $(nums.get(line_index))
    line.addClass("selected")
    num.addClass("selected")
}

function deselect_line(line_index){
    let lines = _lines()
    let nums = _nums()
    let line = $(lines.get(line_index))
    let num = $(nums.get(line_index))
    line.removeClass("selected")
    num.removeClass("selected")
}

function deselect_all_lines(){
    let lines = _lines()
    let nums = _nums()
    lines.removeClass("selected")
    nums.removeClass("selected")
}

function remove_line(line_index){
    let lines = _lines()
    let nums = _nums()
    $(lines.get(line_index)).remove()
    $(nums.get(line_index)).remove()
}

var _cursor_status = 0

setInterval(()=>{
    if (_cursor_status){
        $(".cursor").css("background-color", "var(--t3)")
        _cursor_status = 0
    }else{
        $(".cursor").css("background-color", "#fff0")
        _cursor_status = 1
    }
}, 500)