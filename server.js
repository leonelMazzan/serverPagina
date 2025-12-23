const express = require("express");
const path = require("path");
const app = express();
const compression = require('compression')

//obteniendo el puerto de la pagina
// const port = process.env.PORT;
const port = 3000;

app.use(compression());

// API routes - deben ir antes del catch-all
app.get("/api", (req, res)=>{
  return res.status(200).json({
    ok: true,
    message: {
        message:'No API'
    }
});
})

// Servir archivos estáticos (CSS, JS, imágenes, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Catch-all handler: sirve index.html para todas las rutas que no sean archivos estáticos o API
// Esto permite que React Router maneje el enrutamiento en el cliente
// IMPORTANTE: Debe ir al final, después de todas las demás rutas
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  //el puerto que esta escuchando
  console.log(`Escuchando desde el puerto ${port}`);
});
