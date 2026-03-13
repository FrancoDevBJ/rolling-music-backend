const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, userName, userCode) => {

const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">

<style>

body{
  margin:0;
  padding:0;
  background:#0f0f0f;
  font-family: Arial, Helvetica, sans-serif;
}

.container{
  max-width:600px;
  margin:auto;
  padding:40px 20px;
}

.card{
  background:#ffffff;
  border-radius:12px;
  padding:40px 30px;
  text-align:center;
}

.logo{
  font-size:28px;
  font-weight:bold;
  color:#7c3aed;
  margin-bottom:20px;
}

.title{
  font-size:22px;
  margin-bottom:10px;
}

.text{
  color:#555;
  font-size:16px;
}

.code{
  font-size:34px;
  letter-spacing:6px;
  font-weight:bold;
  color:#7c3aed;
  background:#f3f3f3;
  padding:18px;
  border-radius:8px;
  margin:25px 0;
}

.button{
  display:inline-block;
  background:#7c3aed;
  color:white;
  padding:14px 28px;
  border-radius:8px;
  text-decoration:none;
  font-weight:bold;
  margin-top:10px;
}

.footer{
  margin-top:20px;
  font-size:12px;
  color:#888;
}

</style>
</head>

<body>

<div class="container">

<div class="card">

<div class="logo">📀 RollingMusic</div>

<h2 class="title">Bienvenido ${userName}</h2>

<p class="text">
Gracias por registrarte en RollingMusic.
Para completar tu cuenta verifica tu email.
</p>

<div class="code">
${userCode}
</div>

<a class="button" href="#">
Verificar cuenta
</a>

<p class="text">
Este código expira en 20 minutos.
</p>

<div class="footer">
© 2026 RollingMusic
</div>

</div>

</div>

</body>
</html>
`;

  try {

    await resend.emails.send({
      from: "RollingMusic 📀 <onboarding@resend.dev>",
      to: email,
      subject: "Verifica tu cuenta - RollingMusic 📀",
      html: htmlTemplate
    });

    console.log(`Email enviado a ${email}`);

    return true;

  } catch (error) {

    console.error("❌ Error enviando email:", error);

    throw new Error("No se pudo enviar el email");

  }

};

module.exports = {
  sendVerificationEmail
};