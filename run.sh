#!/bin/sh
docker build -t mongoose_edges .

docker rm -f dev_mongo
docker run --name dev_mongo -d mongo mongod --smallfiles
docker run -it --rm -v $(pwd)/src/:/app/src/ \
                    -v $(pwd)/test/:/app/test/ \
                    -v $(pwd)/_site/:/app/_site/ \
                    --link dev_mongo:mongo --name dev_module mongoose_edges
