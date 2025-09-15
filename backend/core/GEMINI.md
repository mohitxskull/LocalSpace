Options:
  --ansi|--no-ansi        Force enable or disable colorful output
  --help                  View help for a given command

Available commands:
  add                     Install and configure a package
  build                   Build application for production by compiling frontend assets and TypeScript source to JavaScript
  configure               Configure a package after it has been installed
  eject                   Eject scaffolding stubs to your application root
  list                    View list of available commands
  playground              Test your code here in the playground
  repl                    Start a new REPL session
  serve                   Start the development HTTP server along with the file watcher to perform restarts on file change
  test                    Run tests along with the file watcher to re-run tests on file change

cache
  cache:clear             Clear the application cache
  cache:delete            Delete a specific cache entry by key
  cache:prune             Remove expired cache entries from the selected store. This command is only useful for stores without native TTL support, like Database or File drivers.

db
  db:seed                 Execute database seeders
  db:truncate             Truncate all tables in database
  db:wipe                 Drop all tables, views and types in database

env
  env:add                 Add a new environment variable

generate
  generate:key            Generate a cryptographically secure random application key

inspect
  inspect:rcfile          Inspect the RC file with its default values

list
  list:routes             List application routes. This command will boot the application in the console environment

make
  make:command            Create a new ace command class
  make:controller         Create a new HTTP controller class
  make:event              Create a new event class
  make:exception          Create a new custom exception class
  make:factory            Make a new factory
  make:job                Make a new job class
  make:listener           Create a new event listener class
  make:mail               Make a new mail class
  make:middleware         Create a new middleware class for HTTP requests
  make:migration          Make a new migration file
  make:model              Make a new Lucid model
  make:policy             Make a new bouncer policy class
  make:preload            Create a new preload file inside the start directory
  make:provider           Create a new service provider class
  make:seeder             Make a new Seeder file
  make:service            Create a new service class
  make:test               Create a new Japa test file
  make:validator          Create a new file to define VineJS validators
  make:view               Create a new Edge.js template file

migration
  migration:fresh         Drop all tables and re-migrate the database
  migration:refresh       Rollback and migrate database
  migration:reset         Rollback all migrations
  migration:rollback      Rollback migrations to a specific batch number
  migration:run           Migrate database by running pending migrations
  migration:status        View migrations status

queue
  queue:clean             Clean jobs of a specific type and older than a specified grace period
  queue:clear             Clear all jobs from queues
  queue:drain             Remove all waiting and active jobs from queues
  queue:scheduler:clear   Clear all scheduled jobs
  queue:scheduler:list    List all scheduled jobs
  queue:scheduler:remove  Remove a scheduled job by its key
  queue:work              Listen for dispatched jobs

tuyau
  tuyau:generate          Tuyau generator command