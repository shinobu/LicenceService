query = "PREFIX  dc:   <http://purl.org/dc/terms/> \
PREFIX owl: <http://www.w3.org/2002/07/owl#> \
SELECT  ?license ?title ?sameAsLicense \
WHERE \
{   GRAPH <$branch> \
       { ?license  owl:sameAs  ?sameAsLicense } \
   GRAPH <$master> \
       { ?license  dc:title  ?title } \
   FILTER NOT EXISTS { GRAPH <$master> \
                       { ?license  owl:sameAs  ?sameAsLicense } \
                   } \
}"
query = query.replace("$master", config.limboGraph).replace("$master", config.limboGraph).replace("$branch", config.devGraph)
var xhttp;
xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        resultPresentation(this);
    }
};
xhttp.open("POST", config.endpoint, true);
xhttp.setRequestHeader("Content-Type", "application\/x-www-form-urlencoded");
xhttp.setRequestHeader("Accept", "application/sparql-results+json")
xhttp.send("query=" + encodeURIComponent(query));

function resultPresentation(results) {
    var triples = JSON.parse(results.response)
    for (i = 0, len = triples['results']['bindings'].length; i < len; i++)
        addField(triples['results']['bindings'][i])
}
function addField(triple) {
    el = document.createElement("div")
    el.innerHTML += "<span>" + String(triple['license'].value) + "</span> | <span>" + String(triple['title'].value) + "</span> | <span>" + String(triple['sameAsLicense'].value) + "</span> <button onclick=validateLink(this.parentElement)>Validate Link</button><button onclick=deleteSameAsLink(this.parentElement)>Delete (false) Link</button>"
    parent = document.getElementById("links")
    parent.append(el)
}
function validateLink(div){
    if(confirm("Confirm Link and add to Master?")) {
        query =  "PREFIX owl: <http://www.w3.org/2002/07/owl#> \
INSERT DATA { GRAPH <$master> { <$license> owl:sameAs <$link>} \
}"
        query = query.replace("$master", config.limboGraph).replace("$license", div.children[0].innerHTML).replace("$link", div.children[2].innerHTML)

        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                div.remove()
            }
        };
        xhttp.open("POST", config.endpoint, true);
        xhttp.setRequestHeader("Content-Type", "application\/x-www-form-urlencoded");
        xhttp.setRequestHeader("Accept", "application/sparql-results+json")
        xhttp.send("update=" + encodeURIComponent(query));
    }
}
function searchLicense(){
    window.open(window.location.href.substring(0, - config.sameAsValidatorURL.length) + config.searchURL)

}
// older unused/unecessary functions
//     function otherLicense(div){
//         var otherLicense = div.getElementsByTagName("input")[0].value;
//         if(confirm("Add Link to '" + otherLicense + "' instead?")) {
//             query =  "PREFIX owl: <http://www.w3.org/2002/07/owl#> \
// INSERT DATA { GRAPH <$master> { <$license> owl:sameAs <$link>} \
// }"
//             query = query.replace("$master", config.limboGraph).replace("$license", div.children[0].innerHTML).replace("$link", otherLicense)

//             var xhttp;
//             xhttp = new XMLHttpRequest();
//             xhttp.onreadystatechange = function() {
//                 if (this.readyState == 4 && this.status == 200) {
//                     div.remove()
//                 }
//             };
//             xhttp.open("POST", config.endpoint, true);
//             xhttp.setRequestHeader("Content-Type", "application\/x-www-form-urlencoded");
//             xhttp.setRequestHeader("Accept", "application/sparql-results+json")
//             xhttp.send("update=" + encodeURIComponent(query));
//         }
//     }
//     function createLicense(div){
//         window.open(window.location.href.substring(0, - config.sameAsValidatorURL.length) + config.formURL + "?sameAs=" + encodeURIComponent(div.children[0].innerHTML))
//     }
function deleteSameAsLink(div) {
    if(confirm("Delete this potential Link from the dev Graph?")) {
        query =  "PREFIX owl: <http://www.w3.org/2002/07/owl#>\
DELETE DATA { GRAPH <$branch> { <$license> owl:sameAs <$link>} \
}"
        query = query.replace("$branch", config.devGraph).replace("$license", div.children[0].innerHTML).replace("$link", div.children[2].innerHTML)

        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                div.remove()
            }
        };
        xhttp.open("POST", config.endpoint, true);
        xhttp.setRequestHeader("Content-Type", "application\/x-www-form-urlencoded");
        xhttp.setRequestHeader("Accept", "application/sparql-results+json")
        xhttp.send("update=" + encodeURIComponent(query));
    }
}