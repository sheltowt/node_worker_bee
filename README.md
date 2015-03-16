# node_worker_bee
A node.js application that creates a job queue whose workers fetch data from a url, and store results in a database.  The job queue exposes a REST API for adding jobs, updating jobs, deleting job and checking their status and results.

On post requests, and put requests where the url changes, the job is added to the queue.  The queue iterates through jobs, distributing processing tasks to child processes.  Child processes retrieve data from a url, and than save the data to a table containing data about a job, as well as a table containing data about a worker.

One job can have multiple workers, if there are multiple put request updating the url of a specific job.  

TO get up and running:
1.  Install node, mongodb
2.  npm install
3.  In root directory type node app.js