const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');

const resolve = dir => {
  // __dirname表示当前目录
  return path.join(__dirname,dir);
}

module.exports = {
  lintOnSave: false,
  devServer: {
    // server端发起axios请求
    before(app) {
      // 热门歌单推荐
      app.get('/api/getDiscList',(req,res) => {
        axios.get('https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg', {
          headers: {
            referer: 'https://c.y.qq.com/',
            host: 'c.y.qq.com'
          },
          params: req.query,
        }).then(data => {
          res.json(data.data);
        }).catch(e => {
          console.log(e);
        })
      });

      // 歌曲URL
      app.post('/api/getPurlUrl', bodyParser.json(), function (req, res) {
        const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg';
        axios.post(url, req.body, {
          headers: {
            referer: 'https://y.qq.com/',
            origin: 'https://y.qq.com',
            'Content-type': 'application/x-www-form-urlencoded'
          }
        }).then((response) => {
          res.json(response.data);
        }).catch((e) => {
          console.log(e);
        })
      });

      // 歌词
      app.get('/api/getLyric',(req,res) => {
        const url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg';
        axios.get(url, {
          headers: {
            referer: 'https://y.qq.com/',
            origin: 'https://y.qq.com',
          },
          params: req.query,
        }).then(data => {
          res.json(data.data);
        }).catch(e => {
          console.log(e);
        })
      });

      // 歌单列表
      app.get('/api/getCdInfo', (req,res) => {
        const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg';
        axios.get(url, {
          headers: {
            referer: 'https://c.y.qq.com/',
            host: 'c.y.qq.com'
          },
          params: req.query,
        }).then(data => {
          res.json(data.data);
        }).catch(e => {
          console.log(e);
        })
      });

      // 搜索结果
      app.get('/api/search', function (req, res) {
        const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
        axios.get(url, {
          headers: {
            referer: 'https://c.y.qq.com/',
            host: 'c.y.qq.com'
          },
          params: req.query
        }).then((response) => {
          res.json(response.data)
        }).catch((e) => {
          console.log(e)
        })
      });
    },
    proxy: {
      // 代理轮播图接口
      '/api/getTopBanner': {
        target: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
        changeOrigin: true,
        pathRewrite: {
          '^/api/getTopBanner': ''
        }
      },
      // 代理歌手列表接口
      '/api/getSingerList': {
        target: 'https://c.y.qq.com/v8/fcg-bin/v8.fcg',
        changeOrigin: true,
        pathRewrite: {
          '^/api/getSingerList': ''
        }
      },
      // 代理歌手详情接口
      '/api/getSingerDetail': {
        target: 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg',
        changeOrigin: true,
        pathRewrite: {
          '^/api/getSingerDetail': ''
        }
      },
      // 代理排行榜接口
      '/api/getTopList': {
        target: 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg',
        changeOrigin: true,
        pathRewrite: {
          '^/api/getTopList': ''
        }
      },
      // 代理排行榜歌曲列表接口
      '/api/getTopMusicList': {
        target: 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg',
        changeOrigin: true,
        pathRewrite: {
          '^/api/getTopMusicList': ''
        }
      },
      // 代理热门搜索接口
      '/api/getHotKey': {
        target: 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg',
        changeOrigin: true,
        pathRewrite: {
          '^/api/getHotKey': ''
        }
      },
    },
  },
  chainWebpack(config) {
    config.resolve.alias
      .set('common', resolve('src/common'))
      .set('api', resolve('src/api'))
      .set('components', resolve('src/components'))
      .set('base',resolve('src/base'))
  }
}