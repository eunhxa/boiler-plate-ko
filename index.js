const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { User } = require("./models/User")
const { auth } = require('./middleware/auth')

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

app.post('/api/users/register', (req, res) => {
    // 회원가입 시 필요한 정보를 client에서 가져와서 데이터베이스에 넣기
    const user = new User(req.body);
    user.save((err, userInfo) => {
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})

app.post('/api/users/login', (req, res) => {
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

app.get('/api/users/auth', auth, (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        idAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        image: req.user.image,
        role: req.user.role
    });
})

app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({"_id": req.user._id}, 
    {token: ""},
    (err, user) => {
        if(err) return res.json({success: false, err});
        return res.status(200).send({success: true});
    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})