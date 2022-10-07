Database hosted in docker (Postgres)

to run the project you mast have docker installed, then run the following

``` $shell
    $ docker-compose up -d
    $ docker ps //to check if
    //if you want to run pgAdmin with yout database
    $ docker run --name pgadmin_teste --network=backend_default -p 15432:80 -e "PGADMIN_DEFAULT_EMAIL=<EMAIL_HERE>"\
     -e "PGADMIN_DEFAULT_PASSWORD=<PASSWORD_HERE>" -d dpage/pgadmin4
```

first configure prisma/db
``` $shell
    $ npx prisma migrate dev --preview-feature --name "init" //to run migrations in db
    $ npx prisma generate  // to generate default resolvers
```

then, simply run

``` $shell
    $ npm install //to install dependencies
    $ npm run dev
```
