import urllib.parse
import urllib.request
import rdflib

class UtilitySupplier:

    def downloadLicenseGraph (self, url, graph):
        query = 'CONSTRUCT {{?a ?b ?c}} where {{ graph <{graph}> {{ ?a ?b ?c }}}}'.format(graph=graph)
        data = urllib.parse.urlencode({'query': query})
        req = urllib.request.Request('http://localhost:5000/sparql', data=data.encode('utf-8'), headers={'Content-Type': 'application/x-www-form-urlencoded'})
        g = rdflib.graph.Graph()
        try:
            with urllib.request.urlopen(req) as f:
                g.parse(data=f.read().decode('utf-8'), format='turtle')
        except Exception as e:
            raise e
        return g

    def updateLicenseGraph (self, query, url, graph):
        data = urllib.parse.urlencode({'update': query})
        req = urllib.request.Request('http://localhost:5000/sparql', data=data.encode('utf-8'), headers={'Content-Type': 'application/x-www-form-urlencoded'})
        try:
            with urllib.request.urlopen(req) as f:
                print(f)
        except Exception as e:
            raise e
        return
