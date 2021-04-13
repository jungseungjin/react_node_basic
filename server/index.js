const express = require("express");
const mongoose = require("mongoose");
const mongoDBUrl = require("./config/key");
const app = express();
const port = 5000;
const { User } = require("./models/User");
const { auth } = require("./auth");
//클라이언트에서 오는 정보를 서버에서 분석해서 가져 올 수 있게 하는 역할
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extend: true })); //application/x-www-form-urlencoded 타입을 분석해서 가져올 수 있게 설정
app.use(bodyParser.json()); //application/json 타입을 분석해서 가져올 수 있게 설정
const cookieParser = require("cookie-parser");
app.use(cookieParser());
process.env.NODE_ENV =
  process.env.NODE_ENV &&
  process.env.NODE_ENV.trim().toLowerCase() == "production"
    ? "production"
    : "development";
mongoose
  .connect(mongoDBUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/api/hello", (req, res) => res.send("Hello World!!!!"));

app.post("/api/users/register", (req, res) => {
  //회원가입할때 필요한 정보들을 클라이언트에서 가져오면
  //그것들을 데이터베이스에 넣어준다.

  //req.body는 아래같은 형태
  // {
  //   id:"hello",
  //   password:'ㅎㅇㅎㅇ'
  // }

  const user = new User(req.body);

  user.save((err, userInfo) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, err });
    }
    return res.status(200).json({
      success: true,
    });
  });
  //User모델에 저장
});
app.post("/api/users/login", (req, res) => {
  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        loginSuccess: "false",
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    //요청한 이메일이 데이터베이스에 있다면 비밀번호가 같은지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: "false",
          message: "비밀번호가 틀렸습니다.",
        });
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        //token을 저장한다. 어디에?  쿠키, 로컬스토리지등에 저장할 수 있음
        //쿠키에 저장해보자.
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userid: user._id });
      });
    });
  });

  //비밀번호까지 같다면 로그인 성공 - 토큰 생성하기
});

//auth미들웨어 추가
//(req,res)=>로 넘어가기 전에 auth로 확인
app.get("/api/users/auth", auth, (req, res) => {
  //미들웨어를 통과하면 여기로 나옴.
  //미들웨어를 통과하면 auth가 true됐음.

  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});
app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    { $set: { token: "" } },
    (err, user) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({ success: true });
    }
  );
});
app.listen(port, () => console.log(`startingPort : ${port}`));
