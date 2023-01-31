import bcrypt from "bcryptjs";

const pwd = "khunou";

bcrypt.hash(pwd, 10).then((hash) => {
  console.log(hash);
});
