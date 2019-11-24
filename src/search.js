function resetOnReload() {
    var inputFields = document.getElementsByTagName("input")
    for (var i = inputFields.length - 1; i >= 0; i--) {
        if (inputFields[i].type == "radio") {
            if (inputFields[i].value == 0) {
                inputFields[i].checked = true
            }
            else {
                inputFields[i].checked = false
            }
        }
        else if (inputFields[i].type == "text") {
            inputFields[i].value = ""
        }
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
function searchLicenses() {
    var triples = getLicenseTerms(),
    searchValue = document.getElementById("searchString").value,
    query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \n\
PREFIX odrl: <http://www.w3.org/ns/odrl/2/> \n\
PREFIX dalicc: <https://dalicc.poolparty.biz/DALICC/> \n\
PREFIX cc: <http://creativecommons.org/ns#> \n\
PREFIX dc: <http://purl.org/dc/terms/> \n";
    if (searchValue != "") {
        triples += " FILTER CONTAINS(lcase(str(?name)), \"" + searchValue.toLowerCase() + "\") \n"
    }

    query += "SELECT ?license WHERE { GRAPH <" + config.limboGraph + "> { ?license dc:title ?name . " + triples + "} }"
    var xhttp1;
    xhttp1 = new XMLHttpRequest();
    xhttp1.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            fillResults(this, "licenseListLimbo");
        }
    };
    xhttp1.open("POST", config.endpoint, true);
    xhttp1.setRequestHeader("Content-Type", "application\/x-www-form-urlencoded");
    xhttp1.setRequestHeader("Accept", "application/sparql-results+json")
    xhttp1.send("query=" + encodeURIComponent(query));

    query = query.replace(config.limboGraph, config.daliccGraph)
    var xhttp2;
    xhttp2 = new XMLHttpRequest();
    xhttp2.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            fillResults(this, "licenseListDALICC");
        }
    };
    xhttp2.open("POST", config.endpoint, true);
    xhttp2.setRequestHeader("Content-Type", "application\/x-www-form-urlencoded");
    xhttp2.setRequestHeader("Accept", "application/sparql-results+json")
    xhttp2.send("query=" + encodeURIComponent(query));
}
function getLicenseTerms() {
    var triples = ""
    //reproduce
    var radioButtons = document.getElementsByName("reproduce"),
    buttonValue = getRadioButtonValue(radioButtons);
    if(buttonValue == 1) {
        triples += "?license odrl:permission/odrl:action odrl:reproduce . \n"
    } else if(buttonValue == -1) {
        triples += "?license odrl:prohibition/odrl:action odrl:reproduce . \n"
    }
    //distribute
    radioButtons = document.getElementsByName("distribute");
    buttonValue = getRadioButtonValue(radioButtons);
    if(buttonValue == 1) {
        triples += "?license odrl:permission/odrl:action odrl:distribute . \n"
        radioButtons = document.getElementsByName("distributeAttribution");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            triples += "?license odrl:permission/odrl:duties/odrl:action cc:Attribution . \n"
        }
        radioButtons = document.getElementsByName("distributeNotice");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            triples += "?license odrl:permission/odrl:duties/odrl:action cc:Notice . \n"
        }
        radioButtons = document.getElementsByName("display");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            triples += "?license odrl:permission/odrl:action odrl:display . \n"
        } else if (buttonValue == -1) {
            triples += "?license odrl:prohibition/odrl:action odrl:display . \n"
        }
        radioButtons = document.getElementsByName("present");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            triples += "?license odrl:permission/odrl:action odrl:present . \n"
        } else if (buttonValue == -1) {
            triples += "?license odrl:prohibition/odrl:action odrl:present . \n"
        }
    } else if(buttonValue == -1) {
        triples += "?license odrl:prohibition/odrl:action odrl:distribute . \n"
    }
    //modify
    radioButtons = document.getElementsByName("modify");
    buttonValue = getRadioButtonValue(radioButtons);
    if(buttonValue == 1) {
        triples += "?license odrl:permission/odrl:action odrl:modify . \n"
        radioButtons = document.getElementsByName("modifyRename");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            triples += "?license odrl:permission/odrl:duties/odrl:action dalicc:rename . \n"
        }
        radioButtons = document.getElementsByName("modifyAttribution");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            triples += "?license odrl:permission/odrl:duties/odrl:action cc:Attribution . \n"
        }
        radioButtons = document.getElementsByName("modifyModificationNotice");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            triples += "?license odrl:permission/odrl:duties/odrl:action dalicc:modificationNotice . \n"
        }
        radioButtons = document.getElementsByName("modifyNotice");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            triples += "?license odrl:permission/odrl:duties/odrl:action cc:Notice . \n"
        }
        radioButtons = document.getElementsByName("modifiedWorks");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            triples += "?license odrl:permission/odrl:action dalicc:ModifiedWorks . \n"
        } else if (buttonValue == -1) {
            triples += "?license odrl:prohibition/odrl:action dalicc:ModifiedWorks . \n"
        }
    } else if(buttonValue == -1) {
        triples += "?license odrl:prohibition/odrl:action odrl:modify . \n"
    }
    //derive
    radioButtons = document.getElementsByName("derive");
    buttonValue = getRadioButtonValue(radioButtons);
    if(buttonValue == 1) {
        triples += "?license odrl:permission/odrl:action odrl:derive . \n"
        radioButtons = document.getElementsByName("deriveRename");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            triples += "?license odrl:permission/odrl:duties/odrl:action cc:Rename . \n"
        }
        radioButtons = document.getElementsByName("deriveAttribution");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            triples += "?license odrl:permission/odrl:duties/odrl:action cc:Attribution . \n"
        }
        radioButtons = document.getElementsByName("deriveModificationNotice");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            triples += "?license odrl:permission/odrl:duties/odrl:action dalicc:modificationNotice . \n"
        }
        radioButtons = document.getElementsByName("deriveNotice");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            triples += "?license odrl:permission/odrl:duties/odrl:action cc:Notice . \n"
        }
        radioButtons = document.getElementsByName("derivativeWorks");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            triples += "?license odrl:permission/odrl:action cc:DerivativeWorks . \n"
        } else if (buttonValue == -1) {
            triples += "?license odrl:prohibition/odrl:action cc:DerivativeWorks . \n"
        }
    } else if(buttonValue == -1) {
        triples += "?license odrl:prohibition/odrl:action odrl:derive . \n"
    }
    //commercial use
    radioButtons = document.getElementsByName("commercialUse");
    buttonValue = getRadioButtonValue(radioButtons);
    if(buttonValue == 1) {
        triples += "?license odrl:permission/odrl:action cc:CommercialUse . \n"
        radioButtons = document.getElementsByName("promote");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            triples += "?license odrl:permission/odrl:action dalicc:promote . \n"
        } else if (buttonValue == -1) {
            triples += "?license odrl:prohibition/odrl:action dalicc:promote . \n"
        }
    } else if(buttonValue == -1) {
        triples += "?license odrl:prohibition/odrl:action cc:CommercialUse . \n"
    }
    //charge distribution fee
    var radioButtons = document.getElementsByName("chargeDistributionFee"),
    buttonValue = getRadioButtonValue(radioButtons);
    if(buttonValue == 1) {
        triples += "?license odrl:permission/odrl:action dalicc:chargeDistributionFee . \n"
    } else if(buttonValue == -1) {
        triples += "?license odrl:prohibition/odrl:action dalicc:chargeDistributionFee . \n"
    }
    //change license
    radioButtons = document.getElementsByName("changeLicense");
    buttonValue = getRadioButtonValue(radioButtons);
    if(buttonValue == 1) {
        triples += "?license odrl:permission/odrl:action dalicc:ChangeLicense . \n"
        radioButtons = document.getElementsByName("compliantLicense");
        buttonValue = getRadioButtonValue(radioButtons);
        if (buttonValue == 1) {
            triples += "?license odrl:permission/odrl:duties/odrl:action dalicc:compliantLicense . \n"
        }
    } else if(buttonValue == -1) {
        triples += "?license odrl:prohibition/odrl:action dalicc:ChangeLicense. \n"
    }
    return triples
}
function fillResults(result, divId) {
    var div = document.getElementById(divId),
    response = JSON.parse(result.response)['results']['bindings'],
    tmpDiv;
    // clear results from last search if they exist
    child1 = div.children[0]
    child1.style.display = "block"
    div.innerHTML = ""
    div.appendChild(child1)
    for (var i = response.length - 1; i >= 0; i--) {
        tmpDiv = document.createElement("div")
        tmpDiv.setAttribute("class", "License")
        tmpDiv.setAttribute("data-uri", response[i]["license"].value)
        tmpDiv.innerHTML = response[i]["license"].value
        div.appendChild(tmpDiv)
        tmpDiv.onclick = toggleOrLoadLicense.bind(this, tmpDiv)
    }
}
function toggleOrLoadLicense(div) {
    if (div.children.length > 0) {
        toggleDiv = div.children[0]
        toggleDiv.style.display = (toggleDiv.style.display == "none") ? "block" : "none"
    } else {
        tmpDiv = document.createElement("div")
        tmpDiv.setAttribute("class", "subLicense")
        div.appendChild(tmpDiv)
        var graph = (div.parentElement.dataset.type == "limbo") ? config.limboGraph : config.daliccGraph,
        licenseQuery = "SELECT * WHERE { GRAPH <" + graph + "> { <" + div.dataset.uri + "> ?p ?o . OPTIONAL { ?o ?a ?b OPTIONAL { ?b ?c ?d}} }} ORDER BY ?a" ,
        xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                fillLicenseTerms(this, tmpDiv);
            }
        };
        xhttp.open("POST", config.endpoint, true);
        xhttp.setRequestHeader("Content-Type", "application\/x-www-form-urlencoded");
        xhttp.setRequestHeader("Accept", "application/sparql-results+json")
        xhttp.send("query=" + encodeURIComponent(licenseQuery));
    }
}
function fillLicenseTerms(result, div) {
    var response = JSON.parse(result.response)['results']['bindings'],
    length = response.length,
    textValues = [],
    terms = {},
    duties = {};
    for (var i = 0; i < length; i++) {
        if (Object.keys(response[i]).length == 2) {
            var textValue = fillTextValues(response[i]);
            (textValue != undefined) ? textValues.push(textValue) : undefined
        } else if (Object.keys(response[i]).length == 4) {
            term = fillTerms(response[i])
            if (term == undefined) {
                continue
            }
            if (term[0] in terms) {
                terms[term[0]].push(term[1])
            }
            else {
                terms[term[0]] = [term[2], term[1]]
            }
        } else {
            duty = fillDuties(response[i])
            if (duty == undefined) {
                continue
            }
            if (duty[0] in duties) {
                duties[duty[0]].push(duty[1])
            }
            else {
                duties[duty[0]] = [duty[1]]
            }
        }
    }
    div.innerHTML += "<hr>"
    for (var i = 0; i < textValues.length; i++) {
        div.innerHTML += textValues[i] + " <br>"
        //div.innerHTML += ((i % 2) == 0) ? "   " : "<br>"
    }
    var permissions = document.createElement("div"),
    prohibitions = document.createElement("div");
    prohibitions.innerHTML = "<h3>Prohibitions</h3>"
    prohibitions.style.float = "right"
    prohibitions.style.width = "50%"
    prohibitions.style["box-sizing"] = "border-box"
    permissions.innerHTML = "<h3>Permissions</h3>"
    permissions.style.float = "left"
    permissions.style.width = "50%"
    for (term in terms) {
        if (terms[term][0].includes("prohibition")) {
            for (var i = 1; i < terms[term].length; i++) {
                prohibitions.innerHTML += terms[term][i] + " <br>\n"
            }
        }
    }
    for (term in terms) {
        if (!(Object.keys(duties).indexOf(term) > -1) && terms[term][0].includes("permission")) {
            for (var i = 1; i < terms[term].length; i++) {
                // show terms without duty first
                permissions.innerHTML += terms[term][i] + " <br>\n"
            }
        }
    }
    for (term in terms) {
        if (Object.keys(duties).indexOf(term) > -1) {
            permissions.innerHTML += terms[term][1] + " <br>\n"
            tmpDuties = ""
            for (var i = 0; i < duties[term].length; i++) {
                tmpDuties += duties[term][i] + " <br>\n"
            }
            permissions.innerHTML += "<p style='padding-left:10px'>Duties:<br>\n" + tmpDuties + "</p>"
        }
    }
    div.appendChild(permissions);
    div.appendChild(prohibitions);
}
function fillTextValues(item){
    // cut value before # or / ? Preset "Layout" ?
    if (config.relevantTextValues.indexOf(item["p"].value) > -1) {
        return item["p"].value + " : " + item["o"].value
    }
    return undefined
}
function fillTerms(item){
    var o = item["o"].value,
    a = item["a"].value,
    b = item["b"].value,
    p = item["p"].value;
    if (a == "http://www.w3.org/ns/odrl/2/action") {
        return [o, b, p]
    }
    return undefined
}
function fillDuties(item){
    var o = item["o"].value,
    c = item["c"].value,
    d = item["d"].value;
    if (c == "http://www.w3.org/ns/odrl/2/action") {
        return [o, d]
    }
}
function getRadioButtonValue(radioButtons) {
    for (var i = radioButtons.length - 1; i >= 0; i--) {
        if(radioButtons[i].checked)
            return radioButtons[i].value
    }
}
