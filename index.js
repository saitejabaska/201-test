const app = require('./app')
//const dotenv = require('dotenv')

app.listen(process.env.PORT || 3000,()=>{
    console.log('server started on port',process.env.PORT)
})
