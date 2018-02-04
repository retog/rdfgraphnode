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

    describe('Remote data', function () {
        var express = require('express');
        var app = express();
        var server = null;
        var http = require('http');
        express.static.mime.define({'application/n-triples': ['nt']});

        before(function(done) {  
            var path = require('path');
            app.set('port', process.env.PORT || 3123);
            app.use(express.static(path.join(__dirname, './served')));
            server = http.createServer((request, reponse) => {
                return app(request, reponse);
            });
            server.listen(app.get('port'));
            done();
        });
        it('Fetching turtle', function (done) {
            let gn = GraphNode(rdf.sym("http://localhost:"+app.get('port')+"/example.ttl"));
            gn.fetch().then(gn => 
                {
                    let title = gn.out(dc("title")).value;
                    assert.equal("Another example", title);
                }).then(done);
        });
        it('Fetching n-triples', function (done) {
            let gn = GraphNode(rdf.sym("http://localhost:"+app.get('port')+"/example.nt"));
            gn.fetch().then(gn => 
                {
                    let title = gn.out(dc("title")).value;
                    assert.equal("Another example", title);
                }).then(done);
        });
        after(function(done) {
            server.close();
            done();
        });
    });
});