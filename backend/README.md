Database hosted in docker (Postgres)

to run the project you mast have docker installed, then run the following

``` $shell
    $ docker-compose up -d
    $ docker ps //to check if
```

first configure prisma/db
``` $shell
    $ npx prisma migrate dev --preview-feature --name "init"
```

then, simply run

``` $shell
    $ npm install //to install dependencies
    $ npm run dev
```
