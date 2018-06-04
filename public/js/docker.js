function includeJs(jsFilePath) {
    let js = document.createElement("script");

    js.type = "text/javascript";
    js.src = jsFilePath;

    document.body.appendChild(js);
}

includeJs("js/textures.js");
includeJs("js/blockProperties.js");

includeJs("js/main.js");