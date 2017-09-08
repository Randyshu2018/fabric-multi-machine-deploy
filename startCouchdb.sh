docker run -p 5984:5984 -d --name my-couchdb -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=password -v ~/couchdb:/opt/couchdb/data klaemo/couchdb

