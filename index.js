const express = require('express');
const {connectToMongoDb} = require('./connect');
const {checkForAuthentication, restrictTo} = require('./middlewares/auth');

const URL = require('./modals/url');

const urlRoute = require('./routes/url');
const path = require('path');
const cookieParser = require('cookie-parser');
const staticRouter = require('./routes/staticRouter');
const UserRoute = require('./routes/user');
const { userInfo } = require('os');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(checkForAuthentication);

app.set('view engine','ejs');
app.set('views' ,path.resolve('./views'));

app.get('/test',async(req,res)=>{
    const allUrls = await URL.find({});
    return res.render('home',{
        urls: allUrls,      
    });
})

app.use('/',staticRouter);
app.use('/url',restrictTo(['NORMAl','ADMIN']),urlRoute);
app.use('/user',UserRoute);

app.get('/:shortId',async (req,res)=>{
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId
    }, {
        $push: {
            visitHistory:{
                timestamp : Date.now()
            }
    }
    }   
);
if(entry){
   res.redirect(entry.redirectUrl);
}else{
    return res.status(404).send('URL not found');
}
});

app.listen(PORT,()=>console.log(`server started at port:${PORT}`));
connectToMongoDb('mongodb://127.0.0.1:27017/short-url',()=> console.log('mongoDb connected'));
