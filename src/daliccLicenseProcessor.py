import rdflib
import os
import sys
import json
from rdflib.namespace import RDF, RDFS, XSD, DC
from UtilitySupplier import UtilitySupplier

class daliccLicenseProcessor:

    def __init__(self):
        self.scriptDir = os.path.dirname(os.path.abspath(__file__))
        with open(self.scriptDir + '/config.json') as configFile:
            self.config = json.load(configFile)
        self.licenseDir = self.config['path']
        if not (self.licenseDir[0] == '/') and not (self.licenseDir[1] == ':'):
            # path is not absolute
            self.licenseDir = self.scriptDir + '/' + self.licenseDir
        self.graph = self.config['daliccGraph']
        self.endpoint = self.config['endpoint']
        self.licenseGraph = UtilitySupplier.downloadLicenseGraph(self, self.endpoint, self.graph)
        self.odrl = rdflib.namespace.Namespace('http://www.w3.org/ns/odrl/2/')
        self.cc = rdflib.namespace.Namespace('http://creativecommons.org/ns#')
        self.dalicc = rdflib.namespace.Namespace('https://dalicc.poolparty.biz/DALICC/')
        self.parse()

    def parse(self):
        try:
            files = [f for f in os.listdir(self.licenseDir) if os.path.isfile(os.path.join(self.licenseDir, f))]
        except Exception as e:
            raise e
        addTriples = ''
        deleteSubjects = ''
        for filename in files:
            if filename[-4:] != '.ttl':
                continue
            if ('https://www.dalicc.net/license-library' + filename, None, None) not in self.licenseGraph:
                # query needs to insert all triples, no checks required
                tmpGraph = rdflib.graph.Graph()
                tmpGraph.parse(self.licenseDir + filename, format='turtle')
                for triple in tmpGraph.query('CONSTRUCT {?s ?p ?o} WHERE {?s ?p ?o}'):
                    if isinstance(triple[0], rdflib.term.URIRef):
                        addTriples += '<' + str(triple[0]) + '> '
                    else:
                        addTriples += '_:' + str(triple[0]) + ' '
                    addTriples += '<' + str(triple[1]) + '> '
                    if isinstance(triple[2], rdflib.term.URIRef):
                        addTriples += '<' + str(triple[2]) + '> .\n'
                    elif isinstance(triple[2], rdflib.term.Literal):
                        addTriples += '"' + str(triple[2]).replace('"', '\\"') + '" .\n'
                    else:
                        addTriples += '_:' + str(triple[2]) + ' .\n'
                # not as relevant with dalicc licenses having their own graph
                # not working as intended, because rdflib cant deal with
                # insert/delte queries with OPTIONAL (valid SPARQL) atm
                # else:
                #     # check for subset in License Graph
                #     tmpGraph = rdflib.graph.Graph()
                #     tmpGraph.parse(data=''.join(lines), format='xml')
                #     isSubset = True
                #     for triple in tmpGraph.query('CONSTRUCT {?s ?p ?o} WHERE {?s ?p ?o}'):
                #         if isinstance(triple[0], rdflib.term.URIRef):
                #             addTriples += '<' + str(triple[0]) + '> '
                #         else:
                #             addTriples += '_:' + str(triple[0]) + ' '
                #         addTriples += '<' + str(triple[1]) + '> '
                #         if isinstance(triple[2], rdflib.term.URIRef):
                #             addTriples += '<' + str(triple[2]) + '> .\n'
                #         elif isinstance(triple[2], rdflib.term.Literal):
                #             addTriples += '"' + str(triple[2]) + '" .\n'
                #         else:
                #             addTriples += '_:' + str(triple[2]) + ' .\n'
                #         if triple not in self.licenseGraph:
                #             isSubset = False
                #     if not isSubset:
                #         # relevant changes should only be in permissions and prohibitions
                #         # delete all old ones and add "new" ones
                #         # add all triples again, at most new dc:alternatives "should" be added
                #         deleteSubjects += '<' + licenseURI + '> '
        # send updatequery to Store
#         query = """PREFIX odrl: <{odrl}>
# DELETE WHERE {{ GRAPH <{graph}> {{ VALUES ?s {{{deleteSubjects}}}
# VALUES ?p {{ odrl:permission odrl:prohibition }}
# ?s ?p ?o . ?o ?a ?b . OPTIONAL {{ ?b ?c ?d . }}}}}}
# INSERT DATA {{GRAPH <{graph}> {{ {addTriples}}}}}
# """.format(odrl=str(self.odrl), graph=self.graph, deleteSubjects=deleteSubjects, addTriples=addTriples)
#         print(query)
        query = """PREFIX odrl: <{odrl}>
INSERT DATA {{GRAPH <{graph}> {{ {addTriples}}}}}
""".format(odrl=str(self.odrl), graph=self.graph, addTriples=addTriples)
        UtilitySupplier.updateLicenseGraph(self, query, self.endpoint, self.graph)




licProc = daliccLicenseProcessor()