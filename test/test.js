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

        before(function(done) {  
            var path = require('path');
            //var logger = require('morgan');
            app.set('port', process.env.PORT || 3123);
            server = app.listen(app.get('port'),
            function(){
                console.log("Express server listening on port " + app.get('port'));
                //app.use(logger('dev'));
                app.use(express.static(path.join(__dirname, './served')));
            });
            done();
        });
        it('Fetching', function (done) {
            let gn = GraphNode(rdf.sym("http://localhost:"+app.get('port')+"/example.ttl"));
            gn.fetch().then(gn => 
                {
                    let title = gn.out(dc("title")).value;
                    assert.equal("Another example", title);
                }).then(done);
        });
        after(function(done) {
            console.log("closing server");;
            server.close();
            done();
        });
    });
});