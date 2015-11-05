(function() {
    var WA_API = "9J3V84-P2XEERRHY7";
    var plusBtn = document.getElementById('dsm-btn');
    var input = document.getElementById('dsm-input');
    var invalid = document.getElementById('dsm-invalid');
    var infoT = document.getElementById('dsm-infot');
    var infoP = document.getElementById('dsm-infop');
    var loader = document.getElementById('dsm-loading-fill');
    var inputValue = "";

    function getSelectionText() {
        chrome.tabs.query({
                active: true,
                windowId: chrome.windows.WINDOW_ID_CURRENT
            },
            function(tab) {
                chrome.tabs.sendMessage(tab[0].id, {
                        method: "getSelection"
                    },
                    function(response) {
                        input.setAttribute("value", response.data);
                    });
            });
    };

    function invalidInput() {
        invalid.style.display = 'block';

        setTimeout(function() {
            invalid.style.display = 'none';
        }, 300);
    };

    function activateLoading() {
        loader.className += " dsm-glow";
    };

    function deactivateLoading() {
        infoStatus = false;
        loader.className = "dsm-loading-fill";
        loader.style.width = "36%";
    };


    function xmlRequest(filter) {
        var xmlhttp = new XMLHttpRequest();
        var assumption = "";
        var xmlData = "";
        var idSearch = "";

        if (filter === "word") {
            assumption = "define+";
            idSearch = "Definition:WordData";
        } else if (filter === "person") {
            idSearch = "NotableFacts:PeopleData";
        } else if (filter === "acronym") {
            assumption = "acronym+";
            idSearch = "Result";
        } else if (filter === "zip") {
            assumption = "ZIP+";
            idSearch = "Location:ZIPCodeData";
        } else if (filter === "unit") {
            idSearch = "UnitConversion";
        };;

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                if (xmlhttp.status == 200) {
                    if (xmlhttp.responseXML.getElementById(idSearch)) {
                        loader.style.width = "100%";
                        xmlData = xmlhttp.responseXML.getElementById(idSearch).childNodes;
                        infoP.innerHTML = "";

                        for (var i = 0; i < xmlData.length; i ++) {
                            if (i % 2) {
                                infoP.innerHTML += xmlData[i].textContent + "<br>";
                            };
                        };

                        infoT.innerHTML = input.value.toUpperCase();
                        input.value = "";
                    } else {
                        infoT.innerHTML = "Error";
                        infoP.innerHTML = "There was a problem grabbing the information -- please try again later";
                    };
                    deactivateLoading();
                } else {
                    invalidInput();
                    infoT.innerHTML = "Error: " + xmlhttp.status;
                    infoP.innerHTML = xmlhttp.statusText;
                    deactivateLoading();
                };
            };
        };

        xmlhttp.open("GET", "http://api.wolframalpha.com/v2/query?input=" + assumption + inputValue + "&appid=" + WA_API, true);
        xmlhttp.send();
    };

    function actionTrigger() {
        inputValue = input.value.trim();

        if (inputValue === "") {
            invalidInput();
        } else if (inputValue.length === 5 && inputValue.match(/\d+/g)) {
            activateLoading();
            xmlRequest("zip");
        } else if ((inputValue.length > 0) && (inputValue.split(" ").length === 1) && (inputValue === inputValue.toUpperCase())) {
            activateLoading();
            xmlRequest("acronym");
        } else if (inputValue.match(/\d+/g)) {
            activateLoading();
            xmlRequest("unit");
        } else if (inputValue.split(" ")[0][0] === inputValue.split(" ")[0][0].toUpperCase()) {
            activateLoading();
            xmlRequest("person");
        } else if ((inputValue.length > 0) && (inputValue.split(" ").length === 1) && (inputValue === inputValue.toLowerCase())) {
            activateLoading();
            xmlRequest("word");
        } else {
            invalidInput();
        };;
    };
    
    window.addEventListener("keypress", function(e) {
        if (e.keyCode == "13") {
            actionTrigger();
        };
    }, false);

    plusBtn.addEventListener("click", function(e) {
        actionTrigger();
    }, false);
    
    getSelectionText();

})();
