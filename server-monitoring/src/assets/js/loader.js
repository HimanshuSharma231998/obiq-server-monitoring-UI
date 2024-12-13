
 function loadingStart(el, msg) {
    //   debugger;

    var element;

    var element_selector = el.substr(0, 1);

    if (element_selector == "#") {
        var selected_element_byId = el.substr(1);
        element = document.getElementById(selected_element_byId);
    } else if (element_selector == ".") {
        var selected_element_byClass = el.substr(1);
        element = document.getElementsByClassName(selected_element_byClass);
    } else {
        return;
    }

    if (element !== null) {

        // element.classList.add("loader-relative");

        // var div_node = document.createElement("div");
        // var div_node_child = document.createElement("div");
        // var spinner_node = document.createElement("div");
        // var span_node = document.createElement("span");
        // var text_node = document.createTextNode(msg);
        // div_node.appendChild(div_node_child);
        // div_node_child.appendChild(spinner_node);
        // span_node.appendChild(text_node);

        // div_node.classList.add("loader-overlay");
        // div_node_child.classList.add("loader-panel");
        // span_node.classList.add("Loader-msg");
        // spinner_node.classList.add('spinner-border', 'spinner-theme');
        // element.appendChild(div_node);

        var div_noed = document.createElement("div");
        var div_node_child = document.createElement("div");
        var spinner_node = document.createElement("div");
        var span_node = document.createElement("span");
        var text_node = document.createTextNode(msg);

        div_noed.appendChild(div_node_child);
        div_node_child.appendChild(spinner_node);
        div_node_child.appendChild(span_node);
        span_node.appendChild(text_node);

        div_noed.classList.add("loader-overlay");
        div_node_child.classList.add("loader-panel");
        span_node.classList.add("loader-msg");
        spinner_node.classList.add('spinner-border', 'spinner-theme-green');

        element.appendChild(div_noed);
    }
}

 function loadingStop(el) {
    var element;

    var element_selector = el.substr(0, 1);

    if (element_selector == "#") {
        var selected_element_byId = el.substr(1);
        element = document.getElementById(selected_element_byId);
    } else if (element_selector == ".") {
        var selected_element_byClass = el.substr(1);
        element = document.getElementsByClassName(selected_element_byClass);
    } else {
        return;
    }

    if (element !== null) {
        element.classList.remove("loader-relative");
        var loader_element = element.lastElementChild;
        var loader_element_class = element.lastElementChild.className;

        if (loader_element_class == "loader-overlay") {
            element.removeChild(loader_element);
        } else {
            return;
        }
    }
}

