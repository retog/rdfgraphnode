var $rdf = require("rdflib");
var fetch = require("node-fetch");

/**
 * Node Status:
 * 
 * Locally undetermined: There are multiple local nodes satisfying the criteria specified for this object 
 * Blank: The object represents a blank node in a graph that is locally available
 * Unresolved: This node is identified by a URI that has not yet been derefernced
 * 
 * @type type
 */

let Headers = ((h) => h ? h : window.Headers)(fetch.Headers);

function GraphNode() {
    return new GraphNode.Impl(...arguments);
}

GraphNode.Impl = class {
        
        constructor(nodes, graph, sources) {
            this._graph = graph;
            if (Array.isArray(nodes)) {
                this.nodes = nodes;
                /*if (this.nodes.length === 0) {
                    throw "Can't represent empty set of nodes";
                }*/
            } else {
                this.nodes = [nodes];
            }
            this.sources = sources;
        }
        
        get graph() {
            if (!this._graph) {
                throw Error("Operation not possible as no Graph is available, try fetching first");
            }
            return this._graph;
        }
        
        get node() {
            if (this.nodes.length !== 1) {
                throw Error("Operation not possible as this GraphNode is underdetermined");
            }
            return this.nodes[0];
        }
        
        get termType() {
            return this.node.termType;
        }
        
        get value() {;
            return this.node.value;
        }
        
        fetch() {
            if ((this.termType !== "NamedNode") || 
                        (this.sources && this.sources.indexOf(this.value.split("#")[0]) > -1)) {
                return Promise.resolve(this);
            } else {
                //TODO extend existing graph?
                var uri = this.value.split("#")[0];
                return GraphNode.rdfFetch(uri).then(response => response.graph()).then(graph => GraphNode(this.node, graph, [uri]));
            }
        }
        
        /*
         * 
         * @param {type} f
         * @returns {unresolved} a promise that is satisfied when all promises returned by f are resolved
         */
        each(f) {
            var results = this.nodes.map(node => f(GraphNode([node], this.graph, this.sources)));
            return Promise.all(results);
        }
        
        fetchEach(f) {
            var results = this.nodes.map(node => GraphNode([node], this.graph, this.sources).fetch().then(f));
            return Promise.all(results);
        }

        /**
         * Returns a GraphNode for each node represented by this GraphNode
         */
        split() {
            return this.nodes.map(node => GraphNode([node], this.graph, this.sources));
        }
        
        out(predicate) {
            var nodes = this.graph.each(this.node, predicate);
            /*if (nodes.length === 0) {
                throw "No property "+predicate+" on "+this.node;
            }*/
            return GraphNode(nodes, this.graph, this.sources);
        }
        
        in(predicate) {
            var statements = this.graph.statementsMatching(undefined, predicate, this.node);
            /*if (statements.length === 0) {
                throw "No property "+predicate+" pointing to "+this.node;
            }*/
            return GraphNode(statements.map(statement => statement.subject), this.graph, this.sources);
        }
    }

/**
 * 
 * Fetches an RDF graph. If the server return 401 the login process will be 
 * started upon which the fetch will be retried.
 *
 * @param uri {string} The URI to be fetched
 * @param options passed to $rdf.Fetcher
 * @param login {boolean} The login function to be called, optional
 *
 * @return {Promise<Response>} Response has a `graph`property with the rertived graph
 */
GraphNode.rdfFetch = function(uri, options, login) {
    function plainFetch(uri, init = {}) {
        if (!init.headers) {
            init.headers = new Headers();
        }
        if (!init.headers.get("Accept")) {
            init.headers.set("Accept", "text/turtle;q=1, application/n-triples;q=.9, "+
                "application/rdf+xml;q=.8, application/ld+json;q=.7, */*;q=.1");
        }
        return fetch(uri, init).then(response => {
            if (response.ok) {
                response.graph = () => new Promise((resolve, reject) => {
                    let graph = $rdf.graph();
                    let mediaType = response.headers.get("Content-type").split(";")[0];
                    return response.text().then(text => {
                        if ((mediaType === "text/html") && (typeof DOMParser !== 'undefined')) {
                            console.log("Working around rdflib problem parsing RDFa in browser");
                            //let opts = {baseURI: uri};
                            //let parser = new DOMParser();
                            //let doc = parser.parseFromString(text, "text/html");
                            //let doc = new JSDOM(text);
                            //let doc = DOMParser.parse(text);
                            //let graph = getRdfaGraph(doc, opts);
                            //console.log(graph.toString());
                        }
                        $rdf.parse(text, graph, uri, mediaType, (error, graph) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(graph);
                            }
                        });
                    });
                });
                return response;
            } else {
                return response;
            }
        });
    };
    var ggg = this;
    return plainFetch(uri, options).then(function (response) {
        if (response.status < 300) {
            return response;
        } else {
            if (login && response.status === 401) {
                console.log("Got 401 response, attempting to login");
                return login().then(function () {
                    return ggg.rdfFetch(uri, options);
                });
            } else {
                return response;
            }
        }
    });
};

module.exports = GraphNode;
