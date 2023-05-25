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

function remove_all_cursors(){
    $(".cursor").remove()
}

function remove_line(line_index){
    let lines = _lines()
    let nums = _nums()
    $(lines.get(line_index)).remove()
    $(nums.get(line_index)).remove()
}

var _visiblity_h_scrollbar = 1
var _visiblity_v_scrollbar = 1

var _y_ratio = 0
var _x_ratio = 0

var update_scrollbars = ()=>{
    let editor_panel = $(".editor")
    let window_panel = $(".editor .window")
    let code_panel = $(".editor .window .code")
    let numbers_panel = $(".editor .window .numbers")
    let horizontal_scrollbar = $(".editor .scrollbar.horizontal")
    let vertical_thumb = $(".editor .scrollbar.vertical .thumb")
    let horizontal_thumb = $(".editor .scrollbar.horizontal .thumb")
    let code_line = $(".editor .window .code .line")

    let code_size = code_line.width()
    let window_size = window_panel.height() + editor_panel.height() - 30

    _y_ratio = window_size / editor_panel.height()
    _x_ratio = code_size / code_panel.width()

    horizontal_scrollbar.css("left", numbers_panel.width() + 26)
    horizontal_scrollbar.width(editor_panel.width() - (numbers_panel.width() + 36))
    horizontal_thumb.width((code_panel.width() / _x_ratio) - 10)
    vertical_thumb.height(editor_panel.height() / _y_ratio)
    horizontal_thumb.css("left", (parseInt($(".editor .window .code .line").css("margin-left")) * -1 / _x_ratio))
    vertical_thumb.css("top", parseInt($(".editor .window").css("margin-top")) * -1 / _y_ratio)

    if (_x_ratio <= 1){
        horizontal_scrollbar.css("display", "none")
    } else {
        horizontal_scrollbar.css("display", "block")
    }

    if (_y_ratio <= 1){
        vertical_thumb.css("display", "none")
    } else {
        vertical_thumb.css("display", "block")
    }
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

setInterval(update_scrollbars, 1)

let _ignore_click = false
let _menu_clicked = false
let _move_window = false

let close_program = ()=>{
    $.get("/close")
}

let _maximize_window = ()=>{
    $("#maximize_btn").css("display", "none")
    $("#restore-down_btn").css("display", "flex")
}

let _minimize_window = ()=>{
    $("#maximize_btn").css("display", "flex")
    $("#restore-down_btn").css("display", "none")
}

let maximize_program = ()=>{
    $.get("/maximize")
    _maximize_window()
}

let restore_down_program = ()=>{
    $.get("/restore-down")
    _minimize_window()
}

let move_program = ()=>{
    _move_window = true
    $.get("/move")
}

let unmove_program = ()=>{
    _move_window = false
    $.get("/unmove")
}

let show_program = ()=>{
    $.get("/show")
}

let minimize_program = ()=>{
    $.get("/minimize")
}

$("#close_btn").click(()=>{
    close_program()
})

$("#maximize_btn").click(()=>{
    maximize_program()
})

$("#restore-down_btn").click(()=>{
    restore_down_program()
})

$("#minimize_btn").click(()=>{
    minimize_program()
})

$("body").ready(()=>{
    // load_home_page()
    load_editor_page()
    show_program()
    update_scrollbars()

    $(function() {
        $(".editor .scrollbar.horizontal .thumb").draggable({
            axis: "x",
            containment: ".editor .scrollbar.horizontal",
            drag: function(event, ui) {
                var scrollLeft = ui.position.left;
                $(".editor .window .code .line").css("margin-left", (scrollLeft * -1 * _x_ratio) + "px");
            },
            start: function(event, ui) {
                $(ui).addClass("selected")
            },
            stop: function(event, ui) {
                $(ui).removeClass("selected")
            }
        });
        $(".editor .scrollbar.vertical .thumb").draggable({
            axis: "y",
            containment: ".editor .scrollbar.vertical",
            drag: function(event, ui) {
                var scrollTop = ui.position.top;
                $(".editor .window").css("margin-top", (scrollTop * -1 * _y_ratio) + "px");
            },
            start: function(event, ui) {
                $(ui).addClass("selected")
            },
            stop: function(event, ui) {
                $(ui).removeClass("selected")
            }
        });
    });
})

let close_topbar_menu = ()=>{
    $(".menu .item")
        .removeClass("clicked")
        .children(".menu-item").css("display", "none");
    _menu_clicked = false;
}

$(".menu .item").click((event)=>{
    close_topbar_menu()
    _ignore_click = true
    _menu_clicked = true
    $(event.currentTarget)
        .addClass("clicked")
        .children(".menu-item").css("display", "flex")
}).hover((event)=>{
    if(!$(event.currentTarget).hasClass("clicked") && _menu_clicked){
        close_topbar_menu()
        $(event.currentTarget).click()
    }
})

$(document).click(()=>{
    if(!_ignore_click){
        close_topbar_menu()
    }
    _ignore_click = false
}).mouseup((event)=>{
    if(event.which === 1 && _move_window){
        unmove_program()
    }
}).mousedown((event)=>{
    if(event.which === 1 && $(event.target).hasClass("dragable")){
        move_program()
    }
})

$("#create_tab").click(()=>{
    create_tab("untitled.bf")
    load_editor_page()
})

$(".tab").click((event)=>{
})

$(".editor .window .code .line").mousedown((event)=>{
    if (event.button === 0){
        if (!event.altKey){
            deselect_all_lines()
            remove_all_cursors()
        }
        let currentTarget = $(event.currentTarget)
        let target = $(event.target)
        let cursor = $('<div class="cursor"></div>')
        select_line(_lines().index(currentTarget))
        if (event.currentTarget === event.target){
            currentTarget.append(cursor)
        }else{
            cursor.insertBefore(target)
        }
    }
})