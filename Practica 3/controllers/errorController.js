import path from 'path';

export const get404 = (req, res, next) => {
    // path.resolve une los segmentos y genera la ruta absoluta desde la raíz del sistema
    // '..' sube un nivel (sale de 'controllers') para entrar en 'public'
    const filePath = path.resolve('public', 'html', '404.html');

    res.status(404).sendFile(filePath, (err) => {
        if (err) {
            // Si el archivo no existe o hay un error, enviamos el fallback en JSON
            res.status(404).json({
                status: 'fail',
                message: `No se encontró ${req.originalUrl}`
            });
        }
    });
};