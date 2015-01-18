
var Edge = require('./model/edge');

/**
 * Store edges and their properties between two objects.
 * @module mongoose-edges
 */

/**
 * @typedef module:mongoose-edges.edge
 * @property {ObjectId} src - ObjectId this edge starts from.
 * @property {ObjectId} dest - ObjectId this edge ends at.
 * @property {object} props - object holding this edges properties.
 */

/**
 * @typedef module:mongoose-edges.query
 * @property {ObjectId} [src] - ObjectId edges may starts from.
 * @property {ObjectId} [dest] - ObjectId edges may ends at.
 * @property {object} [props] - object holding props to return from query.
 * @property {object} [find] - object holding mongoDB query selectors for props.
 */

/**
 * @callback module:mongoose-edges.callback
 * @param {?object} err
 * @param {?module:mongoose-edges.edge} edge
 */

function getUniqueIndex(edge) {
    return edge.src + ":" + edge.dest;
}

function opHandler (edge, cb) {
    var props, prop, conditions = {}, fields = {src: 1, dest: 1, _id: 0}, op = {}, opValues = {};

    // ==== Assemble query ==== //

    if(edge.hasOwnProperty("src")) {
        conditions.src = edge.src;
    }

    if(edge.hasOwnProperty("dest")) {
        conditions.dest = edge.dest;
    }

    // edge.find contains query conditions for properties of edge
    if(edge.hasOwnProperty("find")) {

        // prefix properties in find with "props." and add to query
        props = edge.find;
        for (prop in props) {
            if (props.hasOwnProperty(prop))
                conditions['props.'+prop] = props[prop];
        }
    }

    if(edge.hasOwnProperty("get")) {

        if(edge.get == 'all') {
            fields.props = 1;
        } else {
            // prefix properties in get with "props." and add to selected fields
            props = edge.get;
            for (prop in props) {
                if (props.hasOwnProperty(prop))
                    fields['props.'+prop] = 1;
            }
        }
    }

    if(edge.hasOwnProperty("set")) {

        props = edge.set;
        for (prop in props) {
            if (props.hasOwnProperty(prop))
                opValues['props.'+prop] = props[prop];
        }
        op.$set = opValues;
    }

    if(edge.hasOwnProperty("remove")) {

        if(edge.remove == 'all') {
            opValues.props = "";
            op.$unset = opValues;
        } else {
            props = edge.remove;
            for (prop in props) {
                if (props.hasOwnProperty(prop))
                    opValues['props.' + prop] = "";
            }
            op.$unset = opValues;
        }
    }

    // ==== Run query ==== //

    // operate on single edge
    if(!edge.hasOwnProperty("find")) {

        // prohibits insertion of duplicates because of upsert,
        // and forces user to supply src as well as dest
        conditions.uniqueIndex = getUniqueIndex(edge);

        Edge.findOneAndUpdate(
            conditions,
            op,
            {
                upsert: true,   // Insert if edge does not exist yet
                lean: true,     // Returns plain js objects not MongooseDocuments
                select: fields
            },
            function (err, res) {

                if (err) cb(err);

                else if (edge.hasOwnProperty("get")) {
                    cb(null, res);
                }
                else cb(null);
            });

    } else {
        Edge.find(
            conditions,
            fields,
            cb
        );
    }
}

/**
 * Sets properties given in edge.props to edge. Existing properties
 * are overridden.
 *
 * @param {module:mongoose-edges.edge} edge
 * @param {module:mongoose-edges.callback} cb
 */
module.exports.setProperties = function(edge, cb) {
    var opEdge = {
        src: edge.src,
        dest: edge.dest,
        set: edge.props
    };
    opHandler(opEdge, cb);
};

/**
 * Get properties specified in edge.props. If edge param has no
 * props property all properties are returned.
 *
 * @param {module:mongoose-edges.edge} edge
 * @param {module:mongoose-edges.callback} cb
 */
module.exports.getProperties = function(edge, cb) {
    var opEdge = {
        src: edge.src,
        dest: edge.dest
    };

    if(edge.hasOwnProperty('props')) {
        opEdge.get = edge.props;
    } else {
        opEdge.get = "all";
    }
    opHandler(opEdge, cb);
};

/**
 * Removes properties specified in edge.props from edge. If edge has no
 * props property all properties are removed.
 *
 * @param {module:mongoose-edges.edge} edge
 * @param {module:mongoose-edges.callback} cb
 */
module.exports.removeProperties = function(edge, cb) {
    var opEdge = {
        src: edge.src,
        dest: edge.dest
    };

    if(edge.hasOwnProperty('props')) {
        opEdge.remove = edge.props;
    } else {
        opEdge.remove = "all";
    }
    opHandler(opEdge, cb);
};

/**
 * Finds multiple edges meeting the criteria specified by query.
 *
 * src, dest and find are optional but at least one of them hast to exist
 * in the query to yield any results. They specify the criteria for the query.
 * props specifies which fields to return.
 *
 * The callback is either called with an error or an array of edges.
 *
 * @param {module:mongoose-edges.edge} query
 * @param {module:mongoose-edges.callback} cb
 */
module.exports.findEdges = function (query, cb) {
    var opEdge = {}, plausible = false;

    if(query.hasOwnProperty("src")) {
        opEdge.src = query.src;
        plausible = true;
    }

    if(query.hasOwnProperty("dest")) {
        opEdge.dest = query.dest;
        plausible = true;
    }

    if(query.hasOwnProperty('props')) {
        opEdge.get = query.props;
    } else {
        opEdge.get = "all";
    }

    if(query.hasOwnProperty("find")) {
        opEdge.find = query.find;
        plausible = true;
    } else {
        opEdge.find = {};
    }

    if(!plausible) cb(null, []);
    else opHandler(opEdge, cb);
};
