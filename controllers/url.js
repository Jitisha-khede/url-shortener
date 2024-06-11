const shortid = require('shortid');
const URL = require('../modals/url');

async function handleGenerateNewShortUrl(req,res){
    try{
    const body = req.body;
    if(!body.url) return res.status(404).json({error:'url is required'});

    const existingEntry = await URL.findOne({ redirectUrl: body.url });
    if (existingEntry) {
        return res.render('home', { id: existingEntry.shortId });
    }

    const shortId = shortid();
    await URL.create({
        shortId: shortId,
        redirectUrl: body.url,
        visitHistory: [],
        createdBy: req.user._id 
    })
    return res.render('home', {id: shortId})
    
}
catch (error) {
    console.error('Error generating short URL:', error); // Debugging log
    return res.status(500).json({ error: 'Internal server error' });
}
}

async function handleGetAnalytics(req,res){
    const shortId = req.params.shortId;
    const result = await URL.findOne({ shortId });
    return res.json({ totalClicks : result.visitHistory.length, analytics: result.visitHistory })
}

module.exports  = { 
    handleGenerateNewShortUrl,
    handleGetAnalytics,

}