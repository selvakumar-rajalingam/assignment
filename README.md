#**Step 1**: Download or clone the files.

#**Step 2**: **npm update** to install the corresponding packages.

#**Step 3**: Please find the below placeholders in index.js and replace with your corresponding values.
 - You can create test/development account from https://cloud.mongodb.com/ and replace the below placeholders or use your connection string for that.
   - #username#
   - #password
   - #dbname#

 - You can create test/development account from https://api.cloudamqp.com/ and replace the connection string in the below placeholder.
   - #amqpurl#
  
 - Use your SMTP details in the below placeholders.
   - #gmailid#
   - #gmailidpwd#

#**Step 4**: **npm start** to start the services.

#**Step 5**: To add a new user.

- API URL: localhost:3000/user

- Method: POST

- #Params:

  - firstname
  
  - lastname
  
  - email
  
  - age
  
#**Step 6**: To Send News letter by uploading CSV file

 - API URL: localhost:3000/sendnewsletter

 - Method: POST

 - #Param: csv_file

  - *Please refer sample.csv
