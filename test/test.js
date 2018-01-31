var assert = require('assert');
var GraphNode = require('../js/main.js');
var rdf = require('rdflib');

function dc(suffix) {
    return rdf.sym("http://dublincore.org/2012/06/14/dcelements#" + suffix);
}

describe('GraphNode', function () {
    describe('#out()', function () {
        it('Getting property value from local graph', function () {
            let dataTurtle = '@prefix dc: <http://dublincore.org/2012/06/14/dcelements#>. \n\
                <http://example.org/> dc:title "An example".';
            let data = rdf.graph();
            rdf.parse(dataTurtle, data, "http://example.org/data", "text/turtle");
            let gn = GraphNode(rdf.sym("http://example.org/"), data);
            let title = gn.out(dc("title")).value;
            assert.equal("An example", title);
        });
    });
});