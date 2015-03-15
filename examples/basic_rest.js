//get workers
jQuery.get("/api/workers/", function (data, textStatus, jqXHR) { 
    console.log("Get workers:"); 
    console.dir(data); 
    console.log(textStatus); 
    console.dir(jqXHR); 
});

//create a worker
jQuery.post("/api/workers", {
  "status": "Run",
  "data": {}
}, function (data, textStatus, jqXHR) { 
    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR); 
});

jQuery.get("/api/products/0", function(data, textStatus, jqXHR) { 
    console.log("Get resposne:"); 
    console.dir(data); 
    console.log(textStatus); 
    console.dir(jqXHR); 
});