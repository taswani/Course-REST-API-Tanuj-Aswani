# Course-REST-API-Tanuj-Aswani

To start with the REST API:
In two terminals run:
```
mongod
```
&
```
mongo
```

In a separate terminal tab browse to the src/database/seed-data folder & run the commands:
```
mongoimport --db api --collection courses --type=json --jsonArray --file courses.json
mongoimport --db api --collection users --type=json --jsonArray --file users.json
mongoimport --db api --collection reviews --type=json --jsonArray --file reviews.json
```

Run program with:
```
npm install
npm start
```

Run tests with:
```
npm test
```
