const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const config = require('./config/key')

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB connected!'))
.catch(err => console.log(err));


app.get('/', (req, res) => {
  res.send('Hello World!')
})

const { User } = require("./models/User")

app.post('/register', (req, res) => {
    // 회원가입 시 필요한 정보를 client에서 가져와서 데이터베이스에 넣기
    const user = new User(req.body);
    user.save((err, userInfo) => {
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})