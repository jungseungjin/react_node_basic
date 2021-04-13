const { User } = require("./models/User");

const auth = (req, res, next) => {
  //인증처리를 하는곳

  //클라이언트 쿠키에서 토큰 가져오기
  let token = req.cookies.x_auth;
  //토큰을 복호화한다음에 유저찾기
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({ isAuth: false, error: true });

    //다음 넘어가서 토큰과 유저를 사용할 수 있게
    req.token = token;
    req.user = user;

    next();
  });
  //유저가 있으면 인증 o 없으면 인증 x
};

module.exports = { auth };
