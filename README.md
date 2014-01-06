* start server command: 

	bin/devserver

* start redis command: 

	redis-server

* start mongodb command:

	mongod

* start mongo console:

	mongo

* create a mongo collection:

	db.createCollection('collection name')

* use a specific database in mongo:

	use chat-salon; (or other database/collection name)

* show all mongodb collections:

	db.getCollectionNames()

* to start in production mode:

	NODE_ENV=production node app.js

* use curl to test api calls

	curl http://localhost:3000/user/create -d {} (the -d option is for a post...ur passing a blank object as post data)


* to run all tests:

	npm test


MONGODB

* show dbs - show all databases

* use <db_name> - use a database

* db.getCollectionNames() - show all collections in a database

* db.<collection_name>.find() - show all records for a given collection

* if connecting to the remote mongo instance, apparently "show dbs doesn't work"...use "show collections"

* dropping a database:

	- use <database name>;
	- db.dropDatabase();

	

