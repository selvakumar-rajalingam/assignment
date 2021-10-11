const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('fast-csv');

const nodemailer = require('nodemailer');
const amqp = require('amqplib/callback_api');

const app = express();

mongoose.connect('mongodb+srv://#username#:#password#@cluster0.tpzmg.mongodb.net/#dbname#?retryWrites=true&w=majority');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongoose connection error!'));

const user = require('./routes/user');
const usercontroller = require('./controllers/user.controller');
const logscontroller = require('./controllers/logs.controller');

app.use(express.urlencoded({extended: true}));

app.use('/user', user);

let mailerQueue = "mailer-queue";
amqp.connect('#amqpurl#', (error,conn)=>{
    if(error) {
        console.error(error);
    }

    conn.createChannel((error1,channel)=>{
        if(error1) {
            console.error(error1);
        }
        
        channel.assertQueue(mailerQueue, {
            durable: false
        });

        channel.consume(mailerQueue, async (msg)=>{

            let queueMsg = msg.content.toString();
            let queueMsgJSON = JSON.parse(queueMsg);

            let email = queueMsgJSON.Email;
            let newslettername = queueMsgJSON.Newsletter;
            let newslettercontent = queueMsgJSON.Content;

            try {
                let transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: "#gmailid#",
                        pass: "#gmailidpwd#"
                    }
                });

                let userDetails = await usercontroller.get_user(email);
                
                if(userDetails.length > 0) {
                    let deliveryInfo = await transporter.sendMail({
                        from: 'selvamailers@gmail.com',
                        to: email,
                        subject: newslettername,
                        text: `Dear ${userDetails[0].name} \n\n${newslettercontent}`,
                    });
                    console.log('deliveryInfo: ', deliveryInfo);

                    let logObj = {
                        email: email,
                        newslettername: newslettername
                    }
                    logscontroller.create_logs(logObj);
                }
            } catch(err) {
                console.log(err);
            }
        },{noAck: true});
    });
});

app.post('/sendnewsletter', multer({ fileFilter: function(req, file, callback) {
    if(path.extname(file.originalname) !== '.csv') {
        return callback(new Error('Only csv files allowed!'));
    }
    callback(null, true)
}, dest: 'uploads/'}).single('csv_file'), (req,res)=>{

    if(req.file == undefined) {
        res.send({error: 'Please upload a CSV file.'});
    }

    if(req.file.fieldname != 'csv_file') {
        res.send({error: '"csv_file" can not be empty.'});
    }

    let details = [];
    let filepath = __dirname + "/uploads/" + req.file.filename;

    amqp.connect('#amqpurl#', (error,conn)=>{
        if(error) {
            console.error(error);
        } else {
            conn.createChannel((error1,channel)=>{
                if(error1) {
                    console.error(error1);
                } else {
                    channel.assertQueue(mailerQueue, {
                        durable: false
                    });

                    fs.createReadStream(filepath)
                        .pipe(csv.parse({ headers: true }))
                        .on("error", (error) => {
                            res.send({error: error.message});
                        })
                        .on("data", async (row) => {
                            channel.sendToQueue(mailerQueue, new Buffer(JSON.stringify(row)));
                            details.push(row);
                        })
                        .on("end", () => {
                            res.send({message: 'File Uploaded. Sending Newsletters...'});
                        });
                }
            });
        }
    });
});

app.listen(3000);