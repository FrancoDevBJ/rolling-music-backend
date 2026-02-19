const User =require('../models/User');

const createSuperAdmin = async () => {
    try {
        const superAdminEmail = process.env.ADMIN_EMAIL

        //VERIFICAR SI YA EXISTE EL SUPER ADMIN
        const existingSuperAdmin = await User.findOne({email:superAdminEmail});

        if (existingSuperAdmin) {
            console.log('✅ Super admin ya existe!')
            return
        }

        //CREAR SUPER ADMIN
        const superAdmin = new User({
            email: superAdminEmail,
            password: process.env.ADMIN_PASSWORD,
            name: process.env.ADMIN_NAME,
            surname: process.env.ADMIN_SURNAME,
            role: 'superadmin',
            verifiedEmail: true
        })

        await superAdmin.save() //PARA QUE SE GUARDE EN LA BASE DE DATOS
        console.log('💻 Super admin creado exitosamente')

    } catch (error) {
        console.error('❌ Error al crear super Admin: ', error.message)
    }
}

module.exports = createSuperAdmin;