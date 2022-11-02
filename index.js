const express = require("express");
const request = require('request')
const path = require('path')
const app = express();

const domain_url = 'https://chuyendong24h.net';

app.use(express.static(path.join(__dirname + '/images')));

app.set('view engine', 'ejs');

app.get('/:filename.:ext', function(req, res) {
    res.status(204);
    res.end();
});


app.get("/", (req, res) => {
    res.render(path.join(__dirname + '/views/index.ejs'), {
    
    });
});

app.get("/share/:page", (req, res) => {
    let page = req.params.page ? req.params.page : 1;
    
    
    let api = domain_url + '/wp-json/wp/v2/posts?page=' + page;
    
    let domain_vercel = req.protocol + '://' + req.get('host');
    
    request(api, { json: true }, (err, response, result) => {
        if (err) { return console.log(err); }
        if(typeof result[0] !== "undefined") {
            let share = [];
            
            let blank_img = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
            
            for (let i = 0; i < result.length; i++) {
                share.push({
                    id: result[i].id,
                    title: result[i].title.rendered,
                    img: typeof result[i].yoast_head_json.og_image !== "undefined" ? result[i].yoast_head_json.og_image[0].url : blank_img,
                    link_origin: result[i].link,
                    link_vercel: result[i].link.replace(domain_url, domain_vercel),
                })
            }
    
            page = parseInt(page);
            
            res.render(path.join(__dirname + '/views/share.ejs'), {
                share: share,
                previous_page_url: domain_vercel + '/share/' + ((page - 1) <= 1 ? 1 : (page - 1)),
                next_page_url: domain_vercel + '/share/' + (result.length === 10 ? page + 1 : page),
            });
        } else {
            res.send("ERR");
            console.log("ERR")
        }
    });
});

app.get('/:slug', function (req, res) {
    
    let slug = req.params.slug;
    let referer = req.headers.referrer || req.headers.referer;
    let api = domain_url + '/wp-json/wp/v2/posts?slug=' + slug;
    
    // console.log(slug);
    // console.log("referer:", referer);
    
    if(typeof referer !== "undefined") {
        let urls_301 = ['facebook','messages', 'fb'], urls_301_length = urls_301.length;
        while(urls_301_length--) {
            if (referer.indexOf(urls_301[urls_301_length]) !== -1) {
                res.redirect(301, domain_url + '/' + slug + '/')
                return;
            }
        }
    }
    
    request(api, { json: true }, (err, response, result) => {
        if (err) { return console.log(err); }
        if(typeof result[0] !== "undefined" && typeof result[0].title !== "undefined") {
            let optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            let dFormat = new Date(result[0].date);
            dFormat = dFormat.toLocaleDateString("en-US", optionsDate);
            
            console.log(result[0].content.yoast_head_json)
            
            res.render(path.join(__dirname + '/views/post.ejs'), {
                title: result[0].title.rendered,
                date: dFormat,
                content: result[0].content.rendered,
                yoast_head_json: result[0].yoast_head_json,
            });
        } else {
            console.log("ERR")
        }
    });
});

app.listen(3000, () => {
    console.log("Running on port 3000.");
});

module.exports = app;
