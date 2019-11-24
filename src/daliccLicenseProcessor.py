import rdflib
import os
import sys
import json
from rdflib.namespace import RDF, RDFS, XSD, DC
from UtilitySupplier import UtilitySupplier

class daliccLicenseProcessor:

    def __init__(self):
        self.scriptDir = os.path.dirname(os.path.abspath(__file__))
        with open('config.json') as configFile:
            self.config = json.load(configFile)
        self.licenseDir = self.config['path']
        if not (self.licenseDir[0] == '/') and not (self.licenseDir[1] == ':'):
            # path is not absolute
            self.licenseDir = self.scriptDir + '/' + self.licenseDir
        print(self.licenseDir)
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
        for filepath in files:
            if filepath[-4:] != '.rdf':
                continue
            file = open(self.licenseDir + filepath, 'r')
            fileString = file.read()
            lines = fileString.splitlines()
            file.close()
            if '<odrl:target rdf:resource="http://purl.org/dc/dcmitype/Dataset"/>' in fileString:
                deletionTargets = ('odrl:target', 'odrl:assigner', 'odrl:AssetCollection', 'odrl:Party', 'dc:creator')
                saveTargets = ('dc:title', 'dc:alternative', 'cc:attributionName', 'dc:source', 'cc:legalcode')
                savedLines = ''
                for i, line in enumerate(lines):
                    # check for plain deletion of target assigner including asset collections
                    # they are urns and probably can only partially be deciphered
                    # save all lines with dc title/anothername in a string with \n's
                    # those can occasionally? randomly? be in the asset collection instead of the license
                    # in a second run put them after the set start
                    if any(deletionTarget in line for deletionTarget in deletionTargets):
                        lines[i] = ''
                    if any(saveTarget in line for saveTarget in saveTargets):
                        savedLines += line + '\n'
                        lines[i] = ''
                for i, line in enumerate(lines):
                    # add savedLines
                    if 'https://dalicc.net/license-library/' in line:
                        licenseURI = line[i]
                        lines[i] += '\n' + savedLines
                        lines[i] += '<dc:creator>dalicc</dc:creator>\n'
                        break
                # >license name exists and is from daliic 
                # ->compare license graph with file, and if overlap is not 100%
                # --> change delete differences, insert whole file/only changes?
                # --> else ignore
                # > add whole file
                if (licenseURI, None, None) not in self.licenseGraph:
                    # query needs to insert all triples, no checks required
                    tmpGraph = rdflib.graph.Graph()
                    tmpGraph.parse(data=''.join(lines), format='xml')
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