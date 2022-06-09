const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

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

app.post('/login', (req, res) => {
    // 요청된 이메일을 데이터베이스에 있는지 찾기
    User.findOne({email: req.body.email}, (err, userInfo) => {
        if(!userInfo) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }
        // 비밀번호 맞는지 확인
        userInfo.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch)
            return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."});

            // 비밀번호까지 맞으면 토큰 생성
            userInfo.generateToken((err, userInfo) => {
                if(err) return res.status(400).send(err);
                //토큰 저장
                res.cookie("x_auth", userInfo.token)
                .status(200)
                .json({loginSuccess: true, userId: userInfo._id})
            }) 
        })

    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})