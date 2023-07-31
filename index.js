const fast2sms = require("fast-two-sms");
const options = { authorization: "cBmX0RW1tkSDeb7E9o42THNMnlLQhUFCGKI3ZVizxag6qsyrpYcT3jilFX7vdzwPuhHxLk2NnQqapEVD", message: 'this is message for tes api', numbers: ['7462947196'] };
fast2sms.sendMessage(options).then(response => {
    console.log(response)
}).catch((err) => {
    throw err;
})