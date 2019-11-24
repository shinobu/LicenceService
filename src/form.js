//placeholder share alike: Derivative works be licensed under the same terms or compatible terms as the original work.
if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function()
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}
var rdf = "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
odrl = "http://www.w3.org/ns/odrl/2/",
dc = "http://purl.org/dc/terms/",
cc = "http://creativecommons.org/ns#",
dalicc = "https://dalicc.poolparty.biz/DALICC/";

function createLicense(licenseForm, publish) {
    var query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \n\
PREFIX odrl: <http://www.w3.org/ns/odrl/2/> \n\
PREFIX dalicc: <https://dalicc.poolparty.biz/DALICC/> \n\
PREFIX cc: <http://creativecommons.org/ns#> \n\
PREFIX dc: <http://purl.org/dc/terms/> \n";

    var i = 1,
        formElements = licenseForm.elements,
        triples = ""
        licenseURI = formElements[0].value.trim(),
        //[0] the prohibition field and [1] is the basic permission field, other fields are used when duties exist
        rules = ["", ""];
    for (i; i < formElements.length; i++) {
        if(formElements[i].type == "text") {
            var objectURI = new URI(formElements[i].value.trim())
            if(formElements[i].value.trim() != "") {
                if((objectURI.is("url") || objectURI.is("urn")) && objectURI.is("absolute")) {
                    triples += "<" + licenseURI + "> " + formElements[i].dataset.predicate + " <" + formElements[i].value.trim() + "> . \n"
                } else {
                    triples += "<" + licenseURI + "> " + formElements[i].dataset.predicate + " '" + formElements[i].value.trim() + "' . \n"
                }
            }
        }
    }
    //rdflib has issues with blanknode serialization on non-unique identifiers
    //a randomly generated string is added to all blank nodes to universally solve this issue
    rndString = new Date().valueOf().toString(36) + Math.random().toString(36).substr(2)
    triples +=  "<" + licenseURI + "> a odrl:Set . \n"
    //reproduce
    var radioButtons = document.getElementsByName("reproduce"),
    buttonValue = getRadioButtonValue(radioButtons);
    if(buttonValue == 1) {
        rules[1] += "_:b1" + rndString + " odrl:action odrl:reproduce . \n"
    } else if(buttonValue == -1) {
        rules[0] += "_:b0" + rndString + " odrl:action odrl:reproduce . \n"
    }
    //distribute
    radioButtons = document.getElementsByName("distribute");
    buttonValue = getRadioButtonValue(radioButtons);
    if(buttonValue == 1) {
        if(hasDutySet("distributeDuties")){
            var number = rules.length
            var rNumber = number + rndString
            rules[number] = "_:b" + rNumber + " a odrl:Permission . \n"
            rules[number] += "_:b" + rNumber + " odrl:action odrl:distribute . \n"
            rules[number] += "_:b" + rNumber + " odrl:duties _:bd" + rNumber + " . \n"
            rules[number] += "_:bd" + rNumber + " a odrl:duty . \n"
            radioButtons = document.getElementsByName("distributeAttribution");
            buttonValue = getRadioButtonValue(radioButtons);
            if (buttonValue == 1) {
                rules[number] += "_:bd" + rNumber + " odrl:action cc:Attribution . \n"
            }
            radioButtons = document.getElementsByName("distributeNotice");
            buttonValue = getRadioButtonValue(radioButtons);
            if (buttonValue == 1) {
                rules[number] += "_:bd" + rNumber + " odrl:action cc:Notice . \n"
            }
        } else {
            rules[1] += "_:b1" + rndString + " odrl:action odrl:distribute . \n"
        }
        radioButtons = document.getElementsByName("display");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            rules[1] += "_:b1" + rndString + " odrl:action odrl:display . \n"
        } else if (buttonValue == -1) {
            rules[0] += "_:b0" + rndString + " odrl:action odrl:display . \n"
        }
        radioButtons = document.getElementsByName("present");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            rules[1] += "_:b1" + rndString + " odrl:action odrl:present . \n"
        } else if (buttonValue == -1) {
            rules[0] += "_:b0" + rndString + " odrl:action odrl:present . \n"
        }
    } else if(buttonValue == -1) {
        rules[0] += "_:b0" + rndString + " odrl:action odrl:distribute . \n"
    }
    //modify
    radioButtons = document.getElementsByName("modify");
    buttonValue = getRadioButtonValue(radioButtons);
    if(buttonValue == 1) {
        if(hasDutySet("modifyDuties")){
            var number = rules.length
            var rNumber = number + rndString
            rules[number] = "_:b" + rNumber + " a odrl:Permission . \n"
            rules[number] += "_:b" + rNumber + " odrl:action odrl:modify . \n"
            rules[number] += "_:b" + rNumber + " odrl:duties _:bd" + rNumber + " . \n"
            rules[number] += "_:bd" + rNumber + " a odrl:duty . \n"
            radioButtons = document.getElementsByName("modifyRename");
            buttonValue = getRadioButtonValue(radioButtons);
            if (buttonValue == 1) {
                rules[number] += "_:bd" + rNumber + " odrl:action dalicc:rename . \n"
            }
            radioButtons = document.getElementsByName("modifyAttribution");
            buttonValue = getRadioButtonValue(radioButtons);
            if (buttonValue == 1) {
                rules[number] += "_:bd" + rNumber + " odrl:action cc:Attribution . \n"
            }
            radioButtons = document.getElementsByName("modifyModificationNotice");
            buttonValue = getRadioButtonValue(radioButtons);
            if (buttonValue == 1) {
                rules[number] += "_:bd" + rNumber + " odrl:action dalicc:modificationNotice . \n"
            }
            radioButtons = document.getElementsByName("modifyNotice");
            buttonValue = getRadioButtonValue(radioButtons);
            if (buttonValue == 1) {
                rules[number] += "_:bd" + rNumber + " odrl:action cc:Notice . \n"
            }
        } else {
            rules[1] += "_:b1" + rndString + " odrl:action odrl:modify . \n"
        }
        radioButtons = document.getElementsByName("modifiedWorks");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            rules[1] += "_:b1" + rndString + " odrl:action dalicc:ModifiedWorks . \n"
        } else if (buttonValue == -1) {
            rules[0] += "_:b0" + rndString + " odrl:action dalicc:ModifiedWorks . \n"
        }
    } else if(buttonValue == -1) {
        rules[0] += "_:b0" + rndString + " odrl:action odrl:modify . \n"
    }
    //derive
    radioButtons = document.getElementsByName("derive");
    buttonValue = getRadioButtonValue(radioButtons);
    if(buttonValue == 1) {
        if(hasDutySet("deriveDuties")){
            var number = rules.length
            var rNumber = number + rndString
            rules[number] = "_:b" + rNumber + " a odrl:Permission . \n"
            rules[number] += "_:b" + rNumber + " odrl:action odrl:derive . \n"
            rules[number] += "_:b" + rNumber + " odrl:duties _:bd" + rNumber + " . \n"
            rules[number] += "_:bd" + rNumber + " a odrl:duty . \n"
            radioButtons = document.getElementsByName("deriveRename");
            buttonValue = getRadioButtonValue(radioButtons);
            if (buttonValue == 1) {
                rules[number] += "_:bd" + rNumber + " odrl:action cc:Rename . \n"
            }
            radioButtons = document.getElementsByName("deriveAttribution");
            buttonValue = getRadioButtonValue(radioButtons);
            if (buttonValue == 1) {
                rules[number] += "_:bd" + rNumber + " odrl:action cc:Attribution . \n"
            }
            radioButtons = document.getElementsByName("deriveModificationNotice");
            buttonValue = getRadioButtonValue(radioButtons);
            if (buttonValue == 1) {
                rules[number] += "_:bd" + rNumber + " odrl:action dalicc:modificationNotice . \n"
            }
            radioButtons = document.getElementsByName("deriveNotice");
            buttonValue = getRadioButtonValue(radioButtons);
            if (buttonValue == 1) {
                rules[number] += "_:bd" + rNumber + " odrl:action cc:Notice . \n"
            }
        } else {
            rules[1] += "_:b1" + rndString + " odrl:action odrl:derive . \n"
        }
        radioButtons = document.getElementsByName("derivativeWorks");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            rules[1] += "_:b1" + rndString + " odrl:action cc:DerivativeWorks . \n"
        } else if (buttonValue == -1) {
            rules[0] += "_:b0" + rndString + " odrl:action cc:DerivativeWorks . \n"
        }
    } else if(buttonValue == -1) {
        rules[0] += "_:b0" + rndString + " odrl:action odrl:derive . \n"
    }
    //commercial use
    radioButtons = document.getElementsByName("commercialUse");
    buttonValue = getRadioButtonValue(radioButtons);
    if(buttonValue == 1) {
        rules[1] += "_:b1" + rndString + " odrl:action cc:CommercialUse . \n"
        radioButtons = document.getElementsByName("promote");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            rules[1] += "_:b1" + rndString + " odrl:action dalicc:promote . \n"
        } else if (buttonValue == -1) {
            rules[0] += "_:b0" + rndString + " odrl:action dalicc:promote . \n"
        }
    } else if(buttonValue == -1) {
        rules[0] += "_:b0" + rndString + " odrl:action cc:CommercialUse . \n"
    }
    //charge distribution fee
    var radioButtons = document.getElementsByName("chargeDistributionFee"),
    buttonValue = getRadioButtonValue(radioButtons);
    if(buttonValue == 1) {
        rules[1] += "_:b1" + rndString + " odrl:action dalicc:chargeDistributionFee . \n"
    } else if(buttonValue == -1) {
        rules[0] += "_:b0" + rndString + " odrl:action dalicc:chargeDistributionFee . \n"
    }
    //change license
    radioButtons = document.getElementsByName("changeLicense");
    buttonValue = getRadioButtonValue(radioButtons);
    if(buttonValue == 1) {
        if(hasDutySet("changeLicenseDuties")){
            var number = rules.length
            var rNumber = number + rndString
            rules[number] = "_:b" + rNumber + " a odrl:Permission . \n"
            rules[number] += "_:b" + rNumber + " odrl:action dalicc:ChangeLicense . \n"
            rules[number] += "_:b" + rNumber + " odrl:duties _:bd" + rNumber + " . \n"
            rules[number] += "_:bd" + rNumber + " a odrl:duty . \n"
            radioButtons = document.getElementsByName("compliantLicense");
            buttonValue = getRadioButtonValue(radioButtons);
            if (buttonValue == 1) {
                rules[number] += "_:bd" + rNumber + " odrl:action dalicc:compliantLicense . \n"
            }
        } else {
            rules[1] += "_:b1" + rndString + " odrl:action dalicc:ChangeLicense . \n"
        }
    } else if(buttonValue == -1) {
        rules[0] += "_:b0" + rndString + "odrl:action dalicc:ChangeLicense. \n"
    }
    if(rules[0] != "") {
        rules[0] += "_:b0" + rndString + " a odrl:Prohibition . \n"
    }
    if(rules[1] != "") {
        rules[1] += "_:b1" + rndString + " a odrl:Permission . \n"
    }
    for (var i = 0; i < rules.length; i++) {
        triples += rules[i]
        if (i == 0 && rules[0] != "") {
            triples += "<" + licenseURI + "> odrl:prohibition _:b0" + rndString + " . \n"
            continue
        }
        if (i == 1 && rules[1] != "") {
            triples += "<" + licenseURI + "> odrl:permission _:b1" + rndString + " . \n"
            continue
        }
        if (i > 1) {
            triples += "<" + licenseURI + "> odrl:permission _:b" + String(i) + rndString + " . \n"
        }
    }
    if (publish) {
        query += "INSERT DATA { GRAPH <" + config.limboGraph + "> \n{" + triples + "}}";
        document.getElementById("editDiv").style = ""
        document.getElementById("editButton").disabled = false
        editField = document.getElementById("edit")
        editField.value = query
        editField.style.width = "600px"
        editField.style.height = (editField.scrollHeight+30)+"px"
    } else {
        triples += " <" + licenseURI + "> a <http://www.purl.org/dc/terms/WIP> ."
        query += "INSERT DATA { GRAPH <" + config.devGraph + "> {" + triples + "}}";
        return query
    }
}
function toggleSubDiv(id, disable) {
    var subDiv = document.getElementById(id);
    if(disable == false) {
        subDiv.style.display = "block"
    }
    if(disable == true) {
        subDiv.style.display = "none"
        var radioButtons = subDiv.getElementsByTagName("input")
        for (var i = radioButtons.length - 1; i >= 0; i--) {
            if (radioButtons[i].value == 0) {
                radioButtons[i].checked = true
            }
            else {
                radioButtons[i].checked = false
            }
         }
    }
}
function addTextfield(id, value) {
    var div = document.getElementById(id),
    element = document.createElement("input");
    element.setAttribute("type", "text")
    element.setAttribute("value", value)
    element.setAttribute("data-predicate", "dc:alternative")
    div.appendChild(element)
    div.appendChild(document.createElement("br"))
}
function delTextfield(id) {
    var textFields = document.getElementById(id)
    if(textFields.children.length > 0) {
        textFields.removeChild(textFields.children[textFields.children.length -1])
        textFields.removeChild(textFields.children[textFields.children.length -1])
    }
}

function getRadioButtonValue(radioButtons) {
    for (var i = radioButtons.length - 1; i >= 0; i--) {
        if(radioButtons[i].checked)
            return radioButtons[i].value
    }
}

function sendForm1() {
    var uri = document.getElementById("uri").value.trim()
    query = "SELECT * WHERE { GRAPH <" + config.limboGraph + "> { <" + uri + "> a ?p . }} "
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            sendForm2(this, uri);
        }
    };
    xhttp.open("POST", config.endpoint, true);
    xhttp.setRequestHeader("Content-Type", "application\/x-www-form-urlencoded");
    xhttp.setRequestHeader("Accept", "application/sparql-results+json")
    xhttp.send("query=" + encodeURIComponent(query));
}

function sendForm2(result, uri) {
    var response = JSON.parse(result.response)
    if(response['results']['bindings'].length == 1) {
        alert("License already exists");
        return
    }
    deleteDraft(uri, undefined)
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            sendSuccessful(this);
        }
    };
    xhttp.open("POST", config.endpoint, true);
    xhttp.setRequestHeader("Content-Type", "application\/x-www-form-urlencoded");
    xhttp.setRequestHeader("Accept", "application/sparql-results+json")
    xhttp.send("update=" + encodeURIComponent(document.getElementById("edit").value));
}
function sendSuccessful(result) {
    alert("License added successfully")
}
function hasDutySet(dutyDivId) {
    var dutyDiv = document.getElementById(dutyDivId)
    for (var i = dutyDiv.children.length - 1; i >= 0; i--) {
        if(dutyDiv.children[i].type == "radio" && dutyDiv.children[i].checked && (dutyDiv.children[i].value == 1)){
            return true
        }
    }
    return false
}
function saveGraph1(form) {
    uri = document.getElementById("uri").value.trim()
    if (uri) {
        isSaved(uri, form)
    }
}
function saveGraph2(result, uri, form) {
    var response = JSON.parse(result.response)
    if(response['results']['bindings'].length == 2) {
        if(confirm("There is already a saved Draft for this License, Overwrite it?")) {
            deleteDraft(uri, form)
            return
        }
        else {
            return
        }
    }
    else if(response['results']['bindings'].length == 1) {
        alert('This license already exists')
        return
    }
    saveGraph3(form)
}
function saveGraph3(form) {
    query = createLicense(form, false)
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            saveSuccessful(this);
        }
    };
    xhttp.open("POST", config.endpoint, true);
    xhttp.setRequestHeader("Content-Type", "application\/x-www-form-urlencoded");
    xhttp.setRequestHeader("Accept", "application/sparql-results+json")
    xhttp.send("update=" + encodeURIComponent(query));
}
function saveSuccessful(result) {
    //TODO better feedback
    alert("saved")
}
function isSaved(uri, form) {
    query = "SELECT * WHERE { GRAPH <" + config.devGraph + "> { <" + uri + "> a ?p . }} "
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            saveGraph2(this, uri, form);
        }
    };
    xhttp.open("POST", config.endpoint, true);
    xhttp.setRequestHeader("Content-Type", "application\/x-www-form-urlencoded");
    xhttp.setRequestHeader("Accept", "application/sparql-results+json")
    xhttp.send("query=" + encodeURIComponent(query));
}
function deleteDraft(uri, form) {
    query = "DELETE {<uri> ?p ?o . ?o ?a ?b . ?b ?c ?d} WHERE { GRAPH <graph> { <uri> ?p ?o . ?o ?a ?b . ?b ?c ?d}}; \
DELETE {<uri> ?p ?o . ?o ?a ?b .} WHERE { GRAPH <$graph> { <uri> ?p ?o . ?o ?a ?b . }}; \
DELETE {<uri> ?p ?o . } WHERE { GRAPH <$graph> { <uri> ?p ?o . }}".replace(/uri/g, uri).replace('graph', config.devGraph)
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //consider numbers for different functions for this
            if (form != undefined) {
                saveGraph3(this, form);
            }
        }
    };
    xhttp.open("POST", config.endpoint, true);
    xhttp.setRequestHeader("Content-Type", "application\/x-www-form-urlencoded");
    xhttp.setRequestHeader("Accept", "application/sparql-results+json")
    xhttp.send("update=" + encodeURIComponent(query));
}
function saveLocal1(form) {
    var formLen = form.elements.length,
    jsonArray = [],
    alternativeNames = document.getElementById("alternativeNames").getElementsByTagName("input"),
    altNameLen = alternativeNames.length,
    altNamesArray = [];
    for (var i = 0; i < formLen; i++) {
        var element = form.elements[i]
        if (element.name && element.type != 'button') {
            if (element.checked || element.type == 'text') {
                jsonArray[jsonArray.length] = { name: element.name, value: element.value}
            }
        }
    }
    for (var i = 0; i < altNameLen; i++) {
        if (alternativeNames[i].value != "") {
            altNamesArray[altNamesArray.length] = alternativeNames[i].value
        }
    }
    if (altNamesArray != []) {
        jsonArray[jsonArray.length] = { name: "alternativeNames", value: altNamesArray}
    }
    var file = new Blob([JSON.stringify(jsonArray)], {type: "plain/text"})
    if (window.navigator.msSaveOrOpenBlob) { // IE10+
        window.navigator.msSaveOrOpenBlob(file, "savedGraph")
    } else { // Others
        var a = document.createElement("a"),
        url = URL.createObjectURL(file);
        a.href = url
        a.download = "savedGraph"
        document.body.appendChild(a)
        a.click()
    }
}
function loadGraph1() {
    document.getElementById("licenseForm").reset();
    query = "SELECT ?s WHERE { GRAPH <" + config.devGraph + "> { ?s a <http://www.purl.org/dc/terms/WIP> . }} "
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            loadGraph2(this);
        }
    };
    xhttp.open("POST", config.endpoint, true);
    xhttp.setRequestHeader("Content-Type", "application\/x-www-form-urlencoded");
    xhttp.setRequestHeader("Accept", "application/sparql-results+json")
    xhttp.send("query=" + encodeURIComponent(query));
}
function loadGraph2(result) {
    var response = JSON.parse(result.response)
    if(response['results']['bindings'].length == 0) {
        alert("No licenses are saved.")
            return
    }
    else {
        div = document.getElementById("savedLicenses")
        div.innerHTML = ""
        for (var i = response['results']['bindings'].length - 1; i >= 0; i--) {
            ressource = document.createElement("span");
            value = String(response['results']['bindings'][i]['s'].value)
            ressource.innerHTML = value
            ressource.onclick = function() {loadGraph3(this.innerHTML); }
            div.appendChild(ressource)
            div.appendChild(document.createElement("br"))
        }
        
    }
}
function loadGraph3(uri) {
    if(confirm("Are you sure you want to load " + uri + " ?")) {
        document.getElementById("savedLicenses").innerHTML = ""
        document.getElementById("uri").innerHTML = uri
        query = "SELECT ?p ?o ?a ?b ?c ?d WHERE { GRAPH <" + config.devGraph + "> { <" + uri + "> ?p ?o . OPTIONAL { ?o ?a ?b OPTIONAL { ?b ?c ?d}} }} ORDER BY ?a"
        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                loadGraph4(this, uri);
            }
        };
        xhttp.open("POST", config.endpoint, true);
        xhttp.setRequestHeader("Content-Type", "application\/x-www-form-urlencoded");
        xhttp.setRequestHeader("Accept", "application/sparql-results+json")
        xhttp.send("query=" + encodeURIComponent(query));

    }
}

function loadGraph4(result, uri) {
    map = new Map()
    var response = JSON.parse(result.response)
    // response['results']['bindings'].sort((a,b) => {return Object.keys(a).length - Object.keys(b).length})
    // the query already orders the results
    length = response['results']['bindings'].length
    for (var i = 0; i < length; i++) {
        if (Object.keys(response['results']['bindings'][i]).length == 2) {
            loadGraphRest(response['results']['bindings'][i])
        } else if (Object.keys(response['results']['bindings'][i]).length == 4) {
            loadGraphPermProh(response['results']['bindings'][i], map)
        } else {
            loadGraphDuties(response['results']['bindings'][i], map)
        }
    }
    document.getElementById("uri").value = uri
}

function loadGraphDuties(values, map) {
    // p is odrl:permission/prohibition
    // o is a bnode
    // a is odrl:duty
    // b is a bnode
    // c is odrl:action/a
    // d is the duty
    // some duties are used more than once > fill a global map to distinguish those
    var o = values["o"].value,
    d = values["d"].value;
    if (d == cc + "Attribution") {
            var radioButtons = document.getElementsByName((map.get(o) + "Attribution"))
            setRadioButtonValue(radioButtons, 1)
    }
    if (d == cc + "Notice") {
            var radioButtons = document.getElementsByName((map.get(o) + "Notice"))
            setRadioButtonValue(radioButtons, 1)
    }
    if (d == dalicc + "Rename") {
            var radioButtons = document.getElementsByName((map.get(o) + "Rename"))
            setRadioButtonValue(radioButtons, 1)
    }
    if (d == dalicc + "ModificationNotice") {
            var radioButtons = document.getElementsByName((map.get(o) + "ModificationNotice"))
            setRadioButtonValue(radioButtons, 1)
    }
    if (d == dalicc + "CompliantLicense") {
            var radioButtons = document.getElementsByName("compliantLicense")
            setRadioButtonValue(radioButtons, 1)
    }
}
function loadGraphPermProh(values, map) {
    // permissions and prohibitions
    // bnode o is used to fill the map for loadGraphDuties
    // the setup only works, because the ordering puts 'a' before 'odrl:action'
    // ordering actually not relevant for this part, switch from map lookup to p value check TODO
    var o = values["o"].value,
    a = values["a"].value,
    b = values["b"].value,
    p = values["p"].value;
    // odrl:action
    if (b == (odrl + "reproduce")) {
        map.set(o, "reproduce")
        var radioButtons = document.getElementsByName("reproduce")
        if (p == (odrl + "prohibition")) {
            setRadioButtonValue(radioButtons, -1)
        }
        else {
            setRadioButtonValue(radioButtons, 1)
        }
    }
    if (b == (odrl + "distribute")) {
        map.set(o, "distribute")
        var radioButtons = document.getElementsByName("distribute")
        if (p == (odrl + "prohibition")) {
            setRadioButtonValue(radioButtons, -1)
        }
        else {
            setRadioButtonValue(radioButtons, 1)
        }
    }
    if (b == (odrl + "display")) {
        var radioButtons = document.getElementsByName("display")
        if (p == (odrl + "prohibition")) {
            setRadioButtonValue(radioButtons, -1)
        }
        else {
            setRadioButtonValue(radioButtons, 1)
        }
    }
    if (b == (odrl + "present")) {
        var radioButtons = document.getElementsByName("present")
        if (p == (odrl + "prohibition")) {
            setRadioButtonValue(radioButtons, -1)
        }
        else {
            setRadioButtonValue(radioButtons, 1)
        }
    }
    if (b == (odrl + "modify")) {
        map.set(o, "modify")
        var radioButtons = document.getElementsByName("modify")
        if (p == (odrl + "prohibition")) {
            setRadioButtonValue(radioButtons, -1)
        }
        else {
            setRadioButtonValue(radioButtons, 1)
        }
    }
    if (b == (dalicc + "ModifiedWorks")) {
        var radioButtons = document.getElementsByName("modifiedWorks")
        if (p == (odrl + "prohibition")) {
            setRadioButtonValue(radioButtons, -1)
        }
        else {
            setRadioButtonValue(radioButtons, 1)
        }
    }
    if (b == (odrl + "derive")) {
        map.set(o, "derive")
        var radioButtons = document.getElementsByName("derive")
        if (p == (odrl + "prohibition")) {
            setRadioButtonValue(radioButtons, -1)
        }
        else {
            setRadioButtonValue(radioButtons, 1)
        }
    }
    if (b == (cc + "DerivativeWorks")) {
        var radioButtons = document.getElementsByName("derivativeWorks")
        if (p == (odrl + "prohibition")) {
            setRadioButtonValue(radioButtons, -1)
        }
        else {
            setRadioButtonValue(radioButtons, 1)
        }
    }
    if (b == (cc + "CommercialUse")) {
        map.set(o, "commercialUse")
        var radioButtons = document.getElementsByName("commercialUse")
        if (p == (odrl + "prohibition")) {
            setRadioButtonValue(radioButtons, -1)
        }
        else {
            setRadioButtonValue(radioButtons, 1)
        }
    }
    if (b == (dalicc + "promote")) {
        var radioButtons = document.getElementsByName("promote")
        if (p == (odrl + "prohibition")) {
            setRadioButtonValue(radioButtons, -1)
        }
        else {
            setRadioButtonValue(radioButtons, 1)
        }
    }
    if (b == (dalicc + "chargeDistributionFee")) {
        map.set(o, "chargeDistributionFee")
        var radioButtons = document.getElementsByName("chargeDistributionFee")
        if (p == (odrl + "prohibition")) {
            setRadioButtonValue(radioButtons, -1)
        }
        else {
            setRadioButtonValue(radioButtons, 1)
        }
    }
    if (b == (dalicc + "changeLicense")) {
        map.set(o, "changeLicense")
        var radioButtons = document.getElementsByName("changeLicense")
        if (p == (odrl + "prohibition")) {
            setRadioButtonValue(radioButtons, -1)
        }
        else {
            setRadioButtonValue(radioButtons, 1)
        }
    }
}
function loadGraphRest(values) {
    // all text values
    var p = values["p"].value,
    o = values["o"].value;
    if(p == (dc + "title")) {
        document.getElementById("licenseName").value = o
    }
    if(p == (dc + "publisher")) {
        document.getElementById("licensor").value = o
    }
    if(p == (odrl + "assignee")) {
        document.getElementById("licensee").value = o
    }
    if(p == (cc + "attributionName")) {
        document.getElementById("creator").value = o
    }
    if(p == (dc + "source")) {
        document.getElementById("source").value = o
    }
    if(p == (dc + "created")) {
        document.getElementById("created").value = o
    }
    if(p == (dc + "creator")) {
        document.getElementById("licenseValidator").value = o
    }
    if(p == (dc + "alternative")) {
        loadAlternativeName(o)
        document.getElementById("alternativeNames").value = o
    }
}
function loadAlternativeName(name) {
    if(document.getElementById("alternativeNames").children[0].value == "") {
        document.getElementById("alternativeNames").children[0].value = name
    }
    else {
        addTextfield("alternativeNames", name)
    }
}
function setRadioButtonValue(buttons, value) {
    for (var i = buttons.length - 1; i >= 0; i--) {
        if(Number(buttons[i].value) == Number(value)) {
            buttons[i].click()
        }
    }

}
function loadLocal1() {
    var input = document.createElement("input")
    input.type = "file"
    input.onchange = event => {
        document.getElementById("licenseForm").reset();
        var licenseDraft = event.target.files[0],
        fileReader = new FileReader();
        fileReader.onload = event => {
            loadLocal2(event.target.result)
        }
        fileReader.readAsText(licenseDraft)
    }
    input.click()
}
function loadLocal2(licenseJSON) {
    var licenseArray = JSON.parse(licenseJSON),
    textFieldNames = ["uri", "licenseName", "licensor", "licensee", "creator", "source", "created", "licenseValidator"];
    for (var i = licenseArray.length - 1; i >= 0; i--) {
        if (licenseArray[i].name == "alternativeNames") {
            var altNamesArray = licenseArray[i].value,
            altNameLen = altNamesArray.length;
            for (var j = 0; j < altNameLen; j++) {
                loadAlternativeName(altNamesArray[j])
            }
        } else if (textFieldNames.indexOf(licenseArray[i].name) >= 0) {
            // index is the same as the name
            document.getElementById(licenseArray[i].name).value = licenseArray[i].value
        } else {
            var buttons = document.getElementsByName(licenseArray[i].name)
            setRadioButtonValue(buttons, licenseArray[i].value)
        }
    }
}