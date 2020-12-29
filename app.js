const mysql = require('mysql');
const aes = require('mysql-aes');
const moment = require('moment');
const TelegramBot = require('node-telegram-bot-api');

require('dotenv').config({path: __dirname + '/.env'})

// Set telegram bot API KEY
const token = process.env.BOT_TOKEN

// Set Admin ID
// let adminUsername = process.env.ADMIN.split(",");

// Initialize telegram bot
const bot = new TelegramBot(token, {polling:true});

// Initialize connection to database
const conn = mysql.createConnection({
    host        : process.env.DB_HOST,
    user        : process.env.DB_USER,
    password    : process.env.DB_PASS,
    database    : process.env.DB_DATABASE
});

conn.connect((err) => {
    if (err) {
        console.log("Error connection: " + err.stack);
    }

    console.log("Connected as: " + conn.threadId);
});

// Get online user
bot.onText(/\/ovpn_online/, (msg, match) => {
    const chatId = msg.chat.id;

    conn.query("SELECT COUNT(user_id) AS total FROM user WHERE user_online = 1", (err, result) => {
        if (err) throw err;

        // console.log(result);

        Object.keys(result).forEach((key) => {
            let row = result[key];
            // console.log(row.user_name);

            bot.sendMessage(chatId, "Total Online: " + row.total + '\n');
        });
    
    });
});

// Get user info
bot.onText(/\/ovpn_info (.+)/, (msg, match) => {
    const chatId = msg.chat.id;

    let userName = match[1];

    conn.query("SELECT user_name, user_online, user_enable, user_start_date, user_end_date FROM user WHERE user_name = ?", [userName], (err, result) => {
        if (err) throw err;

        console.log(result);

        if (result.length === 0) {
            bot.sendMessage(chatId, "user not exist!");
        } else {
            Object.keys(result).forEach((key) => {
                let row = result[key];
                let startDate = moment(row.user_start_date).format("YYYY-MM-DD");
                let endDate;

                if (row.user_end_date === "0000-00-00"){
                    endDate = "Unlimited";
                } else {
                    endDate = moment(row.user_end_date).format("YYYY-MM-DD");
                }
    
                bot.sendMessage(chatId, '## User info ## \n'
                        + 'Username: ' + row.user_name + '\n'
                        + 'Online: ' + row.user_online + '\n'
                        + 'Enable: ' + row.user_enable + '\n'
                        + 'Start Date: ' + startDate + '\n'
                        + 'Expired Date: ' + endDate);
            });
        }
    
    });
});

// Register new user
bot.onText(/\/ovpn_add (.+) (.+) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;

    let userName = match[1];
    let userPass = match[2];
    let day = match[3];
    let today = moment().format("YYYY-MM-DD");
    let expired = moment().add(day, 'days').format("YYYY-MM-DD");

    conn.query({
        sql: "INSERT INTO user (user_name, user_pass, user_start_date, user_end_date) VALUES (?, AES_ENCRYPT(?, 'vpnje'), ?, ?)",
        values: [userName, userPass, today, expired]
    }, (err, result) => {
        if (err) throw err;

        // console.log(result);
    
        bot.sendMessage(chatId, '## Register success ## \n'
                    + 'Username: ' + userName + '\n'
                    + 'Password: ' + userPass + '\n'
                    + 'Start Date: ' + today + '\n'
                    + 'Expired Date: ' + expired);
    });
});

// Renew user
bot.onText(/\/ovpn_renew (.+) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;

    let userName = match[1];
    let day = match[2];
    let today = moment().format("YYYY-MM-DD");
    let expired = moment().add(day, 'days').format("YYYY-MM-DD");

    conn.query("UPDATE user SET user_start_date = ?, user_end_date = ? WHERE user_name = ?", [today, expired, userName], (err, result) => {
        if (err) throw err;

        // console.log(result);
    
        bot.sendMessage(chatId, '## Renew success ## \n'
                    + 'Username: ' + userName + '\n'
                    + 'Password: ' + userPass + '\n'
                    + 'Start Date: ' + today + '\n'
                    + 'Expired Date: ' + expired);
    });
});

// Block user
bot.onText(/\/ovpn_block (.+)/, (msg, match) => {
    const chatId = msg.chat.id;

    let userName = match[1];

    conn.query("UPDATE user SET user_enable = 0 WHERE user_name = ?", [userName], (err, result) => {
        if (err) throw err;

        // console.log(result);
    
        bot.sendMessage(chatId, 'User ' + userName + ' blocked!');
    });
});

// Unblock user
bot.onText(/\/ovpn_unblock (.+)/, (msg, match) => {
    const chatId = msg.chat.id;

    let userName = match[1];

    conn.query("UPDATE user SET user_enable = 1 WHERE user_name = ?", [userName], (err, result) => {
        if (err) throw err;

        // console.log(result);
    
        bot.sendMessage(chatId, 'User ' + userName + ' unblocked!');
    });
});

// Delete user
bot.onText(/\/ovpn_del (.+)/, (msg, match) => {
    const chatId = msg.chat.id;

    let userName = match[1];

    conn.query("DELETE FROM user WHERE user_name = ?", [userName], (err, result) => {
        if (err) throw err;

        // console.log(result);
    
        bot.sendMessage(chatId, 'User ' + userName + ' removed!');
    });
});

// Reset User pass
bot.onText(/\/ovpn_reset (.+) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;

    let userName = match[1];
    let userPass = match[2];

    conn.query("UPDATE user SET user_pass = AES_ENCRYPT(?, 'vpnje') WHERE user_name = ?", [userName, userPass], (err, result) => {
        if (err) throw err;

        console.log(result);
    
        bot.sendMessage(chatId, 'Reset password success');
    });
});


// conn.query({
//     sql: "SELECT HEX(user_pass) AS pass FROM user WHERE user_name = ?",
//     values: ['himaris']
// }, (err, result) => {
//     if (err) throw err;

//     Object.keys(result).forEach((key) => {
//         let row = result[key];
//         let pass = aes.decrypt(row.pass, process.env.SECRET);
//         // console.log(aes.decrypt(row.pass, process.env.SECRET));

//         bot.sendMessage('73804219', 'Your Passoword is \n'
//             + 'Username: Himaris \n'
//             + 'Password: ' + pass + '\n'
//         );
//     });
// });