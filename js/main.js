/**
 * A GraphNode.internalSpot: a node that maybe doesn't exist and a promise for the nodes that exist.
 * 
 * Node Status:
 * 
 * Locally undetermined: There are multiple local nodes satisfying the criteria specified for this object 
 * Blank: The object represents a blank node in a graph that is locally available
 * Unresolved: This node is identified by a URI that has not yet been derefernced
 * 
 * @type type
 */
function GraphNode() {
    return new GraphNode.Impl(...arguments);
}

GraphNode.Impl = class {
        
        constructor(nodes, graph, sources) {
            this._graph = graph;
            if (Array.isArray(nodes)) {
                this.nodes = nodes;
                if (this.nodes.length === 0) {
                    throw "Can't represent empty set of nodes";
                }
            } else {
                this.nodes = [nodes];
            }
            this.sources = sources;
        }
        
        get graph() {
            if (!this._graph) {
                throw "Operation not possible as no Graph is available, try fetching first";
            }
            return this._graph;
        }
        
        get node() {
            if (this.nodes.length !== 1) {
                throw "Operation not possible as this GraphNode is underdetermined";
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
                return GraphNode.rdfFetch(uri).then(response => GraphNode(this.node, response.graph, [uri]));
            }
        }
        
        each(f) {
            this.nodes.forEach(node => f(GraphNode([node], this.graph, this.sources)));
        }
        
        out(predicate) {
            var nodes = this.graph.each(this.node, predicate);
            if (nodes.length === 0) {
                throw "No property "+predicate+" on "+this.node;
            }
            return GraphNode(nodes, this.graph, this.sources);
        }
        
        in(predicate) {
            var statements = this.graph.statementsMatching(undefined, predicate, this.node);
            if (statements.length === 0) {
                throw "No property "+predicate+" pointing to "+this.node;
            }
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
    var ggg = this;
    return new Promise(function (resolve, reject) {
        var graph = $rdf.graph();
        var fetcher = new $rdf.Fetcher(graph, options);
        fetcher.fetch(uri, {
            "redirect": "follow"
        }).then(function (response) {
            if (response.status < 300) {
                response.graph = graph;
                resolve(response);
            } else {
                if (login && (response.status === 401)) {
                    console.log("Got 401 response, attempting to login");
                    return login().then(function () {
                        return ggg.rdfFetch(uri);
                    });
                } else {
                    reject(response);
                }
            }
        });
    });
};